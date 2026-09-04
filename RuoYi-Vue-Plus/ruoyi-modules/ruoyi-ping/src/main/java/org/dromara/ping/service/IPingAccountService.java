package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.vo.PingAccountProfileVo;
import org.dromara.ping.domain.vo.PingAccountSessionVo;
import org.dromara.ping.domain.vo.PingLoginLogVo;
import org.dromara.ping.domain.vo.PingSessionKickVo;
import org.dromara.ping.domain.vo.PingUserPreferenceVo;

import java.util.List;

public interface IPingAccountService {

    PingAccountProfileVo getProfile();

    PingUserPreferenceVo getPreferences();

    PingUserPreferenceVo savePreferences(PingUserPreferenceVo preferences);

    List<PingAccountSessionVo> getSessions();

    PingSessionKickVo kickSession(String sessionKey);

    TableDataInfo<PingLoginLogVo> getLoginLogs(PageQuery pageQuery);
}
