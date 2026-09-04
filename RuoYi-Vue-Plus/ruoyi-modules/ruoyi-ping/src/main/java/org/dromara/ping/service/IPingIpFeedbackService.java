package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingIpFeedbackQueryBo;
import org.dromara.ping.domain.bo.PingIpFeedbackReviewBo;
import org.dromara.ping.domain.bo.PingIpFeedbackSubmitBo;
import org.dromara.ping.domain.vo.PingIpFeedbackVo;
import org.dromara.ping.domain.vo.PingPublicIpFeedbackPageVo;

public interface IPingIpFeedbackService {

    Long submit(PingIpFeedbackSubmitBo bo);

    TableDataInfo<PingIpFeedbackVo> queryPageList(PingIpFeedbackQueryBo bo, PageQuery pageQuery);

    PingPublicIpFeedbackPageVo queryPublicPage(String ip, Integer pageNum, Integer pageSize);

    Boolean review(PingIpFeedbackReviewBo bo);
}
