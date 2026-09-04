package org.dromara.ping.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.dromara.ping.config.PingProperties;

public interface PingIpProviderClient {

    JsonNode fetch(String providerName, PingProperties.Provider provider, String ip);
}
