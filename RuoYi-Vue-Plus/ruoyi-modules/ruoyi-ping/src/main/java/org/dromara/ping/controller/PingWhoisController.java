package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.ping.domain.dto.WhoisQueryDto;
import org.dromara.ping.domain.vo.PingWhoisVo;
import org.dromara.ping.service.IPingWhoisService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ping/whois")
@RequiredArgsConstructor
public class PingWhoisController {

    private final IPingWhoisService whoisService;

    @SaIgnore
    @PostMapping("/query")
    public R<PingWhoisVo> query(@Valid @RequestBody WhoisQueryDto dto) {
        return R.ok(whoisService.query(dto.getHost()));
    }
}
