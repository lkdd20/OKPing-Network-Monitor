package org.dromara.domain.bo;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.mybatis.core.domain.BaseEntity;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 广告链接业务对象 ad_links
 *
 * @author Lion Li
 * @date 2026-05-15
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SendTaskBo extends BaseEntity {

    /**
     * 任务类型
     */
    private String type;

    /**
     * 任务配置
     */
    private Config config;

    /**
     * 请求地址
     */
    private String url;

    /**
     * 端口
     */
    private String port;

    /**
     * 协议
     */
    private String agreement;

    /**
     * 路径或参数
     */
    private String pathOrParams;

    /**
     * DNS
     */
    private String dns;

    /**
     * 模式
     */
    private String model;

    /**
     * 请求体
     */
    private String body;

    /**
     * 任务配置
     */
    @Data
    public static class Config implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        /**
         * 地区
         */
        private List<String> region;

        /**
         * 运营商
         */
        private List<String> operators;

    }

}
