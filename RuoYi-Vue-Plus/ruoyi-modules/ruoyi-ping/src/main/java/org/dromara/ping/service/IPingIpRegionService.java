package org.dromara.ping.service;

import org.dromara.ping.domain.vo.PingIpDatabaseStatusVo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IPingIpRegionService {

    String lookup(String ip);

    /**
     * Reload administrator-approved location correction ranges without restarting the service.
     */
    void refreshApprovedCorrections();

    List<PingIpDatabaseStatusVo> status();

    PingIpDatabaseStatusVo upload(String version, MultipartFile file);
}
