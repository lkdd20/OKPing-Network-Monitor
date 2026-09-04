package org.dromara.ping.domain.bo;

import lombok.Data;

import java.util.List;
import java.util.Locale;

@Data
public class PingPageConfigLangBo {

    /**
     * 支持的语言
     */
    private static final List<String> SUPPORTED_LANGS = List.of(
        "zh",
        "en",
        "ja",
        "ko",
        "fr",
        "de",
        "es",
        "pt",
        "ru",
        "it"
    );

    /**
     * 校验语言是否合法
     */
    public static boolean isValidLang(String lang) {
        if (lang == null || lang.isBlank()) {
            return false;
        }

        String safeLang = lang.trim().toLowerCase(Locale.ROOT);

        return SUPPORTED_LANGS.contains(safeLang);
    }
}
