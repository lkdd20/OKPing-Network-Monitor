package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.json.utils.JsonUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.ping.domain.PingIssue;
import org.dromara.ping.domain.PingIssueMessage;
import org.dromara.ping.domain.bo.PingIssueAdminMessageBo;
import org.dromara.ping.domain.bo.PingIssueMessageSubmitBo;
import org.dromara.ping.domain.bo.PingIssueMessageVisibilityBo;
import org.dromara.ping.domain.bo.PingIssueQueryBo;
import org.dromara.ping.domain.bo.PingIssueReviewBo;
import org.dromara.ping.domain.bo.PingIssueSubmitBo;
import org.dromara.ping.domain.vo.PingIssueAttachmentVo;
import org.dromara.ping.domain.vo.PingIssueMessageVo;
import org.dromara.ping.domain.vo.PingIssueVo;
import org.dromara.ping.domain.vo.PingPublicIssuePageVo;
import org.dromara.ping.domain.vo.PingPublicIssueVo;
import org.dromara.ping.mapper.PingIssueMapper;
import org.dromara.ping.mapper.PingIssueMessageMapper;
import org.dromara.ping.service.IPingIssueService;
import org.dromara.system.domain.vo.SysOssVo;
import org.dromara.system.service.ISysOssService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class PingIssueServiceImpl implements IPingIssueService {

    private static final int MAX_FILES = 3;
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final int PUBLIC_DEFAULT_PAGE_SIZE = 10;
    private static final int PUBLIC_MAX_PAGE_SIZE = 20;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final TypeReference<List<PingIssueAttachmentVo>> ATTACHMENT_TYPE = new TypeReference<>() {
    };

    private final PingIssueMapper baseMapper;
    private final PingIssueMessageMapper messageMapper;
    private final ISysOssService ossService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long submit(PingIssueSubmitBo bo, List<MultipartFile> rawFiles) {
        LoginUser loginUser = requireLoginUser();
        List<MultipartFile> files = rawFiles == null
            ? List.of()
            : rawFiles.stream().filter(file -> file != null && !file.isEmpty()).toList();
        validateFiles(files);

        List<PingIssueAttachmentVo> attachments = new ArrayList<>();
        List<Long> uploadedIds = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                SysOssVo uploaded = ossService.upload(file);
                uploadedIds.add(uploaded.getOssId());
                attachments.add(new PingIssueAttachmentVo(
                    uploaded.getOssId(), uploaded.getUrl(), normalizeFileName(file.getOriginalFilename()), file.getSize()));
            }

            PingIssue issue = new PingIssue();
            issue.setTenantId(loginUser.getTenantId());
            issue.setUserId(loginUser.getUserId());
            issue.setUserName(normalizeSingleLine(loginUser.getUsername(), 64));
            issue.setNickname(normalizeSingleLine(loginUser.getNickname(), 64));
            issue.setIssueType(bo.getIssueType());
            issue.setTitle(normalizeSingleLine(bo.getTitle(), 120));
            issue.setContent(normalizeText(bo.getContent(), 5000));
            issue.setAttachmentsJson(JsonUtils.toJsonString(attachments));
            issue.setStatus("pending");
            issue.setPublicVisible(false);
            if (baseMapper.insert(issue) != 1) {
                throw new ServiceException("问题反馈提交失败，请稍后重试");
            }
            return issue.getId();
        } catch (RuntimeException exception) {
            cleanupUploads(uploadedIds);
            throw exception;
        }
    }

    @Override
    public TableDataInfo<PingIssueVo> queryMine(String category, PageQuery pageQuery) {
        LoginUser loginUser = requireLoginUser();
        LambdaQueryWrapper<PingIssue> wrapper = Wrappers.<PingIssue>lambdaQuery()
            .eq(PingIssue::getTenantId, loginUser.getTenantId())
            .eq(PingIssue::getUserId, loginUser.getUserId());
        if ("feedback".equals(category)) {
            wrapper.in(PingIssue::getIssueType, "problem", "suggestion");
        } else if ("cooperation".equals(category)) {
            wrapper.eq(PingIssue::getIssueType, "cooperation");
        } else if (StringUtils.isNotBlank(category)) {
            throw new ServiceException("记录分类无效");
        }
        wrapper.orderByDesc(PingIssue::getCreateTime).orderByDesc(PingIssue::getId);
        Page<PingIssue> page = baseMapper.selectPage(pageQuery.build(), wrapper);
        return new TableDataInfo<>(toIssueVosWithMessages(page.getRecords(), false), page.getTotal());
    }

    @Override
    public PingIssueVo getMine(Long id) {
        LoginUser loginUser = requireLoginUser();
        PingIssue issue = baseMapper.selectOne(Wrappers.<PingIssue>lambdaQuery()
            .eq(PingIssue::getId, id)
            .eq(PingIssue::getTenantId, loginUser.getTenantId())
            .eq(PingIssue::getUserId, loginUser.getUserId()));
        if (issue == null) {
            throw new ServiceException("问题反馈不存在或无权查看");
        }
        List<PingIssueMessage> messages = queryMessages(List.of(issue.getId()), false);
        return toIssueVo(issue, resolveAttachmentUrls(List.of(issue), messages), messages);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addMineMessage(Long issueId, PingIssueMessageSubmitBo bo) {
        LoginUser loginUser = requireLoginUser();
        PingIssue issue = findMineIssue(issueId, loginUser);
        PingIssueMessage message = buildMessage(
            issue,
            loginUser,
            "user",
            normalizeText(bo.getContent(), 5000),
            false
        );
        if (messageMapper.insert(message) != 1) {
            throw new ServiceException("回复失败，请稍后重试");
        }
        if ("resolved".equals(issue.getStatus()) || "closed".equals(issue.getStatus())) {
            issue.setStatus("processing");
            baseMapper.updateById(issue);
        }
        return message.getId();
    }

    @Override
    public PingPublicIssuePageVo queryPublicPage(String keyword, Integer pageNum, Integer pageSize) {
        int safePageNum = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int safePageSize = pageSize == null || pageSize < 1
            ? PUBLIC_DEFAULT_PAGE_SIZE
            : Math.min(pageSize, PUBLIC_MAX_PAGE_SIZE);
        String normalizedKeyword = normalizeSingleLine(keyword, 80);
        Set<Long> messageMatchedIssueIds = findPublicMessageIssueIds(normalizedKeyword);
        LambdaQueryWrapper<PingIssue> wrapper = Wrappers.<PingIssue>lambdaQuery()
            .eq(PingIssue::getPublicVisible, true)
            .orderByDesc(PingIssue::getReplyTime)
            .orderByDesc(PingIssue::getCreateTime)
            .orderByDesc(PingIssue::getId);
        if (StringUtils.isNotBlank(normalizedKeyword)) {
            wrapper.and(query -> {
                query.like(PingIssue::getTitle, normalizedKeyword)
                    .or()
                    .like(PingIssue::getContent, normalizedKeyword);
                if (!messageMatchedIssueIds.isEmpty()) {
                    query.or().in(PingIssue::getId, messageMatchedIssueIds);
                }
            });
        }
        Page<PingIssue> page = baseMapper.selectPage(new Page<>(safePageNum, safePageSize), wrapper);
        List<PingIssueMessage> messages = queryMessages(
            page.getRecords().stream().map(PingIssue::getId).toList(), true);
        Map<Long, List<PingIssueMessage>> messagesByIssue = groupMessages(messages);
        Map<Long, String> urls = resolveAttachmentUrls(page.getRecords(), messages);

        PingPublicIssuePageVo result = new PingPublicIssuePageVo();
        result.setTotal(page.getTotal());
        result.setPageNum(safePageNum);
        result.setPageSize(safePageSize);
        result.setRows(page.getRecords().stream()
            .map(issue -> toPublicVo(issue, urls, messagesByIssue.getOrDefault(issue.getId(), List.of())))
            .toList());
        return result;
    }

    @Override
    public PingPublicIssueVo getPublic(Long id) {
        PingIssue issue = baseMapper.selectOne(Wrappers.<PingIssue>lambdaQuery()
            .eq(PingIssue::getId, id)
            .eq(PingIssue::getPublicVisible, true));
        if (issue == null) {
            throw new ServiceException("问题不存在或尚未公开");
        }
        List<PingIssueMessage> messages = queryMessages(List.of(issue.getId()), true);
        return toPublicVo(issue, resolveAttachmentUrls(List.of(issue), messages), messages);
    }

    @Override
    public TableDataInfo<PingIssueVo> queryAdminPage(PingIssueQueryBo bo, PageQuery pageQuery) {
        String keyword = normalizeSingleLine(bo.getKeyword(), 100);
        Map<String, Object> params = bo.getParams();
        LambdaQueryWrapper<PingIssue> wrapper = Wrappers.<PingIssue>lambdaQuery()
            .eq(StringUtils.isNotBlank(bo.getIssueType()), PingIssue::getIssueType, bo.getIssueType())
            .eq(StringUtils.isNotBlank(bo.getStatus()), PingIssue::getStatus, bo.getStatus())
            .eq(bo.getPublicVisible() != null, PingIssue::getPublicVisible, bo.getPublicVisible())
            .and(StringUtils.isNotBlank(keyword), query -> query
                .like(PingIssue::getTitle, keyword)
                .or()
                .like(PingIssue::getContent, keyword)
                .or()
                .like(PingIssue::getUserName, keyword)
                .or()
                .like(PingIssue::getNickname, keyword))
            .between(params.get("beginTime") != null && params.get("endTime") != null,
                PingIssue::getCreateTime, params.get("beginTime"), params.get("endTime"))
            .orderByAsc(PingIssue::getReplyTime)
            .orderByDesc(PingIssue::getCreateTime)
            .orderByDesc(PingIssue::getId);
        Page<PingIssue> page = baseMapper.selectPage(pageQuery.build(), wrapper);
        return new TableDataInfo<>(toIssueVos(page.getRecords()), page.getTotal());
    }

    @Override
    public PingIssueVo getAdmin(Long id) {
        PingIssue issue = baseMapper.selectById(id);
        if (issue == null) {
            throw new ServiceException("问题反馈不存在");
        }
        List<PingIssueMessage> messages = queryMessages(List.of(issue.getId()), false);
        return toIssueVo(issue, resolveAttachmentUrls(List.of(issue), messages), messages);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean review(PingIssueReviewBo bo) {
        PingIssue issue = baseMapper.selectById(bo.getId());
        if (issue == null) {
            throw new ServiceException("问题反馈不存在");
        }
        issue.setStatus(bo.getStatus());
        issue.setPublicVisible(bo.getPublicVisible());
        issue.setRemark(normalizeText(bo.getRemark(), 512));
        return baseMapper.updateById(issue) == 1;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long addAdminMessage(Long issueId, PingIssueAdminMessageBo bo) {
        PingIssue issue = baseMapper.selectById(issueId);
        if (issue == null) {
            throw new ServiceException("问题反馈不存在");
        }
        LoginUser loginUser = requireLoginUser();
        String content = normalizeText(bo.getContent(), 5000);
        PingIssueMessage message = buildMessage(
            issue, loginUser, "admin", content, Boolean.TRUE.equals(bo.getPublicVisible()));
        if (messageMapper.insert(message) != 1) {
            throw new ServiceException("管理员回复失败，请稍后重试");
        }

        issue.setAdminReply(content);
        issue.setReplyUserId(loginUser.getUserId());
        issue.setReplyUserName(normalizeSingleLine(
            StringUtils.blankToDefault(loginUser.getNickname(), loginUser.getUsername()), 64));
        issue.setReplyTime(new Date());
        if (baseMapper.updateById(issue) != 1) {
            throw new ServiceException("管理员回复状态更新失败");
        }
        return message.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateMessageVisibility(PingIssueMessageVisibilityBo bo) {
        PingIssueMessage message = messageMapper.selectById(bo.getId());
        if (message == null) {
            throw new ServiceException("反馈消息不存在");
        }
        message.setPublicVisible(bo.getPublicVisible());
        return messageMapper.updateById(message) == 1;
    }

    private List<PingIssueVo> toIssueVos(List<PingIssue> issues) {
        Map<Long, String> urls = resolveAttachmentUrls(issues, List.of());
        return issues.stream().map(issue -> toIssueVo(issue, urls)).toList();
    }

    private List<PingIssueVo> toIssueVosWithMessages(List<PingIssue> issues, boolean publicOnly) {
        List<Long> issueIds = issues.stream().map(PingIssue::getId).toList();
        List<PingIssueMessage> messages = queryMessages(issueIds, publicOnly);
        Map<Long, List<PingIssueMessage>> messagesByIssue = groupMessages(messages);
        Map<Long, String> urls = resolveAttachmentUrls(issues, messages);
        return issues.stream()
            .map(issue -> toIssueVo(issue, urls, messagesByIssue.getOrDefault(issue.getId(), List.of())))
            .toList();
    }

    private PingIssueVo toIssueVo(PingIssue issue, Map<Long, String> urls) {
        return toIssueVo(issue, urls, List.of());
    }

    private PingIssueVo toIssueVo(
        PingIssue issue,
        Map<Long, String> urls,
        List<PingIssueMessage> messages) {
        PingIssueVo vo = new PingIssueVo();
        vo.setId(issue.getId());
        vo.setUserId(issue.getUserId());
        vo.setUserName(issue.getUserName());
        vo.setNickname(issue.getNickname());
        vo.setIssueType(issue.getIssueType());
        vo.setTitle(issue.getTitle());
        vo.setContent(issue.getContent());
        vo.setAttachments(resolveAttachments(issue.getAttachmentsJson(), urls));
        vo.setMessages(toMessageVos(messages, urls, false));
        vo.setStatus(issue.getStatus());
        vo.setPublicVisible(Boolean.TRUE.equals(issue.getPublicVisible()));
        vo.setAdminReply(issue.getAdminReply());
        vo.setReplyUserId(issue.getReplyUserId());
        vo.setReplyUserName(issue.getReplyUserName());
        vo.setReplyTime(issue.getReplyTime());
        vo.setRemark(issue.getRemark());
        vo.setCreateTime(issue.getCreateTime());
        vo.setUpdateTime(issue.getUpdateTime());
        return vo;
    }

    private PingPublicIssueVo toPublicVo(
        PingIssue issue,
        Map<Long, String> urls,
        List<PingIssueMessage> messages) {
        PingPublicIssueVo vo = new PingPublicIssueVo();
        vo.setId(issue.getId());
        vo.setAuthorName("用户");
        vo.setIssueType(issue.getIssueType());
        vo.setTitle(issue.getTitle());
        vo.setContent(issue.getContent());
        vo.setAttachments(resolveAttachments(issue.getAttachmentsJson(), urls));
        List<PingIssueMessageVo> messageVos = toMessageVos(messages, urls, true);
        vo.setMessages(messageVos);
        vo.setStatus(issue.getStatus());
        PingIssueMessageVo latestAdminMessage = messageVos.stream()
            .filter(message -> "admin".equals(message.getSenderType()))
            .reduce((first, second) -> second)
            .orElse(null);
        vo.setAdminReply(latestAdminMessage == null ? null : latestAdminMessage.getContent());
        vo.setReplyUserName(latestAdminMessage == null ? null : latestAdminMessage.getSenderName());
        vo.setReplyTime(latestAdminMessage == null ? null : latestAdminMessage.getCreateTime());
        vo.setCreateTime(issue.getCreateTime());
        vo.setUpdateTime(issue.getUpdateTime());
        return vo;
    }

    private Map<Long, String> resolveAttachmentUrls(
        Collection<PingIssue> issues,
        Collection<PingIssueMessage> messages) {
        LinkedHashSet<Long> ids = issues.stream()
            .flatMap(issue -> parseAttachments(issue.getAttachmentsJson()).stream())
            .map(PingIssueAttachmentVo::getOssId)
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        messages.stream()
            .flatMap(message -> parseAttachments(message.getAttachmentsJson()).stream())
            .map(PingIssueAttachmentVo::getOssId)
            .filter(java.util.Objects::nonNull)
            .forEach(ids::add);
        if (ids.isEmpty()) {
            return Map.of();
        }
        return ossService.listByIds(ids).stream()
            .collect(Collectors.toMap(SysOssVo::getOssId, SysOssVo::getUrl, (first, ignored) -> first, HashMap::new));
    }

    private List<PingIssueAttachmentVo> resolveAttachments(String attachmentsJson, Map<Long, String> urls) {
        return parseAttachments(attachmentsJson).stream().map(attachment ->
            new PingIssueAttachmentVo(
                attachment.getOssId(),
                StringUtils.blankToDefault(urls.get(attachment.getOssId()), attachment.getUrl()),
                attachment.getOriginalName(),
                attachment.getSize()
            )).toList();
    }

    private List<PingIssueMessageVo> toMessageVos(
        List<PingIssueMessage> messages,
        Map<Long, String> urls,
        boolean publicResponse) {
        return messages.stream().map(message -> {
            PingIssueMessageVo vo = new PingIssueMessageVo();
            vo.setId(message.getId());
            vo.setIssueId(message.getIssueId());
            vo.setSenderUserId(publicResponse ? null : message.getSenderUserId());
            vo.setSenderName(publicResponse
                ? ("admin".equals(message.getSenderType()) ? "管理员" : "用户")
                : message.getSenderName());
            vo.setSenderType(message.getSenderType());
            vo.setContent(message.getContent());
            vo.setAttachments(resolveAttachments(message.getAttachmentsJson(), urls));
            vo.setPublicVisible(Boolean.TRUE.equals(message.getPublicVisible()));
            vo.setCreateTime(message.getCreateTime());
            vo.setUpdateTime(message.getUpdateTime());
            return vo;
        }).toList();
    }

    private List<PingIssueMessage> queryMessages(List<Long> issueIds, boolean publicOnly) {
        if (issueIds.isEmpty()) {
            return List.of();
        }
        return messageMapper.selectList(Wrappers.<PingIssueMessage>lambdaQuery()
            .in(PingIssueMessage::getIssueId, issueIds)
            .eq(publicOnly, PingIssueMessage::getPublicVisible, true)
            .orderByAsc(PingIssueMessage::getCreateTime)
            .orderByAsc(PingIssueMessage::getId));
    }

    private Map<Long, List<PingIssueMessage>> groupMessages(List<PingIssueMessage> messages) {
        return messages.stream().collect(Collectors.groupingBy(
            PingIssueMessage::getIssueId,
            java.util.LinkedHashMap::new,
            Collectors.toList()
        ));
    }

    private Set<Long> findPublicMessageIssueIds(String keyword) {
        if (StringUtils.isBlank(keyword)) {
            return Set.of();
        }
        return messageMapper.selectList(Wrappers.<PingIssueMessage>lambdaQuery()
                .select(PingIssueMessage::getIssueId)
                .eq(PingIssueMessage::getPublicVisible, true)
                .like(PingIssueMessage::getContent, keyword))
            .stream()
            .map(PingIssueMessage::getIssueId)
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private PingIssue findMineIssue(Long issueId, LoginUser loginUser) {
        PingIssue issue = baseMapper.selectOne(Wrappers.<PingIssue>lambdaQuery()
            .eq(PingIssue::getId, issueId)
            .eq(PingIssue::getTenantId, loginUser.getTenantId())
            .eq(PingIssue::getUserId, loginUser.getUserId()));
        if (issue == null) {
            throw new ServiceException("问题反馈不存在或无权回复");
        }
        return issue;
    }

    private PingIssueMessage buildMessage(
        PingIssue issue,
        LoginUser loginUser,
        String senderType,
        String content,
        boolean publicVisible) {
        PingIssueMessage message = new PingIssueMessage();
        message.setTenantId(issue.getTenantId());
        message.setIssueId(issue.getId());
        message.setSenderUserId(loginUser.getUserId());
        message.setSenderName(normalizeSingleLine(
            StringUtils.blankToDefault(loginUser.getNickname(), loginUser.getUsername()), 64));
        message.setSenderType(senderType);
        message.setContent(content);
        message.setAttachmentsJson("[]");
        message.setPublicVisible(publicVisible);
        return message;
    }

    private List<PingIssueAttachmentVo> parseAttachments(String json) {
        if (StringUtils.isBlank(json)) {
            return List.of();
        }
        try {
            List<PingIssueAttachmentVo> attachments = JsonUtils.parseObject(json, ATTACHMENT_TYPE);
            return attachments == null ? List.of() : attachments;
        } catch (RuntimeException ignored) {
            return List.of();
        }
    }

    private void validateFiles(List<MultipartFile> files) {
        if (files.size() > MAX_FILES) {
            throw new ServiceException("最多只能上传3张截图");
        }
        for (MultipartFile file : files) {
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new ServiceException("单张截图不能超过5MB");
            }
            String extension = getExtension(file.getOriginalFilename());
            if (!ALLOWED_EXTENSIONS.contains(extension) || !matchesImageSignature(file, extension)) {
                throw new ServiceException("截图仅支持 JPG、PNG、GIF 或 WEBP 格式");
            }
        }
    }

    private boolean matchesImageSignature(MultipartFile file, String extension) {
        try (InputStream input = file.getInputStream()) {
            byte[] header = input.readNBytes(12);
            return switch (extension) {
                case "jpg", "jpeg" -> header.length >= 3
                    && unsigned(header[0]) == 0xFF && unsigned(header[1]) == 0xD8 && unsigned(header[2]) == 0xFF;
                case "png" -> header.length >= 8
                    && unsigned(header[0]) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                    && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
                case "gif" -> header.length >= 6
                    && (new String(header, 0, 6, StandardCharsets.US_ASCII).equals("GIF87a")
                    || new String(header, 0, 6, StandardCharsets.US_ASCII).equals("GIF89a"));
                case "webp" -> header.length >= 12
                    && new String(header, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                    && new String(header, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
                default -> false;
            };
        } catch (IOException ignored) {
            return false;
        }
    }

    private int unsigned(byte value) {
        return value & 0xFF;
    }

    private String getExtension(String fileName) {
        String normalized = fileName == null ? "" : fileName.trim().toLowerCase(Locale.ROOT);
        int separator = normalized.lastIndexOf('.');
        return separator < 0 ? "" : normalized.substring(separator + 1);
    }

    private void cleanupUploads(List<Long> uploadedIds) {
        if (uploadedIds.isEmpty()) {
            return;
        }
        try {
            ossService.deleteWithValidByIds(uploadedIds, false);
        } catch (RuntimeException ignored) {
            // Preserve the original submission error; OSS cleanup can be retried from the OSS console.
        }
    }

    private LoginUser requireLoginUser() {
        LoginUser loginUser = LoginHelper.getLoginUser();
        if (loginUser == null || loginUser.getUserId() == null) {
            throw new ServiceException("登录状态已失效，请重新登录");
        }
        return loginUser;
    }

    private String normalizeFileName(String value) {
        return normalizeSingleLine(value, 255);
    }

    private String normalizeSingleLine(String value, int maxLength) {
        String normalized = value == null ? "" : value.trim().replaceAll("[\\r\\n\\t]+", " ").replaceAll(" {2,}", " ");
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }

    private String normalizeText(String value, int maxLength) {
        String normalized = value == null ? "" : value.replace("\r\n", "\n").replace('\r', '\n').trim();
        return normalized.length() > maxLength ? normalized.substring(0, maxLength) : normalized;
    }
}
