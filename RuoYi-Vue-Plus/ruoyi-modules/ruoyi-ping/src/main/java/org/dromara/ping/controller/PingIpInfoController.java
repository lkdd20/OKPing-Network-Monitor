package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.ping.domain.dto.IpInfoDto;
import org.dromara.ping.domain.vo.PingIpInfoVo;
import org.dromara.ping.service.IPingIpInfoService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.dromara.common.mybatis.core.mapper.BaseMapperPlus.log;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/ip-info")
public class PingIpInfoController {

    private final IPingIpInfoService ipInfoService;

    @SaIgnore
    @PostMapping("/query")
    public R<PingIpInfoVo> query(@Valid @RequestBody IpInfoDto dto) {
        return R.ok(ipInfoService.query(dto.getIp()));
    }

    @SaIgnore
    @GetMapping("/client")
    public R<String> clientIp(HttpServletRequest request) {
        String ip = ipInfoService.firstPublicClientIp(List.of(
            header(request, "X-Forwarded-For"),
            header(request, "X-Real-IP"),
            String.valueOf(request.getRemoteAddr())
        ));
        return R.ok(ip);
    }

    private String header(HttpServletRequest request, String name) {
        String value = request.getHeader(name);
        return value == null ? "" : value;
    }
}
