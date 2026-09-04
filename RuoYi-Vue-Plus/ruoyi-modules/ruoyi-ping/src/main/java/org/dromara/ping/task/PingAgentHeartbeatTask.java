package org.dromara.ping.task;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.ping.service.IPingAgentService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PingAgentHeartbeatTask {

    private final IPingAgentService agentService;

    @Scheduled(fixedDelayString = "${ping.agent.offline-scan-interval-millis:60000}")
    public void markStaleNodesOffline() {
        int count = agentService.markStaleNodesOffline();
        if (count > 0) {
            log.info("ping marked {} stale Agent node(s) offline", count);
        }
    }
}
