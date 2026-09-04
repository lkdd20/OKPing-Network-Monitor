package org.dromara.ping.domain.vo;

import lombok.Data;

@Data
public class PingIpDatabaseStatusVo {

    private String version;
    private boolean custom;
    private String fileName;
    private long fileSize;
    private String updatedAt;
}
