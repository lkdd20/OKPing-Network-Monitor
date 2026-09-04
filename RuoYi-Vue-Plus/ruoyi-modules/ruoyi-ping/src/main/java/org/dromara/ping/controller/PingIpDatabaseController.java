package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.ping.domain.vo.PingIpDatabaseStatusVo;
import org.dromara.ping.service.IPingIpRegionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ping/ip-database")
public class PingIpDatabaseController {

    private final IPingIpRegionService ipRegionService;

    @SaCheckPermission("ping:nodeConfig:list")
    @GetMapping("/status")
    public R<List<PingIpDatabaseStatusVo>> status() {
        return R.ok(ipRegionService.status());
    }

    @SaCheckPermission("ping:nodeConfig:edit")
    @Log(title = "ping IP地址库", businessType = BusinessType.IMPORT)
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public R<PingIpDatabaseStatusVo> upload(@RequestParam("version") String version,
                                               @RequestPart("file") MultipartFile file) {
        return R.ok("IP地址库更新成功", ipRegionService.upload(version, file));
    }
}
