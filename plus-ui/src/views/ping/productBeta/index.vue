<template>
  <div class="p-2">
    <el-row :gutter="12" class="mb-[10px]">
      <el-col v-for="item in summaryItems" :key="item.label" :span="item.span">
        <el-card shadow="never" class="summary-card">
          <div class="text-sm text-gray-500">{{ item.label }}</div>
          <div class="mt-2 text-2xl font-semibold" :class="item.className">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="product-beta-query-form">
            <el-form-item label="报名用户" prop="keyword">
              <el-input v-model="queryParams.keyword" clearable placeholder="用户账号或昵称" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="通知状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="全部状态">
                <el-option label="待通知" value="registered" />
                <el-option label="已通知" value="notified" />
              </el-select>
            </el-form-item>
            <el-form-item label="报名时间">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
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
        <div class="flex items-center justify-between">
          <div>
            <span class="font-medium">监控产品内测报名</span>
            <span class="ml-3 text-xs text-gray-400">共 {{ total }} 位用户</span>
          </div>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="refreshAll" />
        </div>
      </template>

      <el-table v-loading="loading" :data="signupList" border>
        <el-table-column label="用户ID" prop="userId" align="center" width="110" />
        <el-table-column label="用户账号" prop="userName" min-width="190" show-overflow-tooltip />
        <el-table-column label="用户昵称" min-width="150" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.nickname || '--' }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'notified' ? 'success' : 'warning'">
              {{ scope.row.status === 'notified' ? '已通知' : '待通知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名时间" prop="createTime" align="center" width="170" />
        <el-table-column label="通知时间" align="center" width="170">
          <template #default="scope">{{ scope.row.notifiedTime || '--' }}</template>
        </el-table-column>
        <el-table-column label="后台备注" min-width="220" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.remark || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="处理报名" placement="top">
              <el-button link type="primary" icon="EditPen" @click="openStatusDialog(scope.row)" v-hasPermi="['ping:productBeta:edit']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="statusDialog.visible" title="处理内测报名" width="560px" append-to-body>
      <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-width="88px">
        <el-form-item label="报名用户">
          <span>{{ statusDialog.userLabel }}</span>
        </el-form-item>
        <el-form-item label="通知状态" prop="status">
          <el-radio-group v-model="statusForm.status">
            <el-radio value="registered">待通知</el-radio>
            <el-radio value="notified">已通知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="后台备注" prop="remark">
          <el-input
            v-model="statusForm.remark"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            maxlength="512"
            show-word-limit
            placeholder="可记录通知渠道、内测批次或跟进情况"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitStatus">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingProductBeta" lang="ts">
import { getProductBetaSummary, listProductBetaSignups, updateProductBetaStatus } from '@/api/ping/productBeta';
import type {
  ProductBetaStatus,
  PingProductBetaQuery,
  PingProductBetaSignupVO,
  PingProductBetaStatusForm,
  PingProductBetaSummary
} from '@/api/ping/productBeta/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const emptySummary: PingProductBetaSummary = {
  total: 0,
  registered: 0,
  notified: 0,
  today: 0,
  lastSevenDays: 0
};

const signupList = ref<PingProductBetaSignupVO[]>([]);
const summary = ref<PingProductBetaSummary>({ ...emptySummary });
const loading = ref(true);
const buttonLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[string, string] | []>([]);
const queryFormRef = ref<ElFormInstance>();
const statusFormRef = ref<ElFormInstance>();

const queryParams = reactive<PingProductBetaQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  params: {}
});

const statusForm = reactive<PingProductBetaStatusForm>({
  id: '',
  status: 'registered',
  remark: ''
});

const statusDialog = reactive({ visible: false, userLabel: '' });
const statusRules: ElFormRules = {
  status: [{ required: true, message: '请选择通知状态', trigger: 'change' }]
};

const summaryItems = computed(() => [
  { label: '累计报名', value: summary.value.total, className: 'text-blue-600', span: 5 },
  { label: '待通知', value: summary.value.registered, className: 'text-amber-600', span: 5 },
  { label: '已通知', value: summary.value.notified, className: 'text-emerald-600', span: 5 },
  { label: '今日报名', value: summary.value.today, className: 'text-violet-600', span: 4 },
  { label: '近7日报名', value: summary.value.lastSevenDays, className: 'text-cyan-600', span: 5 }
]);

const buildQuery = (): PingProductBetaQuery => ({
  ...queryParams,
  params: dateRange.value.length === 2 ? { beginTime: dateRange.value[0], endTime: dateRange.value[1] } : {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listProductBetaSignups(buildQuery());
    signupList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const getSummary = async () => {
  const res = await getProductBetaSummary();
  summary.value = res.data;
};

const refreshAll = async () => {
  await Promise.all([getList(), getSummary()]);
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = [];
  handleQuery();
};

const openStatusDialog = (row: PingProductBetaSignupVO) => {
  statusForm.id = row.id;
  statusForm.status = row.status as ProductBetaStatus;
  statusForm.remark = row.remark || '';
  statusDialog.userLabel = row.nickname ? `${row.nickname}（${row.userName}）` : row.userName;
  statusDialog.visible = true;
};

const submitStatus = () => {
  statusFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      await updateProductBetaStatus({ ...statusForm });
      proxy?.$modal.msgSuccess(statusForm.status === 'notified' ? '已标记为通知完成' : '已恢复为待通知');
      statusDialog.visible = false;
      await refreshAll();
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(refreshAll);
</script>

<style lang="scss" scoped>
.summary-card {
  min-height: 104px;
}

.product-beta-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 210px;
  }

  :deep(.el-date-editor) {
    width: 360px;
  }
}
</style>
