<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="milestone-query-form">
            <el-form-item label="内容关键词" prop="keyword">
              <el-input v-model="queryParams.keyword" placeholder="搜索内容或备注" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['ping:milestone:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['ping:milestone:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['ping:milestone:remove']">
              删除
            </el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="milestoneList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="发生月份" prop="milestoneDate" align="center" width="130">
          <template #default="scope">{{ formatMilestoneMonth(scope.row.milestoneDate) }}</template>
        </el-table-column>
        <el-table-column label="里程碑内容" prop="content" min-width="420" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'on' ? 'success' : 'info'">{{ scope.row.status === 'on' ? '开启' : '关闭' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序权重" prop="sortOrder" align="center" width="100" />
        <el-table-column label="更新时间" prop="updateTime" align="center" width="170" />
        <el-table-column label="操作" align="center" fixed="right" width="100" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['ping:milestone:edit']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['ping:milestone:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="680px" append-to-body>
      <el-form ref="milestoneFormRef" :model="form" :rules="rules" label-width="100px" class="milestone-form">
        <el-form-item label="发生月份" prop="milestoneDate">
          <el-date-picker v-model="form.milestoneDate" type="month" value-format="YYYY-MM-DD" placeholder="请选择发生月份" />
        </el-form-item>
        <el-form-item label="里程碑内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 10 }"
            maxlength="1000"
            show-word-limit
            placeholder="请输入对外展示的发展记录"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="on">开启</el-radio>
            <el-radio value="off">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999999" controls-position="right" />
          <span class="ml-3 text-xs text-gray-400">同一月份内，数值越大越靠前</span>
        </el-form-item>
        <el-form-item label="后台备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            maxlength="512"
            show-word-limit
            placeholder="仅管理员可见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingMilestone" lang="ts">
import { addMilestone, deleteMilestones, getMilestone, listMilestones, updateMilestone } from '@/api/ping/milestone';
import type { PingMilestoneForm, PingMilestoneQuery, PingMilestoneVO } from '@/api/ping/milestone/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const milestoneList = ref<PingMilestoneVO[]>([]);
const loading = ref(true);
const buttonLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const milestoneFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({ visible: false, title: '' });

const initFormData: PingMilestoneForm = {
  id: undefined,
  milestoneDate: '',
  content: '',
  status: 'on',
  sortOrder: 0,
  remark: ''
};

const data = reactive<PageData<PingMilestoneForm, PingMilestoneQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: ''
  },
  rules: {
    milestoneDate: [{ required: true, message: '请选择发生月份', trigger: 'change' }],
    content: [{ required: true, message: '里程碑内容不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const formatMilestoneMonth = (value?: string) => {
  if (!value) return '-';
  const [year, month] = value.split('-');
  return year && month ? `${year}年${Number(month)}月` : value;
};

const normalizeMilestoneDate = (value: string) => (value ? `${value.slice(0, 7)}-01` : value);

const getList = async () => {
  loading.value = true;
  try {
    const res = await listMilestones(queryParams.value);
    milestoneList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  form.value = { ...initFormData };
  milestoneFormRef.value?.resetFields();
};

const cancel = () => {
  dialog.visible = false;
  reset();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: PingMilestoneVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  dialog.title = '新增项目里程碑';
  dialog.visible = true;
};

const handleUpdate = async (row?: PingMilestoneVO) => {
  reset();
  const id = row?.id ?? ids.value[0];
  const res = await getMilestone(id);
  Object.assign(form.value, res.data, {
    milestoneDate: normalizeMilestoneDate(res.data.milestoneDate)
  });
  dialog.title = '修改项目里程碑';
  dialog.visible = true;
};

const submitForm = () => {
  milestoneFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      const payload = {
        ...form.value,
        milestoneDate: normalizeMilestoneDate(form.value.milestoneDate)
      };
      if (payload.id) {
        await updateMilestone(payload);
      } else {
        await addMilestone(payload);
      }
      proxy?.$modal.msgSuccess('保存成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: PingMilestoneVO) => {
  const selectedIds = row?.id ?? ids.value;
  await proxy?.$modal.confirm(`是否确认删除项目里程碑编号为“${selectedIds}”的数据？`);
  await deleteMilestones(selectedIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

onMounted(getList);
</script>

<style lang="scss" scoped>
.milestone-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 220px;
  }
}

.milestone-form {
  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-textarea),
  :deep(.el-date-editor) {
    width: 100%;
  }
}
</style>
