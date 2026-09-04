<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="ping-query-form">
            <el-form-item label="IP" prop="startIp">
              <el-input v-model="queryParams.startIp" clearable placeholder="起始IP或结束IP" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="IP版本" prop="ipVersion">
              <el-select v-model="queryParams.ipVersion" clearable placeholder="全部版本">
                <el-option label="IPv4" value="ipv4" />
                <el-option label="IPv6" value="ipv6" />
              </el-select>
            </el-form-item>
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="全部状态">
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已驳回" value="rejected" />
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

    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span>IP信息纠错审核</span>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </template>
      <el-table v-loading="loading" :data="feedbackList" border>
        <el-table-column label="ID" prop="id" align="center" width="80" />
        <el-table-column label="版本" prop="ipVersion" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.ipVersion === 'ipv6' ? 'success' : 'primary'">{{ scope.row.ipVersion?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="IP范围" min-width="260" show-overflow-tooltip>
          <template #default="scope">
            <span class="font-mono">{{ scope.row.startIp }}{{ scope.row.endIp !== scope.row.startIp ? ` - ${scope.row.endIp}` : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="正确归属地" prop="location" min-width="220" show-overflow-tooltip>
          <template #default="scope">{{ formatLocation(scope.row.location) }}</template>
        </el-table-column>
        <el-table-column label="状态" prop="status" align="center" width="100">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核备注" prop="reviewRemark" min-width="180" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.reviewRemark || '--' }}</template>
        </el-table-column>
        <el-table-column label="提交时间" prop="createTime" align="center" width="170" />
        <el-table-column label="审核时间" prop="reviewTime" align="center" width="170">
          <template #default="scope">{{ scope.row.reviewTime || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip v-if="scope.row.status === 'pending'" content="审核" placement="top">
              <el-button link type="primary" icon="EditPen" @click="openReview(scope.row)" v-hasPermi="['ping:ipFeedback:audit']" />
            </el-tooltip>
            <span v-else class="text-xs text-gray-400">已处理</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog v-model="reviewDialog.visible" title="审核IP信息纠错" width="560px" append-to-body>
      <el-form ref="reviewFormRef" :model="reviewForm" :rules="reviewRules" label-width="96px">
        <el-form-item label="IP范围">
          <span class="break-all font-mono text-sm">{{ reviewDialog.range }}</span>
        </el-form-item>
        <el-form-item label="正确归属地">
          <span>{{ formatLocation(reviewDialog.location) }}</span>
        </el-form-item>
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="reviewForm.status">
            <el-radio value="approved">通过并应用</el-radio>
            <el-radio value="rejected">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核备注" prop="reviewRemark">
          <el-input v-model="reviewForm.reviewRemark" type="textarea" :autosize="{ minRows: 3, maxRows: 6 }" maxlength="512" show-word-limit placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="reviewLoading" @click="submitReview">确认审核</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingIpFeedback" lang="ts">
import { listPingIpFeedback, reviewPingIpFeedback } from '@/api/ping/ipFeedback';
import { PingIpFeedbackQuery, PingIpFeedbackReviewForm, PingIpFeedbackStatus, PingIpFeedbackVO } from '@/api/ping/ipFeedback/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const feedbackList = ref<PingIpFeedbackVO[]>([]);
const loading = ref(true);
const reviewLoading = ref(false);
const showSearch = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();
const reviewFormRef = ref<ElFormInstance>();

const queryParams = reactive<PingIpFeedbackQuery>({
  pageNum: 1,
  pageSize: 10,
  ipVersion: undefined,
  startIp: undefined,
  status: undefined,
  params: {}
});

const reviewForm = reactive<PingIpFeedbackReviewForm>({
  id: '',
  status: 'approved',
  reviewRemark: ''
});

const reviewDialog = reactive({
  visible: false,
  range: '',
  location: ''
});

const reviewRules: ElFormRules = {
  status: [{ required: true, message: '请选择审核结果', trigger: 'change' }]
};

const statusLabel = (status: PingIpFeedbackStatus) => ({ pending: '待审核', approved: '已通过', rejected: '已驳回' })[status] || status;
const statusType = (status: PingIpFeedbackStatus): 'warning' | 'success' | 'danger' | 'info' => {
  return ({ pending: 'warning', approved: 'success', rejected: 'danger' } as const)[status] || 'info';
};
const formatLocation = (location?: string) => location?.split('|').filter(Boolean).join(' / ') || '--';

const getList = async () => {
  loading.value = true;
  try {
    const res = await listPingIpFeedback(queryParams);
    feedbackList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const openReview = (row: PingIpFeedbackVO) => {
  reviewForm.id = row.id;
  reviewForm.status = 'approved';
  reviewForm.reviewRemark = '';
  reviewDialog.range = row.startIp === row.endIp ? row.startIp : `${row.startIp} - ${row.endIp}`;
  reviewDialog.location = row.location;
  reviewDialog.visible = true;
};

const submitReview = () => {
  reviewFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    reviewLoading.value = true;
    try {
      await reviewPingIpFeedback({ ...reviewForm });
      proxy?.$modal.msgSuccess(reviewForm.status === 'approved' ? '审核通过，归属地规则已应用' : '已驳回该反馈');
      reviewDialog.visible = false;
      await getList();
    } finally {
      reviewLoading.value = false;
    }
  });
};

onMounted(getList);
</script>

<style lang="scss" scoped>
.ping-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 200px;
  }
}
</style>
