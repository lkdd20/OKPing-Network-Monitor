package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingProductBetaSignupBo;
import org.dromara.ping.domain.vo.PingProductBetaSignupVo;
import org.dromara.ping.domain.vo.PingProductBetaStatusVo;
import org.dromara.ping.domain.vo.PingProductBetaSummaryVo;

public interface IPingProductBetaSignupService {

    PingProductBetaStatusVo getCurrentStatus();

    PingProductBetaStatusVo signup();

    TableDataInfo<PingProductBetaSignupVo> queryPageList(
        PingProductBetaSignupBo bo, PageQuery pageQuery);

    PingProductBetaSummaryVo querySummary();

    Boolean updateStatus(PingProductBetaSignupBo bo);
}
