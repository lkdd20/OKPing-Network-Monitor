DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE `sponsors` (
  `id` bigint NOT NULL COMMENT '主键',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `url` varchar(500) DEFAULT NULL COMMENT '链接地址',
  `img_url` varchar(500) DEFAULT NULL COMMENT '图片地址',
  `weight` bigint DEFAULT 0 COMMENT '权重',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT 0 COMMENT '删除标志',
  `tenant_id` varchar(20) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='赞助商';
