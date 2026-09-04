package org.dromara.ping.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;

/**
 * ping 1.0 public header/footer layout configuration.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ping_layout_config")
public class PingLayoutConfig extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

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
    private String navItemsJson;
    private String footerColumnsJson;
    private String friendshipLinksJson;
    private String announcementsJson;
    private String homeToolsJson;
    private String status;
    private String remark;
}
