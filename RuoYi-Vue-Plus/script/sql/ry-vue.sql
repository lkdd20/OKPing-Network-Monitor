/*
 Navicat Premium Data Transfer

 Source Server         : 本机
 Source Server Type    : MySQL
 Source Server Version : 80046 (8.0.46)
 Source Host           : localhost:3306
 Source Schema         : ry-vue

 Target Server Type    : MySQL
 Target Server Version : 80046 (8.0.46)
 File Encoding         : 65001

 Date: 04/09/2026 15:39:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ad_links
-- ----------------------------
DROP TABLE IF EXISTS `ad_links`;
CREATE TABLE `ad_links` (
  `id` bigint NOT NULL COMMENT '主键',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '连接地址',
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片地址',
  `del_time` datetime NOT NULL COMMENT '到期时间',
  `weight` int NOT NULL DEFAULT '0' COMMENT '权重',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='广告链接';



-- ----------------------------
-- Table structure for friendship_links
-- ----------------------------
DROP TABLE IF EXISTS `friendship_links`;
CREATE TABLE `friendship_links` (
  `id` bigint NOT NULL COMMENT '主键',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '连接地址',
  `weight` int NOT NULL DEFAULT '0' COMMENT '权重',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



-- ----------------------------
-- Table structure for gen_table
-- ----------------------------
DROP TABLE IF EXISTS `gen_table`;
CREATE TABLE `gen_table` (
  `table_id` bigint NOT NULL COMMENT '编号',
  `data_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '数据源名称',
  `table_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '表名称',
  `table_comment` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '表描述',
  `sub_table_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '关联子表的表名',
  `sub_table_fk_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '子表关联的外键名',
  `class_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '实体类名称',
  `tpl_category` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'crud' COMMENT '使用的模板（crud单表操作 tree树表操作）',
  `package_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '生成包路径',
  `module_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '生成模块名',
  `business_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '生成业务名',
  `function_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '生成功能名',
  `function_author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '生成功能作者',
  `gen_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '生成代码方式（0zip压缩包 1自定义路径）',
  `gen_path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '/' COMMENT '生成路径（不填默认项目路径）',
  `options` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '其它生成选项',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`table_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='代码生成业务表';

-- ----------------------------
-- Records of gen_table
-- ----------------------------
BEGIN;
INSERT INTO `gen_table` (`table_id`, `data_name`, `table_name`, `table_comment`, `sub_table_name`, `sub_table_fk_name`, `class_name`, `tpl_category`, `package_name`, `module_name`, `business_name`, `function_name`, `function_author`, `gen_type`, `gen_path`, `options`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054798364348977153, 'slave', 'friendship_links', '友情链接', NULL, NULL, 'FriendshipLinks', 'crud', 'org.dromara.web', 'web', 'links', '友情链接', 'Lion Li', '0', '/', '{\"treeCode\":null,\"treeName\":null,\"treeParentCode\":null,\"parentMenuId\":3}', 103, 1, '2026-05-14 13:38:01', 1, '2026-05-14 13:41:01', NULL);
INSERT INTO `gen_table` (`table_id`, `data_name`, `table_name`, `table_comment`, `sub_table_name`, `sub_table_fk_name`, `class_name`, `tpl_category`, `package_name`, `module_name`, `business_name`, `function_name`, `function_author`, `gen_type`, `gen_path`, `options`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055181620554756097, 'master', 'ad_links', '广告链接', NULL, NULL, 'AdLinks', 'crud', 'org.dromara.web', 'web', 'adLinks', '广告链接', 'Lion Li', '0', '/', '{\"treeCode\":null,\"treeName\":null,\"treeParentCode\":null,\"parentMenuId\":3}', 103, 1, '2026-05-15 15:00:56', 1, '2026-05-15 15:02:42', NULL);
INSERT INTO `gen_table` (`table_id`, `data_name`, `table_name`, `table_comment`, `sub_table_name`, `sub_table_fk_name`, `class_name`, `tpl_category`, `package_name`, `module_name`, `business_name`, `function_name`, `function_author`, `gen_type`, `gen_path`, `options`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928344226881537, 'master', 'url_blacklist', '域名黑名单', NULL, NULL, 'UrlBlacklist', 'crud', 'org.dromara.web', 'web', 'blacklist', '域名黑名单', 'Lion Li', '0', '/', '{\"treeCode\":null,\"treeName\":null,\"treeParentCode\":null,\"parentMenuId\":null}', 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15', NULL);
INSERT INTO `gen_table` (`table_id`, `data_name`, `table_name`, `table_comment`, `sub_table_name`, `sub_table_fk_name`, `class_name`, `tpl_category`, `package_name`, `module_name`, `business_name`, `function_name`, `function_author`, `gen_type`, `gen_path`, `options`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420494814740481, 'master', 'sponsors', '赞助商', NULL, NULL, 'Sponsors', 'crud', 'org.dromara.web', 'web', 'sponsors', '赞助商', 'Lion Li', '0', '/', '{\"treeCode\":null,\"treeName\":null,\"treeParentCode\":null,\"parentMenuId\":null}', 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03', NULL);
INSERT INTO `gen_table` (`table_id`, `data_name`, `table_name`, `table_comment`, `sub_table_name`, `sub_table_fk_name`, `class_name`, `tpl_category`, `package_name`, `module_name`, `business_name`, `function_name`, `function_author`, `gen_type`, `gen_path`, `options`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066807277150539777, 'master', 'node_config', '节点信息', NULL, NULL, 'NodeConfig', 'crud', 'org.dromara', 'webone', 'nodeConfig', '节点信息', 'Lion Li', '0', '/', '{\"treeCode\":null,\"treeName\":null,\"treeParentCode\":null,\"parentMenuId\":3}', 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:36', NULL);
COMMIT;

-- ----------------------------
-- Table structure for gen_table_column
-- ----------------------------
DROP TABLE IF EXISTS `gen_table_column`;
CREATE TABLE `gen_table_column` (
  `column_id` bigint NOT NULL COMMENT '编号',
  `table_id` bigint DEFAULT NULL COMMENT '归属表编号',
  `column_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '列名称',
  `column_comment` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '列描述',
  `column_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '列类型',
  `java_type` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'JAVA类型',
  `java_field` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'JAVA字段名',
  `is_pk` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否主键（1是）',
  `is_increment` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否自增（1是）',
  `is_required` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否必填（1是）',
  `is_insert` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否为插入字段（1是）',
  `is_edit` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否编辑字段（1是）',
  `is_list` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否列表字段（1是）',
  `is_query` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '是否查询字段（1是）',
  `query_type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'EQ' COMMENT '查询方式（等于、不等于、大于、小于、范围）',
  `html_type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '显示类型（文本框、文本域、下拉框、复选框、单选框、日期控件）',
  `dict_type` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典类型',
  `sort` int DEFAULT NULL COMMENT '排序',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`column_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='代码生成业务表字段';

-- ----------------------------
-- Records of gen_table_column
-- ----------------------------
BEGIN;
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366790062081, 2054798364348977153, 'id', '主键', 'bigint', 'Long', 'id', '1', '0', '1', NULL, '1', '1', NULL, 'EQ', 'input', '', 1, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366794256385, 2054798364348977153, 'name', '名称', 'varchar(255)', 'String', 'name', '0', '0', '1', '1', '1', '1', '1', 'LIKE', 'input', '', 2, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366794256386, 2054798364348977153, 'url', '连接地址', 'varchar(255)', 'String', 'url', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 3, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366798450689, 2054798364348977153, 'weight', '权重', 'int', 'Long', 'weight', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 4, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366798450690, 2054798364348977153, 'create_dept', '创建部门', 'bigint', 'Long', 'createDept', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 5, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366802644993, 2054798364348977153, 'create_time', '创建时间', 'datetime', 'Date', 'createTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 6, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366802644994, 2054798364348977153, 'create_by', '创建人', 'bigint', 'Long', 'createBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 7, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366806839297, 2054798364348977153, 'update_time', '更新时间', 'datetime', 'Date', 'updateTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 8, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366806839298, 2054798364348977153, 'update_by', '更新人', 'bigint', 'Long', 'updateBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 9, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2054798366806839299, 2054798364348977153, 'del_flag', '删除标志', 'int', 'Long', 'delFlag', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 10, 103, 1, '2026-05-14 13:38:02', 1, '2026-05-14 13:41:01');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623142641665, 2055181620554756097, 'id', '主键', 'bigint', 'Long', 'id', '1', '0', '1', NULL, '1', '1', NULL, 'EQ', 'input', '', 1, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:42');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623142641666, 2055181620554756097, 'name', '名称', 'varchar(255)', 'String', 'name', '0', '0', '1', '1', '1', '1', '1', 'LIKE', 'input', '', 2, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:42');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623146835969, 2055181620554756097, 'type', '类型', 'bigint', 'Long', 'type', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'select', 'ad_type', 3, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623155224577, 2055181620554756097, 'url', '连接地址', 'varchar(255)', 'String', 'url', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 4, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623155224578, 2055181620554756097, 'img_url', '图片地址', 'varchar(255)', 'String', 'imgUrl', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 5, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623159418882, 2055181620554756097, 'del_time', '到期时间', 'datetime', 'Date', 'delTime', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'datetime', '', 6, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623163613186, 2055181620554756097, 'weight', '权重', 'int', 'Long', 'weight', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 7, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623163613187, 2055181620554756097, 'create_dept', '创建部门', 'bigint', 'Long', 'createDept', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 8, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623167807489, 2055181620554756097, 'create_time', '创建时间', 'datetime', 'Date', 'createTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 9, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623167807490, 2055181620554756097, 'create_by', '创建人', 'bigint', 'Long', 'createBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 10, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623172001793, 2055181620554756097, 'update_time', '更新时间', 'datetime', 'Date', 'updateTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 11, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623172001794, 2055181620554756097, 'update_by', '更新人', 'bigint', 'Long', 'updateBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 12, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623172001795, 2055181620554756097, 'del_flag', '删除标志', 'int', 'Long', 'delFlag', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 13, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2055181623176196098, 2055181620554756097, 'tenant_id', '', 'int', 'Long', 'tenantId', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 14, 103, 1, '2026-05-15 15:00:57', 1, '2026-05-15 15:02:43');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346491805697, 2056928344226881537, 'id', 'ID', 'bigint', 'Long', 'id', '1', '0', '1', NULL, '1', '1', NULL, 'EQ', 'input', '', 1, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346500194306, 2056928344226881537, 'value', '匹配值', 'varchar(255)', 'String', 'value', '0', '0', '0', '1', '1', '1', '1', 'LIKE', 'input', '', 2, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346500194307, 2056928344226881537, 'status', '是否生效', 'tinyint', 'Long', 'status', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'radio', 'url_blacklist_status', 3, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346508582913, 2056928344226881537, 'stop_time', '拦截到期时间', 'datetime', 'Date', 'stopTime', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'datetime', '', 4, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346516971521, 2056928344226881537, 'create_dept', '创建部门', 'bigint', 'Long', 'createDept', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', NULL, 5, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:15');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346516971522, 2056928344226881537, 'create_time', '创建时间', 'datetime', 'Date', 'createTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', NULL, 6, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346521165825, 2056928344226881537, 'create_by', '创建人', 'bigint', 'Long', 'createBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', NULL, 7, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346521165826, 2056928344226881537, 'update_time', '更新时间', 'datetime', 'Date', 'updateTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', NULL, 8, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346521165827, 2056928344226881537, 'update_by', '更新人', 'bigint', 'Long', 'updateBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', NULL, 9, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346521165828, 2056928344226881537, 'del_flag', '删除标志', 'int', 'Long', 'delFlag', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', NULL, 10, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2056928346521165829, 2056928344226881537, 'tenant_id', '租户id', 'int', 'Long', 'tenantId', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', NULL, 11, 103, 1, '2026-05-20 10:41:48', 1, '2026-05-20 11:43:16');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496794451970, 2062420494814740481, 'id', '主键', 'bigint', 'Long', 'id', '1', '0', '1', NULL, '1', '1', NULL, 'EQ', 'input', '', 1, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496958029826, 2062420494814740481, 'name', '名称', 'varchar(255)', 'String', 'name', '0', '0', '0', '1', '1', '1', '1', 'LIKE', 'input', '', 2, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496958029827, 2062420494814740481, 'url', '链接地址', 'varchar(500)', 'String', 'url', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'textarea', '', 3, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496962224129, 2062420494814740481, 'img_url', '图片地址', 'varchar(500)', 'String', 'imgUrl', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'textarea', '', 4, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496962224130, 2062420494814740481, 'weight', '权重', 'bigint', 'Long', 'weight', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'input', '', 5, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496970612738, 2062420494814740481, 'create_dept', '创建部门', 'bigint', 'Long', 'createDept', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 6, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496970612739, 2062420494814740481, 'create_time', '创建时间', 'datetime', 'Date', 'createTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 7, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496974807041, 2062420494814740481, 'create_by', '创建人', 'bigint', 'Long', 'createBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 8, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496979001346, 2062420494814740481, 'update_time', '更新时间', 'datetime', 'Date', 'updateTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 9, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496979001347, 2062420494814740481, 'update_by', '更新人', 'bigint', 'Long', 'updateBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 10, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:03');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496979001348, 2062420494814740481, 'del_flag', '删除标志', 'int', 'Long', 'delFlag', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 11, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:04');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2062420496983195650, 2062420494814740481, 'tenant_id', '租户id', 'varchar(20)', 'String', 'tenantId', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 12, 103, 1, '2026-06-04 14:25:39', 1, '2026-06-04 14:27:04');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279155417090, 2066807277150539777, 'id', 'ID', 'bigint', 'Long', 'id', '1', '1', '1', NULL, '1', '1', NULL, 'EQ', 'input', '', 1, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:36');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279159611393, 2066807277150539777, 'country', '国家', 'varchar(255)', 'String', 'country', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'input', '', 2, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:36');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279163805697, 2066807277150539777, 'overseas', '是否是海外', 'varchar(255)', 'String', 'overseas', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'radio', 'node_state', 3, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279163805698, 2066807277150539777, 'region', '区域', 'varchar(255)', 'String', 'region', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'select', 'node_region', 4, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279168000001, 2066807277150539777, 'city', '城市', 'varchar(255)', 'String', 'city', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'textarea', '', 5, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279172194305, 2066807277150539777, 'operators', '运营商', 'varchar(255)', 'String', 'operators', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'select', 'node_operators', 6, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279176388609, 2066807277150539777, 'name', '名称', 'varchar(255)', 'String', 'name', '0', '0', '0', '1', '1', '1', '1', 'LIKE', 'input', '', 7, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279176388610, 2066807277150539777, 'coordinate', '坐标', 'json', 'String', 'coordinate', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'input', '', 8, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279180582913, 2066807277150539777, 'state', '状态', 'varchar(255)', 'String', 'state', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'radio', 'node_state', 9, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279180582914, 2066807277150539777, 'content', '备注信息', 'varchar(255)', 'String', 'content', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'editor', '', 10, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279184777218, 2066807277150539777, 'content2', '备注信息2', 'varchar(255)', 'String', 'content2', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'input', '', 11, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279184777219, 2066807277150539777, 'content3', '备注信息3', 'varchar(255)', 'String', 'content3', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'input', '', 12, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279184777220, 2066807277150539777, 'online', '在线时刻', 'int', 'Long', 'online', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'input', '', 13, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279188971522, 2066807277150539777, 'home_state', '是否家宽', 'varchar(255)', 'String', 'homeState', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'radio', 'node_state', 14, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279188971523, 2066807277150539777, 'province', '省份', 'varchar(255)', 'String', 'province', '0', '0', '0', '1', '1', '1', '1', 'EQ', 'select', 'node_province', 15, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279193165826, 2066807277150539777, 'traceroute', '路由追踪开启', 'varchar(255)', 'String', 'traceroute', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'radio', 'node_state', 16, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:37');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279193165827, 2066807277150539777, 'ipv6', 'ipv6支持', 'varchar(255)', 'String', 'ipv6', '0', '0', '1', '1', '1', '1', '1', 'EQ', 'radio', 'node_state', 17, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279193165828, 2066807277150539777, 'create_dept', '创建部门', 'bigint', 'Long', 'createDept', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 18, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279197360130, 2066807277150539777, 'create_time', '创建时间', 'datetime', 'Date', 'createTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 19, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279197360131, 2066807277150539777, 'create_by', '创建人', 'bigint', 'Long', 'createBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 20, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279197360132, 2066807277150539777, 'update_time', '更新时间', 'datetime', 'Date', 'updateTime', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'datetime', '', 21, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279201554433, 2066807277150539777, 'update_by', '更新人', 'bigint', 'Long', 'updateBy', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 22, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279201554434, 2066807277150539777, 'del_flag', '删除标志', 'int', 'Long', 'delFlag', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 23, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
INSERT INTO `gen_table_column` (`column_id`, `table_id`, `column_name`, `column_comment`, `column_type`, `java_type`, `java_field`, `is_pk`, `is_increment`, `is_required`, `is_insert`, `is_edit`, `is_list`, `is_query`, `query_type`, `html_type`, `dict_type`, `sort`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2066807279201554435, 2066807277150539777, 'tenant_id', '租户id', 'varchar(20)', 'String', 'tenantId', '0', '0', '0', NULL, NULL, NULL, NULL, 'EQ', 'input', '', 24, 103, 1, '2026-06-16 16:57:09', 1, '2026-06-17 10:26:38');
COMMIT;

-- ----------------------------
-- Table structure for la_node_config
-- ----------------------------
DROP TABLE IF EXISTS `la_node_config`;
CREATE TABLE `la_node_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `country` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '国家',
  `overseas` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '是否海外',
  `region` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '区域',
  `province` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省份',
  `city` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市',
  `operators` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '运营商',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '名称',
  `ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP',
  `weight` bigint DEFAULT '0' COMMENT '权重',
  `state` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'on' COMMENT '状态 on/off',
  `rq_state` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'on' COMMENT '运行状态 on/off',
  `exchange` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'okping_node' COMMENT '交换机',
  `queue` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '队列',
  `binding` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '绑定数据',
  `sponsor_text` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '赞助商文字',
  `sponsor_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '赞助商链接',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注信息',
  `content2` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注信息2',
  `content3` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注信息3',
  `create_time` bigint DEFAULT NULL COMMENT '创建时间',
  `end_time` bigint DEFAULT NULL COMMENT '过期时间',
  `online` bigint DEFAULT NULL COMMENT '在线时刻',
  `uuid` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '节点UUID',
  `home_state` tinyint(1) DEFAULT '0' COMMENT '是否家宽',
  `traceroute` tinyint(1) DEFAULT '0' COMMENT '是否支持路由追踪',
  `ipv6` tinyint(1) DEFAULT '0' COMMENT '是否支持IPv6',
  `coordinate` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '坐标JSON',
  PRIMARY KEY (`id`),
  KEY `idx_la_node_config_state` (`state`,`rq_state`),
  KEY `idx_la_node_config_ip` (`ip`),
  KEY `idx_la_node_config_uuid` (`uuid`),
  KEY `idx_la_node_config_queue` (`queue`),
  KEY `idx_la_node_config_screen` (`region`,`operators`),
  KEY `idx_la_node_config_weight` (`weight`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ping 节点配置';

-- ----------------------------
-- Records of la_node_config
-- ----------------------------
BEGIN;
INSERT INTO `la_node_config` (`id`, `country`, `overseas`, `region`, `province`, `city`, `operators`, `name`, `ip`, `weight`, `state`, `rq_state`, `exchange`, `queue`, `binding`, `sponsor_text`, `sponsor_url`, `content`, `content2`, `content3`, `create_time`, `end_time`, `online`, `uuid`, `home_state`, `traceroute`, `ipv6`, `coordinate`) VALUES (4, '中国', 'false', '西北地区', '新疆维吾尔自治区', '乌鲁木齐', '移动', '测试', '1.1.1.1', 0, 'on', 'on', 'okping_node', 'okping_node_a5a9c87a-d5e1-4cf4-b965-3e6418f0f6bd', 'okping_node_a5a9c87a-d5e1-4cf4-b965-3e6418f0f6bd', NULL, NULL, NULL, NULL, NULL, 1788409660, NULL, 1788432085, 'a5a9c87a-d5e1-4cf4-b965-3e6418f0f6bd', 1, 1, 1, NULL);
COMMIT;

-- ----------------------------
-- Table structure for node_config
-- ----------------------------
DROP TABLE IF EXISTS `node_config`;
CREATE TABLE `node_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `country` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '国家',
  `overseas` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false' COMMENT '是否是海外',
  `region` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '区域',
  `city` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '城市',
  `operators` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '运营商',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '名称',
  `coordinate` json DEFAULT NULL COMMENT '坐标',
  `state` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true' COMMENT '状态',
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注信息',
  `content2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注信息2',
  `content3` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注信息3',
  `online` int DEFAULT NULL COMMENT '在线时刻',
  `home_state` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'false' COMMENT '是否家宽',
  `province` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '省份',
  `traceroute` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true' COMMENT '路由追踪开启',
  `ipv6` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'true' COMMENT 'ipv6支持',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '租户id',
  `weight` int DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2067082728171487235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='节点信息';

-- ----------------------------
-- Records of node_config
-- ----------------------------
BEGIN;
INSERT INTO `node_config` (`id`, `country`, `overseas`, `region`, `city`, `operators`, `name`, `coordinate`, `state`, `content`, `content2`, `content3`, `online`, `home_state`, `province`, `traceroute`, `ipv6`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`, `tenant_id`, `weight`) VALUES (2067076920545181698, '中国', 'false', '华东地区', '北京', '移动', '北京', '[123, 321]', 'true', '<a>a</a>', '', NULL, NULL, 'false', '新疆维吾尔自治区', 'true', 'true', 103, '2026-06-17 10:48:37', 1, '2026-06-17 11:11:10', 1, 0, '000000', 100);
INSERT INTO `node_config` (`id`, `country`, `overseas`, `region`, `city`, `operators`, `name`, `coordinate`, `state`, `content`, `content2`, `content3`, `online`, `home_state`, `province`, `traceroute`, `ipv6`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`, `tenant_id`, `weight`) VALUES (2067082728171487234, '中国', 'false', '华东地区', '上海', '联通', '上海', NULL, 'true', NULL, NULL, NULL, NULL, 'true', '新疆维吾尔自治区', 'true', 'false', 103, '2026-06-17 11:11:42', 1, '2026-06-17 11:30:03', 1, 0, '000000', 101);
COMMIT;

-- ----------------------------
-- Table structure for ping_agent_deploy_config
-- ----------------------------
DROP TABLE IF EXISTS `ping_agent_deploy_config`;
CREATE TABLE `ping_agent_deploy_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `config_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'default' COMMENT '配置标识',
  `amd64_image_oss_id` bigint DEFAULT NULL COMMENT 'x86_64离线镜像OSS ID',
  `arm64_image_oss_id` bigint DEFAULT NULL COMMENT 'ARM64离线镜像OSS ID',
  `image_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'okping-agent:latest' COMMENT 'docker load后的镜像名',
  `master_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Agent主控地址',
  `docker_install_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ubuntu Docker安装命令模板',
  `first_deploy_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '首次部署命令模板',
  `update_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '更新命令模板',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_agent_deploy_config_key` (`config_key`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping Agent全局部署配置';

-- ----------------------------
-- Records of ping_agent_deploy_config
-- ----------------------------
BEGIN;
INSERT INTO `ping_agent_deploy_config` (`id`, `config_key`, `amd64_image_oss_id`, `arm64_image_oss_id`, `image_name`, `master_url`, `docker_install_template`, `first_deploy_template`, `update_template`, `remark`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (1, 'default', 2095403056314290178, 2095403083149447170, 'okping-agent:latest', 'http://10.211.55.2:8080', 'sudo apt-get update\nsudo apt-get install -y ca-certificates curl\nsudo install -m 0755 -d /etc/apt/keyrings\nsudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc\nsudo chmod a+r /etc/apt/keyrings/docker.asc\n. /etc/os-release\necho \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-$VERSION_CODENAME} stable\" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null\nsudo apt-get update\nsudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\nsudo systemctl enable --now docker', 'sudo install -d -m 0755 /opt/ping-agent /etc/ping-agent\nprintf \'%s\\n\' {{nodeUuid}} | sudo tee {{uuidFilePath}} >/dev/null\nsudo chmod 0644 {{uuidFilePath}}\nsudo curl -fL --retry 3 {{imageUrl}} -o {{archivePath}}\nsudo gzip -dc {{archivePath}} | sudo docker load\nsudo docker rm -f ping-agent >/dev/null 2>&1 || true\nsudo docker run -d \\\n  --name ping-agent \\\n  --restart unless-stopped \\\n  --cap-add NET_RAW \\\n  --sysctl net.ipv4.ping_group_range=\"0 2147483647\" \\\n  -p 9115:9115 \\\n  -v {{uuidFilePath}}:/etc/ping-agent/uuid:ro \\\n  -e PING_AGENT_ENABLED=true \\\n  -e PING_AGENT_MASTER_URL={{masterUrl}} \\\n  -e PING_AGENT_UUID_FILE=/etc/ping-agent/uuid \\\n  {{imageName}}', 'sudo test -s {{uuidFilePath}} || { echo \"Agent UUID文件不存在，请先执行首次部署命令\" >&2; exit 1; }\nsudo curl -fL --retry 3 {{imageUrl}} -o {{archivePath}}\nsudo gzip -dc {{archivePath}} | sudo docker load\nsudo docker rm -f ping-agent >/dev/null 2>&1 || true\nsudo docker run -d \\\n  --name ping-agent \\\n  --restart unless-stopped \\\n  --cap-add NET_RAW \\\n  --sysctl net.ipv4.ping_group_range=\"0 2147483647\" \\\n  -p 9115:9115 \\\n  -v {{uuidFilePath}}:/etc/ping-agent/uuid:ro \\\n  -e PING_AGENT_ENABLED=true \\\n  -e PING_AGENT_MASTER_URL={{masterUrl}} \\\n  -e PING_AGENT_UUID_FILE=/etc/ping-agent/uuid \\\n  {{imageName}}', '支持Ubuntu x86_64和ARM64节点的全局Agent部署配置', NULL, NULL, '2026-08-04 19:10:40', 1, '2026-09-03 14:58:01');
COMMIT;

-- ----------------------------
-- Table structure for ping_blog_post
-- ----------------------------
DROP TABLE IF EXISTS `ping_blog_post`;
CREATE TABLE `ping_blog_post` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章标题',
  `slug` varchar(160) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章URL别名',
  `summary` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章摘要',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '富文本正文',
  `cover_oss_id` bigint DEFAULT NULL COMMENT '封面OSS对象ID',
  `category` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文章分类',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签，英文逗号分隔',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft' COMMENT '状态 draft/published',
  `featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否推荐',
  `sort_order` bigint NOT NULL DEFAULT '0' COMMENT '排序权重',
  `publish_time` datetime DEFAULT NULL COMMENT '发布时间',
  `seo_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO标题',
  `seo_description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO描述',
  `seo_keywords` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SEO关键词',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_blog_post_slug` (`slug`),
  KEY `idx_ping_blog_post_public` (`status`,`publish_time`,`featured`,`sort_order`),
  KEY `idx_ping_blog_post_category` (`category`,`status`,`publish_time`),
  KEY `idx_ping_blog_post_tenant` (`tenant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping 博客文章';

-- ----------------------------
-- Records of ping_blog_post
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ping_ip_feedback
-- ----------------------------
DROP TABLE IF EXISTS `ping_ip_feedback`;
CREATE TABLE `ping_ip_feedback` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `ip_version` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IP版本 ipv4/ipv6',
  `start_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '起始IP',
  `end_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '结束IP',
  `location` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '审核后的归属地，使用竖线分隔',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '审核状态 pending/approved/rejected',
  `review_remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核备注',
  `review_time` datetime DEFAULT NULL COMMENT '审核时间',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '提交时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ping_ip_feedback_status` (`status`,`ip_version`,`review_time`),
  KEY `idx_ping_ip_feedback_range` (`ip_version`,`start_ip`,`end_ip`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ping IP信息纠错审核记录';

-- ----------------------------
-- Records of ping_ip_feedback
-- ----------------------------
BEGIN;
INSERT INTO `ping_ip_feedback` (`id`, `ip_version`, `start_ip`, `end_ip`, `location`, `status`, `review_remark`, `review_time`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (1, 'ipv4', '61.241.54.232', '61.241.54.232', '中国|广东省|深圳市|联通|CN', 'approved', '', '2026-08-03 12:21:56', -1, -1, '2026-08-03 11:40:21', 1, '2026-08-03 12:21:56');
INSERT INTO `ping_ip_feedback` (`id`, `ip_version`, `start_ip`, `end_ip`, `location`, `status`, `review_remark`, `review_time`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2, 'ipv4', '61.241.54.211', '61.241.54.211', '中国|广东省|深圳市|联通', 'approved', '', '2026-08-03 12:22:24', -1, -1, '2026-08-03 12:22:11', 1, '2026-08-03 12:22:24');
COMMIT;

-- ----------------------------
-- Table structure for ping_issue
-- ----------------------------
DROP TABLE IF EXISTS `ping_issue`;
CREATE TABLE `ping_issue` (
  `id` bigint NOT NULL COMMENT '反馈ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `user_id` bigint NOT NULL COMMENT '提交用户ID',
  `user_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号快照',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户昵称快照',
  `issue_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型 problem/suggestion',
  `title` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '反馈标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '反馈内容',
  `attachments_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'OSS截图信息JSON',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态 pending/processing/resolved/closed',
  `public_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否公开展示',
  `admin_reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '管理员回复',
  `reply_user_id` bigint DEFAULT NULL COMMENT '回复管理员ID',
  `reply_user_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '回复管理员名称',
  `reply_time` datetime DEFAULT NULL COMMENT '回复时间',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '后台备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ping_issue_user_time` (`tenant_id`,`user_id`,`create_time`),
  KEY `idx_ping_issue_public_time` (`tenant_id`,`public_visible`,`reply_time`,`create_time`),
  KEY `idx_ping_issue_status_time` (`tenant_id`,`status`,`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping用户问题反馈';

-- ----------------------------
-- Records of ping_issue
-- ----------------------------
BEGIN;
INSERT INTO `ping_issue` (`id`, `tenant_id`, `user_id`, `user_name`, `nickname`, `issue_type`, `title`, `content`, `attachments_json`, `status`, `public_visible`, `admin_reply`, `reply_user_id`, `reply_user_name`, `reply_time`, `remark`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087150616125222913, '000000', 2087024190159917057, 'wx_b3d4e20c15cb22993a1353d7', '用户0068', 'problem', '你好', '我是数据', '[{\"ossId\":\"2087150611507294209\",\"url\":\"https://file.okping.cn/imagesfs/2026/08/11/36cbbac6d41a4b899a715f1f2641d0c2.png\",\"originalName\":\"logo.png\",\"size\":6489},{\"ossId\":\"2087150615462522882\",\"url\":\"https://file.okping.cn/imagesfs/2026/08/11/240cabb674c740a2b957ce1d341c957e.png\",\"originalName\":\"ScreenShot_2026-08-07_110038_461.png\",\"size\":308041}]', 'processing', 0, '好的', 1, '疯狂的狮子Li', '2026-08-11 20:45:39', '', NULL, 2087024190159917057, '2026-08-11 20:14:19', 1, '2026-08-11 20:45:39');
COMMIT;

-- ----------------------------
-- Table structure for ping_issue_message
-- ----------------------------
DROP TABLE IF EXISTS `ping_issue_message`;
CREATE TABLE `ping_issue_message` (
  `id` bigint NOT NULL COMMENT '消息ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `issue_id` bigint NOT NULL COMMENT '反馈ID',
  `sender_user_id` bigint NOT NULL COMMENT '发送用户ID',
  `sender_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发送人名称快照',
  `sender_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发送方 user/admin',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `attachments_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'OSS附件信息JSON',
  `public_visible` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否在公开问题页展示',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ping_issue_message_issue_time` (`tenant_id`,`issue_id`,`create_time`),
  KEY `idx_ping_issue_message_public` (`tenant_id`,`public_visible`,`issue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping问题反馈对话消息';

-- ----------------------------
-- Records of ping_issue_message
-- ----------------------------
BEGIN;
INSERT INTO `ping_issue_message` (`id`, `tenant_id`, `issue_id`, `sender_user_id`, `sender_name`, `sender_type`, `content`, `attachments_json`, `public_visible`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087150616125222913, '000000', 2087150616125222913, 1, '疯狂的狮子Li', 'admin', '还在处理中', '[]', 0, NULL, 1, '2026-08-11 20:19:50', 1, '2026-08-11 20:19:50');
INSERT INTO `ping_issue_message` (`id`, `tenant_id`, `issue_id`, `sender_user_id`, `sender_name`, `sender_type`, `content`, `attachments_json`, `public_visible`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087158502054227969, '000000', 2087150616125222913, 1, '疯狂的狮子Li', 'admin', '好的', '[]', 0, 103, 1, '2026-08-11 20:45:39', 1, '2026-08-11 20:45:39');
INSERT INTO `ping_issue_message` (`id`, `tenant_id`, `issue_id`, `sender_user_id`, `sender_name`, `sender_type`, `content`, `attachments_json`, `public_visible`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087158556718592002, '000000', 2087150616125222913, 2087024190159917057, '用户0068', 'user', '1', '[]', 0, NULL, 2087024190159917057, '2026-08-11 20:45:52', 2087024190159917057, '2026-08-11 20:45:52');
COMMIT;

-- ----------------------------
-- Table structure for ping_layout_config
-- ----------------------------
DROP TABLE IF EXISTS `ping_layout_config`;
CREATE TABLE `ping_layout_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `config_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置标识',
  `site_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '站点名称',
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Header Logo',
  `footer_logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Footer Logo',
  `footer_slogan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Footer 标语',
  `copyright` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '版权',
  `icp_text` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备案文案',
  `icp_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备案链接',
  `service_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '服务文案',
  `service_link_text` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '服务链接文案',
  `service_link_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '服务链接',
  `nav_items_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '导航JSON',
  `footer_columns_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '页脚栏目JSON',
  `friendship_links_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '友情链接JSON',
  `announcements_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '公告JSON',
  `home_tools_json` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '首页功能卡片JSON',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'on' COMMENT '状态 on/off',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_layout_config_key` (`config_key`),
  KEY `idx_ping_layout_config_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ping 站点布局配置';

-- ----------------------------
-- Records of ping_layout_config
-- ----------------------------
BEGIN;
INSERT INTO `ping_layout_config` (`id`, `config_key`, `site_name`, `logo_url`, `footer_logo_url`, `footer_slogan`, `copyright`, `icp_text`, `icp_url`, `service_text`, `service_link_text`, `service_link_url`, `nav_items_json`, `footer_columns_json`, `friendship_links_json`, `announcements_json`, `home_tools_json`, `status`, `remark`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (13, 'default', 'okping', '/logo_t.png', '/logo_t.png', '企业级开放型一站式监控解决方案', '©2026 okping All Rights Reserved OKPING.NET', '', '', '', '', '', '[{\"text\":\"首页\",\"url\":\"/\"},{\"text\":\"在线Ping\",\"url\":\"/ping\"},{\"text\":\"在线TCPing\",\"url\":\"/tcping\"},{\"text\":\"网站测速\",\"url\":\"/http\"},{\"text\":\"DNS查询\",\"url\":\"/dns\"},{\"text\":\"路由追踪\",\"url\":\"/traceroute\"},{\"text\":\"IP查询\",\"url\":\"/ip\"},{\"text\":\"Whois查询\",\"url\":\"/whois\"},{\"text\":\"批量查询\",\"url\":\"/batch\",\"children\":[{\"text\":\"批量Ping\",\"url\":\"/batch_ping\"},{\"text\":\"批量TCPing\",\"url\":\"/batch_tcping\"}]},{\"text\":\"IPv6工具\",\"url\":\"/v6\",\"children\":[{\"text\":\"在线Ping\",\"url\":\"/ping_v6\"},{\"text\":\"在线TCPing\",\"url\":\"/tcping_v6\"},{\"text\":\"网站测速\",\"url\":\"/http_v6\"},{\"text\":\"路由追踪\",\"url\":\"/traceroute_v6\"}]}]', '[{\"links\":[{\"title\":\"公司介绍\",\"url\":\"/about\"},{\"title\":\"联系我们\",\"url\":\"/contact\"},{\"title\":\"发展历程\",\"url\":\"/develop\"},{\"title\":\"赞助节点\",\"url\":\"/joinus\"},{\"title\":\"公告通知\",\"url\":\"/\"}],\"title\":\"关于我们\"},{\"links\":[{\"title\":\"在线Ping\",\"url\":\"/ping\"},{\"title\":\"在线Tcping\",\"url\":\"/tcping\"},{\"title\":\"网站测速\",\"url\":\"/http\"},{\"title\":\"路由追踪\",\"url\":\"/traceroute\"},{\"title\":\"DNS查询\",\"url\":\"/dns\"},{\"title\":\"IP查询\",\"url\":\"/ip\"},{\"title\":\"WHOIS查询\",\"url\":\"/whois\"}],\"title\":\"拨测工具\"},{\"links\":[{\"title\":\"网站监控\",\"url\":\"/product\"},{\"title\":\"Api监控\",\"url\":\"/applicationpi\"},{\"title\":\"SSL证书\",\"url\":\"/ssl\"},{\"title\":\"广告服务\",\"url\":\"/ad\"},{\"title\":\"产品定制\",\"url\":\"/product_pricing\"}],\"title\":\"产品与服务\"}]', '[]', '[]', '[{\"category\":\"ipv4\",\"color\":\"#2563EB\",\"description\":\"使用 ICMP 检测目标可达性与网络延迟\",\"enabled\":true,\"icon\":\"activity\",\"title\":\"在线 Ping\",\"url\":\"/ping\"},{\"category\":\"ipv4\",\"color\":\"#0891B2\",\"description\":\"检测目标主机指定 TCP 端口的连通性\",\"enabled\":true,\"icon\":\"cable\",\"title\":\"在线 TCPing\",\"url\":\"/tcping\"},{\"category\":\"ipv4\",\"color\":\"#059669\",\"description\":\"分析 HTTP 状态、连接与响应耗时\",\"enabled\":true,\"icon\":\"globe\",\"title\":\"网站测速\",\"url\":\"/http\"},{\"category\":\"ipv4\",\"color\":\"#7C3AED\",\"description\":\"查看不同地区和线路的域名解析结果\",\"enabled\":true,\"icon\":\"network\",\"title\":\"DNS 查询\",\"url\":\"/dns\"},{\"category\":\"ipv4\",\"color\":\"#D97706\",\"description\":\"以 MTR 视图定位网络路径和丢包节点\",\"enabled\":true,\"icon\":\"route\",\"title\":\"路由追踪\",\"url\":\"/traceroute\"},{\"category\":\"ipv4\",\"color\":\"#475569\",\"description\":\"查询域名注册商、注册时间、到期时间与DNS服务器\",\"enabled\":true,\"icon\":\"search\",\"title\":\"WHOIS 查询\",\"url\":\"/whois\"},{\"category\":\"batch\",\"color\":\"#DC2626\",\"description\":\"同时检测多个域名、IP 范围或 CIDR\",\"enabled\":true,\"icon\":\"rows\",\"title\":\"批量 Ping\",\"url\":\"/batch_ping\"},{\"category\":\"batch\",\"color\":\"#0F766E\",\"description\":\"批量检测多个目标的 TCP 端口\",\"enabled\":true,\"icon\":\"server\",\"title\":\"批量 TCPing\",\"url\":\"/batch_tcping\"},{\"category\":\"ipv6\",\"color\":\"#0284C7\",\"description\":\"使用 IPv6 节点检测目标可达性\",\"enabled\":true,\"icon\":\"radar\",\"title\":\"IPv6 Ping\",\"url\":\"/ping_v6\"},{\"category\":\"ipv6\",\"color\":\"#4F46E5\",\"description\":\"检测 IPv6 目标端口连通性\",\"enabled\":true,\"icon\":\"cable\",\"title\":\"IPv6 TCPing\",\"url\":\"/tcping_v6\"},{\"category\":\"ipv6\",\"color\":\"#16A34A\",\"description\":\"通过 IPv6 网络分析网站响应性能\",\"enabled\":true,\"icon\":\"globe\",\"title\":\"IPv6 网站测速\",\"url\":\"/http_v6\"},{\"category\":\"ipv6\",\"color\":\"#BE123C\",\"description\":\"查看 IPv6 网络路径、时延与丢包\",\"enabled\":true,\"icon\":\"route\",\"title\":\"IPv6 路由追踪\",\"url\":\"/traceroute_v6\"}]', 'on', NULL, 103, 1, '2026-09-02 10:30:20', 1, '2026-09-02 10:32:05');
COMMIT;

-- ----------------------------
-- Table structure for ping_milestone
-- ----------------------------
DROP TABLE IF EXISTS `ping_milestone`;
CREATE TABLE `ping_milestone` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '里程碑ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `milestone_date` date NOT NULL COMMENT '发生月份，统一保存为当月1日',
  `content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '里程碑内容',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'on' COMMENT '状态 on/off',
  `sort_order` bigint NOT NULL DEFAULT '0' COMMENT '同月排序权重',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '后台备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_ping_milestone_tenant` (`tenant_id`),
  KEY `idx_ping_milestone_public` (`status`,`milestone_date`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping 项目里程碑';

-- ----------------------------
-- Records of ping_milestone
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for ping_page_config
-- ----------------------------
DROP TABLE IF EXISTS `ping_page_config`;
CREATE TABLE `ping_page_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `page_key` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '页面标识 ping/tcping/http',
  `page_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '页面名称',
  `title_template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题模板',
  `description_template` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '描述模板',
  `keywords_template` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关键词模板',
  `h1_template` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'H1模板',
  `intro_template` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '简介模板',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'on' COMMENT '状态 on/off',
  `sort_order` bigint DEFAULT '0' COMMENT '排序',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_page_config_page_key` (`page_key`),
  KEY `idx_ping_page_config_status` (`status`,`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ping 页面SEO配置';

-- ----------------------------
-- Records of ping_page_config
-- ----------------------------
BEGIN;
INSERT INTO `ping_page_config` (`id`, `page_key`, `page_name`, `title_template`, `description_template`, `keywords_template`, `h1_template`, `intro_template`, `status`, `sort_order`, `remark`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (6, 'ping', '在线 Ping', '{displayTarget} 在线 Ping 检测', '为 {displayTarget} 提供未登录用户在线 Ping 检测，支持多地区、多运营商节点实时返回响应 IP、地区与延迟。', '在线Ping,{target},网络检测,延迟检测', '{displayTarget} 在线 Ping 检测', '当前检测目标：{displayTarget}。页面参数由服务端渲染输出，便于搜索引擎解析当前检测内容。', 'on', 1, NULL, 103, 1, '2026-08-31 15:33:43', 1, '2026-08-31 15:33:43');
COMMIT;

-- ----------------------------
-- Table structure for ping_product_beta_signup
-- ----------------------------
DROP TABLE IF EXISTS `ping_product_beta_signup`;
CREATE TABLE `ping_product_beta_signup` (
  `id` bigint NOT NULL COMMENT '报名ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `user_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户账号快照',
  `nickname` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '用户昵称快照',
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registered' COMMENT '状态 registered/notified',
  `source` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'product_page' COMMENT '报名来源',
  `notified_time` datetime DEFAULT NULL COMMENT '上线通知时间',
  `remark` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '后台备注',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '报名时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_product_beta_tenant_user` (`tenant_id`,`user_id`),
  KEY `idx_ping_product_beta_status_time` (`status`,`create_time`),
  KEY `idx_ping_product_beta_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping监控产品内测报名';

-- ----------------------------
-- Records of ping_product_beta_signup
-- ----------------------------
BEGIN;
INSERT INTO `ping_product_beta_signup` (`id`, `tenant_id`, `user_id`, `user_name`, `nickname`, `status`, `source`, `notified_time`, `remark`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087104958898917378, '000000', 2087024190159917057, 'wx_b3d4e20c15cb22993a1353d7', '用户0068', 'registered', 'product_page', NULL, NULL, NULL, 2087024190159917057, '2026-08-11 17:12:53', 2087024190159917057, '2026-08-11 17:12:53');
COMMIT;

-- ----------------------------
-- Table structure for ping_user_preference
-- ----------------------------
DROP TABLE IF EXISTS `ping_user_preference`;
CREATE TABLE `ping_user_preference` (
  `id` bigint NOT NULL COMMENT '主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '000000' COMMENT '租户编号',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `config_json` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工具习惯配置JSON',
  `revision` bigint NOT NULL DEFAULT '0' COMMENT '配置版本',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ping_user_preference_tenant_user` (`tenant_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='okping用户习惯设置';

-- ----------------------------
-- Records of ping_user_preference
-- ----------------------------
BEGIN;
INSERT INTO `ping_user_preference` (`id`, `tenant_id`, `user_id`, `config_json`, `revision`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2087095993058287618, '000000', 2087024190159917057, '{\"revision\":2,\"tools\":{\"ping\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"ping_v6\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"tcping\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"tcping_v6\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"http\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"http_v6\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"dns\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"traceroute\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"traceroute_v6\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"batch_ping\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true},\"batch_tcping\":{\"enterAction\":\"single\",\"historyMode\":\"enabled\",\"operators\":[\"移动\",\"联通\",\"电信\",\"多线\",\"港澳台、海外\"],\"dnsMode\":\"operator\",\"customDns\":\"\",\"mapTimeoutMarker\":true,\"regionSummary\":\"china\",\"dnsStatsExpanded\":true,\"quickActions\":true}}}', 2, NULL, 2087024190159917057, '2026-08-11 16:37:16', 2087024190159917057, '2026-08-11 16:37:36');
COMMIT;

-- ----------------------------
-- Table structure for sponsors
-- ----------------------------
DROP TABLE IF EXISTS `sponsors`;
CREATE TABLE `sponsors` (
  `id` bigint NOT NULL COMMENT '主键',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `url` varchar(500) DEFAULT NULL COMMENT '链接地址',
  `img_url` varchar(500) DEFAULT NULL COMMENT '图片地址',
  `weight` bigint DEFAULT '0' COMMENT '权重',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  `tenant_id` varchar(20) DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='赞助商';



-- ----------------------------
-- Table structure for sys_client
-- ----------------------------
DROP TABLE IF EXISTS `sys_client`;
CREATE TABLE `sys_client` (
  `id` bigint NOT NULL COMMENT 'id',
  `client_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '客户端id',
  `client_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '客户端key',
  `client_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '客户端秘钥',
  `mini_app_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '微信小程序AppID',
  `mini_app_secret` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '微信小程序AppSecret',
  `mini_app_env_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'release' COMMENT '小程序码版本',
  `grant_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '授权类型',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '设备类型',
  `active_timeout` int DEFAULT '1800' COMMENT 'token活跃超时时间',
  `timeout` int DEFAULT '604800' COMMENT 'token固定超时',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统授权表';

-- ----------------------------
-- Records of sys_client
-- ----------------------------
BEGIN;
INSERT INTO `sys_client` (`id`, `client_id`, `client_key`, `client_secret`, `mini_app_id`, `mini_app_secret`, `mini_app_env_version`, `grant_type`, `device_type`, `active_timeout`, `timeout`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (1, 'e5cd7e4891bf95d1d19206ce24a7b32e', 'pc', 'pc123', NULL, NULL, 'release', 'password,social', 'pc', 1800, 604800, '0', '0', 103, 1, '2026-05-14 12:36:14', 1, '2026-05-14 12:36:14');
INSERT INTO `sys_client` (`id`, `client_id`, `client_key`, `client_secret`, `mini_app_id`, `mini_app_secret`, `mini_app_env_version`, `grant_type`, `device_type`, `active_timeout`, `timeout`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (2, '428a8310cd442757ae699df5d894f051', 'app', 'app123', '1', '1', 'release', 'xcx', 'xcx', 1800, 604800, '0', '0', 103, 1, '2026-05-14 12:36:14', 1, '2026-09-02 15:18:08');
COMMIT;

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_config`;
CREATE TABLE `sys_config` (
  `config_id` bigint NOT NULL COMMENT '参数主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `config_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '参数名称',
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '参数键名',
  `config_value` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '参数键值',
  `config_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'N' COMMENT '系统内置（Y是 N否）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='参数配置表';

-- ----------------------------
-- Records of sys_config
-- ----------------------------
BEGIN;
INSERT INTO `sys_config` (`config_id`, `tenant_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', '主框架页-默认皮肤样式名称', 'sys.index.skinName', 'skin-blue', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow');
INSERT INTO `sys_config` (`config_id`, `tenant_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', '用户管理-账号初始密码', 'sys.user.initPassword', '123456', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '初始化密码 123456');
INSERT INTO `sys_config` (`config_id`, `tenant_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', '主框架页-侧边栏主题', 'sys.index.sideTheme', 'theme-dark', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '深色主题theme-dark，浅色主题theme-light');
INSERT INTO `sys_config` (`config_id`, `tenant_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (5, '000000', '账号自助-是否开启用户注册功能', 'sys.account.registerUser', 'false', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '是否开启注册用户功能（true开启，false关闭）');
INSERT INTO `sys_config` (`config_id`, `tenant_id`, `config_name`, `config_key`, `config_value`, `config_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (11, '000000', 'OSS预览列表资源开关', 'sys.oss.previewListResource', 'true', 'Y', 103, 1, '2026-05-14 12:36:14', 1, '2026-08-03 14:31:10', 'true:开启, false:关闭');
COMMIT;

-- ----------------------------
-- Table structure for sys_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept` (
  `dept_id` bigint NOT NULL COMMENT '部门id',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `parent_id` bigint DEFAULT '0' COMMENT '父部门id',
  `ancestors` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '祖级列表',
  `dept_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '部门名称',
  `dept_category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '部门类别编码',
  `order_num` int DEFAULT '0' COMMENT '显示顺序',
  `leader` bigint DEFAULT NULL COMMENT '负责人',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '邮箱',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='部门表';

-- ----------------------------
-- Records of sys_dept
-- ----------------------------
BEGIN;
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (100, '000000', 0, '0', 'XXX科技', NULL, 0, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (101, '000000', 100, '0,100', '深圳总公司', NULL, 1, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (102, '000000', 100, '0,100', '长沙分公司', NULL, 2, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (103, '000000', 101, '0,100,101', '研发部门', NULL, 1, 1, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (104, '000000', 101, '0,100,101', '市场部门', NULL, 2, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (105, '000000', 101, '0,100,101', '测试部门', NULL, 3, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (106, '000000', 101, '0,100,101', '财务部门', NULL, 4, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (107, '000000', 101, '0,100,101', '运维部门', NULL, 5, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (108, '000000', 102, '0,100,102', '市场部门', NULL, 1, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
INSERT INTO `sys_dept` (`dept_id`, `tenant_id`, `parent_id`, `ancestors`, `dept_name`, `dept_category`, `order_num`, `leader`, `phone`, `email`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (109, '000000', 102, '0,100,102', '财务部门', NULL, 2, NULL, '15888888888', 'xxx@qq.com', '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_data
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_data`;
CREATE TABLE `sys_dict_data` (
  `dict_code` bigint NOT NULL COMMENT '字典编码',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `dict_sort` int DEFAULT '0' COMMENT '字典排序',
  `dict_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典标签',
  `dict_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典键值',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典类型',
  `css_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '样式属性（其他样式扩展）',
  `list_class` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '表格回显样式',
  `is_default` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'N' COMMENT '是否默认（Y是 N否）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='字典数据表';

-- ----------------------------
-- Records of sys_dict_data
-- ----------------------------
BEGIN;
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', 1, '男', '0', 'sys_user_sex', '', '', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '性别男');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', 2, '女', '1', 'sys_user_sex', '', '', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '性别女');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', 3, '未知', '2', 'sys_user_sex', '', '', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '性别未知');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, '000000', 1, '显示', '0', 'sys_show_hide', '', 'primary', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '显示菜单');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (5, '000000', 2, '隐藏', '1', 'sys_show_hide', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '隐藏菜单');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (6, '000000', 1, '正常', '0', 'sys_normal_disable', '', 'primary', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '正常状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (7, '000000', 2, '停用', '1', 'sys_normal_disable', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '停用状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12, '000000', 1, '是', 'Y', 'sys_yes_no', '', 'primary', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '系统默认是');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (13, '000000', 2, '否', 'N', 'sys_yes_no', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '系统默认否');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (14, '000000', 1, '通知', '1', 'sys_notice_type', '', 'warning', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '通知');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (15, '000000', 2, '公告', '2', 'sys_notice_type', '', 'success', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '公告');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (16, '000000', 1, '正常', '0', 'sys_notice_status', '', 'primary', 'Y', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '正常状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (17, '000000', 2, '关闭', '1', 'sys_notice_status', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '关闭状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (18, '000000', 1, '新增', '1', 'sys_oper_type', '', 'info', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '新增操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (19, '000000', 2, '修改', '2', 'sys_oper_type', '', 'info', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '修改操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (20, '000000', 3, '删除', '3', 'sys_oper_type', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '删除操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (21, '000000', 4, '授权', '4', 'sys_oper_type', '', 'primary', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '授权操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (22, '000000', 5, '导出', '5', 'sys_oper_type', '', 'warning', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '导出操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (23, '000000', 6, '导入', '6', 'sys_oper_type', '', 'warning', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '导入操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (24, '000000', 7, '强退', '7', 'sys_oper_type', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '强退操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (25, '000000', 8, '生成代码', '8', 'sys_oper_type', '', 'warning', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '生成操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (26, '000000', 9, '清空数据', '9', 'sys_oper_type', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '清空操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (27, '000000', 1, '成功', '0', 'sys_common_status', '', 'primary', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '正常状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (28, '000000', 2, '失败', '1', 'sys_common_status', '', 'danger', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '停用状态');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (29, '000000', 99, '其他', '0', 'sys_oper_type', '', 'info', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '其他操作');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (30, '000000', 0, '密码认证', 'password', 'sys_grant_type', 'el-check-tag', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '密码认证');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (31, '000000', 0, '短信认证', 'sms', 'sys_grant_type', 'el-check-tag', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '短信认证');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (32, '000000', 0, '邮件认证', 'email', 'sys_grant_type', 'el-check-tag', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '邮件认证');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (33, '000000', 0, '小程序认证', 'xcx', 'sys_grant_type', 'el-check-tag', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '小程序认证');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (34, '000000', 0, '三方登录认证', 'social', 'sys_grant_type', 'el-check-tag', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '三方登录认证');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (35, '000000', 0, 'PC', 'pc', 'sys_device_type', '', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, 'PC');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (36, '000000', 0, '安卓', 'android', 'sys_device_type', '', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '安卓');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (37, '000000', 0, 'iOS', 'ios', 'sys_device_type', '', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, 'iOS');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (38, '000000', 0, '小程序', 'xcx', 'sys_device_type', '', 'default', 'N', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '小程序');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055181472411938817, '000000', 0, '顶部', 'top', 'ad_type', '', 'default', 'N', 103, 1, '2026-05-15 15:00:21', 1, '2026-05-15 15:00:21', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055181542079328257, '000000', 0, '中间', 'center', 'ad_type', '', 'default', 'N', 103, 1, '2026-05-15 15:00:38', 1, '2026-05-15 15:00:44', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056927584080584705, '000000', 0, '有效', '1', 'url_blacklist_status', '', 'primary', 'N', 103, 1, '2026-05-20 10:38:47', 1, '2026-05-20 10:38:47', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056927629232267265, '000000', 0, '无效', '0', 'url_blacklist_status', '', 'danger', 'N', 103, 1, '2026-05-20 10:38:57', 1, '2026-05-20 10:38:57', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2057010266572353537, '000000', 0, '左边', 'left', 'ad_type', '', 'default', 'N', 103, 1, '2026-05-20 16:07:20', 1, '2026-05-20 16:07:25', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2057010325858840577, '000000', 0, '右边', 'right', 'ad_type', '', 'default', 'N', 103, 1, '2026-05-20 16:07:34', 1, '2026-05-20 16:07:38', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066801644137385985, '000000', 0, '开启', 'true', 'node_state', '', 'primary', 'N', 103, 1, '2026-06-16 16:34:46', 1, '2026-06-16 16:34:46', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066802010690195458, '000000', 0, '关闭', 'false', 'node_state', '', 'danger', 'N', 103, 1, '2026-06-16 16:36:13', 1, '2026-06-16 16:36:13', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803294927360002, '000000', 0, '华东地区', '华东地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:20', 1, '2026-06-16 16:41:20', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803321783488514, '000000', 0, '华北地区', '华北地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:26', 1, '2026-06-16 16:41:26', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803343895859202, '000000', 0, '华中地区', '华中地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:31', 1, '2026-06-16 16:41:31', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803364754132994, '000000', 0, '华南地区', '华南地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:36', 1, '2026-06-16 16:41:36', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803387709558785, '000000', 0, '西南地区', '西南地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:42', 1, '2026-06-16 16:41:42', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803410597875713, '000000', 0, '西北地区', '西北地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:47', 1, '2026-06-16 16:41:47', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803434232778754, '000000', 0, '东北地区', '东北地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:53', 1, '2026-06-16 16:41:53', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803456412258305, '000000', 0, '海外地区', '海外地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:41:58', 1, '2026-06-16 16:41:58', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803479392849921, '000000', 0, '港澳台、海外地区', '港澳台、海外地区', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:03', 1, '2026-06-16 16:42:03', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803518194356226, '000000', 0, '港澳台', '港澳台', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:13', 1, '2026-06-16 16:42:13', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803541585989633, '000000', 0, '亚洲', '亚洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:18', 1, '2026-06-16 16:42:18', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803564751130625, '000000', 0, '欧洲', '欧洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:24', 1, '2026-06-16 16:42:24', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803584829263874, '000000', 0, '非洲', '非洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:29', 1, '2026-06-16 16:42:29', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803604391497730, '000000', 0, '大洋洲', '大洋洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:33', 1, '2026-06-16 16:42:33', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803625572732930, '000000', 0, '北美洲', '北美洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:38', 1, '2026-06-16 16:42:38', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803648595267586, '000000', 0, '南美洲', '南美洲', 'node_region', '', 'primary', 'N', 103, 1, '2026-06-16 16:42:44', 1, '2026-06-16 16:42:44', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803770548850690, '000000', 0, '移动', '移动', 'node_operators', '', 'primary', 'N', 103, 1, '2026-06-16 16:43:13', 1, '2026-06-16 16:43:13', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803790006226945, '000000', 0, '联通', '联通', 'node_operators', '', 'primary', 'N', 103, 1, '2026-06-16 16:43:18', 1, '2026-06-16 16:43:18', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803813959897090, '000000', 0, '电信', '电信', 'node_operators', '', 'primary', 'N', 103, 1, '2026-06-16 16:43:23', 1, '2026-06-16 16:43:23', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803836034519041, '000000', 0, '多线', '多线', 'node_operators', '', 'primary', 'N', 103, 1, '2026-06-16 16:43:29', 1, '2026-06-16 16:43:29', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803861607190529, '000000', 0, '港澳台、海外', '港澳台、海外', 'node_operators', '', 'primary', 'N', 103, 1, '2026-06-16 16:43:35', 1, '2026-06-16 16:43:35', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066808596489834498, '000000', 0, '新疆维吾尔自治区', '新疆维吾尔自治区', 'node_province', '', 'primary', 'N', 103, 1, '2026-06-16 17:02:24', 1, '2026-06-16 17:02:24', '');
INSERT INTO `sys_dict_data` (`dict_code`, `tenant_id`, `dict_sort`, `dict_label`, `dict_value`, `dict_type`, `css_class`, `list_class`, `is_default`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2087823576543612929, '000000', 0, '广东', '广东', 'node_province', '', 'primary', 'N', 103, 1, '2026-08-13 16:48:25', 1, '2026-08-13 16:48:43', '');
COMMIT;

-- ----------------------------
-- Table structure for sys_dict_type
-- ----------------------------
DROP TABLE IF EXISTS `sys_dict_type`;
CREATE TABLE `sys_dict_type` (
  `dict_id` bigint NOT NULL COMMENT '字典主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `dict_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典名称',
  `dict_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '字典类型',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`dict_id`),
  UNIQUE KEY `tenant_id` (`tenant_id`,`dict_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='字典类型表';

-- ----------------------------
-- Records of sys_dict_type
-- ----------------------------
BEGIN;
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', '用户性别', 'sys_user_sex', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '用户性别列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', '菜单状态', 'sys_show_hide', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '菜单状态列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', '系统开关', 'sys_normal_disable', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '系统开关列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (6, '000000', '系统是否', 'sys_yes_no', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '系统是否列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (7, '000000', '通知类型', 'sys_notice_type', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '通知类型列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (8, '000000', '通知状态', 'sys_notice_status', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '通知状态列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (9, '000000', '操作类型', 'sys_oper_type', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '操作类型列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (10, '000000', '系统状态', 'sys_common_status', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '登录状态列表');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (11, '000000', '授权类型', 'sys_grant_type', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '认证授权类型');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12, '000000', '设备类型', 'sys_device_type', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '客户端设备类型');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055181065539284993, '000000', '广告位置', 'ad_type', 103, 1, '2026-05-15 14:58:44', 1, '2026-05-15 14:58:44', '');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056926964728684546, '000000', '网站黑名单状态', 'url_blacklist_status', 103, 1, '2026-05-20 10:36:19', 1, '2026-05-20 10:36:19', '');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066801445402873858, '000000', '节点-状态', 'node_state', 103, 1, '2026-06-16 16:33:59', 1, '2026-06-16 16:33:59', '');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803209824931842, '000000', '节点-区域', 'node_region', 103, 1, '2026-06-16 16:40:59', 1, '2026-06-16 16:40:59', '');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066803737296408578, '000000', '节点-运营商', 'node_operators', 103, 1, '2026-06-16 16:43:05', 1, '2026-06-16 16:43:05', '');
INSERT INTO `sys_dict_type` (`dict_id`, `tenant_id`, `dict_name`, `dict_type`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2066808484204122114, '000000', '节点-省份', 'node_province', 103, 1, '2026-06-16 17:01:57', 1, '2026-06-16 17:01:57', '');
COMMIT;

-- ----------------------------
-- Table structure for sys_logininfor
-- ----------------------------
DROP TABLE IF EXISTS `sys_logininfor`;
CREATE TABLE `sys_logininfor` (
  `info_id` bigint NOT NULL COMMENT '访问ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `user_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户账号',
  `client_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '客户端',
  `device_type` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '设备类型',
  `ipaddr` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '登录IP地址',
  `login_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '登录地点',
  `browser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '浏览器类型',
  `os` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '操作系统',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '登录状态（0成功 1失败）',
  `msg` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '提示消息',
  `login_time` datetime DEFAULT NULL COMMENT '访问时间',
  PRIMARY KEY (`info_id`),
  KEY `idx_sys_logininfor_s` (`status`),
  KEY `idx_sys_logininfor_lt` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='系统访问记录';



-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu` (
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  `menu_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint DEFAULT '0' COMMENT '父菜单ID',
  `order_num` int DEFAULT '0' COMMENT '显示顺序',
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '组件路径',
  `query_param` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '路由参数',
  `is_frame` int DEFAULT '1' COMMENT '是否为外链（0是 1否）',
  `is_cache` int DEFAULT '0' COMMENT '是否缓存（0缓存 1不缓存）',
  `menu_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '显示状态（0显示 1隐藏）',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '#' COMMENT '菜单图标',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='菜单权限表';

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '系统管理', 0, 1, 'system', NULL, '', 1, 0, 'M', '0', '0', '', 'system', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '系统管理目录');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '系统监控', 0, 3, 'monitor', NULL, '', 1, 0, 'M', '0', '0', '', 'monitor', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '系统监控目录');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '系统工具', 0, 4, 'tool', NULL, '', 1, 0, 'M', '0', '0', '', 'tool', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '系统工具目录');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, 'PLUS官网', 0, 5, 'https://gitee.com/dromara/RuoYi-Vue-Plus', NULL, '', 0, 0, 'M', '0', '0', '', 'guide', 103, 1, '2026-05-14 12:36:13', NULL, NULL, 'RuoYi-Vue-Plus官网地址');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (5, '测试菜单', 0, 5, 'demo', NULL, '', 1, 0, 'M', '0', '0', '', 'star', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '测试菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (6, '租户管理', 0, 2, 'tenant', NULL, '', 1, 0, 'M', '0', '0', '', 'chart', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '租户管理目录');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (100, '用户管理', 1, 1, 'user', 'system/user/index', '', 1, 0, 'C', '0', '0', 'system:user:list', 'user', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '用户管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (101, '角色管理', 1, 2, 'role', 'system/role/index', '', 1, 0, 'C', '0', '0', 'system:role:list', 'peoples', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '角色管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (102, '菜单管理', 1, 3, 'menu', 'system/menu/index', '', 1, 0, 'C', '0', '0', 'system:menu:list', 'tree-table', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '菜单管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (103, '部门管理', 1, 4, 'dept', 'system/dept/index', '', 1, 0, 'C', '0', '0', 'system:dept:list', 'tree', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '部门管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (104, '岗位管理', 1, 5, 'post', 'system/post/index', '', 1, 0, 'C', '0', '0', 'system:post:list', 'post', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '岗位管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (105, '字典管理', 1, 6, 'dict', 'system/dict/index', '', 1, 0, 'C', '0', '0', 'system:dict:list', 'dict', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '字典管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (106, '参数设置', 1, 7, 'config', 'system/config/index', '', 1, 0, 'C', '0', '0', 'system:config:list', 'edit', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '参数设置菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (107, '通知公告', 1, 8, 'notice', 'system/notice/index', '', 1, 0, 'C', '0', '0', 'system:notice:list', 'message', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '通知公告菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (108, '日志管理', 1, 9, 'log', '', '', 1, 0, 'M', '0', '0', '', 'log', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '日志管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (109, '在线用户', 2, 1, 'online', 'monitor/online/index', '', 1, 0, 'C', '0', '0', 'monitor:online:list', 'online', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '在线用户菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (113, '缓存监控', 2, 5, 'cache', 'monitor/cache/index', '', 1, 0, 'C', '0', '0', 'monitor:cache:list', 'redis', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '缓存监控菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (115, '代码生成', 3, 2, 'gen', 'tool/gen/index', '', 1, 0, 'C', '0', '0', 'tool:gen:list', 'code', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '代码生成菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (116, '修改生成配置', 3, 2, 'gen-edit/index/:tableId', 'tool/gen/editTable', '', 1, 1, 'C', '1', '0', 'tool:gen:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '/tool/gen');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (117, 'Admin监控', 2, 5, 'Admin', 'monitor/admin/index', '', 1, 0, 'C', '0', '0', 'monitor:admin:list', 'dashboard', 103, 1, '2026-05-14 12:36:13', NULL, NULL, 'Admin监控菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (118, '文件管理', 1, 10, 'oss', 'system/oss/index', '', 1, 0, 'C', '0', '0', 'system:oss:list', 'upload', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '文件管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (120, '任务调度中心', 2, 6, 'snailjob', 'monitor/snailjob/index', '', 1, 0, 'C', '0', '0', 'monitor:snailjob:list', 'job', 103, 1, '2026-05-14 12:36:13', NULL, NULL, 'SnailJob控制台菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (121, '租户管理', 6, 1, 'tenant', 'system/tenant/index', '', 1, 0, 'C', '0', '0', 'system:tenant:list', 'list', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '租户管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (122, '租户套餐管理', 6, 2, 'tenantPackage', 'system/tenantPackage/index', '', 1, 0, 'C', '0', '0', 'system:tenantPackage:list', 'form', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '租户套餐管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (123, '客户端管理', 1, 11, 'client', 'system/client/index', '', 1, 0, 'C', '0', '0', 'system:client:list', 'international', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '客户端管理菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (130, '分配用户', 1, 2, 'role-auth/user/:roleId', 'system/role/authUser', '', 1, 1, 'C', '1', '0', 'system:role:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '/system/role');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (131, '分配角色', 1, 1, 'user-auth/role/:userId', 'system/user/authRole', '', 1, 1, 'C', '1', '0', 'system:user:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '/system/user');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (132, '字典数据', 1, 6, 'dict-data/index/:dictId', 'system/dict/data', '', 1, 1, 'C', '1', '0', 'system:dict:list', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '/system/dict');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (133, '文件配置管理', 1, 10, 'oss-config/index', 'system/oss/config', '', 1, 1, 'C', '1', '0', 'system:ossConfig:list', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '/system/oss');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (500, '操作日志', 108, 1, 'operlog', 'monitor/operlog/index', '', 1, 0, 'C', '0', '0', 'monitor:operlog:list', 'form', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '操作日志菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (501, '登录日志', 108, 2, 'logininfor', 'monitor/logininfor/index', '', 1, 0, 'C', '0', '0', 'monitor:logininfor:list', 'logininfor', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '登录日志菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1001, '用户查询', 100, 1, '', '', '', 1, 0, 'F', '0', '0', 'system:user:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1002, '用户新增', 100, 2, '', '', '', 1, 0, 'F', '0', '0', 'system:user:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1003, '用户修改', 100, 3, '', '', '', 1, 0, 'F', '0', '0', 'system:user:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1004, '用户删除', 100, 4, '', '', '', 1, 0, 'F', '0', '0', 'system:user:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1005, '用户导出', 100, 5, '', '', '', 1, 0, 'F', '0', '0', 'system:user:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1006, '用户导入', 100, 6, '', '', '', 1, 0, 'F', '0', '0', 'system:user:import', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1007, '重置密码', 100, 7, '', '', '', 1, 0, 'F', '0', '0', 'system:user:resetPwd', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1008, '角色查询', 101, 1, '', '', '', 1, 0, 'F', '0', '0', 'system:role:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1009, '角色新增', 101, 2, '', '', '', 1, 0, 'F', '0', '0', 'system:role:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1010, '角色修改', 101, 3, '', '', '', 1, 0, 'F', '0', '0', 'system:role:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1011, '角色删除', 101, 4, '', '', '', 1, 0, 'F', '0', '0', 'system:role:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1012, '角色导出', 101, 5, '', '', '', 1, 0, 'F', '0', '0', 'system:role:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1013, '菜单查询', 102, 1, '', '', '', 1, 0, 'F', '0', '0', 'system:menu:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1014, '菜单新增', 102, 2, '', '', '', 1, 0, 'F', '0', '0', 'system:menu:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1015, '菜单修改', 102, 3, '', '', '', 1, 0, 'F', '0', '0', 'system:menu:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1016, '菜单删除', 102, 4, '', '', '', 1, 0, 'F', '0', '0', 'system:menu:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1017, '部门查询', 103, 1, '', '', '', 1, 0, 'F', '0', '0', 'system:dept:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1018, '部门新增', 103, 2, '', '', '', 1, 0, 'F', '0', '0', 'system:dept:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1019, '部门修改', 103, 3, '', '', '', 1, 0, 'F', '0', '0', 'system:dept:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1020, '部门删除', 103, 4, '', '', '', 1, 0, 'F', '0', '0', 'system:dept:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1021, '岗位查询', 104, 1, '', '', '', 1, 0, 'F', '0', '0', 'system:post:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1022, '岗位新增', 104, 2, '', '', '', 1, 0, 'F', '0', '0', 'system:post:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1023, '岗位修改', 104, 3, '', '', '', 1, 0, 'F', '0', '0', 'system:post:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1024, '岗位删除', 104, 4, '', '', '', 1, 0, 'F', '0', '0', 'system:post:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1025, '岗位导出', 104, 5, '', '', '', 1, 0, 'F', '0', '0', 'system:post:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1026, '字典查询', 105, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1027, '字典新增', 105, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1028, '字典修改', 105, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1029, '字典删除', 105, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1030, '字典导出', 105, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:dict:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1031, '参数查询', 106, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:config:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1032, '参数新增', 106, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:config:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1033, '参数修改', 106, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:config:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1034, '参数删除', 106, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:config:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1035, '参数导出', 106, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:config:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1036, '公告查询', 107, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1037, '公告新增', 107, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1038, '公告修改', 107, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1039, '公告删除', 107, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:notice:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1040, '操作查询', 500, 1, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1041, '操作删除', 500, 2, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1042, '日志导出', 500, 4, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:operlog:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1043, '登录查询', 501, 1, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1044, '登录删除', 501, 2, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1045, '日志导出', 501, 3, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1046, '在线查询', 109, 1, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1047, '批量强退', 109, 2, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:batchLogout', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1048, '单条强退', 109, 3, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:online:forceLogout', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1050, '账户解锁', 501, 4, '#', '', '', 1, 0, 'F', '0', '0', 'monitor:logininfor:unlock', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1055, '生成查询', 115, 1, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1056, '生成修改', 115, 2, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1057, '生成删除', 115, 3, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1058, '导入代码', 115, 2, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:import', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1059, '预览代码', 115, 4, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:preview', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1060, '生成代码', 115, 5, '#', '', '', 1, 0, 'F', '0', '0', 'tool:gen:code', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1061, '客户端管理查询', 123, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:client:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1062, '客户端管理新增', 123, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:client:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1063, '客户端管理修改', 123, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:client:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1064, '客户端管理删除', 123, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:client:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1065, '客户端管理导出', 123, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:client:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1500, '测试单表', 5, 1, 'demo', 'demo/demo/index', '', 1, 0, 'C', '0', '0', 'demo:demo:list', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '测试单表菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1501, '测试单表查询', 1500, 1, '#', '', '', 1, 0, 'F', '0', '0', 'demo:demo:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1502, '测试单表新增', 1500, 2, '#', '', '', 1, 0, 'F', '0', '0', 'demo:demo:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1503, '测试单表修改', 1500, 3, '#', '', '', 1, 0, 'F', '0', '0', 'demo:demo:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1504, '测试单表删除', 1500, 4, '#', '', '', 1, 0, 'F', '0', '0', 'demo:demo:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1505, '测试单表导出', 1500, 5, '#', '', '', 1, 0, 'F', '0', '0', 'demo:demo:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1506, '测试树表', 5, 1, 'tree', 'demo/tree/index', '', 1, 0, 'C', '0', '0', 'demo:tree:list', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '测试树表菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1507, '测试树表查询', 1506, 1, '#', '', '', 1, 0, 'F', '0', '0', 'demo:tree:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1508, '测试树表新增', 1506, 2, '#', '', '', 1, 0, 'F', '0', '0', 'demo:tree:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1509, '测试树表修改', 1506, 3, '#', '', '', 1, 0, 'F', '0', '0', 'demo:tree:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1510, '测试树表删除', 1506, 4, '#', '', '', 1, 0, 'F', '0', '0', 'demo:tree:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1511, '测试树表导出', 1506, 5, '#', '', '', 1, 0, 'F', '0', '0', 'demo:tree:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1600, '文件查询', 118, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1601, '文件上传', 118, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:upload', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1602, '文件下载', 118, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:download', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1603, '文件删除', 118, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1606, '租户查询', 121, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenant:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1607, '租户新增', 121, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenant:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1608, '租户修改', 121, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenant:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1609, '租户删除', 121, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenant:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1610, '租户导出', 121, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenant:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1611, '租户套餐查询', 122, 1, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenantPackage:query', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1612, '租户套餐新增', 122, 2, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenantPackage:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1613, '租户套餐修改', 122, 3, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenantPackage:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1614, '租户套餐删除', 122, 4, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenantPackage:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1615, '租户套餐导出', 122, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:tenantPackage:export', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1620, '配置列表', 118, 5, '#', '', '', 1, 0, 'F', '0', '0', 'system:ossConfig:list', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1621, '配置添加', 118, 6, '#', '', '', 1, 0, 'F', '0', '0', 'system:ossConfig:add', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1622, '配置编辑', 118, 6, '#', '', '', 1, 0, 'F', '0', '0', 'system:ossConfig:edit', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1623, '配置删除', 118, 6, '#', '', '', 1, 0, 'F', '0', '0', 'system:ossConfig:remove', '#', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12100, 'okping 配置', 0, 8, 'ping', NULL, '', 1, 0, 'M', '0', '0', '', 'monitor', 103, 1, '2026-08-11 20:05:15', 1, '2026-08-31 15:48:04', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12101, '节点配置', 12100, 1, 'nodeConfig', 'ping/nodeConfig/index', '', 1, 0, 'C', '0', '0', 'ping:nodeConfig:list', 'list', 103, 1, '2026-08-11 20:05:15', 1, '2026-08-31 15:50:01', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12102, '节点配置查询', 12101, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:query', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12103, '节点配置新增', 12101, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:add', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12104, '节点配置修改', 12101, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:edit', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12105, '节点配置删除', 12101, 4, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:remove', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12106, '节点配置导出', 12101, 5, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:export', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12107, '节点配置列表', 12101, 6, '#', '', '', 1, 0, 'F', '0', '0', 'ping:nodeConfig:list', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12108, 'Agent镜像上传', 12101, 7, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:upload', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '允许上传Agent离线Docker镜像到OSS');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12120, '页面配置1.0', 12100, 2, 'pageConfig', 'ping/pageConfig/index', '', 1, 0, 'C', '0', '0', 'ping:pageConfig:list', 'list', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12121, '页面配置查询', 12120, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:query', '#', 103, 1, '2026-08-11 20:05:16', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12122, '页面配置新增', 12120, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:add', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12123, '页面配置修改', 12120, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:edit', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12124, '页面配置删除', 12120, 4, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:remove', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12125, '页面配置导出', 12120, 5, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:export', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12126, '页面配置列表', 12120, 6, '#', '', '', 1, 0, 'F', '0', '0', 'ping:pageConfig:list', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12140, '站点布局1.0', 12100, 3, 'layoutConfig', 'ping/layoutConfig/index', '', 1, 0, 'C', '0', '0', 'ping:layoutConfig:list', 'dashboard', 103, 1, '2026-08-11 20:05:17', 1, '2026-08-31 15:52:25', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12141, '站点布局查询', 12140, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:query', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12142, '站点布局新增', 12140, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:add', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12143, '站点布局修改', 12140, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:edit', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12144, '站点布局删除', 12140, 4, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:remove', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12145, '站点布局导出', 12140, 5, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:export', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12146, '站点布局列表', 12140, 6, '#', '', '', 1, 0, 'F', '0', '0', 'ping:layoutConfig:list', '#', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12160, 'IP信息纠错', 12100, 4, 'ipFeedback', 'ping/ipFeedback/index', '', 1, 0, 'C', '0', '0', 'ping:ipFeedback:list', 'edit', 103, 1, '2026-08-11 20:05:17', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12161, 'IP信息纠错查询', 12160, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:ipFeedback:list', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12162, 'IP信息纠错审核', 12160, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:ipFeedback:audit', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12180, '博客管理', 12100, 5, 'blog', 'ping/blog/index', '', 1, 0, 'C', '0', '0', 'ping:blog:list', 'tab', 103, 1, '2026-08-11 20:05:18', 1, '2026-08-31 15:50:49', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12181, '博客文章查询', 12180, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:blog:query', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12182, '博客文章新增', 12180, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:blog:add', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12183, '博客文章修改', 12180, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:blog:edit', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12184, '博客文章删除', 12180, 4, '#', '', '', 1, 0, 'F', '0', '0', 'ping:blog:remove', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12185, '博客文章列表', 12180, 5, '#', '', '', 1, 0, 'F', '0', '0', 'ping:blog:list', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12186, '博客图片上传', 12180, 6, '#', '', '', 1, 0, 'F', '0', '0', 'system:oss:upload', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '允许博客编辑器上传图片到OSS');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12200, '发展历程管理', 12100, 6, 'milestone', 'ping/milestone/index', '', 1, 0, 'C', '0', '0', 'ping:milestone:list', 'list', 103, 1, '2026-08-11 20:05:18', 1, '2026-08-31 15:51:49', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12201, '项目里程碑查询', 12200, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:milestone:query', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12202, '项目里程碑新增', 12200, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:milestone:add', '#', 103, 1, '2026-08-11 20:05:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12203, '项目里程碑修改', 12200, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:milestone:edit', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12204, '项目里程碑删除', 12200, 4, '#', '', '', 1, 0, 'F', '0', '0', 'ping:milestone:remove', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12205, '项目里程碑列表', 12200, 5, '#', '', '', 1, 0, 'F', '0', '0', 'ping:milestone:list', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12220, '监控内测报名', 12100, 7, 'productBeta', 'ping/productBeta/index', '', 1, 0, 'C', '1', '1', 'ping:productBeta:list', 'user-filled', 103, 1, '2026-08-11 20:05:19', 1, '2026-08-31 15:51:30', '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12221, '内测报名列表', 12220, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:productBeta:list', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12222, '内测报名处理', 12220, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:productBeta:edit', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12240, '问题反馈管理', 12100, 8, 'issue', 'ping/issue/index', '', 1, 0, 'C', '0', '0', 'ping:issue:list', 'message', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '用户问题反馈、意见建议及公开解决方案管理');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12241, '问题反馈列表', 12240, 1, '#', '', '', 1, 0, 'F', '0', '0', 'ping:issue:list', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12242, '问题反馈查看', 12240, 2, '#', '', '', 1, 0, 'F', '0', '0', 'ping:issue:query', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (12243, '问题反馈回复', 12240, 3, '#', '', '', 1, 0, 'F', '0', '0', 'ping:issue:reply', '#', 103, 1, '2026-08-11 20:05:19', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164162, '友情链接', 12100, 1, 'links', 'web/links/index', NULL, 1, 0, 'C', '0', '0', 'web:links:list', 'international', 103, 1, '2026-05-14 13:46:32', 1, '2026-08-10 09:58:21', '友情链接菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164163, '友情链接查询', 2054799170083164162, 1, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:links:query', '#', 103, 1, '2026-05-14 13:46:32', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164164, '友情链接新增', 2054799170083164162, 2, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:links:add', '#', 103, 1, '2026-05-14 13:46:32', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164165, '友情链接修改', 2054799170083164162, 3, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:links:edit', '#', 103, 1, '2026-05-14 13:46:32', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164166, '友情链接删除', 2054799170083164162, 4, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:links:remove', '#', 103, 1, '2026-05-14 13:46:32', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2054799170083164167, '友情链接导出', 2054799170083164162, 5, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:links:export', '#', 103, 1, '2026-05-14 13:46:32', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300674, '广告链接', 12100, 1, 'adLinks', 'web/adLinks/index', NULL, 1, 0, 'C', '0', '0', 'web:adLinks:list', 'international', 103, 1, '2026-05-15 15:04:45', 1, '2026-08-10 09:58:35', '广告链接菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300675, '广告链接查询', 2055182176694300674, 1, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:adLinks:query', '#', 103, 1, '2026-05-15 15:04:45', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300676, '广告链接新增', 2055182176694300674, 2, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:adLinks:add', '#', 103, 1, '2026-05-15 15:04:45', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300677, '广告链接修改', 2055182176694300674, 3, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:adLinks:edit', '#', 103, 1, '2026-05-15 15:04:45', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300678, '广告链接删除', 2055182176694300674, 4, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:adLinks:remove', '#', 103, 1, '2026-05-15 15:04:45', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2055182176694300679, '广告链接导出', 2055182176694300674, 5, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:adLinks:export', '#', 103, 1, '2026-05-15 15:04:45', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429378, '域名黑名单', 3, 1, 'blacklist', 'web/blacklist/index', NULL, 1, 0, 'C', '0', '0', 'web:blacklist:list', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '域名黑名单菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429379, '域名黑名单查询', 2056928810675429378, 1, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:blacklist:query', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429380, '域名黑名单新增', 2056928810675429378, 2, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:blacklist:add', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429381, '域名黑名单修改', 2056928810675429378, 3, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:blacklist:edit', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429382, '域名黑名单删除', 2056928810675429378, 4, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:blacklist:remove', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2056928810675429383, '域名黑名单导出', 2056928810675429378, 5, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:blacklist:export', '#', 103, 1, '2026-05-20 10:46:05', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298178, '赞助商', 12100, 1, 'sponsors', 'web/sponsors/index', NULL, 1, 0, 'C', '0', '0', 'web:sponsors:list', 'peoples', 103, 1, '2026-06-04 14:27:18', 1, '2026-08-31 15:50:26', '赞助商菜单');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298179, '赞助商查询', 2062420863909298178, 1, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:sponsors:query', '#', 103, 1, '2026-06-04 14:27:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298180, '赞助商新增', 2062420863909298178, 2, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:sponsors:add', '#', 103, 1, '2026-06-04 14:27:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298181, '赞助商修改', 2062420863909298178, 3, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:sponsors:edit', '#', 103, 1, '2026-06-04 14:27:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298182, '赞助商删除', 2062420863909298178, 4, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:sponsors:remove', '#', 103, 1, '2026-06-04 14:27:18', NULL, NULL, '');
INSERT INTO `sys_menu` (`menu_id`, `menu_name`, `parent_id`, `order_num`, `path`, `component`, `query_param`, `is_frame`, `is_cache`, `menu_type`, `visible`, `status`, `perms`, `icon`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2062420863909298183, '赞助商导出', 2062420863909298178, 5, '#', '', NULL, 1, 0, 'F', '0', '0', 'web:sponsors:export', '#', 103, 1, '2026-06-04 14:27:18', NULL, NULL, '');
COMMIT;

-- ----------------------------
-- Table structure for sys_notice
-- ----------------------------
DROP TABLE IF EXISTS `sys_notice`;
CREATE TABLE `sys_notice` (
  `notice_id` bigint NOT NULL COMMENT '公告ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `notice_title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '公告标题',
  `notice_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '公告类型（1通知 2公告）',
  `notice_content` longblob COMMENT '公告内容',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '公告状态（0正常 1关闭）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='通知公告表';

-- ----------------------------
-- Records of sys_notice
-- ----------------------------
BEGIN;
INSERT INTO `sys_notice` (`notice_id`, `tenant_id`, `notice_title`, `notice_type`, `notice_content`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', '温馨提醒：2018-07-01 新版本发布啦', '2', 0xE696B0E78988E69CACE58685E5AEB9, '0', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '管理员');
INSERT INTO `sys_notice` (`notice_id`, `tenant_id`, `notice_title`, `notice_type`, `notice_content`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', '维护通知：2018-07-01 系统凌晨维护', '1', 0xE7BBB4E68AA4E58685E5AEB9, '0', 103, 1, '2026-05-14 12:36:14', NULL, NULL, '管理员');
COMMIT;

-- ----------------------------
-- Table structure for sys_oper_log
-- ----------------------------
DROP TABLE IF EXISTS `sys_oper_log`;
CREATE TABLE `sys_oper_log` (
  `oper_id` bigint NOT NULL COMMENT '日志主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '模块标题',
  `business_type` int DEFAULT '0' COMMENT '业务类型（0其它 1新增 2修改 3删除）',
  `method` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '方法名称',
  `request_method` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '请求方式',
  `operator_type` int DEFAULT '0' COMMENT '操作类别（0其它 1后台用户 2手机端用户）',
  `oper_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '操作人员',
  `dept_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '部门名称',
  `oper_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '请求URL',
  `oper_ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '主机地址',
  `oper_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '操作地点',
  `oper_param` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '请求参数',
  `json_result` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '返回参数',
  `status` int DEFAULT '0' COMMENT '操作状态（0正常 1异常）',
  `error_msg` varchar(4000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '错误消息',
  `oper_time` datetime DEFAULT NULL COMMENT '操作时间',
  `cost_time` bigint DEFAULT '0' COMMENT '消耗时间',
  PRIMARY KEY (`oper_id`),
  KEY `idx_sys_oper_log_bt` (`business_type`),
  KEY `idx_sys_oper_log_s` (`status`),
  KEY `idx_sys_oper_log_ot` (`oper_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='操作日志记录';

-- ----------------------------
-- Records of sys_oper_log
-- ----------------------------

-- ----------------------------
-- Table structure for sys_oss
-- ----------------------------
DROP TABLE IF EXISTS `sys_oss`;
CREATE TABLE `sys_oss` (
  `oss_id` bigint NOT NULL COMMENT '对象存储主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '文件名',
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '原名',
  `file_suffix` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '文件后缀名',
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'URL地址',
  `ext1` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '扩展字段',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '上传人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `service` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'minio' COMMENT '服务商',
  PRIMARY KEY (`oss_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='OSS对象存储表';



-- ----------------------------
-- Table structure for sys_oss_config
-- ----------------------------
DROP TABLE IF EXISTS `sys_oss_config`;
CREATE TABLE `sys_oss_config` (
  `oss_config_id` bigint NOT NULL COMMENT '主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `config_key` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '配置key',
  `access_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT 'accessKey',
  `secret_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '秘钥',
  `bucket_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '桶名称',
  `prefix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '前缀',
  `endpoint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '访问站点',
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '自定义域名',
  `is_https` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'N' COMMENT '是否https（Y=是,N=否）',
  `region` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '域',
  `access_policy` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '1' COMMENT '桶权限类型(0=private 1=public 2=custom)',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '是否默认（0=是,1=否）',
  `ext1` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '扩展字段',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`oss_config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='对象存储配置表';

-- ----------------------------
-- Records of sys_oss_config
-- ----------------------------
BEGIN;
INSERT INTO `sys_oss_config` (`oss_config_id`, `tenant_id`, `config_key`, `access_key`, `secret_key`, `bucket_name`, `prefix`, `endpoint`, `domain`, `is_https`, `region`, `access_policy`, `status`, `ext1`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', 'okping', 'cPE7gPAiRP0Rc5nUcbAc', 'YVUg2zXUD2vZGZjy4qNTu6kQRyp9YkFBlUtpxUWM', 'data-okping', '', 'file.okping.net:9001', 'file.okping.net:9001', 'N', '', '1', '0', '', 103, 1, '2026-05-14 12:36:14', 1, '2026-09-03 12:35:26', '');
INSERT INTO `sys_oss_config` (`oss_config_id`, `tenant_id`, `config_key`, `access_key`, `secret_key`, `bucket_name`, `prefix`, `endpoint`, `domain`, `is_https`, `region`, `access_policy`, `status`, `ext1`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', 'qiniu', 'XXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXX', 'ruoyi', '', 's3-cn-north-1.qiniucs.com', '', 'N', '', '1', '1', '', 103, 1, '2026-05-14 12:36:14', 1, '2026-05-14 12:36:14', NULL);
INSERT INTO `sys_oss_config` (`oss_config_id`, `tenant_id`, `config_key`, `access_key`, `secret_key`, `bucket_name`, `prefix`, `endpoint`, `domain`, `is_https`, `region`, `access_policy`, `status`, `ext1`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', 'aliyun', 'XXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXX', 'ruoyi', '', 'oss-cn-beijing.aliyuncs.com', '', 'N', '', '1', '1', '', 103, 1, '2026-05-14 12:36:14', 1, '2026-05-14 12:36:14', NULL);
INSERT INTO `sys_oss_config` (`oss_config_id`, `tenant_id`, `config_key`, `access_key`, `secret_key`, `bucket_name`, `prefix`, `endpoint`, `domain`, `is_https`, `region`, `access_policy`, `status`, `ext1`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, '000000', 'qcloud', 'XXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXX', 'ruoyi-1240000000', '', 'cos.ap-beijing.myqcloud.com', '', 'N', 'ap-beijing', '1', '1', '', 103, 1, '2026-05-14 12:36:14', 1, '2026-05-14 12:36:14', NULL);
INSERT INTO `sys_oss_config` (`oss_config_id`, `tenant_id`, `config_key`, `access_key`, `secret_key`, `bucket_name`, `prefix`, `endpoint`, `domain`, `is_https`, `region`, `access_policy`, `status`, `ext1`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (5, '000000', 'image', 'ruoyi', 'ruoyi123', 'ruoyi', 'image', '127.0.0.1:9000', '', 'N', '', '1', '1', '', 103, 1, '2026-05-14 12:36:14', 1, '2026-05-14 12:36:14', NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_post
-- ----------------------------
DROP TABLE IF EXISTS `sys_post`;
CREATE TABLE `sys_post` (
  `post_id` bigint NOT NULL COMMENT '岗位ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `dept_id` bigint NOT NULL COMMENT '部门id',
  `post_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '岗位编码',
  `post_category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '岗位类别编码',
  `post_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '岗位名称',
  `post_sort` int NOT NULL COMMENT '显示顺序',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '状态（0正常 1停用）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='岗位信息表';

-- ----------------------------
-- Records of sys_post
-- ----------------------------
BEGIN;
INSERT INTO `sys_post` (`post_id`, `tenant_id`, `dept_id`, `post_code`, `post_category`, `post_name`, `post_sort`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', 103, 'ceo', NULL, '董事长', 1, '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_post` (`post_id`, `tenant_id`, `dept_id`, `post_code`, `post_category`, `post_name`, `post_sort`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2, '000000', 100, 'se', NULL, '项目经理', 2, '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_post` (`post_id`, `tenant_id`, `dept_id`, `post_code`, `post_category`, `post_name`, `post_sort`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', 100, 'hr', NULL, '人力资源', 3, '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_post` (`post_id`, `tenant_id`, `dept_id`, `post_code`, `post_category`, `post_name`, `post_sort`, `status`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, '000000', 100, 'user', NULL, '普通员工', 4, '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `role_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色权限字符串',
  `role_sort` int NOT NULL COMMENT '显示顺序',
  `data_scope` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '1' COMMENT '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限 5：仅本人数据权限 6：部门及以下或本人数据权限）',
  `menu_check_strictly` tinyint(1) DEFAULT '1' COMMENT '菜单树选择项是否关联显示',
  `dept_check_strictly` tinyint(1) DEFAULT '1' COMMENT '部门树选择项是否关联显示',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色信息表';

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_role` (`role_id`, `tenant_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', '超级管理员', 'superadmin', 1, '1', 1, 1, '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '超级管理员');
INSERT INTO `sys_role` (`role_id`, `tenant_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', '本部门及以下', 'test1', 3, '4', 1, 1, '0', '0', 103, 1, '2026-05-14 12:36:13', 1, '2026-08-13 16:52:15', '');
INSERT INTO `sys_role` (`role_id`, `tenant_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, '000000', '仅本人', 'test2', 4, '5', 1, 1, '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL, '');
INSERT INTO `sys_role` (`role_id`, `tenant_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2087004669764300801, '000000', 'okping平台用户', 'okping', 1, '1', 1, 1, '0', '1', 103, 1, '2026-08-11 10:34:23', 1, '2026-09-02 15:23:10', '');
INSERT INTO `sys_role` (`role_id`, `tenant_id`, `role_name`, `role_key`, `role_sort`, `data_scope`, `menu_check_strictly`, `dept_check_strictly`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2087004669764300802, '000000', '平台用户', 'ping_user', 100, '5', 1, 1, '0', '0', 103, 1, '2026-08-11 11:23:53', 1, '2026-09-02 15:23:28', '微信小程序扫码注册默认角色');
COMMIT;

-- ----------------------------
-- Table structure for sys_role_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_dept`;
CREATE TABLE `sys_role_dept` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `dept_id` bigint NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`role_id`,`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色和部门关联表';

-- ----------------------------
-- Records of sys_role_dept
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_role_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`,`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='角色和菜单关联表';

-- ----------------------------
-- Records of sys_role_menu
-- ----------------------------
BEGIN;
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 105);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 132);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1026);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1027);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1028);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1029);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 1030);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12100);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12101);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12102);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12103);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12104);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12105);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12106);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12107);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12108);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12120);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12121);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12122);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12123);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12124);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12125);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12126);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12140);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12141);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12142);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12143);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12144);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12145);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12146);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12160);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12161);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12162);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12180);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12181);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12182);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12183);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12184);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12185);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12186);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12200);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12201);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12202);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12203);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12204);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12205);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12220);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12221);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12222);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12240);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12241);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12242);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 12243);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164162);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164163);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164164);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164165);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164166);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2054799170083164167);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300674);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300675);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300676);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300677);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300678);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2055182176694300679);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298178);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298179);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298180);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298181);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298182);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (3, 2062420863909298183);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 5);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1500);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1501);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1502);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1503);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1504);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1505);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1506);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1507);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1508);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1509);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1510);
INSERT INTO `sys_role_menu` (`role_id`, `menu_id`) VALUES (4, 1511);
COMMIT;

-- ----------------------------
-- Table structure for sys_social
-- ----------------------------
DROP TABLE IF EXISTS `sys_social`;
CREATE TABLE `sys_social` (
  `id` bigint NOT NULL COMMENT '主键',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户id',
  `auth_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '平台+平台唯一id',
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户来源',
  `open_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '平台编号唯一id',
  `user_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录账号',
  `nick_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户昵称',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户邮箱',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '头像地址',
  `access_token` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户的授权令牌',
  `expire_in` int DEFAULT NULL COMMENT '用户的授权令牌的有效期，部分平台可能没有',
  `refresh_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '刷新令牌，部分平台可能没有',
  `access_code` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '平台的授权信息，部分平台可能没有',
  `union_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '用户的 unionid',
  `scope` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '授予的权限，部分平台可能没有',
  `token_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '个别平台的授权信息，部分平台可能没有',
  `id_token` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'id token，部分平台可能没有',
  `mac_algorithm` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '小米平台用户的附带属性，部分平台可能没有',
  `mac_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '小米平台用户的附带属性，部分平台可能没有',
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '用户的授权code，部分平台可能没有',
  `oauth_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Twitter平台用户的附带属性，部分平台可能没有',
  `oauth_token_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Twitter平台用户的附带属性，部分平台可能没有',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='社会化关系表';

-- ----------------------------
-- Records of sys_social
-- ----------------------------


-- ----------------------------
-- Table structure for sys_tenant
-- ----------------------------
DROP TABLE IF EXISTS `sys_tenant`;
CREATE TABLE `sys_tenant` (
  `id` bigint NOT NULL COMMENT 'id',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '租户编号',
  `contact_user_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '联系人',
  `contact_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '联系电话',
  `company_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '企业名称',
  `license_number` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '统一社会信用代码',
  `address` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '地址',
  `intro` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '企业简介',
  `domain` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '域名',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `package_id` bigint DEFAULT NULL COMMENT '租户套餐编号',
  `expire_time` datetime DEFAULT NULL COMMENT '过期时间',
  `account_count` int DEFAULT '-1' COMMENT '用户数量（-1不限制）',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '租户状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='租户表';

-- ----------------------------
-- Records of sys_tenant
-- ----------------------------
BEGIN;
INSERT INTO `sys_tenant` (`id`, `tenant_id`, `contact_user_name`, `contact_phone`, `company_name`, `license_number`, `address`, `intro`, `domain`, `remark`, `package_id`, `expire_time`, `account_count`, `status`, `del_flag`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES (1, '000000', '管理组', '15888888888', 'XXX有限公司', NULL, NULL, '多租户通用后台管理管理系统', NULL, NULL, NULL, NULL, -1, '0', '0', 103, 1, '2026-05-14 12:36:13', NULL, NULL);
COMMIT;

-- ----------------------------
-- Table structure for sys_tenant_package
-- ----------------------------
DROP TABLE IF EXISTS `sys_tenant_package`;
CREATE TABLE `sys_tenant_package` (
  `package_id` bigint NOT NULL COMMENT '租户套餐id',
  `package_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '套餐名称',
  `menu_ids` varchar(3000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '关联菜单id',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  `menu_check_strictly` tinyint(1) DEFAULT '1' COMMENT '菜单树选择项是否关联显示',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`package_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='租户套餐表';

-- ----------------------------
-- Records of sys_tenant_package
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `dept_id` bigint DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户昵称',
  `user_type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'sys_user' COMMENT '用户类型（sys_user系统用户）',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '手机号码',
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` bigint DEFAULT NULL COMMENT '头像地址',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '密码',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '账号状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0' COMMENT '删除标志（0代表存在 1代表删除）',
  `login_ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户信息表';

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`user_id`, `tenant_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (1, '000000', 103, 'admin', '疯狂的狮子Li', 'sys_user', 'crazyLionLi@163.com', '15888888888', '1', NULL, '$2a$10$Ej10fFy4hML6q81jJwxCMe0yDAB69Jjkqm9oDZ/oAyw57QPisfhjS', '0', '0', '0:0:0:0:0:0:0:1', '2026-09-03 18:44:26', 103, 1, '2026-05-14 12:36:13', -1, '2026-09-03 18:44:26', '管理员');
INSERT INTO `sys_user` (`user_id`, `tenant_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (3, '000000', 108, 'test', '本部门及以下 密码666666', 'sys_user', '', '', '0', NULL, '$2a$10$b8yUzN0C71sbz.PhNOCgJe.Tu1yWC3RNrTyjSQ8p1W0.aaUXUJ.Ne', '0', '1', '127.0.0.1', '2026-05-14 12:36:13', 103, 1, '2026-05-14 12:36:13', 1, '2026-05-18 11:53:32', NULL);
INSERT INTO `sys_user` (`user_id`, `tenant_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (4, '000000', 102, 'test1', '仅本人 密码666666', 'sys_user', '', '', '0', NULL, '$2a$10$b8yUzN0C71sbz.PhNOCgJe.Tu1yWC3RNrTyjSQ8p1W0.aaUXUJ.Ne', '0', '1', '127.0.0.1', '2026-05-14 12:36:13', 103, 1, '2026-05-14 12:36:13', 1, '2026-05-18 11:53:31', NULL);
INSERT INTO `sys_user` (`user_id`, `tenant_id`, `dept_id`, `user_name`, `nick_name`, `user_type`, `email`, `phonenumber`, `sex`, `avatar`, `password`, `status`, `del_flag`, `login_ip`, `login_date`, `create_dept`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES (2087824643612299266, '000000', 100, 'admin2', 'admin2', 'sys_user', '', '', '0', NULL, '$2a$10$bDV/7.SDdoYMEmhDH2pjVOdMDfP2YwNbVmyIkt8EnioisE8enESbi', '0', '0', '116.169.6.161', '2026-08-13 16:53:00', 103, 1, '2026-08-13 16:52:40', -1, '2026-08-13 16:53:00', '');
COMMIT;

-- ----------------------------
-- Table structure for sys_user_post
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_post`;
CREATE TABLE `sys_user_post` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `post_id` bigint NOT NULL COMMENT '岗位ID',
  PRIMARY KEY (`user_id`,`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户与岗位关联表';

-- ----------------------------
-- Records of sys_user_post
-- ----------------------------
BEGIN;
INSERT INTO `sys_user_post` (`user_id`, `post_id`) VALUES (1, 1);
COMMIT;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `role_id` bigint NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户和角色关联表';

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (1, 1);
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (2056215997779570690, 3);
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (2087024190159917057, 2087004669764300802);
INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES (2087824643612299266, 3);
COMMIT;

-- ----------------------------
-- Table structure for test_demo
-- ----------------------------
DROP TABLE IF EXISTS `test_demo`;
CREATE TABLE `test_demo` (
  `id` bigint NOT NULL COMMENT '主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `dept_id` bigint DEFAULT NULL COMMENT '部门id',
  `user_id` bigint DEFAULT NULL COMMENT '用户id',
  `order_num` int DEFAULT '0' COMMENT '排序号',
  `test_key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'key键',
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '值',
  `version` int DEFAULT '0' COMMENT '版本',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='测试单表';

-- ----------------------------
-- Records of test_demo
-- ----------------------------
BEGIN;
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (1, '000000', 102, 4, 1, '测试数据权限', '测试', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (2, '000000', 102, 3, 2, '子节点1', '111', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (3, '000000', 102, 3, 3, '子节点2', '222', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (4, '000000', 108, 4, 4, '测试数据', 'demo', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (5, '000000', 108, 3, 13, '子节点11', '1111', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (6, '000000', 108, 3, 12, '子节点22', '2222', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (7, '000000', 108, 3, 11, '子节点33', '3333', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (8, '000000', 108, 3, 10, '子节点44', '4444', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (9, '000000', 108, 3, 9, '子节点55', '5555', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (10, '000000', 108, 3, 8, '子节点66', '6666', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (11, '000000', 108, 3, 7, '子节点77', '7777', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (12, '000000', 108, 3, 6, '子节点88', '8888', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_demo` (`id`, `tenant_id`, `dept_id`, `user_id`, `order_num`, `test_key`, `value`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (13, '000000', 108, 3, 5, '子节点99', '9999', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
COMMIT;

-- ----------------------------
-- Table structure for test_tree
-- ----------------------------
DROP TABLE IF EXISTS `test_tree`;
CREATE TABLE `test_tree` (
  `id` bigint NOT NULL COMMENT '主键',
  `tenant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '000000' COMMENT '租户编号',
  `parent_id` bigint DEFAULT '0' COMMENT '父id',
  `dept_id` bigint DEFAULT NULL COMMENT '部门id',
  `user_id` bigint DEFAULT NULL COMMENT '用户id',
  `tree_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '值',
  `version` int DEFAULT '0' COMMENT '版本',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='测试树表';

-- ----------------------------
-- Records of test_tree
-- ----------------------------
BEGIN;
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (1, '000000', 0, 102, 4, '测试数据权限', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (2, '000000', 1, 102, 3, '子节点1', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (3, '000000', 2, 102, 3, '子节点2', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (4, '000000', 0, 108, 4, '测试树1', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (5, '000000', 4, 108, 3, '子节点11', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (6, '000000', 4, 108, 3, '子节点22', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (7, '000000', 4, 108, 3, '子节点33', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (8, '000000', 5, 108, 3, '子节点44', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (9, '000000', 6, 108, 3, '子节点55', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (10, '000000', 7, 108, 3, '子节点66', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (11, '000000', 7, 108, 3, '子节点77', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (12, '000000', 10, 108, 3, '子节点88', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
INSERT INTO `test_tree` (`id`, `tenant_id`, `parent_id`, `dept_id`, `user_id`, `tree_name`, `version`, `create_dept`, `create_time`, `create_by`, `update_time`, `update_by`, `del_flag`) VALUES (13, '000000', 10, 108, 3, '子节点99', 0, 103, '2026-05-14 12:36:14', 1, NULL, NULL, 0);
COMMIT;

-- ----------------------------
-- Table structure for url_blacklist
-- ----------------------------
DROP TABLE IF EXISTS `url_blacklist`;
CREATE TABLE `url_blacklist` (
  `id` bigint NOT NULL COMMENT 'ID',
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '匹配值',
  `status` tinyint DEFAULT NULL COMMENT '是否生效',
  `stop_time` datetime DEFAULT NULL COMMENT '拦截到期时间',
  `create_dept` bigint DEFAULT NULL COMMENT '创建部门',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `del_flag` int DEFAULT '0' COMMENT '删除标志',
  `tenant_id` int DEFAULT NULL COMMENT '租户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='域名黑名单';

-- ----------------------------
-- Records of url_blacklist
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
