package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import org.dromara.common.core.domain.dto.OssDTO;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.service.OssService;
import org.dromara.ping.domain.PingBlogPost;
import org.dromara.ping.domain.vo.PingBlogPostVo;
import org.dromara.ping.domain.vo.PingPublicBlogPostDetailVo;
import org.dromara.ping.mapper.PingBlogPostMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingBlogPostServiceImplTest {

    @Mock
    private PingBlogPostMapper baseMapper;

    @Mock
    private OssService ossService;

    @InjectMocks
    private PingBlogPostServiceImpl service;

    @Test
    void normalizeBeforeSaveSanitizesRichTextAndGeneratesSlug() {
        PingBlogPost post = new PingBlogPost();
        post.setTitle("<b>网络 检测入门</b>");
        post.setSummary("<span>一篇摘要</span>");
        post.setCategory("<em>网络技术</em>");
        post.setContent("<p onclick=\"alert(1)\">正文</p><script>alert(1)</script>"
            + "<p><span style=\"color: rgb(230, 0, 0); background-color: rgb(255, 255, 0); font-size: 18px; text-align: center;\">彩色正文</span>"
            + "<span style=\"position: fixed; background-image: url(https://evil.example/x);\">不安全样式</span></p>"
            + "<img src=\"javascript:alert(2)\" onerror=\"alert(3)\">"
            + "<img src=\"https://oss.example.com/cover.png\" alt=\"cover\">");
        post.setTags(" Ping，网络监控,Ping ");
        post.setStatus("published");

        service.normalizeBeforeSave(post);

        assertThat(post.getTitle()).isEqualTo("网络 检测入门");
        assertThat(post.getSlug()).isEqualTo("网络-检测入门");
        assertThat(post.getTags()).isEqualTo("Ping,网络监控");
        assertThat(post.getContent())
            .contains("https://oss.example.com/cover.png")
            .contains("color: rgb(230, 0, 0)", "background-color: rgb(255, 255, 0)", "font-size: 18px", "text-align: center")
            .doesNotContain("script", "onclick", "onerror", "javascript:", "position", "background-image", "url(");
        assertThat(post.getPublishTime()).isNotNull();
    }

    @Test
    void normalizeBeforeSaveKeepsParagraphSpacingStableAcrossRepeatedSaves() {
        PingBlogPost post = new PingBlogPost();
        post.setTitle("段落测试");
        post.setSummary("摘要");
        post.setCategory("网络技术");
        post.setStatus("draft");
        post.setContent("<p>第一行</p>\n<p>第二行</p><p>\n</p><p><br></p><p>第三行</p>");

        service.normalizeBeforeSave(post);
        String firstSave = post.getContent();
        service.normalizeBeforeSave(post);

        assertThat(firstSave).isEqualTo("<p>第一行</p><p>第二行</p><p><br></p><p>第三行</p>");
        assertThat(post.getContent()).isEqualTo(firstSave);
    }

    @Test
    void normalizeBeforeSavePreservesEditableTableStructure() {
        PingBlogPost post = new PingBlogPost();
        post.setTitle("表格测试");
        post.setSummary("摘要");
        post.setCategory("网络技术");
        post.setStatus("draft");
        post.setContent("<table class=\"ql-editor__table--hideBorder\" table_id=\"table-1\" width=\"100%\">"
            + "<tr row_id=\"row-1\"><td table_id=\"table-1\" row_id=\"row-1\" cell_id=\"cell-1\" colspan=\"2\" onclick=\"alert(1)\">"
            + "<p>单元格内容</p></td><td table_id=\"table-1\" row_id=\"row-1\" cell_id=\"cell-2\" merge_id=\"cell-1\">"
            + "<p><br></p></td></tr></table>");

        service.normalizeBeforeSave(post);

        assertThat(post.getContent())
            .contains("<table class=\"ql-editor__table--hideBorder\" table_id=\"table-1\" width=\"100%\">")
            .contains("<tr row_id=\"row-1\">")
            .contains("cell_id=\"cell-1\"", "colspan=\"2\"", "merge_id=\"cell-1\"", "单元格内容")
            .doesNotContain("onclick", "alert(1)");
    }

    @Test
    void ensureSlugUniqueRejectsDuplicateSlug() {
        when(baseMapper.exists(any())).thenReturn(true);

        assertThatThrownBy(() -> service.ensureSlugUnique("network-check", null))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("文章别名已存在");
    }

    @Test
    void publicDetailResolvesCoverFromOss() {
        PingBlogPost post = new PingBlogPost();
        post.setId(8L);
        post.setTitle("网络检测实践");
        post.setSlug("network-check");
        post.setSummary("摘要");
        post.setContent("<p>正文</p>");
        post.setCategory("网络技术");
        post.setTags("Ping,监控");
        post.setCoverOssId(99L);
        post.setFeatured(true);
        when(baseMapper.selectOne(any())).thenReturn(post);

        OssDTO cover = new OssDTO();
        cover.setOssId(99L);
        cover.setUrl("https://oss.example.com/blog-cover.png");
        when(ossService.selectByIds(eq("99"))).thenReturn(List.of(cover));

        PingPublicBlogPostDetailVo result = service.queryPublicDetail("network-check");

        assertThat(result).isNotNull();
        assertThat(result.getCoverUrl()).isEqualTo("https://oss.example.com/blog-cover.png");
        assertThat(result.getTags()).containsExactly("Ping", "监控");
    }

    @Test
    void queriesAdminPostWithoutCover() {
        PingBlogPostVo post = new PingBlogPostVo();
        post.setId(8L);
        when(baseMapper.selectVoById(8L)).thenReturn(post);

        PingBlogPostVo result = service.queryById(8L);

        assertThat(result).isSameAs(post);
        assertThat(result.getCoverOssId()).isNull();
        assertThat(result.getCoverUrl()).isNull();
    }

    @Test
    void queriesPublicPostWithoutCover() {
        PingBlogPost post = new PingBlogPost();
        post.setId(8L);
        post.setTitle("无封面文章");
        post.setSlug("no-cover");
        post.setSummary("摘要");
        post.setContent("<p>正文</p>");
        post.setCategory("网络技术");
        when(baseMapper.selectOne(any())).thenReturn(post);

        PingPublicBlogPostDetailVo result = service.queryPublicDetail("no-cover");

        assertThat(result).isNotNull();
        assertThat(result.getCoverOssId()).isNull();
        assertThat(result.getCoverUrl()).isNull();
    }

    @Test
    void coverOssIdAlwaysParticipatesInUpdates() throws NoSuchFieldException {
        TableField tableField = PingBlogPost.class.getDeclaredField("coverOssId").getAnnotation(TableField.class);

        assertThat(tableField).isNotNull();
        assertThat(tableField.updateStrategy()).isEqualTo(FieldStrategy.ALWAYS);
    }
}
