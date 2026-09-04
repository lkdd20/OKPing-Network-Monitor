package org.dromara.ping.support;

import java.util.Map;

public final class PingAgentDeployTemplateRenderer {

    private PingAgentDeployTemplateRenderer() {
    }

    public static String render(String template, Map<String, String> variables) {
        String rendered = template == null ? "" : template;
        for (Map.Entry<String, String> variable : variables.entrySet()) {
            rendered = rendered.replace("{{" + variable.getKey() + "}}", shellQuote(variable.getValue()));
        }
        return rendered.trim();
    }

    public static String shellQuote(String value) {
        String safeValue = value == null ? "" : value;
        return "'" + safeValue.replace("'", "'\"'\"'") + "'";
    }
}
