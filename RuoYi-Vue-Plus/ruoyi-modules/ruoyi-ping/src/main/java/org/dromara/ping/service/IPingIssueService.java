package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingIssueAdminMessageBo;
import org.dromara.ping.domain.bo.PingIssueMessageSubmitBo;
import org.dromara.ping.domain.bo.PingIssueMessageVisibilityBo;
import org.dromara.ping.domain.bo.PingIssueQueryBo;
import org.dromara.ping.domain.bo.PingIssueReviewBo;
import org.dromara.ping.domain.bo.PingIssueSubmitBo;
import org.dromara.ping.domain.vo.PingIssueVo;
import org.dromara.ping.domain.vo.PingPublicIssuePageVo;
import org.dromara.ping.domain.vo.PingPublicIssueVo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPingIssueService {

    Long submit(PingIssueSubmitBo bo, List<MultipartFile> files);

    TableDataInfo<PingIssueVo> queryMine(String category, PageQuery pageQuery);

    PingIssueVo getMine(Long id);

    Long addMineMessage(Long issueId, PingIssueMessageSubmitBo bo);

    PingPublicIssuePageVo queryPublicPage(String keyword, Integer pageNum, Integer pageSize);

    PingPublicIssueVo getPublic(Long id);

    TableDataInfo<PingIssueVo> queryAdminPage(PingIssueQueryBo bo, PageQuery pageQuery);

    PingIssueVo getAdmin(Long id);

    Boolean review(PingIssueReviewBo bo);

    Long addAdminMessage(Long issueId, PingIssueAdminMessageBo bo);

    Boolean updateMessageVisibility(PingIssueMessageVisibilityBo bo);
}
