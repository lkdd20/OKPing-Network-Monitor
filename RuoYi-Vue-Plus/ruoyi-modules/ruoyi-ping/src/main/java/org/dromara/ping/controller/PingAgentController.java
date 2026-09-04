package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.log.enums.OperatorType;
import org.dromara.ping.domain.dto.PingAgentRegisterDto;
import org.dromara.ping.domain.vo.PingAgentRegisterVo;
import org.dromara.ping.service.IPingAgentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SaIgnore
@RestController
@RequiredArgsConstructor
@RequestMapping("/ping/agent")
public class PingAgentController {

    private final IPingAgentService agentService;
    @Log(title = "节点注册", businessType = BusinessType.INSERT, operatorType = OperatorType.OTHER)

    @PostMapping("/register")
    public R<PingAgentRegisterVo> register(@Valid @RequestBody PingAgentRegisterDto request,
                                               HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        PingAgentRegisterVo registration = agentService.register(request);
        return registration == null ? R.fail("节点不存在") : R.ok(registration);
    }
}
