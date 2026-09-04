<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="ping-query-form">
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="IP" prop="ip">
              <el-input v-model="queryParams.ip" placeholder="请输入 IP" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="权重" prop="weight">
              <el-input-number v-model="queryParams.weight" :min="0" controls-position="right" placeholder="请输入权重" />
            </el-form-item>
            <el-form-item label="UUID" prop="uuid">
              <el-input v-model="queryParams.uuid" placeholder="请输入 UUID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
              <el-select v-model="queryParams.state" placeholder="请选择状态" clearable>
                <el-option label="开启" value="on" />
                <el-option label="关闭" value="off" />
              </el-select>
            </el-form-item>
            <el-form-item label="运行状态" prop="rqState">
              <el-select v-model="queryParams.rqState" placeholder="请选择运行状态" clearable>
                <el-option label="开启" value="on" />
                <el-option label="关闭" value="off" />
              </el-select>
            </el-form-item>
            <el-form-item label="省份" prop="province">
              <el-select v-model="queryParams.province" placeholder="请选择省份" clearable>
                <el-option v-for="dict in node_province" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="区域" prop="region">
              <el-select v-model="queryParams.region" placeholder="请选择区域" clearable>
                <el-option v-for="dict in node_region" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="运营商" prop="operators">
              <el-select v-model="queryParams.operators" placeholder="请选择运营商" clearable>
                <el-option v-for="dict in node_operators" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ping:nodeConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['ping:nodeConfig:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['ping:nodeConfig:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['ping:nodeConfig:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Upload" @click="openIpDatabaseDialog" v-hasPermi="['ping:nodeConfig:edit']">IP 库</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Setting" @click="openAgentDeployConfig" v-hasPermi="['ping:nodeConfig:edit']">
              Agent 部署配置
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="nodeConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="名称" prop="name" min-width="140" show-overflow-tooltip />
        <el-table-column label="权重" prop="weight" align="center" width="90" />
        <el-table-column label="IP" prop="ip" min-width="130" show-overflow-tooltip />
        <el-table-column label="UUID" prop="uuid" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" prop="state" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.state === 'on' ? 'success' : 'info'">{{ scope.row.state === 'on' ? '开启' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="运行状态" prop="rqState" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.rqState === 'on' ? 'success' : 'danger'">{{ scope.row.rqState === 'on' ? '开启' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地区" min-width="170" show-overflow-tooltip>
          <template #default="scope">
            {{ [scope.row.country, scope.row.province, scope.row.city].filter(Boolean).join(' / ') }}
          </template>
        </el-table-column>
        <el-table-column label="省份" prop="province" align="center" width="110">
          <template #default="scope">
            <dict-tag :options="node_province" :value="scope.row.province" />
          </template>
        </el-table-column>
        <el-table-column label="区域" prop="region" align="center" width="110">
          <template #default="scope">
            <dict-tag :options="node_region" :value="scope.row.region" />
          </template>
        </el-table-column>
        <el-table-column label="运营商" prop="operators" align="center" width="110">
          <template #default="scope">
            <dict-tag :options="node_operators" :value="scope.row.operators" />
          </template>
        </el-table-column>
        <el-table-column label="赞助商" prop="sponsorText" min-width="120" show-overflow-tooltip />
        <el-table-column label="队列" prop="queue" min-width="140" show-overflow-tooltip />
        <el-table-column label="能力" align="center" width="170">
          <template #default="scope">
            <el-tag v-if="scope.row.homeState" class="mr-1" size="small">家宽</el-tag>
            <el-tag v-if="scope.row.traceroute" class="mr-1" size="small" type="warning">路由</el-tag>
            <el-tag v-if="scope.row.ipv6" size="small" type="success">IPv6</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="部署命令" placement="top">
              <el-button link type="primary" icon="Monitor" @click="openAgentDeployment(scope.row)" v-hasPermi="['ping:nodeConfig:query']" />
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ping:nodeConfig:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ping:nodeConfig:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="960px" top="5vh" append-to-body class="ping-dialog">
      <div class="ping-dialog-body">
        <el-form ref="nodeConfigFormRef" :model="form" :rules="rules" label-width="110px" class="ping-form">
          <div class="ping-section">
            <div class="ping-section-title">基础信息</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="IP" prop="ip">
                  <el-input v-model="form.ip" placeholder="请输入 IP" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="权重" prop="weight">
                  <el-input-number v-model="form.weight" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="UUID" prop="uuid">
                  <el-input v-model="form.uuid" placeholder="自动生成节点 UUID">
                    <template #append>
                      <el-button icon="Refresh" @click="regenerateNodeRuntimeFields">重新生成</el-button>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="国家" prop="country">
                  <el-input v-model="form.country" placeholder="请输入国家" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="省份" prop="province">
                  <el-select v-model="form.province" placeholder="请选择省份">
                    <el-option v-for="dict in node_province" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="城市" prop="city">
                  <el-input v-model="form.city" placeholder="请输入城市" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="区域" prop="region">
                  <el-select v-model="form.region" placeholder="请选择区域">
                    <el-option v-for="dict in node_region" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="运营商" prop="operators">
                  <el-select v-model="form.operators" placeholder="请选择运营商">
                    <el-option v-for="dict in node_operators" :key="dict.value" :label="dict.label" :value="dict.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-section">
            <div class="ping-section-title">运行配置</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="状态" prop="state">
                  <el-radio-group v-model="form.state">
                    <el-radio value="on">开启</el-radio>
                    <el-radio value="off">关闭</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="运行状态" prop="rqState">
                  <el-radio-group v-model="form.rqState">
                    <el-radio value="on">开启</el-radio>
                    <el-radio value="off">关闭</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="交换机" prop="exchange">
                  <el-input v-model="form.exchange" placeholder="默认 okping_node" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="队列" prop="queue">
                  <el-input v-model="form.queue" placeholder="自动生成 RabbitMQ 队列" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="绑定数据" prop="binding">
                  <el-input v-model="form.binding" placeholder="自动生成 RabbitMQ 绑定数据" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="家宽" prop="homeState">
                  <el-switch v-model="form.homeState" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="路由追踪" prop="traceroute">
                  <el-switch v-model="form.traceroute" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="8">
                <el-form-item label="IPv6" prop="ipv6">
                  <el-switch v-model="form.ipv6" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-section">
            <div class="ping-section-title">扩展信息</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="创建时间" prop="createTime">
                  <el-input-number v-model="form.createTime" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="过期时间" prop="endTime">
                  <el-input-number v-model="form.endTime" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="在线时刻" prop="online">
                  <el-input-number v-model="form.online" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="海外" prop="overseas">
                  <el-radio-group v-model="form.overseas">
                    <el-radio value="true">开</el-radio>
                    <el-radio value="false">关</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="坐标" prop="coordinate">
                  <el-input v-model="form.coordinate" placeholder="请输入坐标 JSON，例如 [104.06,30.67]" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="赞助商文字" prop="sponsorText">
                  <el-input v-model="form.sponsorText" maxlength="64" placeholder="请输入赞助商文字，前台最多显示10个字" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="赞助商链接" prop="sponsorUrl">
                  <el-input v-model="form.sponsorUrl" maxlength="512" placeholder="请输入赞助商 URL" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="备注信息2" prop="content2">
                  <el-input v-model="form.content2" placeholder="请输入备注信息2" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="备注信息3" prop="content3">
                  <el-input v-model="form.content3" placeholder="请输入备注信息3" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注信息" prop="content">
                  <el-input v-model="form.content" type="textarea" :autosize="{ minRows: 5, maxRows: 10 }" placeholder="请输入备注信息" />
                </el-form-item>
              </el-col>
            </el-row>
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

    <el-dialog v-model="agentDeployConfigDialogVisible" title="Agent 全局部署配置" width="960px" top="4vh" append-to-body>
      <div v-loading="agentDeployConfigLoading" class="ping-dialog-body">
        <el-form ref="agentDeployConfigFormRef" :model="agentDeployConfigForm" :rules="agentDeployConfigRules" label-width="130px" class="ping-form">
          <div class="ping-section">
            <div class="ping-section-title">镜像与主控</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="x86_64 镜像" prop="amd64ImageOssId">
                  <div class="agent-image-upload">
                    <el-upload :show-file-list="false" accept=".gz,.tgz" :http-request="(options) => uploadAgentArchive('amd64', options)">
                      <el-button :loading="agentImageUploading.amd64" icon="Upload">上传 amd64 镜像</el-button>
                    </el-upload>
                    <el-link v-if="agentDeployConfigForm.amd64ImageUrl" :href="agentDeployConfigForm.amd64ImageUrl" target="_blank" type="primary">
                      {{ agentDeployConfigForm.amd64ImageFileName || '已上传镜像' }}
                    </el-link>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="ARM64 镜像" prop="arm64ImageOssId">
                  <div class="agent-image-upload">
                    <el-upload :show-file-list="false" accept=".gz,.tgz" :http-request="(options) => uploadAgentArchive('arm64', options)">
                      <el-button :loading="agentImageUploading.arm64" icon="Upload">上传 arm64 镜像</el-button>
                    </el-upload>
                    <el-link v-if="agentDeployConfigForm.arm64ImageUrl" :href="agentDeployConfigForm.arm64ImageUrl" target="_blank" type="primary">
                      {{ agentDeployConfigForm.arm64ImageFileName || '已上传镜像' }}
                    </el-link>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="运行镜像名" prop="imageName">
                  <el-input v-model="agentDeployConfigForm.imageName" placeholder="ping-agent:latest" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="主控地址" prop="masterUrl">
                  <el-input v-model="agentDeployConfigForm.masterUrl" placeholder="https://controller.example.com" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-section">
            <div class="ping-section-title">Ubuntu 命令模板</div>
            <el-alert
              class="mb-4"
              title="首次部署将节点 UUID 写入宿主机文件；更新模板必须复用 {{uuidFilePath}}，不再包含节点 UUID。"
              type="info"
              :closable="false"
              show-icon
            />
            <el-form-item label="Docker 安装" prop="dockerInstallTemplate">
              <el-input v-model="agentDeployConfigForm.dockerInstallTemplate" type="textarea" :autosize="{ minRows: 7, maxRows: 14 }" />
            </el-form-item>
            <el-form-item label="首次部署" prop="firstDeployTemplate">
              <el-input v-model="agentDeployConfigForm.firstDeployTemplate" type="textarea" :autosize="{ minRows: 9, maxRows: 16 }" />
            </el-form-item>
            <el-form-item label="更新 Agent" prop="updateTemplate">
              <el-input v-model="agentDeployConfigForm.updateTemplate" type="textarea" :autosize="{ minRows: 9, maxRows: 16 }" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="agentDeployConfigForm.remark" maxlength="512" type="textarea" :rows="2" />
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="agentDeployConfigDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="agentDeployConfigSaving" @click="saveAgentDeployConfig">保存并全局生效</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="agentDeploymentDialogVisible"
      :title="agentDeployment ? `${agentDeployment.nodeName} Agent 部署` : 'Agent 部署命令'"
      width="980px"
      top="4vh"
      append-to-body
    >
      <div v-loading="agentDeploymentLoading" class="agent-deployment-dialog">
        <template v-if="agentDeployment">
          <div class="agent-deployment-summary">
            <span>节点 ID：{{ agentDeployment.nodeId }}</span>
            <span>主控：{{ agentDeployment.masterUrl }}</span>
            <span>镜像：{{ agentDeployment.imageName }}</span>
            <span>UUID 文件：{{ agentDeployment.uuidFilePath }}</span>
          </div>
          <el-segmented v-model="selectedAgentArchitecture" :options="agentArchitectureOptions" class="agent-architecture-switch" />
          <el-alert
            v-if="!selectedArchitectureCommand?.available"
            title="当前架构尚未上传离线镜像，请先完成 Agent 全局部署配置"
            type="warning"
            :closable="false"
            show-icon
          />
          <div v-else class="agent-command-list">
            <div class="agent-image-meta">
              <el-tag type="success">{{ selectedArchitectureCommand.label }}</el-tag>
              <span>{{ selectedArchitectureCommand.imageFileName }}</span>
            </div>
            <CommandBlock title="首次安装（Ubuntu 未安装 Docker）" :command="selectedArchitectureCommand.firstInstallCommand" />
            <CommandBlock title="首次部署（写入 UUID 文件）" :command="selectedArchitectureCommand.firstDeployCommand" />
            <CommandBlock title="更新 Agent（复用 UUID 文件）" :command="selectedArchitectureCommand.updateCommand" />
          </div>
        </template>
      </div>
    </el-dialog>

    <el-dialog v-model="ipDatabaseDialogVisible" title="IP 地址库管理" width="680px" append-to-body>
      <el-table v-loading="ipDatabaseLoading" :data="ipDatabaseStatus" border>
        <el-table-column label="版本" prop="version" align="center" width="90">
          <template #default="scope">{{ scope.row.version.toUpperCase() }}</template>
        </el-table-column>
        <el-table-column label="当前来源" align="center" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.custom ? 'success' : 'info'">{{ scope.row.custom ? '自定义' : '内置' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件" prop="fileName" min-width="170" show-overflow-tooltip />
        <el-table-column label="大小" align="center" width="100">
          <template #default="scope">{{ formatFileSize(scope.row.fileSize) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" min-width="170">
          <template #default="scope">{{ formatDatabaseTime(scope.row.updatedAt) }}</template>
        </el-table-column>
      </el-table>

      <el-form class="mt-5" label-width="90px">
        <el-form-item label="地址版本">
          <el-segmented v-model="ipDatabaseVersion" :options="ipDatabaseVersionOptions" />
        </el-form-item>
        <el-form-item label="XDB 文件">
          <el-upload
            ref="ipDatabaseUploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xdb"
            :on-change="handleIpDatabaseFileChange"
            :on-remove="handleIpDatabaseFileRemove"
          >
            <el-button icon="DocumentAdd">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">上传文件会替换对应版本地址库，校验通过后立即生效。</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ipDatabaseDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="ipDatabaseUploading" :disabled="!ipDatabaseFile" @click="handleIpDatabaseUpload">上传并生效</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingNodeConfig" lang="ts">
import {
  addPingNodeConfig,
  delPingNodeConfig,
  getPingAgentDeployConfig,
  getPingAgentDeployment,
  getPingNodeConfig,
  getPingIpDatabaseStatus,
  listPingNodeConfig,
  updatePingAgentDeployConfig,
  updatePingNodeConfig,
  uploadPingAgentImage,
  uploadPingIpDatabase
} from '@/api/ping/nodeConfig';
import {
  PingAgentArchitectureCommandVO,
  PingAgentDeployConfigForm,
  PingAgentDeploymentVO,
  PingIpDatabaseStatusVO,
  PingNodeConfigForm,
  PingNodeConfigQuery,
  PingNodeConfigVO
} from '@/api/ping/nodeConfig/types';
import CommandBlock from '@/components/CommandBlock/index.vue';
import type { FormRules, UploadFile, UploadInstance, UploadRequestOptions } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { node_province, node_region, node_operators } = toRefs<any>(proxy?.useDict('node_province', 'node_region', 'node_operators'));

const nodeConfigList = ref<PingNodeConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const ipDatabaseDialogVisible = ref(false);
const ipDatabaseLoading = ref(false);
const ipDatabaseUploading = ref(false);
const ipDatabaseStatus = ref<PingIpDatabaseStatusVO[]>([]);
const ipDatabaseVersion = ref<'ipv4' | 'ipv6'>('ipv4');
const ipDatabaseFile = ref<File>();
const ipDatabaseUploadRef = ref<UploadInstance>();
const ipDatabaseVersionOptions = [
  { label: 'IPv4', value: 'ipv4' },
  { label: 'IPv6', value: 'ipv6' }
];
const agentDeployConfigDialogVisible = ref(false);
const agentDeployConfigLoading = ref(false);
const agentDeployConfigSaving = ref(false);
const agentDeploymentDialogVisible = ref(false);
const agentDeploymentLoading = ref(false);
const agentDeployment = ref<PingAgentDeploymentVO>();
const selectedAgentArchitecture = ref<'amd64' | 'arm64'>('amd64');
const agentArchitectureOptions = [
  { label: 'x86_64 / AMD64', value: 'amd64' },
  { label: 'ARM64 / AArch64', value: 'arm64' }
];
const agentImageUploading = reactive({
  amd64: false,
  arm64: false
});

const initAgentDeployConfigForm: PingAgentDeployConfigForm = {
  configKey: 'default',
  amd64ImageOssId: undefined,
  amd64ImageUrl: undefined,
  amd64ImageFileName: undefined,
  arm64ImageOssId: undefined,
  arm64ImageUrl: undefined,
  arm64ImageFileName: undefined,
  imageName: 'ping-agent:latest',
  masterUrl: '',
  dockerInstallTemplate: '',
  firstDeployTemplate: '',
  updateTemplate: '',
  remark: undefined
};
const agentDeployConfigForm = reactive<PingAgentDeployConfigForm>({ ...initAgentDeployConfigForm });
const agentDeployConfigRules: FormRules<PingAgentDeployConfigForm> = {
  amd64ImageOssId: [{ required: true, message: '请上传 x86_64 Agent 镜像', trigger: 'change' }],
  arm64ImageOssId: [{ required: true, message: '请上传 ARM64 Agent 镜像', trigger: 'change' }],
  imageName: [{ required: true, message: '运行镜像名不能为空', trigger: 'blur' }],
  masterUrl: [{ required: true, message: '主控地址不能为空', trigger: 'blur' }],
  dockerInstallTemplate: [{ required: true, message: 'Docker 安装命令模板不能为空', trigger: 'blur' }],
  firstDeployTemplate: [{ required: true, message: '首次部署命令模板不能为空', trigger: 'blur' }],
  updateTemplate: [{ required: true, message: '更新命令模板不能为空', trigger: 'blur' }]
};

const queryFormRef = ref<ElFormInstance>();
const nodeConfigFormRef = ref<ElFormInstance>();
const agentDeployConfigFormRef = ref<ElFormInstance>();

const selectedArchitectureCommand = computed<PingAgentArchitectureCommandVO | undefined>(() =>
  agentDeployment.value?.architectures.find((item) => item.architecture === selectedAgentArchitecture.value)
);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const NODE_EXCHANGE = 'okping_node';
const NODE_RUNTIME_PREFIX = 'okping_node';

const getNowSecond = () => Math.floor(Date.now() / 1000);

const generateUuid = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

const buildRuntimeResourceName = (uuid: string) => `${NODE_RUNTIME_PREFIX}_${uuid}`;

const buildNodeRuntimeFields = (): Pick<PingNodeConfigForm, 'uuid' | 'exchange' | 'queue' | 'binding'> => {
  const uuid = generateUuid();
  const resourceName = buildRuntimeResourceName(uuid);
  return {
    uuid,
    exchange: NODE_EXCHANGE,
    queue: resourceName,
    binding: resourceName
  };
};

const isBlank = (value?: string) => !value || value.trim().length === 0;

const initFormData: PingNodeConfigForm = {
  id: undefined,
  country: '中国',
  overseas: 'false',
  region: undefined,
  province: undefined,
  city: undefined,
  operators: undefined,
  name: undefined,
  ip: undefined,
  weight: 0,
  state: 'on',
  rqState: 'on',
  exchange: undefined,
  queue: undefined,
  binding: undefined,
  sponsorText: undefined,
  sponsorUrl: undefined,
  content: undefined,
  content2: undefined,
  content3: undefined,
  createTime: undefined,
  endTime: undefined,
  online: undefined,
  uuid: undefined,
  homeState: false,
  traceroute: false,
  ipv6: false,
  coordinate: undefined
};

const data = reactive<PageData<PingNodeConfigForm, PingNodeConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    country: undefined,
    overseas: undefined,
    region: undefined,
    province: undefined,
    city: undefined,
    operators: undefined,
    name: undefined,
    ip: undefined,
    weight: undefined,
    state: undefined,
    rqState: undefined,
    exchange: undefined,
    queue: undefined,
    binding: undefined,
    sponsorText: undefined,
    sponsorUrl: undefined,
    uuid: undefined,
    homeState: undefined,
    traceroute: undefined,
    ipv6: undefined,
    params: {}
  },
  rules: {
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    ip: [{ required: true, message: 'IP不能为空', trigger: 'blur' }],
    weight: [{ required: true, message: '权重不能为空', trigger: 'blur' }],
    country: [{ required: true, message: '国家不能为空', trigger: 'blur' }],
    province: [{ required: true, message: '省份不能为空', trigger: 'change' }],
    region: [{ required: true, message: '区域不能为空', trigger: 'change' }],
    city: [{ required: true, message: '城市不能为空', trigger: 'blur' }],
    operators: [{ required: true, message: '运营商不能为空', trigger: 'change' }],
    state: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    rqState: [{ required: true, message: '运行状态不能为空', trigger: 'change' }],
    overseas: [{ required: true, message: '海外状态不能为空', trigger: 'change' }],
    uuid: [{ required: true, message: 'UUID不能为空', trigger: 'blur' }],
    exchange: [{ required: true, message: '交换机不能为空', trigger: 'blur' }],
    queue: [{ required: true, message: '队列不能为空', trigger: 'blur' }],
    binding: [{ required: true, message: '绑定数据不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listPingNodeConfig(queryParams.value);
  nodeConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  nodeConfigFormRef.value?.resetFields();
};

const regenerateNodeRuntimeFields = () => {
  Object.assign(form.value, buildNodeRuntimeFields());
  nodeConfigFormRef.value?.clearValidate(['uuid', 'exchange', 'queue', 'binding']);
};

const ensureNodeRuntimeFields = () => {
  if (isBlank(form.value.uuid)) {
    form.value.uuid = generateUuid();
  }
  const resourceName = buildRuntimeResourceName(form.value.uuid as string);
  if (isBlank(form.value.exchange)) {
    form.value.exchange = NODE_EXCHANGE;
  }
  if (isBlank(form.value.queue)) {
    form.value.queue = resourceName;
  }
  if (isBlank(form.value.binding)) {
    form.value.binding = resourceName;
  }
  if (isBlank(form.value.overseas)) {
    form.value.overseas = 'false';
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: PingNodeConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  form.value = {
    ...initFormData,
    ...buildNodeRuntimeFields(),
    overseas: 'false',
    createTime: getNowSecond(),
    online: getNowSecond()
  };
  dialog.visible = true;
  dialog.title = '添加 ping 1.0 节点';
};

const handleUpdate = async (row?: PingNodeConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getPingNodeConfig(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改 ping 1.0 节点';
};

const submitForm = () => {
  ensureNodeRuntimeFields();
  nodeConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    if (form.value.id) {
      await updatePingNodeConfig(form.value).finally(() => (buttonLoading.value = false));
    } else {
      await addPingNodeConfig(form.value).finally(() => (buttonLoading.value = false));
    }
    proxy?.$modal.msgSuccess('操作成功');
    dialog.visible = false;
    await getList();
  });
};

const handleDelete = async (row?: PingNodeConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除 ping 1.0 节点编号为"${_ids}"的数据项？`).finally(() => (loading.value = false));
  await delPingNodeConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'ping/node-config/export',
    {
      ...queryParams.value
    },
    `okping_node_config_${new Date().getTime()}.xlsx`
  );
};

const openAgentDeployConfig = async () => {
  agentDeployConfigDialogVisible.value = true;
  agentDeployConfigLoading.value = true;
  Object.assign(agentDeployConfigForm, initAgentDeployConfigForm);
  try {
    const res = await getPingAgentDeployConfig();
    Object.assign(agentDeployConfigForm, res.data);
    await nextTick();
    agentDeployConfigFormRef.value?.clearValidate();
  } finally {
    agentDeployConfigLoading.value = false;
  }
};

const uploadAgentArchive = async (architecture: 'amd64' | 'arm64', options: UploadRequestOptions) => {
  const fileName = options.file.name.toLowerCase();
  if (!fileName.endsWith('.tar.gz') && !fileName.endsWith('.tgz')) {
    proxy?.$modal.msgError('请选择 .tar.gz 或 .tgz 格式的 Agent 离线镜像');
    return;
  }
  if (options.file.size >= 128 * 1024 * 1024) {
    proxy?.$modal.msgError('Agent 离线镜像不能超过 128MB');
    return;
  }

  agentImageUploading[architecture] = true;
  try {
    const res = await uploadPingAgentImage(options.file);
    if (architecture === 'amd64') {
      agentDeployConfigForm.amd64ImageOssId = res.data.ossId;
      agentDeployConfigForm.amd64ImageUrl = res.data.url;
      agentDeployConfigForm.amd64ImageFileName = res.data.fileName;
      agentDeployConfigFormRef.value?.clearValidate('amd64ImageOssId');
    } else {
      agentDeployConfigForm.arm64ImageOssId = res.data.ossId;
      agentDeployConfigForm.arm64ImageUrl = res.data.url;
      agentDeployConfigForm.arm64ImageFileName = res.data.fileName;
      agentDeployConfigFormRef.value?.clearValidate('arm64ImageOssId');
    }
    proxy?.$modal.msgSuccess(`${architecture === 'amd64' ? 'x86_64' : 'ARM64'} 镜像上传成功`);
  } finally {
    agentImageUploading[architecture] = false;
  }
};

const saveAgentDeployConfig = () => {
  agentDeployConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    agentDeployConfigSaving.value = true;
    try {
      await updatePingAgentDeployConfig(agentDeployConfigForm);
      proxy?.$modal.msgSuccess('Agent 部署配置已全局生效');
      agentDeployConfigDialogVisible.value = false;
    } finally {
      agentDeployConfigSaving.value = false;
    }
  });
};

const openAgentDeployment = async (row: PingNodeConfigVO) => {
  agentDeploymentDialogVisible.value = true;
  agentDeploymentLoading.value = true;
  agentDeployment.value = undefined;
  selectedAgentArchitecture.value = 'amd64';
  try {
    const res = await getPingAgentDeployment(row.id);
    agentDeployment.value = res.data;
  } finally {
    agentDeploymentLoading.value = false;
  }
};

const loadIpDatabaseStatus = async () => {
  ipDatabaseLoading.value = true;
  try {
    const res = await getPingIpDatabaseStatus();
    ipDatabaseStatus.value = res.data ?? [];
  } finally {
    ipDatabaseLoading.value = false;
  }
};

const openIpDatabaseDialog = () => {
  ipDatabaseDialogVisible.value = true;
  ipDatabaseFile.value = undefined;
  ipDatabaseUploadRef.value?.clearFiles();
  loadIpDatabaseStatus();
};

const handleIpDatabaseFileChange = (file: UploadFile) => {
  if (!file.raw) {
    return;
  }
  if (!file.name.toLowerCase().endsWith('.xdb')) {
    proxy?.$modal.msgError('请选择 .xdb 格式的 IP 地址库');
    ipDatabaseUploadRef.value?.clearFiles();
    ipDatabaseFile.value = undefined;
    return;
  }
  ipDatabaseFile.value = file.raw;
};

const handleIpDatabaseFileRemove = () => {
  ipDatabaseFile.value = undefined;
};

const handleIpDatabaseUpload = async () => {
  if (!ipDatabaseFile.value) {
    proxy?.$modal.msgError('请选择要上传的 XDB 文件');
    return;
  }
  ipDatabaseUploading.value = true;
  try {
    await uploadPingIpDatabase(ipDatabaseVersion.value, ipDatabaseFile.value);
    proxy?.$modal.msgSuccess('IP 地址库已更新并生效');
    ipDatabaseFile.value = undefined;
    ipDatabaseUploadRef.value?.clearFiles();
    await loadIpDatabaseStatus();
  } finally {
    ipDatabaseUploading.value = false;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) {
    return '--';
  }
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

const formatDatabaseTime = (value?: string) => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false });
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.ping-query-form {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number) {
    width: 180px;
  }
}

.ping-dialog-body {
  max-height: 68vh;
  overflow-y: auto;
  padding-right: 8px;
}

.ping-section {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ping-section-title {
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

.ping-form {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-textarea),
  :deep(.el-input-number) {
    width: 100%;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

:deep(.ping-dialog .el-dialog) {
  max-width: calc(100vw - 24px);
}

.agent-image-upload {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;

  .el-link {
    min-width: 0;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.agent-deployment-dialog {
  min-height: 260px;
}

.agent-deployment-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-bottom: 16px;
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.agent-architecture-switch {
  margin-bottom: 18px;
}

.agent-command-list {
  display: grid;
  gap: 14px;
}

.agent-image-meta {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  span:last-child {
    overflow-wrap: anywhere;
  }
}
</style>
