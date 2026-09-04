package org.dromara.ping.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.service.PingIpProviderClient;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component
public class PingIpProviderClientImpl implements PingIpProviderClient {

    private final PingProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PingIpProviderClientImpl(PingProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofMillis(Math.max(500, properties.getIpLookup().getConnectTimeoutMillis())))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
    }

    @Override
    public JsonNode fetch(String providerName, PingProperties.Provider provider, String ip) {
        if (!provider.isEnabled() || StringUtils.isBlank(provider.getUrlTemplate())) {
            return null;
        }
        if (provider.isRequireKey() && StringUtils.isBlank(provider.getKey())) {
            throw new IllegalStateException(providerName + " key未配置");
        }

        String url = provider.getUrlTemplate()
            .replace("{ip}", encode(ip))
            .replace("{key}", encode(StringUtils.blankToDefault(provider.getKey(), "")));
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .GET()
                .timeout(Duration.ofMillis(Math.max(500, properties.getIpLookup().getRequestTimeoutMillis())))
                .header("Accept", "application/json")
                .header("User-Agent", "PING-IP-Lookup/1.0")
                .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException(providerName + "响应状态 " + response.statusCode());
            }
            JsonNode body = objectMapper.readTree(response.body());
            if (body == null || body.isNull() || body.hasNonNull("error")) {
                throw new IllegalStateException(providerName + "响应无有效数据");
            }
            return body;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(providerName + "请求被中断", e);
        } catch (Exception e) {
            throw new IllegalStateException(providerName + "请求失败", e);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
