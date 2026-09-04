package org.dromara.ping.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
public class PingPublicLayoutConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String configKey;
    private String siteName;
    private String logoUrl;
    private String footerLogoUrl;
    private String footerSlogan;
    private String copyright;
    private String icpText;
    private String icpUrl;
    private String serviceText;
    private String serviceLinkText;
    private String serviceLinkUrl;
    private List<NavItem> navItems = new ArrayList<>();
    private List<FooterColumn> footerColumns = new ArrayList<>();
    private List<LinkItem> friendshipLinks = new ArrayList<>();
    private List<AnnouncementItem> announcements = new ArrayList<>();
    private List<HomeToolItem> homeTools = new ArrayList<>();

    @Data
    public static class NavItem implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String text;
        private String url;
        private List<NavItem> children = new ArrayList<>();
    }

    @Data
    public static class FooterColumn implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String title;
        private List<LinkItem> links = new ArrayList<>();
    }

    @Data
    public static class LinkItem implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String title;
        private String url;
    }

    @Data
    public static class AnnouncementItem implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String level;
        private String content;
        private String url;
    }

    @Data
    public static class HomeToolItem implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;

        private String title;
        private String description;
        private String url;
        private String category;
        private String icon;
        private String color;
        private Boolean enabled;
    }
}
