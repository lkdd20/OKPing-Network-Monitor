<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="ping-page-query-form">
            <el-form-item label="页面标识" prop="pageKey">
              <el-input v-model="queryParams.pageKey" placeholder="请输入页面标识" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="页面名称" prop="pageName">
              <el-input v-model="queryParams.pageName" placeholder="请输入页面名称" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ping:pageConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['ping:pageConfig:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['ping:pageConfig:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['ping:pageConfig:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-alert
        class="mb-3"
        type="info"
        :closable="false"
        show-icon
        title="模板支持占位符：{target} 原始目标、{displayTarget} 展示目标、{pageName} 页面名称、{canonicalPath} 当前规范路径。公开接口 Redis 缓存 5 分钟，保存后会自动清理缓存。"
      />

      <el-table v-loading="loading" border :data="pageConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="页面标识" prop="pageKey" align="center" width="110" />
        <el-table-column label="页面名称" prop="pageName" min-width="120" show-overflow-tooltip />
        <el-table-column label="标题模板" prop="titleTemplate" min-width="260" show-overflow-tooltip />
        <el-table-column label="描述模板" prop="descriptionTemplate" min-width="320" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'on' ? 'success' : 'info'">{{ scope.row.status === 'on' ? '开启' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortOrder" align="center" width="90" />
        <el-table-column label="更新时间" prop="updateTime" align="center" width="170" />
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ping:pageConfig:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ping:pageConfig:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="960px" top="5vh" append-to-body class="ping-page-dialog">
      <div class="ping-page-dialog-body">
        <el-form ref="pageConfigFormRef" :model="form" :rules="rules" label-width="110px" class="ping-page-form">
          <div class="ping-page-section">
            <div class="ping-page-section-title">基础配置</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="页面标识" prop="pageKey">
                  <el-input v-model="form.pageKey" placeholder="请输入页面标识，例如 ping、tcping、http" clearable />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="页面名称" prop="pageName">
                  <el-input v-model="form.pageName" placeholder="请输入页面名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status">
                    <el-radio value="on">开启</el-radio>
                    <el-radio value="off">关闭</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="排序" prop="sortOrder">
                  <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-page-section">
            <div class="ping-page-section-title">SEO 模板</div>
            <el-row :gutter="18">
              <el-col :span="24">
                <el-form-item label="标题模板" prop="titleTemplate">
                  <el-input v-model="form.titleTemplate" placeholder="例如：{displayTarget} 在线 Ping 检测 - TCPTest" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="描述模板" prop="descriptionTemplate">
                  <el-input
                    v-model="form.descriptionTemplate"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 6 }"
                    placeholder="请输入 description 模板"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="关键词模板" prop="keywordsTemplate">
                  <el-input v-model="form.keywordsTemplate" placeholder="例如：TCPTest,在线Ping,{target},网络检测" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="H1模板" prop="h1Template">
                  <el-input v-model="form.h1Template" placeholder="例如：{displayTarget} 在线 Ping 检测" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="简介模板" prop="introTemplate">
                  <el-input
                    v-model="form.introTemplate"
                    type="textarea"
                    :autosize="{ minRows: 3, maxRows: 8 }"
                    placeholder="请输入页面首屏服务端渲染简介"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="ping-page-section">
            <div class="ping-page-section-title">备注</div>
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

<script setup name="PingPageConfig" lang="ts">
import {
  addPingPageConfig,
  delPingPageConfig,
  getPingPageConfig,
  listPingPageConfig,
  updatePingPageConfig
} from '@/api/ping/pageConfig';
import { PingPageConfigForm, PingPageConfigQuery, PingPageConfigVO } from '@/api/ping/pageConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const pageConfigList = ref<PingPageConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const pageConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PingPageConfigForm = {
  id: undefined,
  pageKey: 'ping',
  pageName: '在线 Ping',
  titleTemplate: '{displayTarget} 在线 Ping 检测',
  descriptionTemplate: '为 {displayTarget} 提供未登录用户在线 Ping 检测，支持多地区、多运营商节点实时返回响应 IP、地区与延迟。',
  keywordsTemplate: '在线Ping,{target},网络检测,延迟检测',
  h1Template: '{displayTarget} 在线 Ping 检测',
  introTemplate: '当前检测目标：{displayTarget}。页面参数由服务端渲染输出，便于搜索引擎解析当前检测内容。',
  status: 'on',
  sortOrder: 1,
  remark: undefined
};

const data = reactive<PageData<PingPageConfigForm, PingPageConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    pageKey: undefined,
    pageName: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    pageKey: [{ required: true, message: '页面标识不能为空', trigger: 'blur' }],
    pageName: [{ required: true, message: '页面名称不能为空', trigger: 'blur' }],
    titleTemplate: [{ required: true, message: '标题模板不能为空', trigger: 'blur' }],
    descriptionTemplate: [{ required: true, message: '描述模板不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listPingPageConfig(queryParams.value);
  pageConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  pageConfigFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: PingPageConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加 ping 1.0 页面配置';
};

const handleUpdate = async (row?: PingPageConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getPingPageConfig(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改 ping 1.0 页面配置';
};

const submitForm = () => {
  pageConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    buttonLoading.value = true;
    if (form.value.id) {
      await updatePingPageConfig(form.value).finally(() => (buttonLoading.value = false));
    } else {
      await addPingPageConfig(form.value).finally(() => (buttonLoading.value = false));
    }
    proxy?.$modal.msgSuccess('操作成功，公开页面缓存已刷新');
    dialog.visible = false;
    await getList();
  });
};

const handleDelete = async (row?: PingPageConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除 ping 1.0 页面配置编号为"${_ids}"的数据项？`).finally(() => (loading.value = false));
  await delPingPageConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功，公开页面缓存已刷新');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'ping/page-config/export',
    {
      ...queryParams.value
    },
    `ping_page_config_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.ping-page-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 180px;
  }
}

.ping-page-dialog-body {
  max-height: 68vh;
  overflow-y: auto;
  padding-right: 8px;
}

.ping-page-section {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ping-page-section-title {
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

.ping-page-form {
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

:deep(.ping-page-dialog .el-dialog) {
  max-width: calc(100vw - 24px);
}
</style>
