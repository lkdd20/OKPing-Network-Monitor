<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="ping-layout-query-form">
            <el-form-item label="配置标识" prop="configKey">
              <el-input v-model="queryParams.configKey" placeholder="请输入配置标识" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="queryParams.siteName" placeholder="请输入站点名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                <el-option label="开启" value="on" />
                <el-option label="关闭" value="off" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ping:layoutConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['ping:layoutConfig:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['ping:layoutConfig:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['ping:layoutConfig:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-alert
        class="mb-3"
        type="info"
        :closable="false"
        show-icon
        title="公开接口 /ping/layout-config/public/default 会读取当前配置，Redis 缓存 5 分钟。Logo 建议使用 /logo_t.png 与 /logo.png，也可以配置完整 URL。"
      />

      <el-table v-loading="loading" border :data="layoutConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="配置标识" prop="configKey" align="center" width="120" />
        <el-table-column label="站点名称" prop="siteName" min-width="130" show-overflow-tooltip />
        <el-table-column label="Header Logo" prop="logoUrl" min-width="160" show-overflow-tooltip />
        <el-table-column label="Footer Logo" prop="footerLogoUrl" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'on' ? 'success' : 'info'">{{ scope.row.status === 'on' ? '开启' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" align="center" width="170" />
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ping:layoutConfig:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ping:layoutConfig:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1200px" top="4vh" append-to-body class="ping-layout-dialog">
      <div class="ping-layout-dialog-body">
        <el-form ref="layoutConfigFormRef" :model="form" :rules="rules" label-width="120px" class="ping-layout-form">
          <div class="ping-layout-section">
            <div class="ping-layout-section-title">基础配置</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="8">
                <el-form-item label="配置标识" prop="configKey">
                  <el-input v-model="form.configKey" placeholder="default" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="站点名称" prop="siteName">
                  <el-input v-model="form.siteName" placeholder="" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status">
                    <el-radio value="on">开启</el-radio>
                    <el-radio value="off">关闭</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="Header Logo" prop="logoUrl">
                  <el-input v-model="form.logoUrl" placeholder="/logo_t.png" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="Footer Logo" prop="footerLogoUrl">
                  <el-input v-model="form.footerLogoUrl" placeholder="/logo.png" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="Footer 标语" prop="footerSlogan">
                  <el-input v-model="form.footerSlogan" placeholder="请输入 Footer 标语" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">底部备案与服务</div>
            <el-row :gutter="18">
              <el-col :span="24">
                <el-form-item label="版权" prop="copyright">
                  <el-input v-model="form.copyright" placeholder="请输入版权文案" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="备案文案" prop="icpText">
                  <el-input v-model="form.icpText" placeholder="蜀ICP备..." />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="备案链接" prop="icpUrl">
                  <el-input v-model="form.icpUrl" placeholder="https://beian.miit.gov.cn/" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="服务文案" prop="serviceText">
                  <el-input v-model="form.serviceText" placeholder="本站服务器托管由" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="服务链接文案" prop="serviceLinkText">
                  <el-input v-model="form.serviceLinkText" placeholder="" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="服务链接" prop="serviceLinkUrl">
                  <el-input v-model="form.serviceLinkUrl" placeholder="https://..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">导航配置</div>
            <el-alert
              class="mb-3"
              type="info"
              :closable="false"
              title="导航配置会在保存时自动转换为 navItemsJson 传递到后端；子导航可展开对应行后配置。"
            />
            <div class="ping-table-toolbar">
              <el-button type="primary" plain icon="Plus" @click="addNavItem">添加导航</el-button>
            </div>
            <el-table :data="navItems" border row-key="_key" empty-text="暂无导航">
              <el-table-column type="expand" width="48">
                <template #default="scope">
                  <div class="ping-subtable">
                    <div class="ping-subtable-header">
                      <span>子导航</span>
                      <el-button size="small" type="primary" plain icon="Plus" @click="addNavChild(scope.row)">添加子导航</el-button>
                    </div>
                    <el-table :data="scope.row.children" border row-key="_key" empty-text="暂无子导航">
                      <el-table-column label="名称" min-width="180">
                        <template #default="childScope">
                          <el-input v-model="childScope.row.text" placeholder="例如：批量Ping" />
                        </template>
                      </el-table-column>
                      <el-table-column label="地址" min-width="220">
                        <template #default="childScope">
                          <el-input v-model="childScope.row.url" placeholder="/batch_ping" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="160" align="center">
                        <template #default="childScope">
                          <el-button
                            link
                            type="primary"
                            icon="Top"
                            :disabled="childScope.$index === 0"
                            @click="moveNavChild(scope.row, childScope.$index, -1)"
                          />
                          <el-button
                            link
                            type="primary"
                            icon="Bottom"
                            :disabled="childScope.$index === scope.row.children.length - 1"
                            @click="moveNavChild(scope.row, childScope.$index, 1)"
                          />
                          <el-button link type="danger" icon="Delete" @click="removeNavChild(scope.row, childScope.$index)" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="名称" min-width="180">
                <template #default="scope">
                  <el-input v-model="scope.row.text" placeholder="例如：首页" />
                </template>
              </el-table-column>
              <el-table-column label="地址" min-width="220">
                <template #default="scope">
                  <el-input v-model="scope.row.url" placeholder="/" />
                </template>
              </el-table-column>
              <el-table-column label="子导航" width="90" align="center">
                <template #default="scope">
                  <el-tag>{{ scope.row.children.length }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="190" align="center">
                <template #default="scope">
                  <el-button link type="primary" icon="Top" :disabled="scope.$index === 0" @click="moveNavItem(scope.$index, -1)" />
                  <el-button
                    link
                    type="primary"
                    icon="Bottom"
                    :disabled="scope.$index === navItems.length - 1"
                    @click="moveNavItem(scope.$index, 1)"
                  />
                  <el-button link type="danger" icon="Delete" @click="removeNavItem(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">首页功能卡片</div>
            <el-alert class="mb-3" type="info" :closable="false" title="首页按照表格顺序展示已启用卡片；分类决定卡片显示在哪个筛选标签下。" />
            <div class="ping-table-toolbar">
              <el-button type="primary" plain icon="Plus" @click="addHomeTool">添加功能卡片</el-button>
            </div>
            <el-table :data="homeTools" border row-key="_key" empty-text="暂无首页功能卡片">
              <el-table-column label="显示" width="78" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="图标" width="145">
                <template #default="scope">
                  <el-select v-model="scope.row.icon" placeholder="选择图标">
                    <el-option v-for="item in homeToolIconOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="分类" width="145">
                <template #default="scope">
                  <el-select v-model="scope.row.category" placeholder="选择分类">
                    <el-option v-for="item in homeToolCategoryOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="颜色" width="88" align="center">
                <template #default="scope">
                  <el-color-picker v-model="scope.row.color" :predefine="homeToolColors" />
                </template>
              </el-table-column>
              <el-table-column label="标题" min-width="150">
                <template #default="scope">
                  <el-input v-model="scope.row.title" maxlength="24" placeholder="在线 Ping" />
                </template>
              </el-table-column>
              <el-table-column label="描述" min-width="260">
                <template #default="scope">
                  <el-input v-model="scope.row.description" maxlength="80" placeholder="请输入功能描述" />
                </template>
              </el-table-column>
              <el-table-column label="跳转地址" min-width="190">
                <template #default="scope">
                  <el-input v-model="scope.row.url" placeholder="/ping" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="scope">
                  <el-button link type="primary" icon="Top" :disabled="scope.$index === 0" @click="moveHomeTool(scope.$index, -1)" />
                  <el-button
                    link
                    type="primary"
                    icon="Bottom"
                    :disabled="scope.$index === homeTools.length - 1"
                    @click="moveHomeTool(scope.$index, 1)"
                  />
                  <el-button link type="danger" icon="Delete" @click="removeHomeTool(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">顶部公告配置</div>
            <el-alert
              class="mb-3"
              type="info"
              :closable="false"
              title="公告会在用户端页面浏览器顶部显示，可配置多条；保存时自动转换为 announcementsJson 传递到后端。"
            />
            <div class="ping-table-toolbar">
              <el-button type="primary" plain icon="Plus" @click="addAnnouncement">添加公告</el-button>
            </div>
            <el-table :data="announcements" border row-key="_key" empty-text="暂无公告">
              <el-table-column label="等级" width="150">
                <template #default="scope">
                  <el-select v-model="scope.row.level" placeholder="请选择等级">
                    <el-option v-for="item in announcementLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="公告内容" min-width="320">
                <template #default="scope">
                  <el-input v-model="scope.row.content" maxlength="120" show-word-limit placeholder="请输入公告内容" />
                </template>
              </el-table-column>
              <el-table-column label="跳转地址" min-width="260">
                <template #default="scope">
                  <el-input v-model="scope.row.url" placeholder="/notice 或 https://..." />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template #default="scope">
                  <el-button link type="primary" icon="Top" :disabled="scope.$index === 0" @click="moveAnnouncement(scope.$index, -1)" />
                  <el-button
                    link
                    type="primary"
                    icon="Bottom"
                    :disabled="scope.$index === announcements.length - 1"
                    @click="moveAnnouncement(scope.$index, 1)"
                  />
                  <el-button link type="danger" icon="Delete" @click="removeAnnouncement(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">页脚栏目配置</div>
            <el-alert
              class="mb-3"
              type="info"
              :closable="false"
              title="页脚栏目配置会在保存时自动转换为 footerColumnsJson 传递到后端；友情链接来自 /web/links/lists，不在这里配置。"
            />
            <div class="ping-table-toolbar">
              <el-button type="primary" plain icon="Plus" @click="addFooterColumn">添加栏目</el-button>
            </div>
            <el-table :data="footerColumns" border row-key="_key" empty-text="暂无页脚栏目">
              <el-table-column type="expand" width="48">
                <template #default="scope">
                  <div class="ping-subtable">
                    <div class="ping-subtable-header">
                      <span>栏目链接</span>
                      <el-button size="small" type="primary" plain icon="Plus" @click="addFooterLink(scope.row)">添加链接</el-button>
                    </div>
                    <el-table :data="scope.row.links" border row-key="_key" empty-text="暂无链接">
                      <el-table-column label="标题" min-width="180">
                        <template #default="linkScope">
                          <el-input v-model="linkScope.row.title" placeholder="例如：公司介绍" />
                        </template>
                      </el-table-column>
                      <el-table-column label="地址" min-width="220">
                        <template #default="linkScope">
                          <el-input v-model="linkScope.row.url" placeholder="/about" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="160" align="center">
                        <template #default="linkScope">
                          <el-button
                            link
                            type="primary"
                            icon="Top"
                            :disabled="linkScope.$index === 0"
                            @click="moveFooterLink(scope.row, linkScope.$index, -1)"
                          />
                          <el-button
                            link
                            type="primary"
                            icon="Bottom"
                            :disabled="linkScope.$index === scope.row.links.length - 1"
                            @click="moveFooterLink(scope.row, linkScope.$index, 1)"
                          />
                          <el-button link type="danger" icon="Delete" @click="removeFooterLink(scope.row, linkScope.$index)" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="栏目标题" min-width="220">
                <template #default="scope">
                  <el-input v-model="scope.row.title" placeholder="例如：关于我们" />
                </template>
              </el-table-column>
              <el-table-column label="链接数" width="90" align="center">
                <template #default="scope">
                  <el-tag>{{ scope.row.links.length }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="190" align="center">
                <template #default="scope">
                  <el-button link type="primary" icon="Top" :disabled="scope.$index === 0" @click="moveFooterColumn(scope.$index, -1)" />
                  <el-button
                    link
                    type="primary"
                    icon="Bottom"
                    :disabled="scope.$index === footerColumns.length - 1"
                    @click="moveFooterColumn(scope.$index, 1)"
                  />
                  <el-button link type="danger" icon="Delete" @click="removeFooterColumn(scope.$index)" />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="ping-layout-section">
            <div class="ping-layout-section-title">备注</div>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" placeholder="请输入备注" />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingLayoutConfig" lang="ts">
import {
  addPingLayoutConfig,
  delPingLayoutConfig,
  getPingLayoutConfig,
  listPingLayoutConfig,
  updatePingLayoutConfig
} from '@/api/ping/layoutConfig';
import { PingLayoutConfigForm, PingLayoutConfigQuery, PingLayoutConfigVO } from '@/api/ping/layoutConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

type EditableNavItem = {
  _key: string;
  children: EditableNavItem[];
  text: string;
  url: string;
};

type EditableFooterLink = {
  _key: string;
  title: string;
  url: string;
};

type EditableFooterColumn = {
  _key: string;
  links: EditableFooterLink[];
  title: string;
};

type EditableAnnouncement = {
  _key: string;
  content: string;
  level: string;
  url: string;
};

type EditableHomeTool = {
  _key: string;
  category: string;
  color: string;
  description: string;
  enabled: boolean;
  icon: string;
  title: string;
  url: string;
};

const defaultNavJson =
  '[{"text":"首页","url":"/"},{"text":"在线Ping","url":"/ping"},{"text":"在线TCPing","url":"/tcping"},{"text":"网站测速","url":"/http"},{"text":"DNS查询","url":"/dns"},{"text":"路由追踪","url":"/traceroute"},{"text":"IP查询","url":"/ip"},{"text":"Whois查询","url":"/whois"},{"text":"批量查询","url":"/batch","children":[{"text":"批量Ping","url":"/batch_ping"},{"text":"批量TCPing","url":"/batch_tcping"}]},{"text":"IPv6工具","url":"/v6","children":[{"text":"在线Ping","url":"/ping_v6"},{"text":"在线TCPing","url":"/tcping_v6"},{"text":"网站测速","url":"/http_v6"},{"text":"路由追踪","url":"/traceroute_v6"}]}]';
const defaultFooterJson =
  '[{"title":"关于我们","links":[{"title":"公司介绍","url":"/about"},{"title":"联系我们","url":"/contact"},{"title":"发展历程","url":"/develop"},{"title":"赞助节点","url":"/joinus"},{"title":"公告通知","url":"/"}]},{"title":"拨测工具","links":[{"title":"在线Ping","url":"/ping"},{"title":"在线Tcping","url":"/tcping"},{"title":"网站测速","url":"/http"},{"title":"路由追踪","url":"/traceroute"},{"title":"DNS查询","url":"/dns"},{"title":"IP查询","url":"/ip"},{"title":"WHOIS查询","url":"/whois"}]},{"title":"产品与服务","links":[{"title":"网站监控","url":"/product"},{"title":"Api监控","url":"/applicationpi"},{"title":"SSL证书","url":"/ssl"},{"title":"广告服务","url":"/ad"},{"title":"产品定制","url":"/product_pricing"}]}]';
const defaultAnnouncementsJson = '[]';
const defaultHomeToolsJson = JSON.stringify([
  {
    category: 'ipv4',
    title: '在线 Ping',
    description: '使用 ICMP 检测目标可达性与网络延迟',
    url: '/ping',
    icon: 'activity',
    color: '#2563EB',
    enabled: true
  },
  {
    category: 'ipv4',
    title: '在线 TCPing',
    description: '检测目标主机指定 TCP 端口的连通性',
    url: '/tcping',
    icon: 'cable',
    color: '#0891B2',
    enabled: true
  },
  {
    category: 'ipv4',
    title: '网站测速',
    description: '分析 HTTP 状态、连接与响应耗时',
    url: '/http',
    icon: 'globe',
    color: '#059669',
    enabled: true
  },
  {
    category: 'ipv4',
    title: 'DNS 查询',
    description: '查看不同地区和线路的域名解析结果',
    url: '/dns',
    icon: 'network',
    color: '#7C3AED',
    enabled: true
  },
  {
    category: 'ipv4',
    title: '路由追踪',
    description: '以 MTR 视图定位网络路径和丢包节点',
    url: '/traceroute',
    icon: 'route',
    color: '#D97706',
    enabled: true
  },
  {
    category: 'ipv4',
    title: 'WHOIS 查询',
    description: '查询域名注册商、注册时间、到期时间与DNS服务器',
    url: '/whois',
    icon: 'search',
    color: '#475569',
    enabled: true
  },
  {
    category: 'batch',
    title: '批量 Ping',
    description: '同时检测多个域名、IP 范围或 CIDR',
    url: '/batch_ping',
    icon: 'rows',
    color: '#DC2626',
    enabled: true
  },
  {
    category: 'batch',
    title: '批量 TCPing',
    description: '批量检测多个目标的 TCP 端口',
    url: '/batch_tcping',
    icon: 'server',
    color: '#0F766E',
    enabled: true
  },
  {
    category: 'ipv6',
    title: 'IPv6 Ping',
    description: '使用 IPv6 节点检测目标可达性',
    url: '/ping_v6',
    icon: 'radar',
    color: '#0284C7',
    enabled: true
  },
  {
    category: 'ipv6',
    title: 'IPv6 TCPing',
    description: '检测 IPv6 目标端口连通性',
    url: '/tcping_v6',
    icon: 'cable',
    color: '#4F46E5',
    enabled: true
  },
  {
    category: 'ipv6',
    title: 'IPv6 网站测速',
    description: '通过 IPv6 网络分析网站响应性能',
    url: '/http_v6',
    icon: 'globe',
    color: '#16A34A',
    enabled: true
  },
  {
    category: 'ipv6',
    title: 'IPv6 路由追踪',
    description: '查看 IPv6 网络路径、时延与丢包',
    url: '/traceroute_v6',
    icon: 'route',
    color: '#BE123C',
    enabled: true
  }
]);
const announcementLevelOptions = [
  { label: '普通公告', value: 'info' },
  { label: '重要公告', value: 'warning' },
  { label: '紧急公告', value: 'danger' }
];
const homeToolIconOptions = [
  { label: '网络活动', value: 'activity' },
  { label: '端口连接', value: 'cable' },
  { label: '网站', value: 'globe' },
  { label: 'DNS 网络', value: 'network' },
  { label: '路由', value: 'route' },
  { label: '搜索', value: 'search' },
  { label: '批量列表', value: 'rows' },
  { label: '雷达', value: 'radar' },
  { label: '安全', value: 'shield' },
  { label: '服务器', value: 'server' },
  { label: '无线网络', value: 'wifi' }
];
const homeToolCategoryOptions = [
  { label: 'IPv4工具', value: 'ipv4' },
  { label: 'IPv6工具', value: 'ipv6' },
  { label: '批量检测工具', value: 'batch' }
];
const homeToolColors = ['#2563EB', '#0891B2', '#059669', '#7C3AED', '#D97706', '#DC2626', '#0F766E', '#0284C7', '#4F46E5', '#16A34A', '#BE123C'];

let rowKeySeed = 0;

const createRowKey = () => `ping-layout-${Date.now()}-${rowKeySeed++}`;

const normalizeString = (value: unknown) => (typeof value === 'string' ? value : '');

const inferHomeToolCategory = (url: string) => {
  if (/(^|\/)batch[_/-]/i.test(url)) return 'batch';
  if (/_v6(?:\/|$|\?)/i.test(url)) return 'ipv6';
  return 'ipv4';
};

const parseJsonArray = <T,>(text: string | undefined, fallbackText: string, normalizer: (item: any) => T): T[] => {
  const source = text?.trim() || fallbackText;
  try {
    const parsed = JSON.parse(source);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((item) => normalizer(item));
  } catch {
    return [];
  }
};

const toEditableNavItem = (item: any): EditableNavItem => ({
  _key: createRowKey(),
  children: Array.isArray(item?.children) ? item.children.map((child: any) => toEditableNavItem(child)) : [],
  text: normalizeString(item?.text),
  url: normalizeString(item?.url)
});

const toEditableFooterLink = (item: any): EditableFooterLink => ({
  _key: createRowKey(),
  title: normalizeString(item?.title),
  url: normalizeString(item?.url)
});

const toEditableFooterColumn = (item: any): EditableFooterColumn => ({
  _key: createRowKey(),
  links: Array.isArray(item?.links) ? item.links.map((link: any) => toEditableFooterLink(link)) : [],
  title: normalizeString(item?.title)
});

const toEditableAnnouncement = (item: any): EditableAnnouncement => ({
  _key: createRowKey(),
  content: normalizeString(item?.content),
  level: ['info', 'warning', 'danger'].includes(normalizeString(item?.level)) ? normalizeString(item?.level) : 'info',
  url: normalizeString(item?.url)
});

const toEditableHomeTool = (item: any): EditableHomeTool => ({
  _key: createRowKey(),
  category: homeToolCategoryOptions.some((option) => option.value === item?.category)
    ? item.category
    : inferHomeToolCategory(normalizeString(item?.url)),
  color: /^#[0-9a-fA-F]{6}$/.test(normalizeString(item?.color)) ? normalizeString(item?.color) : '#2563EB',
  description: normalizeString(item?.description),
  enabled: item?.enabled !== false,
  icon: homeToolIconOptions.some((option) => option.value === item?.icon) ? item.icon : 'activity',
  title: normalizeString(item?.title),
  url: normalizeString(item?.url)
});

const navItems = ref<EditableNavItem[]>(parseJsonArray(defaultNavJson, defaultNavJson, toEditableNavItem));
const footerColumns = ref<EditableFooterColumn[]>(parseJsonArray(defaultFooterJson, defaultFooterJson, toEditableFooterColumn));
const announcements = ref<EditableAnnouncement[]>(parseJsonArray(defaultAnnouncementsJson, defaultAnnouncementsJson, toEditableAnnouncement));
const homeTools = ref<EditableHomeTool[]>(parseJsonArray(defaultHomeToolsJson, defaultHomeToolsJson, toEditableHomeTool));

const layoutConfigList = ref<PingLayoutConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const layoutConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PingLayoutConfigForm = {
  id: undefined,
  configKey: 'default',
  siteName: '',
  logoUrl: '/logo_t.png',
  footerLogoUrl: '/logo.png',
  footerSlogan: '企业级开放型一站式监控解决方案',
  copyright: '',
  icpText: '',
  icpUrl: '',
  serviceText: '',
  serviceLinkText: '',
  serviceLinkUrl: '',
  navItemsJson: defaultNavJson,
  footerColumnsJson: defaultFooterJson,
  friendshipLinksJson: '[]',
  announcementsJson: defaultAnnouncementsJson,
  homeToolsJson: defaultHomeToolsJson,
  status: 'on',
  remark: undefined
};

const data = reactive<PageData<PingLayoutConfigForm, PingLayoutConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configKey: undefined,
    siteName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    configKey: [{ required: true, message: '配置标识不能为空', trigger: 'blur' }],
    siteName: [{ required: true, message: '站点名称不能为空', trigger: 'blur' }],
    logoUrl: [{ required: true, message: 'Header Logo不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listPingLayoutConfig(queryParams.value);
  layoutConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  syncTablesFromForm();
  layoutConfigFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: PingLayoutConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加 ping 1.0 站点布局配置';
};

const handleUpdate = async (row?: PingLayoutConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getPingLayoutConfig(_id);
  Object.assign(form.value, res.data);
  syncTablesFromForm();
  dialog.visible = true;
  dialog.title = '修改 ping 1.0 站点布局配置';
};

const syncTablesFromForm = () => {
  navItems.value = parseJsonArray(form.value.navItemsJson, defaultNavJson, toEditableNavItem);
  footerColumns.value = parseJsonArray(form.value.footerColumnsJson, defaultFooterJson, toEditableFooterColumn);
  announcements.value = parseJsonArray(form.value.announcementsJson, defaultAnnouncementsJson, toEditableAnnouncement);
  homeTools.value = parseJsonArray(form.value.homeToolsJson, defaultHomeToolsJson, toEditableHomeTool);
};

const swapRows = <T,>(rows: T[], index: number, offset: number) => {
  const targetIndex = index + offset;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return;
  }
  const target = rows[targetIndex];
  rows[targetIndex] = rows[index];
  rows[index] = target;
};

const addNavItem = () => {
  navItems.value.push({ _key: createRowKey(), children: [], text: '', url: '' });
};

const removeNavItem = (index: number) => {
  navItems.value.splice(index, 1);
};

const moveNavItem = (index: number, offset: number) => {
  swapRows(navItems.value, index, offset);
};

const addNavChild = (row: EditableNavItem) => {
  row.children.push({ _key: createRowKey(), children: [], text: '', url: '' });
};

const removeNavChild = (row: EditableNavItem, index: number) => {
  row.children.splice(index, 1);
};

const moveNavChild = (row: EditableNavItem, index: number, offset: number) => {
  swapRows(row.children, index, offset);
};

const addHomeTool = () => {
  homeTools.value.push({
    _key: createRowKey(),
    category: 'ipv4',
    color: '#2563EB',
    description: '',
    enabled: true,
    icon: 'activity',
    title: '',
    url: ''
  });
};

const removeHomeTool = (index: number) => {
  homeTools.value.splice(index, 1);
};

const moveHomeTool = (index: number, offset: number) => {
  swapRows(homeTools.value, index, offset);
};

const addFooterColumn = () => {
  footerColumns.value.push({ _key: createRowKey(), links: [], title: '' });
};

const removeFooterColumn = (index: number) => {
  footerColumns.value.splice(index, 1);
};

const moveFooterColumn = (index: number, offset: number) => {
  swapRows(footerColumns.value, index, offset);
};

const addFooterLink = (row: EditableFooterColumn) => {
  row.links.push({ _key: createRowKey(), title: '', url: '' });
};

const removeFooterLink = (row: EditableFooterColumn, index: number) => {
  row.links.splice(index, 1);
};

const moveFooterLink = (row: EditableFooterColumn, index: number, offset: number) => {
  swapRows(row.links, index, offset);
};

const addAnnouncement = () => {
  announcements.value.push({ _key: createRowKey(), content: '', level: 'info', url: '' });
};

const removeAnnouncement = (index: number) => {
  announcements.value.splice(index, 1);
};

const moveAnnouncement = (index: number, offset: number) => {
  swapRows(announcements.value, index, offset);
};

const validateTableFields = () => {
  const invalidNav = navItems.value.some(
    (item) => !item.text.trim() || !item.url.trim() || item.children.some((child) => !child.text.trim() || !child.url.trim())
  );
  if (invalidNav) {
    proxy?.$modal.msgError('导航名称和地址不能为空');
    return false;
  }

  const invalidHomeTool = homeTools.value.some(
    (item) =>
      !item.title.trim() || !item.description.trim() || !item.url.trim() || !item.category || !item.icon || !/^#[0-9a-fA-F]{6}$/.test(item.color)
  );
  if (invalidHomeTool) {
    proxy?.$modal.msgError('首页功能卡片标题、描述、地址、分类、图标和颜色不能为空');
    return false;
  }

  const invalidFooter = footerColumns.value.some(
    (column) => !column.title.trim() || column.links.some((link) => !link.title.trim() || !link.url.trim())
  );
  if (invalidFooter) {
    proxy?.$modal.msgError('页脚栏目标题、链接标题和链接地址不能为空');
    return false;
  }

  const invalidAnnouncement = announcements.value.some((item) => !item.level || !item.content.trim() || !item.url.trim());
  if (invalidAnnouncement) {
    proxy?.$modal.msgError('公告等级、公告内容和跳转地址不能为空');
    return false;
  }

  return true;
};

const syncFormJsonFromTables = () => {
  form.value.navItemsJson = JSON.stringify(
    navItems.value.map((item) => ({
      text: item.text.trim(),
      url: item.url.trim(),
      ...(item.children.length
        ? {
            children: item.children.map((child) => ({
              text: child.text.trim(),
              url: child.url.trim()
            }))
          }
        : {})
    }))
  );
  form.value.footerColumnsJson = JSON.stringify(
    footerColumns.value.map((column) => ({
      links: column.links.map((link) => ({
        title: link.title.trim(),
        url: link.url.trim()
      })),
      title: column.title.trim()
    }))
  );
  form.value.friendshipLinksJson = '[]';
  form.value.homeToolsJson = JSON.stringify(
    homeTools.value.map((item) => ({
      category: item.category,
      color: item.color,
      description: item.description.trim(),
      enabled: item.enabled,
      icon: item.icon,
      title: item.title.trim(),
      url: item.url.trim()
    }))
  );
  form.value.announcementsJson = JSON.stringify(
    announcements.value.map((item) => ({
      content: item.content.trim(),
      level: item.level,
      url: item.url.trim()
    }))
  );
};

const submitForm = () => {
  layoutConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid || !validateTableFields()) {
      return;
    }
    syncFormJsonFromTables();
    buttonLoading.value = true;
    if (form.value.id) {
      await updatePingLayoutConfig(form.value).finally(() => (buttonLoading.value = false));
    } else {
      await addPingLayoutConfig(form.value).finally(() => (buttonLoading.value = false));
    }
    proxy?.$modal.msgSuccess('操作成功，公开布局缓存已刷新');
    dialog.visible = false;
    await getList();
  });
};

const handleDelete = async (row?: PingLayoutConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除 ping 1.0 站点布局配置编号为"${_ids}"的数据项？`).finally(() => (loading.value = false));
  await delPingLayoutConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功，公开布局缓存已刷新');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'ping/layout-config/export',
    {
      ...queryParams.value
    },
    `ping_layout_config_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.ping-layout-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 180px;
  }
}

.ping-layout-dialog-body {
  max-height: 72vh;
  overflow-y: auto;
  padding-right: 8px;
}

.ping-layout-section {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ping-layout-section-title {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;

  &::before {
    width: 3px;
    height: 14px;
    margin-right: 8px;
    border-radius: 2px;
    background: var(--el-color-primary);
    content: '';
  }
}

.ping-layout-form {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-textarea) {
    width: 100%;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

:deep(.ping-layout-dialog .el-dialog) {
  max-width: calc(100vw - 24px);
}
</style>
