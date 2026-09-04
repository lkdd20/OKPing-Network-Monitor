package org.dromara.web.domain;

import org.dromara.common.mybatis.core.domain.BaseEntity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;

/**
 * 友情链接对象 friendship_links
 *
 * @author Lion Li
 * @date 2026-05-14
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("friendship_links")
public class FriendshipLinks extends BaseEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 名称
     */
    private String name;

    /**
     * 连接地址
     */
    private String url;

    /**
     * 权重
     */
    private Long weight;

    /**
     * 删除标志
     */
    @TableLogic
    private Long delFlag;


}
