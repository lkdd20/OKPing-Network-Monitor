package org.dromara.ping.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ping")
public class PingProperties {

    private Websocket websocket = new Websocket();
    private Rabbit rabbit = new Rabbit();
    private Agent agent = new Agent();
    private IpDatabase ipDatabase = new IpDatabase();
    private IpLookup ipLookup = new IpLookup();

    @Data
    public static class Websocket {
        private boolean enabled = true;
        private String path = "/websocket/{userId}";
        private long accessKeyExpireSeconds = 20;
    }

    @Data
    public static class Rabbit {
        private boolean enabled = true;
        private boolean declareNodeResultQueue = false;
        private boolean logEnabled = true;
        private String nodeResultQueue = "ping_dev_node_result";
        private String logExchange = "ping_logs";
        private String logRoutingKey = "python";
        private int continueNum = 100;
        private int messagesPerSecond = 3;
    }

    @Data
    public static class Agent {
        private boolean enabled = true;
        private long heartbeatIntervalSeconds = 600;
        private long offlineAfterSeconds = 1260;
        private RabbitConnection rabbit = new RabbitConnection();
    }

    @Data
    public static class RabbitConnection {
        private String host = "127.0.0.1";
        private int port = 5672;
        private String username = "guest";
        private String password = "guest";
        private String virtualHost = "/";
        private boolean tls = false;
        private String resultExchange = "";
        private String resultRoutingKey = "ping_dev_node_result";
    }

    @Data
    public static class IpDatabase {
        private String directory = "./data/ping/ip-database";
        private long maxUploadBytes = 128L * 1024 * 1024;
    }

    @Data
    public static class IpLookup {
        private long cacheTtlSeconds = 300;
        private int connectTimeoutMillis = 3000;
        private int requestTimeoutMillis = 5000;
        private Provider ipapi = new Provider();
        private Provider ipregistry = new Provider();
        private Provider scamalytics = new Provider();
    }

    @Data
    public static class Provider {
        private boolean enabled = false;
        private boolean requireKey = true;
        private String urlTemplate = "";
        private String key = "";
    }
}
