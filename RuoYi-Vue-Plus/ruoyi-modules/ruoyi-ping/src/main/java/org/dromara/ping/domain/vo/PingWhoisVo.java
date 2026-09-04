package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingWhoisVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String domain;
    private String registrar;
    private String registrarUrl;
    private String registrantOrg;
    private String registrantEmail;
    private String whoisServer;
    private String creationDate;
    private String expirationDate;
    private String updatedDate;
    private String dnssec;
    private List<String> nameServers = new ArrayList<>();
    private List<String> statuses = new ArrayList<>();
    private String rawWhois;
}
