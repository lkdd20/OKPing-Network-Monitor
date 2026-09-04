package org.dromara.web.service;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.SecureUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.constant.Constants;
import org.dromara.common.core.constant.GlobalConstants;
import org.dromara.common.core.constant.SystemConstants;
import org.dromara.common.core.constant.TenantConstants;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.enums.UserType;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.ServletUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.common.tenant.helper.TenantHelper;
import org.dromara.system.domain.SysRole;
import org.dromara.system.domain.SysSocial;
import org.dromara.system.domain.SysUser;
import org.dromara.system.domain.SysUserRole;
import org.dromara.system.domain.bo.SysClientBo;
import org.dromara.system.domain.vo.SysClientVo;
import org.dromara.system.domain.vo.SysSocialVo;
import org.dromara.system.domain.vo.SysUserVo;
import org.dromara.system.mapper.SysRoleMapper;
import org.dromara.system.mapper.SysSocialMapper;
import org.dromara.system.mapper.SysUserMapper;
import org.dromara.system.mapper.SysUserRoleMapper;
import org.dromara.system.service.ISysClientService;
import org.dromara.system.service.ISysSocialService;
import org.dromara.system.service.ISysUserService;
import org.dromara.web.domain.miniapp.WechatMiniLoginRequest;
import org.dromara.web.domain.miniapp.WechatMiniLoginVo;
import org.dromara.web.domain.miniapp.WechatMiniRegisterRequest;
import org.dromara.web.domain.miniapp.WechatQrCreateVo;
import org.dromara.web.domain.miniapp.WechatQrStatusVo;
import org.dromara.web.domain.vo.LoginVo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serial;
import java.io.Serializable;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WechatMiniAppAuthService {

    private static final String SOURCE = "wechat_miniapp";
    private static final String DEFAULT_ROLE_KEY = "ping_user";
    private static final String MINI_DEVICE_TYPE = "xcx";
    private static final String QR_CACHE_PREFIX = GlobalConstants.GLOBAL_REDIS_KEY + "ping:auth:wechat:qr:";
    private static final String ACCESS_TOKEN_CACHE_PREFIX = GlobalConstants.GLOBAL_REDIS_KEY
        + "ping:auth:wechat:access-token:";
    private static final Duration QR_TTL = Duration.ofMinutes(5);
    private static final Duration QR_RESULT_TTL = Duration.ofMinutes(5);
    private static final Duration ACCESS_TOKEN_TTL = Duration.ofSeconds(7000);
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(8))
        .build();

    private final ISysClientService clientService;
    private final ISysSocialService socialService;
    private final ISysUserService userService;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysSocialMapper socialMapper;
    private final SysLoginService loginService;

    public WechatMiniLoginVo login(WechatMiniLoginRequest request) {
        SysClientVo client = requireMiniClient(request.getClientId());
        touchQrSession(request.getSessionId(), client.getClientId());
        WechatSession wechatSession = exchangeLoginCode(client, request.getLoginCode());
        SysUserVo user = findUser(client, wechatSession.openId());
        if (user == null) {
            WechatMiniLoginVo result = new WechatMiniLoginVo();
            result.setRegistered(false);
            result.setPhoneBound(false);
            result.setClientId(client.getClientId());
            return result;
        }
        return loginUser(user, client);
    }

    @Transactional(rollbackFor = Exception.class)
    public WechatMiniLoginVo register(WechatMiniRegisterRequest request) {
        SysClientVo client = requireMiniClient(request.getClientId());
        touchQrSession(request.getSessionId(), client.getClientId());
        WechatSession wechatSession = exchangeLoginCode(client, request.getLoginCode());
        String phone = getPhoneNumber(client, request.getPhoneCode());

        SysUserVo user = TenantHelper.dynamic(TenantConstants.DEFAULT_TENANT_ID, () -> {
            SysUserVo boundUser = findUser(client, wechatSession.openId());
            if (boundUser != null) {
                bindPhoneIfNecessary(boundUser, phone);
                return userService.selectUserById(boundUser.getUserId());
            }

            SysUserVo phoneUser = userMapper.selectVoOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getPhonenumber, phone)
                .eq(SysUser::getDelFlag, SystemConstants.NORMAL));
            if (phoneUser != null) {
                createSocialBinding(phoneUser, client, wechatSession, request.getNickName(), request.getAvatar());
                return userService.selectUserById(phoneUser.getUserId());
            }

            return createUser(client, wechatSession, phone, request.getNickName(), request.getAvatar());
        });
        return loginUser(user, client);
    }

    public WechatQrCreateVo createQrSession(String webClientId) {
        SysClientVo webClient = requireEnabledClient(webClientId);
        if (MINI_DEVICE_TYPE.equals(webClient.getDeviceType())) {
            throw new ServiceException("网页登录客户端不能使用小程序设备类型");
        }
        SysClientVo miniClient = findDefaultMiniClient();
        String sessionId = IdUtil.fastSimpleUUID();
        byte[] image = createMiniProgramCode(miniClient, sessionId);
        String launchUrl = createMiniProgramLaunchUrl(miniClient, sessionId);

        WechatQrSession session = new WechatQrSession();
        session.setSessionId(sessionId);
        session.setStatus("WAITING");
        session.setWebClientId(webClient.getClientId());
        session.setMiniClientId(miniClient.getClientId());
        session.setImageBase64(Base64.getEncoder().encodeToString(image));
        RedisUtils.setCacheObject(qrKey(sessionId), session, QR_TTL);

        WechatQrCreateVo result = new WechatQrCreateVo();
        result.setSessionId(sessionId);
        result.setImageUrl("/auth/wechat-miniapp/qr/" + sessionId + "/image");
        result.setLaunchUrl(launchUrl);
        result.setExpiresIn(QR_TTL.toSeconds());
        return result;
    }

    public byte[] getQrImage(String sessionId) {
        WechatQrSession session = getQrSession(sessionId);
        return Base64.getDecoder().decode(session.getImageBase64());
    }

    public void confirmQrSession(String sessionId) {
        WechatQrSession session = getQrSession(sessionId);
        String currentClientId = String.valueOf(StpUtil.getExtra(LoginHelper.CLIENT_KEY));
        if (!StringUtils.equals(session.getMiniClientId(), currentClientId)) {
            throw new ServiceException("请使用已配置的小程序账号确认登录");
        }
        Long currentUserId = LoginHelper.getUserId();
        if ("CONFIRMED".equals(session.getStatus())) {
            if (!ObjectUtil.equals(session.getUserId(), currentUserId)) {
                throw new ServiceException("该小程序码已由其他账号确认");
            }
            // An idempotent confirmation must not write an older session
            // snapshot over an access token produced by status polling.
            if (!RedisUtils.expire(qrKey(sessionId), QR_RESULT_TTL)) {
                throw new ServiceException("小程序码已过期，请在网页重新获取");
            }
            return;
        }
        // Keep the session alive while user and token checks run so a duplicate
        // confirmation cannot observe a missing key at the TTL boundary.
        RedisUtils.setCacheObject(qrKey(sessionId), session, QR_TTL);
        SysUserVo user = TenantHelper.dynamic(LoginHelper.getTenantId(),
            () -> userService.selectUserById(currentUserId));
        validateUser(user);
        if (StringUtils.isBlank(user.getPhonenumber())) {
            throw new ServiceException("请先绑定手机号再确认网页登录");
        }
        session.setStatus("CONFIRMED");
        session.setUserId(user.getUserId());
        session.setTenantId(user.getTenantId());
        session.setImageBase64(null);
        RedisUtils.setCacheObject(qrKey(sessionId), session, QR_RESULT_TTL);
    }

    public WechatQrStatusVo getQrStatus(String sessionId) {
        validateSessionId(sessionId);
        WechatQrSession session = RedisUtils.getCacheObject(qrKey(sessionId));
        if (session == null) {
            WechatQrStatusVo expired = new WechatQrStatusVo();
            expired.setStatus("EXPIRED");
            return expired;
        }
        WechatQrStatusVo result = new WechatQrStatusVo();
        result.setStatus(session.getStatus());
        if (!"CONFIRMED".equals(session.getStatus()) || session.getUserId() == null) {
            return result;
        }

        // Extend the existing key without writing a stale session snapshot.
        // This also prevents a request at the TTL boundary from recreating an
        // already expired login session.
        if (!RedisUtils.expire(qrKey(sessionId), QR_RESULT_TTL)) {
            result.setStatus("EXPIRED");
            return result;
        }
        SysClientVo webClient = requireEnabledClient(session.getWebClientId());
        SysUserVo user = TenantHelper.dynamic(session.getTenantId(),
            () -> userService.selectUserById(session.getUserId()));
        if (StringUtils.isBlank(session.getAccessToken())) {
            LoginVo login = createLogin(user, webClient);
            session.setAccessToken(login.getAccessToken());
            session.setExpireIn(login.getExpireIn());
            session.setImageBase64(null);
            RedisUtils.setCacheObject(qrKey(sessionId), session, QR_RESULT_TTL);
        }
        result.setAccessToken(session.getAccessToken());
        result.setExpireIn(session.getExpireIn());
        result.setClientId(webClient.getClientId());
        return result;
    }

    private WechatMiniLoginVo loginUser(SysUserVo user, SysClientVo client) {
        LoginVo login = createLogin(user, client);
        WechatMiniLoginVo result = new WechatMiniLoginVo();
        result.setRegistered(true);
        result.setPhoneBound(StringUtils.isNotBlank(user.getPhonenumber()));
        result.setAccessToken(login.getAccessToken());
        result.setExpireIn(login.getExpireIn());
        result.setClientId(login.getClientId());
        result.setUserId(user.getUserId());
        result.setUserName(user.getUserName());
        result.setNickName(user.getNickName());
        result.setPhone(maskPhone(user.getPhonenumber()));
        return result;
    }

    private LoginVo createLogin(SysUserVo user, SysClientVo client) {
        validateUser(user);
        LoginUser loginUser = TenantHelper.dynamic(user.getTenantId(), () -> loginService.buildLoginUser(user));
        loginUser.setClientKey(client.getClientKey());
        loginUser.setDeviceType(client.getDeviceType());

        SaLoginParameter parameter = new SaLoginParameter();
        parameter.setDeviceType(client.getDeviceType());
        parameter.setTimeout(client.getTimeout());
        parameter.setActiveTimeout(client.getActiveTimeout());
        parameter.setExtra(LoginHelper.CLIENT_KEY, client.getClientId());
        LoginHelper.login(loginUser, parameter);
        loginService.recordLoginInfo(user.getUserId(), ServletUtils.getClientIP());
        loginService.recordLogininfor(user.getTenantId(), user.getUserName(), Constants.LOGIN_SUCCESS, "微信扫码登录成功");

        LoginVo result = new LoginVo();
        result.setAccessToken(StpUtil.getTokenValue());
        result.setExpireIn(StpUtil.getTokenTimeout());
        result.setClientId(client.getClientId());
        return result;
    }

    private SysUserVo createUser(SysClientVo client, WechatSession wechatSession, String phone,
                                 String nickName, String avatar) {
        SysRole role = roleMapper.selectOne(new LambdaQueryWrapper<SysRole>()
            .eq(SysRole::getTenantId, TenantConstants.DEFAULT_TENANT_ID)
            .eq(SysRole::getRoleKey, DEFAULT_ROLE_KEY)
            .eq(SysRole::getStatus, SystemConstants.NORMAL)
            .eq(SysRole::getDelFlag, SystemConstants.NORMAL)
            .last("LIMIT 1"));
        if (role == null) {
            throw new ServiceException("未找到角色平台用户，请先在角色管理中创建 roleKey=ping_user 的角色");
        }

        String digest = SecureUtil.sha256(wechatSession.openId());
        String username = "wx_" + digest.substring(0, 24);
        SysUser user = new SysUser();
        user.setTenantId(TenantConstants.DEFAULT_TENANT_ID);
        user.setUserName(username);
        user.setNickName(normalizeNickname(nickName, phone));
        user.setUserType(UserType.SYS_USER.getUserType());
        user.setPhonenumber(phone);
        user.setPassword(BCrypt.hashpw(IdUtil.fastUUID() + "aA1!"));
        user.setSex("2");
        user.setStatus(SystemConstants.NORMAL);
        user.setDelFlag(SystemConstants.NORMAL);
        user.setRemark("微信小程序扫码注册");
        user.setCreateBy(0L);
        user.setUpdateBy(0L);
        userMapper.insert(user);

        SysUserRole userRole = new SysUserRole();
        userRole.setUserId(user.getUserId());
        userRole.setRoleId(role.getRoleId());
        userRoleMapper.insert(userRole);

        SysUserVo created = userService.selectUserById(user.getUserId());
        createSocialBinding(created, client, wechatSession, nickName, avatar);
        return userService.selectUserById(user.getUserId());
    }

    private void createSocialBinding(SysUserVo user, SysClientVo client, WechatSession wechatSession,
                                     String nickName, String avatar) {
        String authId = authId(client, wechatSession.openId());
        if (socialMapper.exists(new LambdaQueryWrapper<SysSocial>().eq(SysSocial::getAuthId, authId))) {
            return;
        }
        SysSocial social = new SysSocial();
        social.setTenantId(user.getTenantId());
        social.setUserId(user.getUserId());
        social.setAuthId(authId);
        social.setSource(SOURCE);
        social.setOpenId(wechatSession.openId());
        social.setUnionId(wechatSession.unionId());
        social.setUserName(user.getUserName());
        social.setNickName(normalizeNickname(nickName, user.getPhonenumber()));
        String avatarUrl = StringUtils.blankToDefault(avatar, "");
        social.setAvatar(avatarUrl.length() > 500 ? avatarUrl.substring(0, 500) : avatarUrl);
        social.setAccessToken("");
        social.setExpireIn(0);
        social.setCreateBy(0L);
        socialMapper.insert(social);
    }

    private void bindPhoneIfNecessary(SysUserVo user, String phone) {
        if (StringUtils.isNotBlank(user.getPhonenumber())) {
            if (!StringUtils.equals(user.getPhonenumber(), phone)) {
                throw new ServiceException("当前微信账号已绑定其他手机号");
            }
            return;
        }
        SysUser existing = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
            .eq(SysUser::getPhonenumber, phone)
            .ne(SysUser::getUserId, user.getUserId())
            .eq(SysUser::getDelFlag, SystemConstants.NORMAL)
            .last("LIMIT 1"));
        if (existing != null) {
            throw new ServiceException("该手机号已绑定其他平台账号");
        }
        userMapper.update(null, new LambdaUpdateWrapper<SysUser>()
            .set(SysUser::getPhonenumber, phone)
            .eq(SysUser::getUserId, user.getUserId()));
    }

    private SysUserVo findUser(SysClientVo client, String openId) {
        return TenantHelper.dynamic(TenantConstants.DEFAULT_TENANT_ID, () -> {
            List<SysSocialVo> socials = socialService.selectByAuthId(authId(client, openId));
            if (CollUtil.isEmpty(socials)) {
                return null;
            }
            return userService.selectUserById(socials.get(0).getUserId());
        });
    }

    private String getPhoneNumber(SysClientVo client, String phoneCode) {
        JsonNode body = postWechatJson(
            "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + url(getAccessToken(client)),
            Map.of("code", phoneCode));
        JsonNode phoneInfo = body.path("phone_info");
        String phone = phoneInfo.path("purePhoneNumber").asText();
        if (!phone.matches("^1\\d{10}$")) {
            throw new ServiceException("微信未返回有效的中国大陆手机号");
        }
        return phone;
    }

    private WechatSession exchangeLoginCode(SysClientVo client, String loginCode) {
        String endpoint = "https://api.weixin.qq.com/sns/jscode2session"
            + "?appid=" + url(client.getMiniAppId())
            + "&secret=" + url(client.getMiniAppSecret())
            + "&js_code=" + url(loginCode)
            + "&grant_type=authorization_code";
        JsonNode body = sendJson(HttpRequest.newBuilder(URI.create(endpoint)).GET().build());
        String openId = body.path("openid").asText();
        if (StringUtils.isBlank(openId)) {
            throw wechatError(body, "微信登录凭证校验失败");
        }
        return new WechatSession(openId, body.path("unionid").asText(null));
    }

    private byte[] createMiniProgramCode(SysClientVo client, String sessionId) {
        String envVersion = normalizeEnvVersion(client.getMiniAppEnvVersion());
        JsonNode payload = JsonUtils.getObjectMapper().valueToTree(Map.of(
            "scene", sessionId,
            "page", "pages/index/index",
            "check_path", false,
            "env_version", envVersion,
            "width", 430
        ));
        String endpoint = "https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=" + url(getAccessToken(client));
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .timeout(Duration.ofSeconds(15))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .build();
        try {
            HttpResponse<byte[]> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofByteArray());
            byte[] bytes = response.body();
            String contentType = response.headers().firstValue("Content-Type").orElse("");
            if (contentType.contains("json") || (bytes.length > 0 && bytes[0] == '{')) {
                JsonNode error = JsonUtils.getObjectMapper().readTree(bytes);
                throw wechatError(error, "生成微信小程序码失败");
            }
            if (response.statusCode() / 100 != 2 || bytes.length == 0) {
                throw new ServiceException("生成微信小程序码失败，微信接口状态码：" + response.statusCode());
            }
            return bytes;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("调用微信小程序码接口失败：" + e.getMessage());
        }
    }

    private String createMiniProgramLaunchUrl(SysClientVo client, String sessionId) {
        try {
            JsonNode body = postWechatJson(
                "https://api.weixin.qq.com/wxa/generate_urllink?access_token=" + url(getAccessToken(client)),
                Map.of(
                    "path", "pages/index/index",
                    "query", "session=" + sessionId,
                    "is_expire", true,
                    "expire_type", 0,
                    "expire_time", Instant.now().plus(QR_TTL).getEpochSecond(),
                    "env_version", normalizeEnvVersion(client.getMiniAppEnvVersion())
                ));
            String launchUrl = body.path("url_link").asText();
            if (StringUtils.isBlank(launchUrl) || !launchUrl.startsWith("https://")) {
                throw new ServiceException("微信未返回有效的小程序 URL Link");
            }
            return launchUrl;
        } catch (Exception e) {
            log.warn("Generate Wechat Mini Program URL Link failed, trying URL Scheme, sessionId={}, reason={}",
                sessionId, e.getMessage());
        }
        try {
            JsonNode body = postWechatJson(
                "https://api.weixin.qq.com/wxa/generatescheme?access_token=" + url(getAccessToken(client)),
                Map.of(
                    "jump_wxa", Map.of(
                        "path", "pages/index/index",
                        "query", "session=" + sessionId,
                        "env_version", normalizeEnvVersion(client.getMiniAppEnvVersion())
                    ),
                    "is_expire", true,
                    "expire_type", 0,
                    "expire_time", Instant.now().plus(QR_TTL).getEpochSecond()
                ));
            String launchUrl = body.path("openlink").asText();
            if (StringUtils.isBlank(launchUrl) || !launchUrl.startsWith("weixin://")) {
                throw new ServiceException("微信未返回有效的小程序 URL Scheme");
            }
            return launchUrl;
        } catch (Exception e) {
            // Launch-link permissions vary by account and release status. Desktop QR login remains available.
            log.warn("Generate Wechat Mini Program URL Scheme failed, sessionId={}, reason={}", sessionId, e.getMessage());
            return null;
        }
    }

    private String getAccessToken(SysClientVo client) {
        String cacheKey = ACCESS_TOKEN_CACHE_PREFIX + client.getClientId();
        String cached = RedisUtils.getCacheObject(cacheKey);
        if (StringUtils.isNotBlank(cached)) {
            return cached;
        }
        String endpoint = "https://api.weixin.qq.com/cgi-bin/token"
            + "?grant_type=client_credential"
            + "&appid=" + url(client.getMiniAppId())
            + "&secret=" + url(client.getMiniAppSecret());
        JsonNode body = sendJson(HttpRequest.newBuilder(URI.create(endpoint)).GET().build());
        String token = body.path("access_token").asText();
        if (StringUtils.isBlank(token)) {
            throw wechatError(body, "获取微信接口令牌失败");
        }
        RedisUtils.setCacheObject(cacheKey, token, ACCESS_TOKEN_TTL);
        return token;
    }

    private JsonNode postWechatJson(String endpoint, Object payload) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
            .timeout(Duration.ofSeconds(12))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(JsonUtils.toJsonString(payload)))
            .build();
        return sendJson(request);
    }

    private JsonNode sendJson(HttpRequest request) {
        try {
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode body = JsonUtils.getObjectMapper().readTree(response.body());
            if (response.statusCode() / 100 != 2 || body.path("errcode").asInt(0) != 0) {
                throw wechatError(body, "调用微信接口失败");
            }
            return body;
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException("调用微信接口失败：" + e.getMessage());
        }
    }

    private ServiceException wechatError(JsonNode body, String fallback) {
        int code = body.path("errcode").asInt(-1);
        String message = body.path("errmsg").asText(fallback);
        log.warn("Wechat mini program API failed, errcode={}, errmsg={}", code, message);
        return new ServiceException(fallback + "（" + code + "：" + message + "）");
    }

    private SysClientVo requireMiniClient(String clientId) {
        SysClientVo client = requireEnabledClient(clientId);
        if (!MINI_DEVICE_TYPE.equals(client.getDeviceType()) || !StringUtils.contains(client.getGrantType(), "xcx")) {
            throw new ServiceException("客户端未启用小程序认证");
        }
        validateMiniConfig(client);
        return client;
    }

    private SysClientVo findDefaultMiniClient() {
        SysClientBo query = new SysClientBo();
        query.setDeviceType(MINI_DEVICE_TYPE);
        return clientService.queryList(query).stream()
            .filter(client -> SystemConstants.NORMAL.equals(client.getStatus()))
            .filter(client -> StringUtils.contains(client.getGrantType(), "xcx"))
            .filter(client -> StringUtils.isNotBlank(client.getMiniAppId()) && StringUtils.isNotBlank(client.getMiniAppSecret()))
            .findFirst()
            .orElseThrow(() -> new ServiceException("未配置可用的微信小程序客户端，请先前往客户端管理配置"));
    }

    private SysClientVo requireEnabledClient(String clientId) {
        SysClientVo client = clientService.queryByClientId(clientId);
        if (ObjectUtil.isNull(client)) {
            throw new ServiceException("客户端不存在");
        }
        if (!SystemConstants.NORMAL.equals(client.getStatus())) {
            throw new ServiceException("客户端已停用");
        }
        return client;
    }

    private void validateMiniConfig(SysClientVo client) {
        if (StringUtils.isBlank(client.getMiniAppId()) || StringUtils.isBlank(client.getMiniAppSecret())) {
            throw new ServiceException("当前客户端未配置微信小程序 AppID 或 AppSecret");
        }
    }

    private void validateUser(SysUserVo user) {
        if (user == null) {
            throw new ServiceException("用户不存在");
        }
        if (!SystemConstants.NORMAL.equals(user.getStatus())) {
            throw new ServiceException("用户已被停用");
        }
    }

    private WechatQrSession getQrSession(String sessionId) {
        validateSessionId(sessionId);
        WechatQrSession session = RedisUtils.getCacheObject(qrKey(sessionId));
        if (session == null) {
            throw new ServiceException("小程序码已过期，请在网页重新获取");
        }
        return session;
    }

    private void touchQrSession(String sessionId, String miniClientId) {
        if (StringUtils.isBlank(sessionId)) {
            return;
        }
        WechatQrSession session = getQrSession(sessionId);
        if (!StringUtils.equals(session.getMiniClientId(), miniClientId)) {
            throw new ServiceException("小程序与扫码会话不匹配");
        }
        if (!"CONFIRMED".equals(session.getStatus())) {
            session.setStatus("SCANNED");
            RedisUtils.setCacheObject(qrKey(sessionId), session, QR_TTL);
        }
    }

    private void validateSessionId(String sessionId) {
        if (StringUtils.isBlank(sessionId) || !sessionId.matches("^[0-9a-fA-F]{32}$")) {
            throw new ServiceException("扫码会话无效");
        }
    }

    private String authId(SysClientVo client, String openId) {
        return SOURCE + ":" + client.getMiniAppId() + ":" + openId;
    }

    private String qrKey(String sessionId) {
        return QR_CACHE_PREFIX + sessionId;
    }

    private String normalizeNickname(String nickName, String phone) {
        String value = StringUtils.blankToDefault(nickName, "用户" + phone.substring(phone.length() - 4))
            .replace("<", "")
            .replace(">", "")
            .replace("&", "")
            .trim();
        return value.length() > 30 ? value.substring(0, 30) : value;
    }

    private String maskPhone(String phone) {
        if (StringUtils.isBlank(phone) || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private String normalizeEnvVersion(String value) {
        return switch (StringUtils.blankToDefault(value, "release")) {
            case "develop", "trial", "release" -> StringUtils.blankToDefault(value, "release");
            default -> "release";
        };
    }

    private String url(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record WechatSession(String openId, String unionId) {
    }

    @Data
    public static class WechatQrSession implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String sessionId;
        private String status;
        private String webClientId;
        private String miniClientId;
        private Long userId;
        private String tenantId;
        private String imageBase64;
        private String accessToken;
        private Long expireIn;
    }
}
