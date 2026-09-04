package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.dto.OssDTO;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.service.OssService;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.PingBlogPost;
import org.dromara.ping.domain.bo.PingBlogPostBo;
import org.dromara.ping.domain.vo.PingBlogPostVo;
import org.dromara.ping.domain.vo.PingPublicBlogPageVo;
import org.dromara.ping.domain.vo.PingPublicBlogPostDetailVo;
import org.dromara.ping.domain.vo.PingPublicBlogPostVo;
import org.dromara.ping.mapper.PingBlogPostMapper;
import org.dromara.ping.service.IPingBlogPostService;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.TextNode;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
public class PingBlogPostServiceImpl implements IPingBlogPostService {

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_PUBLISHED = "published";
    private static final int PUBLIC_DEFAULT_PAGE_SIZE = 9;
    private static final int PUBLIC_MAX_PAGE_SIZE = 24;
    private static final Set<String> ALLOWED_INLINE_STYLE_PROPERTIES = Set.of(
        "background-color",
        "color",
        "font-family",
        "font-size",
        "font-style",
        "font-weight",
        "letter-spacing",
        "line-height",
        "text-align",
        "text-decoration",
        "text-indent",
        "vertical-align",
        "white-space"
    );
    private static final Pattern SAFE_INLINE_STYLE_VALUE = Pattern.compile("^[\\p{L}\\p{N}\\s#(),.%+'\"/_+*-]+$");
    private static final Safelist BLOG_CONTENT_SAFELIST = Safelist.relaxed()
        .addTags("h1", "h2", "h3", "h4", "h5", "h6", "pre", "code", "figure", "figcaption", "span", "div")
        .addAttributes(":all", "class", "style")
        .addAttributes("a", "target", "rel", "title")
        .addAttributes("img", "alt", "title", "width", "height", "loading")
        .addAttributes("table", "table_id", "border", "cellpadding", "cellspacing", "width")
        .addAttributes("tr", "row_id")
        .addAttributes("td", "table_id", "row_id", "cell_id", "merge_id", "colspan", "rowspan", "hide_border", "width")
        .addAttributes("th", "colspan", "rowspan", "scope", "width")
        .addAttributes("col", "span", "width")
        .addProtocols("a", "href", "http", "https", "mailto", "tel")
        .addProtocols("img", "src", "http", "https");
    private static final Document.OutputSettings BLOG_OUTPUT_SETTINGS = new Document.OutputSettings().prettyPrint(false);

    private final PingBlogPostMapper baseMapper;
    private final OssService ossService;

    @Override
    public PingBlogPostVo queryById(Long id) {
        PingBlogPostVo vo = baseMapper.selectVoById(id);
        resolveAdminCoverUrls(vo == null ? List.of() : List.of(vo));
        return vo;
    }

    @Override
    public TableDataInfo<PingBlogPostVo> queryPageList(PingBlogPostBo bo, PageQuery pageQuery) {
        Page<PingBlogPostVo> page = baseMapper.selectVoPage(pageQuery.build(), buildAdminQuery(bo));
        resolveAdminCoverUrls(page.getRecords());
        return TableDataInfo.build(page);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean insertByBo(PingBlogPostBo bo) {
        PingBlogPost post = MapstructUtils.convert(bo, PingBlogPost.class);
        normalizeBeforeSave(post);
        ensureSlugUnique(post.getSlug(), null);
        boolean saved = baseMapper.insert(post) > 0;
        if (saved) {
            bo.setId(post.getId());
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateByBo(PingBlogPostBo bo) {
        if (!baseMapper.exists(Wrappers.<PingBlogPost>lambdaQuery().eq(PingBlogPost::getId, bo.getId()))) {
            throw new ServiceException("博客文章不存在");
        }
        PingBlogPost post = MapstructUtils.convert(bo, PingBlogPost.class);
        normalizeBeforeSave(post);
        ensureSlugUnique(post.getSlug(), post.getId());
        return baseMapper.updateById(post) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public PingPublicBlogPageVo queryPublicPage(String keyword, String category, Integer pageNum, Integer pageSize) {
        int safePageNum = pageNum == null || pageNum < 1 ? 1 : pageNum;
        int safePageSize = pageSize == null || pageSize < 1
            ? PUBLIC_DEFAULT_PAGE_SIZE
            : Math.min(pageSize, PUBLIC_MAX_PAGE_SIZE);
        String safeKeyword = normalizeQuery(keyword, 80);
        String safeCategory = normalizeQuery(category, 64);
        LambdaQueryWrapper<PingBlogPost> wrapper = publicQuery();
        wrapper.eq(StringUtils.isNotBlank(safeCategory), PingBlogPost::getCategory, safeCategory);
        wrapper.and(StringUtils.isNotBlank(safeKeyword), query -> query
            .like(PingBlogPost::getTitle, safeKeyword)
            .or()
            .like(PingBlogPost::getSummary, safeKeyword)
            .or()
            .like(PingBlogPost::getTags, safeKeyword));
        Page<PingBlogPost> page = baseMapper.selectPage(new Page<>(safePageNum, safePageSize), wrapper);

        PingPublicBlogPageVo result = new PingPublicBlogPageVo();
        result.setRows(page.getRecords().stream().map(this::toPublicPost).toList());
        result.setCategories(queryPublicCategories());
        result.setTotal(page.getTotal());
        result.setPageNum(safePageNum);
        result.setPageSize(safePageSize);
        resolvePublicCoverUrls(result.getRows());
        return result;
    }

    @Override
    public PingPublicBlogPostDetailVo queryPublicDetail(String slug) {
        String safeSlug = normalizeSlug(slug, "");
        if (StringUtils.isBlank(safeSlug)) {
            return null;
        }
        PingBlogPost post = baseMapper.selectOne(publicQuery()
            .eq(PingBlogPost::getSlug, safeSlug)
            .last("limit 1"));
        if (post == null) {
            return null;
        }
        PingPublicBlogPostDetailVo result = toPublicDetail(post);
        resolvePublicCoverUrls(List.of(result));
        return result;
    }

    private LambdaQueryWrapper<PingBlogPost> buildAdminQuery(PingBlogPostBo bo) {
        LambdaQueryWrapper<PingBlogPost> wrapper = Wrappers.lambdaQuery();
        wrapper.orderByDesc(PingBlogPost::getFeatured)
            .orderByDesc(PingBlogPost::getSortOrder)
            .orderByDesc(PingBlogPost::getPublishTime)
            .orderByDesc(PingBlogPost::getId)
            .eq(StringUtils.isNotBlank(bo.getStatus()), PingBlogPost::getStatus, bo.getStatus())
            .eq(StringUtils.isNotBlank(bo.getCategory()), PingBlogPost::getCategory, bo.getCategory())
            .and(StringUtils.isNotBlank(bo.getKeyword()), query -> query
                .like(PingBlogPost::getTitle, bo.getKeyword())
                .or()
                .like(PingBlogPost::getSlug, bo.getKeyword())
                .or()
                .like(PingBlogPost::getTags, bo.getKeyword()));
        return wrapper;
    }

    private LambdaQueryWrapper<PingBlogPost> publicQuery() {
        Date now = new Date();
        return Wrappers.<PingBlogPost>lambdaQuery()
            .eq(PingBlogPost::getStatus, STATUS_PUBLISHED)
            .le(PingBlogPost::getPublishTime, now)
            .orderByDesc(PingBlogPost::getFeatured)
            .orderByDesc(PingBlogPost::getSortOrder)
            .orderByDesc(PingBlogPost::getPublishTime)
            .orderByDesc(PingBlogPost::getId);
    }

    private List<String> queryPublicCategories() {
        return baseMapper.selectList(Wrappers.<PingBlogPost>lambdaQuery()
                .eq(PingBlogPost::getStatus, STATUS_PUBLISHED)
                .le(PingBlogPost::getPublishTime, new Date())
                .select(PingBlogPost::getCategory)
                .groupBy(PingBlogPost::getCategory)
                .orderByAsc(PingBlogPost::getCategory))
            .stream()
            .map(PingBlogPost::getCategory)
            .filter(StringUtils::isNotBlank)
            .sorted()
            .toList();
    }

    void normalizeBeforeSave(PingBlogPost post) {
        post.setTitle(normalizePlainText(post.getTitle(), 200));
        post.setSummary(normalizePlainText(post.getSummary(), 500));
        post.setCategory(normalizePlainText(post.getCategory(), 64));
        post.setSlug(normalizeSlug(post.getSlug(), post.getTitle()));
        post.setTags(normalizeTags(post.getTags()));
        post.setSeoTitle(normalizePlainText(post.getSeoTitle(), 255));
        post.setSeoDescription(normalizePlainText(post.getSeoDescription(), 500));
        post.setSeoKeywords(normalizePlainText(post.getSeoKeywords(), 255));
        post.setRemark(normalizePlainText(post.getRemark(), 512));
        String cleanContent = Jsoup.clean(StringUtils.blankToDefault(post.getContent(), ""), "", BLOG_CONTENT_SAFELIST, BLOG_OUTPUT_SETTINGS);
        post.setContent(sanitizeInlineStyles(cleanContent));
        post.setFeatured(Boolean.TRUE.equals(post.getFeatured()));
        post.setSortOrder(post.getSortOrder() == null ? 0L : post.getSortOrder());

        if (!STATUS_DRAFT.equals(post.getStatus()) && !STATUS_PUBLISHED.equals(post.getStatus())) {
            throw new ServiceException("博客状态仅支持草稿或已发布");
        }
        if (STATUS_PUBLISHED.equals(post.getStatus()) && post.getPublishTime() == null) {
            post.setPublishTime(new Date());
        }
        if (StringUtils.isBlank(post.getTitle()) || StringUtils.isBlank(post.getSummary())
            || StringUtils.isBlank(post.getCategory()) || StringUtils.isBlank(post.getContent())) {
            throw new ServiceException("文章标题、摘要、分类和正文不能为空");
        }
    }

    void ensureSlugUnique(String slug, Long excludedId) {
        LambdaQueryWrapper<PingBlogPost> wrapper = Wrappers.lambdaQuery(PingBlogPost.class)
            .eq(PingBlogPost::getSlug, slug)
            .ne(excludedId != null, PingBlogPost::getId, excludedId);
        if (baseMapper.exists(wrapper)) {
            throw new ServiceException("文章别名已存在，请更换后重试");
        }
    }

    private String normalizeSlug(String slug, String fallbackTitle) {
        String source = StringUtils.isBlank(slug) ? fallbackTitle : slug;
        String normalized = normalizePlainText(source, 300)
            .toLowerCase(Locale.ROOT)
            .replaceAll("[\\s_]+", "-")
            .replaceAll("[^\\p{L}\\p{N}-]+", "-")
            .replaceAll("-{2,}", "-")
            .replaceAll("^-|-$", "");
        if (StringUtils.isBlank(normalized)) {
            normalized = "post-" + UUID.randomUUID().toString().substring(0, 8);
        }
        return normalized.length() > 160 ? normalized.substring(0, 160).replaceAll("-+$", "") : normalized;
    }

    private String normalizeTags(String tags) {
        if (StringUtils.isBlank(tags)) {
            return "";
        }
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String tag : tags.split("[,，]")) {
            String value = normalizePlainText(tag, 30);
            if (StringUtils.isNotBlank(value)) {
                normalized.add(value);
            }
            if (normalized.size() >= 10) {
                break;
            }
        }
        return String.join(",", normalized);
    }

    private String sanitizeInlineStyles(String html) {
        Document document = Jsoup.parseBodyFragment(html, "");
        document.outputSettings().prettyPrint(false);
        document.body().childNodes().stream()
            .filter(node -> node instanceof TextNode textNode && StringUtils.isBlank(textNode.getWholeText()))
            .forEach(org.jsoup.nodes.Node::remove);
        document.body().select("p").stream()
            .filter(paragraph -> paragraph.children().isEmpty() && StringUtils.isBlank(paragraph.html()))
            .forEach(org.jsoup.nodes.Element::remove);
        document.body().select("[style]").forEach(element -> {
            String style = sanitizeInlineStyle(element.attr("style"));
            if (StringUtils.isBlank(style)) {
                element.removeAttr("style");
            } else {
                element.attr("style", style);
            }
        });
        return document.body().html();
    }

    private String sanitizeInlineStyle(String style) {
        return java.util.Arrays.stream(style.split(";"))
            .map(String::trim)
            .filter(StringUtils::isNotBlank)
            .map(declaration -> declaration.indexOf(':') < 0 ? null : declaration)
            .filter(Objects::nonNull)
            .map(declaration -> declaration.split(":", 2))
            .filter(parts -> ALLOWED_INLINE_STYLE_PROPERTIES.contains(parts[0].trim().toLowerCase(Locale.ROOT)))
            .filter(parts -> isSafeInlineStyleValue(parts[1].trim()))
            .map(parts -> parts[0].trim().toLowerCase(Locale.ROOT) + ": " + parts[1].trim())
            .collect(Collectors.joining("; "));
    }

    private boolean isSafeInlineStyleValue(String value) {
        String lowerValue = value.toLowerCase(Locale.ROOT);
        return StringUtils.isNotBlank(value)
            && SAFE_INLINE_STYLE_VALUE.matcher(value).matches()
            && !lowerValue.contains("url(")
            && !lowerValue.contains("expression(")
            && !lowerValue.contains("javascript:")
            && !lowerValue.contains("var(")
            && !lowerValue.contains("attr(");
    }

    private String normalizePlainText(String value, int maxLength) {
        if (StringUtils.isBlank(value)) {
            return "";
        }
        String text = Jsoup.parse(value).text().trim();
        return text.length() > maxLength ? text.substring(0, maxLength) : text;
    }

    private String normalizeQuery(String value, int maxLength) {
        return normalizePlainText(value, maxLength);
    }

    private PingPublicBlogPostVo toPublicPost(PingBlogPost post) {
        PingPublicBlogPostVo vo = new PingPublicBlogPostVo();
        copyPublicFields(post, vo);
        return vo;
    }

    private PingPublicBlogPostDetailVo toPublicDetail(PingBlogPost post) {
        PingPublicBlogPostDetailVo vo = new PingPublicBlogPostDetailVo();
        copyPublicFields(post, vo);
        vo.setContent(post.getContent());
        vo.setSeoTitle(StringUtils.blankToDefault(post.getSeoTitle(), post.getTitle()));
        vo.setSeoDescription(StringUtils.blankToDefault(post.getSeoDescription(), post.getSummary()));
        vo.setSeoKeywords(StringUtils.blankToDefault(post.getSeoKeywords(), post.getTags()));
        return vo;
    }

    private void copyPublicFields(PingBlogPost post, PingPublicBlogPostVo vo) {
        vo.setId(post.getId());
        vo.setTitle(post.getTitle());
        vo.setSlug(post.getSlug());
        vo.setSummary(post.getSummary());
        vo.setCoverOssId(post.getCoverOssId());
        vo.setCategory(post.getCategory());
        vo.setTags(splitTags(post.getTags()));
        vo.setFeatured(post.getFeatured());
        vo.setPublishTime(post.getPublishTime());
        vo.setUpdateTime(post.getUpdateTime());
    }

    private List<String> splitTags(String tags) {
        return StringUtils.isBlank(tags) ? List.of() : List.of(tags.split(","));
    }

    private void resolveAdminCoverUrls(Collection<PingBlogPostVo> posts) {
        Map<Long, String> urls = queryCoverUrls(posts.stream().map(PingBlogPostVo::getCoverOssId).toList());
        posts.forEach(post -> post.setCoverUrl(resolveCoverUrl(urls, post.getCoverOssId())));
    }

    private void resolvePublicCoverUrls(Collection<? extends PingPublicBlogPostVo> posts) {
        Map<Long, String> urls = queryCoverUrls(posts.stream().map(PingPublicBlogPostVo::getCoverOssId).toList());
        posts.forEach(post -> post.setCoverUrl(resolveCoverUrl(urls, post.getCoverOssId())));
    }

    private String resolveCoverUrl(Map<Long, String> urls, Long coverOssId) {
        return coverOssId == null ? null : urls.get(coverOssId);
    }

    private Map<Long, String> queryCoverUrls(Collection<Long> ids) {
        String joinedIds = ids.stream()
            .filter(Objects::nonNull)
            .distinct()
            .map(String::valueOf)
            .collect(Collectors.joining(","));
        if (StringUtils.isBlank(joinedIds)) {
            return Map.of();
        }
        return ossService.selectByIds(joinedIds).stream()
            .filter(item -> item.getOssId() != null && StringUtils.isNotBlank(item.getUrl()))
            .collect(Collectors.toMap(OssDTO::getOssId, OssDTO::getUrl, (left, right) -> left));
    }

}
