<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="node-config-query-form">
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="权重" prop="weight">
              <el-input-number v-model="queryParams.weight" :min="0" controls-position="right" placeholder="请输入权重" />
            </el-form-item>
            <el-form-item label="状态" prop="state">
              <el-select v-model="queryParams.state" placeholder="请选择状态" clearable>
                <el-option v-for="dict in node_state" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="国家" prop="country">
              <el-input v-model="queryParams.country" placeholder="请输入国家" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="省份" prop="province">
              <el-select v-model="queryParams.province" placeholder="请选择省份" clearable>
                <el-option v-for="dict in node_province" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="城市" prop="city">
              <el-input v-model="queryParams.city" placeholder="请输入城市" clearable @keyup.enter="handleQuery" />
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
            <el-form-item label="海外" prop="overseas">
              <el-select v-model="queryParams.overseas" placeholder="请选择海外状态" clearable>
                <el-option v-for="dict in node_state" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="在线时刻" prop="online">
              <el-input v-model="queryParams.online" placeholder="请输入在线时刻" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="家宽" prop="homeState">
              <el-select v-model="queryParams.homeState" placeholder="请选择家宽状态" clearable>
                <el-option v-for="dict in node_state" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="IPv6" prop="ipv6">
              <el-select v-model="queryParams.ipv6" placeholder="请选择 IPv6 状态" clearable>
                <el-option v-for="dict in node_state" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="路由追踪" prop="traceroute">
              <el-select v-model="queryParams.traceroute" placeholder="请选择路由追踪" clearable>
                <el-option v-for="dict in node_state" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['webone:nodeConfig:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['webone:nodeConfig:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['webone:nodeConfig:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['webone:nodeConfig:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="nodeConfigList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="90" v-if="true" />
        <el-table-column label="名称" align="center" prop="name" min-width="150" show-overflow-tooltip>
          <template #default="scope">
            <span class="node-config-table-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权重" align="center" prop="weight" width="90" />
        <el-table-column label="状态" align="center" prop="state" width="90">
          <template #default="scope">
            <dict-tag :options="node_state" :value="scope.row.state" />
          </template>
        </el-table-column>
        <el-table-column label="国家" align="center" prop="country" min-width="110" show-overflow-tooltip />
        <el-table-column label="省份" align="center" prop="province" min-width="110" show-overflow-tooltip>
          <template #default="scope">
            <dict-tag :options="node_province" :value="scope.row.province" />
          </template>
        </el-table-column>
        <el-table-column label="城市" align="center" prop="city" min-width="120" show-overflow-tooltip />
        <el-table-column label="区域" align="center" prop="region" min-width="110">
          <template #default="scope">
            <dict-tag :options="node_region" :value="scope.row.region" />
          </template>
        </el-table-column>
        <el-table-column label="运营商" align="center" prop="operators" min-width="100">
          <template #default="scope">
            <dict-tag :options="node_operators" :value="scope.row.operators" />
          </template>
        </el-table-column>
        <el-table-column label="海外" align="center" prop="overseas" width="90">
          <template #default="scope">
            <dict-tag :options="node_state" :value="scope.row.overseas" />
          </template>
        </el-table-column>
        <el-table-column label="在线时刻" align="center" prop="online" min-width="120" show-overflow-tooltip />
        <el-table-column label="家宽" align="center" prop="homeState" width="90">
          <template #default="scope">
            <dict-tag :options="node_state" :value="scope.row.homeState" />
          </template>
        </el-table-column>
        <el-table-column label="IPv6" align="center" prop="ipv6" width="90">
          <template #default="scope">
            <dict-tag :options="node_state" :value="scope.row.ipv6" />
          </template>
        </el-table-column>
        <el-table-column label="路由追踪" align="center" prop="traceroute" width="110">
          <template #default="scope">
            <dict-tag :options="node_state" :value="scope.row.traceroute" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['webone:nodeConfig:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['webone:nodeConfig:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改节点信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="860px" top="5vh" append-to-body class="node-config-dialog">
      <div class="node-config-dialog-body">
        <el-form ref="nodeConfigFormRef" :model="form" :rules="rules" label-width="110px" class="node-config-form">
          <div class="node-config-section">
            <div class="node-config-section-title">核心信息</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入名称" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="权重" prop="weight">
                  <el-input-number v-model="form.weight" :min="0" controls-position="right" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="状态" prop="state">
                  <el-radio-group v-model="form.state" class="node-config-radio-group">
                    <el-radio v-for="dict in node_state" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
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
              <el-col :xs="24" :sm="12">
                <el-form-item label="海外" prop="overseas">
                  <el-radio-group v-model="form.overseas" class="node-config-radio-group">
                    <el-radio v-for="dict in node_state" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="node-config-section">
            <div class="node-config-section-title">网络能力</div>
            <el-row :gutter="18">
              <el-col :xs="24" :sm="12">
                <el-form-item label="在线时刻" prop="online">
                  <el-input v-model="form.online" placeholder="请输入在线时刻" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="家宽" prop="homeState">
                  <el-radio-group v-model="form.homeState" class="node-config-radio-group">
                    <el-radio v-for="dict in node_state" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="IPv6" prop="ipv6">
                  <el-radio-group v-model="form.ipv6" class="node-config-radio-group">
                    <el-radio v-for="dict in node_state" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="路由追踪" prop="traceroute">
                  <el-radio-group v-model="form.traceroute" class="node-config-radio-group">
                    <el-radio v-for="dict in node_state" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="坐标" prop="coordinate">
                  <el-input v-model="form.coordinate" placeholder="请输入坐标" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <div class="node-config-section">
            <div class="node-config-section-title">备注信息</div>
            <el-row :gutter="18">
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
                  <el-input
                    v-model="form.content"
                    type="textarea"
                    :autosize="{ minRows: 6, maxRows: 12 }"
                    placeholder="请输入 HTML 标签内容，例如 &lt;p&gt;说明&lt;/p&gt;"
                    class="node-config-html-input"
                  />
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
  </div>
</template>

<script setup name="NodeConfig" lang="ts">
import { listNodeConfig, getNodeConfig, delNodeConfig, addNodeConfig, updateNodeConfig } from '@/api/webone/nodeConfig';
import { NodeConfigVO, NodeConfigQuery, NodeConfigForm } from '@/api/webone/nodeConfig/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { node_state, node_province, node_region, node_operators } = toRefs<any>(
  proxy?.useDict('node_state', 'node_province', 'node_region', 'node_operators')
);

const nodeConfigList = ref<NodeConfigVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const nodeConfigFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: NodeConfigForm = {
  id: undefined,
  country: undefined,
  overseas: undefined,
  region: undefined,
  city: undefined,
  operators: undefined,
  name: undefined,
  weight: 0,
  coordinate: undefined,
  state: undefined,
  content: undefined,
  content2: undefined,
  content3: undefined,
  online: undefined,
  homeState: undefined,
  province: undefined,
  traceroute: undefined,
  ipv6: undefined
};

const getNodeStateValue = (label: string, fallback: string) => {
  const option = node_state.value?.find((item: { label?: string; value?: string }) => item.label?.includes(label));
  return option?.value ?? fallback;
};

const getEnabledValue = () => getNodeStateValue('开启', 'true');
const getDisabledValue = () => getNodeStateValue('关闭', 'false');

const getAddFormData = (): NodeConfigForm => ({
  ...initFormData,
  overseas: getDisabledValue(),
  state: getEnabledValue(),
  homeState: getEnabledValue(),
  traceroute: getEnabledValue(),
  ipv6: getEnabledValue()
});

const data = reactive<PageData<NodeConfigForm, NodeConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    country: undefined,
    overseas: undefined,
    region: undefined,
    city: undefined,
    operators: undefined,
    name: undefined,
    weight: undefined,
    coordinate: undefined,
    state: undefined,
    content: undefined,
    content2: undefined,
    content3: undefined,
    online: undefined,
    homeState: undefined,
    province: undefined,
    traceroute: undefined,
    ipv6: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'ID不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    weight: [{ required: true, message: '权重不能为空', trigger: 'blur' }],
    country: [{ required: true, message: '国家不能为空', trigger: 'blur' }],
    overseas: [{ required: true, message: '是否是海外不能为空', trigger: 'change' }],
    region: [{ required: true, message: '区域不能为空', trigger: 'change' }],
    city: [{ required: true, message: '城市不能为空', trigger: 'blur' }],
    operators: [{ required: true, message: '运营商不能为空', trigger: 'change' }],
    state: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    homeState: [{ required: true, message: '是否家宽不能为空', trigger: 'change' }],
    province: [{ required: true, message: '省份不能为空', trigger: 'change' }],
    traceroute: [{ required: true, message: '路由追踪开启不能为空', trigger: 'change' }],
    ipv6: [{ required: true, message: 'ipv6支持不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询节点信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listNodeConfig(queryParams.value);
  nodeConfigList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  nodeConfigFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: NodeConfigVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  form.value = getAddFormData();
  dialog.visible = true;
  dialog.title = '添加节点信息';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: NodeConfigVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getNodeConfig(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改节点信息';
};

/** 提交按钮 */
const submitForm = () => {
  nodeConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      const submitData = {
        ...form.value,
        content: form.value.content,
        content2: form.value.content2,
        content3: form.value.content3
      };
      if (form.value.id) {
        await updateNodeConfig(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addNodeConfig(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: NodeConfigVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除节点信息编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delNodeConfig(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'webone/nodeConfig/export',
    {
      ...queryParams.value
    },
    `nodeConfig_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.node-config-query-form {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-input-number) {
    width: 180px;
  }
}

.node-config-table-name {
  font-weight: 600;
}

.node-config-dialog-body {
  max-height: 68vh;
  overflow-y: auto;
  padding-right: 8px;
}

.node-config-section {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.node-config-section-title {
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

.node-config-form {
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

.node-config-radio-group {
  display: flex;
  min-height: 32px;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
}

.node-config-html-input {
  :deep(.el-textarea__inner) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    line-height: 1.6;
  }
}

:deep(.node-config-dialog .el-dialog) {
  max-width: calc(100vw - 24px);
}
</style>
