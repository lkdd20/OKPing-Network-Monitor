package org.dromara.ping.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.domain.dto.NodeListQueryDto;
import org.dromara.ping.domain.dto.UuidDto;
import org.dromara.ping.domain.vo.PingFirstNodeVo;
import org.dromara.ping.domain.vo.PingNodeInfoVo;
import org.dromara.ping.domain.vo.PingNodeListedVo;
import org.dromara.ping.service.IPingNodeConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * ping 1.0 public node APIs. URLs intentionally do not keep the legacy /api prefix.
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/ping/nodes")
public class PingNodeController {

    private final IPingNodeConfigService nodeConfigService;

    @GetMapping("/list")
    public R<List<PingNodeListedVo>> list() {
        return R.ok(nodeConfigService.listAvailableNodes());
    }

    @GetMapping("/first")
    public R<List<PingFirstNodeVo>> firstList() {
        return R.ok(nodeConfigService.firstList());
    }

    @GetMapping("/ipv6/first")
    public R<List<PingFirstNodeVo>> ipv6FirstList() {
        return R.ok(nodeConfigService.ipv6FirstList());
    }

    @GetMapping("/ipv6/traceroute/first")
    public R<List<PingFirstNodeVo>> ipv6TracerouteFirstList() {
        return R.ok(nodeConfigService.ipv6TracerouteFirstList());
    }

    @GetMapping("/traceroute/first")
    public R<List<PingFirstNodeVo>> tracerouteFirstList() {
        return R.ok(nodeConfigService.tracerouteFirstList());
    }

    @PostMapping("/screen")
    public R<List<PingNodeListedVo>> screenList(@RequestBody(required = false) NodeListQueryDto query) {
        return R.ok(nodeConfigService.screenList(query));
    }

    @PostMapping("/ipv6/screen")
    public R<List<PingNodeListedVo>> screenIpv6List(@RequestBody(required = false) NodeListQueryDto query) {
        return R.ok(nodeConfigService.screenIpv6List(query));
    }

    @GetMapping("/info")
    public R<PingNodeInfoVo> info(HttpServletRequest request) {
        PingNodeInfoVo info = nodeConfigService.infoByIp(getClientIp(request));
        return info == null ? R.fail("节点不存在") : R.ok(info);
    }

    @PostMapping("/info")
    public R<PingNodeInfoVo> infoByUuid(@RequestBody UuidDto uuidDto) {
        if (uuidDto == null || StringUtils.isBlank(uuidDto.getUuid())) {
            return R.fail("uuid不能为空");
        }
        PingNodeInfoVo info = nodeConfigService.infoByUuid(uuidDto.getUuid());
        return info == null ? R.fail("节点不存在") : R.ok(info);
    }

    @PostMapping("/close")
    public R<Void> close(@RequestBody UuidDto uuidDto) {
        if (uuidDto == null || StringUtils.isBlank(uuidDto.getUuid())) {
            return R.fail("uuid不能为空");
        }
        return nodeConfigService.closeByQueueUuid(uuidDto.getUuid()) ? R.ok() : R.fail("节点不存在");
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (StringUtils.isBlank(ipAddress) || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (StringUtils.isBlank(ipAddress) || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (StringUtils.isBlank(ipAddress) || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("X-Real-IP");
        }
        if (StringUtils.isBlank(ipAddress) || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress == null ? null : ipAddress.split(",")[0].trim();
    }
}
