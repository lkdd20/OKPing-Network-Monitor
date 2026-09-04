package org.dromara.web.service.impl;

import cn.hutool.core.util.URLUtil;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.NetUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.redis.utils.RedisUtils;
import org.dromara.common.tenant.helper.TenantHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.dromara.web.domain.bo.UrlBlacklistBo;
import org.dromara.web.domain.vo.UrlBlacklistInfoVo;
import org.dromara.web.domain.vo.UrlBlacklistVo;
import org.dromara.web.domain.UrlBlacklist;
import org.dromara.web.mapper.UrlBlacklistMapper;
import org.dromara.web.service.IUrlBlacklistService;

import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.Collection;
import java.util.Date;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 域名黑名单Service业务层处理
 *
 * @author Lion Li
 * @date 2026-05-20
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class UrlBlacklistServiceImpl implements IUrlBlacklistService {

    private static final String CACHE_KEY = "web:url_blacklist:list:v4";
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final Long ACTIVE_STATUS = 1L;
    private static final String MATCH_EXACT = "exact";
    private static final String MATCH_FUZZY = "fuzzy";

    private final UrlBlacklistMapper baseMapper;

    /**
     * 查询域名黑名单
     *
     * @param id 主键
     * @return 域名黑名单
     */
    @Override
    public UrlBlacklistVo queryById(Long id){
        return baseMapper.selectVoById(id);
    }

    /**
     * 分页查询域名黑名单列表
     *
     * @param bo        查询条件
     * @param pageQuery 分页参数
     * @return 域名黑名单分页列表
     */
    @Override
    public TableDataInfo<UrlBlacklistVo> queryPageList(UrlBlacklistBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<UrlBlacklist> lqw = buildQueryWrapper(bo);
        Page<UrlBlacklistVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    /**
     * 查询符合条件的域名黑名单列表
     *
     * @param bo 查询条件
     * @return 域名黑名单列表
     */
    @Override
    public List<UrlBlacklistVo> queryList(UrlBlacklistBo bo) {
        LambdaQueryWrapper<UrlBlacklist> lqw = buildQueryWrapper(bo);
        return baseMapper.selectVoList(lqw);
    }

    /**
     * 查询 URL/IP 是否命中黑名单
     *
     * @param value URL/IP/域名
     * @return 命中结果
     */
    @Override
    public UrlBlacklistInfoVo queryInfo(String value) {
        UrlBlacklistInfoVo info = new UrlBlacklistInfoVo();
        info.setBlocked(false);
        info.setQueryValue(value);
        if (StringUtils.isBlank(value)) {
            return info;
        }

        String target = normalize(value);
        String host = parseHost(target);
        for (UrlBlacklistVo item : getCachedList()) {
            MatchResult matchResult = match(item, target, host);
            if (matchResult.matched()) {
                info.setBlocked(true);
                info.setValue(item.getValue());
                info.setMatchType(matchResult.matchType());
                info.setStatus(item.getStatus());
                info.setStopTime(item.getStopTime());
                return info;
            }
        }
        return info;
    }

    private LambdaQueryWrapper<UrlBlacklist> buildQueryWrapper(UrlBlacklistBo bo) {
        LambdaQueryWrapper<UrlBlacklist> lqw = Wrappers.lambdaQuery();
        lqw.orderByAsc(UrlBlacklist::getId);
        lqw.like(StringUtils.isNotBlank(bo.getValue()), UrlBlacklist::getValue, bo.getValue());
        lqw.eq(bo.getStatus() != null, UrlBlacklist::getStatus, bo.getStatus());
        lqw.eq(bo.getStopTime() != null, UrlBlacklist::getStopTime, bo.getStopTime());
        return lqw;
    }

    private List<UrlBlacklistVo> getCachedList() {
        List<UrlBlacklistVo> list = TenantHelper.ignore(() -> RedisUtils.getCacheObject(CACHE_KEY));
        if (list != null) {
            return list;
        }
        return refreshCache();
    }

    private List<UrlBlacklistVo> refreshCache() {
        List<UrlBlacklistVo> list = TenantHelper.ignore(() -> baseMapper.selectVoList(Wrappers.<UrlBlacklist>lambdaQuery()
            .eq(UrlBlacklist::getStatus, ACTIVE_STATUS)
            .orderByAsc(UrlBlacklist::getId)));
        List<UrlBlacklistVo> validList = list.stream()
            .filter(this::isValid)
            .collect(Collectors.toList());
        TenantHelper.ignore(() -> RedisUtils.setCacheObject(CACHE_KEY, validList, CACHE_TTL));
        return validList;
    }

    private boolean isValid(UrlBlacklistVo item) {
        return item != null
            && ACTIVE_STATUS.equals(item.getStatus())
            && (item.getStopTime() == null || item.getStopTime().after(new Date()));
    }

    private String normalize(String value) {
        if (StringUtils.isBlank(value)) {
            return StringUtils.EMPTY;
        }
        return StringUtils.trim(URLUtil.decode(value)).toLowerCase(Locale.ROOT);
    }

    private String parseHost(String value) {
        try {
            URI uri = StringUtils.contains(value, "://") ? URI.create(value) : URI.create("http://" + value);
            String host = uri.getHost();
            return StringUtils.isBlank(host) ? value : host.toLowerCase(Locale.ROOT);
        } catch (Exception e) {
            return value;
        }
    }

    private MatchResult match(UrlBlacklistVo item, String target, String host) {
        if (!isValid(item)) {
            return MatchResult.none();
        }
        String rule = normalize(item.getValue());
        if (StringUtils.isBlank(rule)) {
            return MatchResult.none();
        }
        if (isExactMatched(rule, target, host)) {
            return MatchResult.exact();
        }
        if (isFuzzyMatched(rule, target, host)) {
            return MatchResult.fuzzy();
        }
        return MatchResult.none();
    }

    private boolean isExactMatched(String rule, String target, String host) {
        return StringUtils.equals(rule, target)
            || StringUtils.equals(rule, host);
    }

    private boolean isFuzzyMatched(String rule, String target, String host) {
        if (StringUtils.containsAny(rule, "*", "?")) {
            return matchWildcard(rule, target) || matchWildcard(rule, host);
        }
        if (StringUtils.contains(rule, "/")) {
            return matchCidr(rule, target, host);
        }
        return StringUtils.contains(target, rule)
            || StringUtils.contains(host, rule)
            || StringUtils.endsWith(host, "." + rule);
    }

    private boolean matchWildcard(String rule, String value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        String regex = "^" + Pattern.quote(rule)
            .replace("*", "\\E.*\\Q")
            .replace("?", "\\E.\\Q") + "$";
        return Pattern.matches(regex, value);
    }

    private boolean matchCidr(String cidr, String target, String host) {
        String ip = NetUtils.isIPv4(target) ? target : (NetUtils.isIPv4(host) ? host : null);
        if (StringUtils.isBlank(ip) || !StringUtils.contains(cidr, "/")) {
            return false;
        }
        try {
            String[] parts = StringUtils.split(cidr, "/");
            if (parts == null || parts.length != 2) {
                return false;
            }
            long network = ipv4ToLong(parts[0]);
            int prefix = Integer.parseInt(parts[1]);
            if (prefix < 0 || prefix > 32) {
                return false;
            }
            long mask = prefix == 0 ? 0 : 0xffffffffL << (32 - prefix);
            return (ipv4ToLong(ip) & mask) == (network & mask);
        } catch (Exception e) {
            return false;
        }
    }

    private long ipv4ToLong(String ip) {
        String[] parts = StringUtils.split(ip, ".");
        if (parts == null || parts.length != 4) {
            throw new IllegalArgumentException("Invalid IPv4 address");
        }
        long result = 0;
        for (String part : parts) {
            int value = Integer.parseInt(part);
            if (value < 0 || value > 255) {
                throw new IllegalArgumentException("Invalid IPv4 address");
            }
            result = (result << 8) + value;
        }
        return result;
    }

    /**
     * 新增域名黑名单
     *
     * @param bo 域名黑名单
     * @return 是否新增成功
     */
    @Override
    public Boolean insertByBo(UrlBlacklistBo bo) {
        UrlBlacklist add = MapstructUtils.convert(bo, UrlBlacklist.class);
        validEntityBeforeSave(add);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
            refreshCache();
        }
        return flag;
    }

    /**
     * 修改域名黑名单
     *
     * @param bo 域名黑名单
     * @return 是否修改成功
     */
    @Override
    public Boolean updateByBo(UrlBlacklistBo bo) {
        UrlBlacklist update = MapstructUtils.convert(bo, UrlBlacklist.class);
        validEntityBeforeSave(update);
        boolean flag = baseMapper.updateById(update) > 0;
        if (flag) {
            refreshCache();
        }
        return flag;
    }

    /**
     * 保存前的数据校验
     */
    private void validEntityBeforeSave(UrlBlacklist entity){
        //TODO 做一些数据校验,如唯一约束
    }

    /**
     * 校验并批量删除域名黑名单信息
     *
     * @param ids     待删除的主键集合
     * @param isValid 是否进行有效性校验
     * @return 是否删除成功
     */
    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        if(isValid){
            //TODO 做一些业务上的校验,判断是否需要校验
        }
        boolean flag = baseMapper.deleteByIds(ids) > 0;
        if (flag) {
            refreshCache();
        }
        return flag;
    }

    private record MatchResult(boolean matched, String matchType) {

        private static MatchResult exact() {
            return new MatchResult(true, MATCH_EXACT);
        }

        private static MatchResult fuzzy() {
            return new MatchResult(true, MATCH_FUZZY);
        }

        private static MatchResult none() {
            return new MatchResult(false, null);
        }
    }
}
