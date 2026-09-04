<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="issue-query-form">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryParams.keyword" clearable placeholder="标题、内容、用户" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="反馈类型" prop="issueType">
              <el-select v-model="queryParams.issueType" clearable placeholder="全部类型">
                <el-option label="问题反馈" value="problem" />
                <el-option label="意见建议" value="suggestion" />
                <el-option label="合作" value="cooperation" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="全部状态">
                <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="公开状态" prop="publicVisible">
              <el-select v-model="queryParams.publicVisible" clearable placeholder="全部">
                <el-option label="已公开" :value="true" />
                <el-option label="未公开" :value="false" />
              </el-select>
            </el-form-item>
            <el-form-item label="提交时间">
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
            <span class="font-medium">问题反馈、意见建议与合作</span>
            <span class="ml-3 text-xs text-gray-400">共 {{ total }} 条记录</span>
          </div>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
        </div>
      </template>

      <el-table v-loading="loading" :data="issueList" border>
        <el-table-column label="ID" prop="id" align="center" width="105" show-overflow-tooltip />
        <el-table-column label="类型" align="center" width="100">
          <template #default="scope">
            <el-tag :type="issueTypeMeta(scope.row.issueType).type">{{ issueTypeMeta(scope.row.issueType).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" min-width="260" show-overflow-tooltip />
        <el-table-column label="提交用户" min-width="170" show-overflow-tooltip>
          <template #default="scope">
            <div>{{ scope.row.nickname || scope.row.userName }}</div>
            <div v-if="scope.row.nickname" class="text-xs text-gray-400">{{ scope.row.userName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="statusMeta(scope.row.status).type">{{ statusMeta(scope.row.status).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="公开" align="center" width="82">
          <template #default="scope">
            <el-tag :type="scope.row.publicVisible ? 'success' : 'info'">{{ scope.row.publicVisible ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截图" align="center" width="72">
          <template #default="scope">{{ scope.row.attachments?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="提交时间" prop="createTime" align="center" width="170" />
        <el-table-column label="回复时间" align="center" width="170">
          <template #default="scope">{{ scope.row.replyTime || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="90" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看与处理" placement="top">
              <el-button link type="primary" icon="View" @click="openDetail(scope.row)" v-hasPermi="['ping:issue:query']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-drawer v-model="drawer.visible" title="反馈详情" size="760px" append-to-body destroy-on-close>
      <div v-loading="detailLoading" class="issue-detail">
        <template v-if="currentIssue">
          <div class="mb-5 flex flex-wrap items-center gap-2">
            <el-tag :type="issueTypeMeta(currentIssue.issueType).type">{{ issueTypeMeta(currentIssue.issueType).label }}</el-tag>
            <el-tag :type="statusMeta(currentIssue.status).type">{{ statusMeta(currentIssue.status).label }}</el-tag>
            <span class="text-xs text-gray-400">#{{ currentIssue.id }}</span>
          </div>

          <h2 class="text-lg font-semibold text-gray-900">{{ currentIssue.title }}</h2>
          <div class="mt-2 text-xs text-gray-500">
            {{ currentIssue.nickname || currentIssue.userName }} · {{ currentIssue.userName }} · {{ currentIssue.createTime }}
          </div>
          <div class="mt-4 whitespace-pre-wrap rounded border border-gray-200 bg-gray-50 p-4 text-sm leading-7 text-gray-700">
            {{ currentIssue.content }}
          </div>

          <div v-if="currentIssue.attachments?.length" class="mt-5">
            <div class="mb-2 text-sm font-medium text-gray-700">问题截图</div>
            <div class="grid grid-cols-3 gap-3">
              <el-image
                v-for="attachment in currentIssue.attachments"
                :key="attachment.ossId"
                :src="attachment.url"
                :preview-src-list="previewUrls"
                fit="cover"
                class="h-36 w-full rounded border border-gray-200 bg-gray-50"
                preview-teleported
              />
            </div>
          </div>

          <el-divider content-position="left">沟通记录</el-divider>
          <div v-if="currentIssue.messages?.length" class="space-y-3">
            <div
              v-for="message in currentIssue.messages"
              :key="message.id"
              class="rounded border p-4"
              :class="message.senderType === 'admin' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-gray-50'"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-medium">
                  <el-tag :type="message.senderType === 'admin' ? 'primary' : 'info'" size="small">
                    {{ message.senderType === 'admin' ? '管理员' : '用户' }}
                  </el-tag>
                  <span>{{ message.senderName }}</span>
                  <span class="text-xs font-normal text-gray-400">{{ message.createTime }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">公开展示</span>
                  <el-switch
                    v-model="message.publicVisible"
                    :loading="visibilityLoading === message.id"
                    @change="toggleMessageVisibility(message)"
                    v-hasPermi="['ping:issue:reply']"
                  />
                </div>
              </div>
              <div class="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{{ message.content }}</div>
            </div>
          </div>
          <div v-else class="rounded border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">暂无后续沟通</div>

          <el-divider content-position="left">管理员处理</el-divider>
          <el-form ref="reviewFormRef" :model="reviewForm" label-width="92px">
            <el-form-item label="处理状态" prop="status">
              <el-select v-model="reviewForm.status" class="w-full">
                <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="公开展示" prop="publicVisible">
              <div>
                <el-switch v-model="reviewForm.publicVisible" inline-prompt active-text="公开" inactive-text="私有" />
                <p class="mt-1 text-xs text-gray-400">开启后问题会进入公开问题库；后续消息仍由各自的公开开关单独控制。</p>
              </div>
            </el-form-item>
            <el-form-item label="后台备注" prop="remark">
              <el-input
                v-model="reviewForm.remark"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 5 }"
                maxlength="512"
                show-word-limit
                placeholder="仅管理员可见"
              />
            </el-form-item>
          </el-form>

          <el-divider content-position="left">追加管理员回复</el-divider>
          <el-form label-width="92px">
            <el-form-item label="回复内容">
              <el-input
                v-model="messageForm.content"
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 10 }"
                maxlength="5000"
                show-word-limit
                placeholder="填写排查结果、解决方案或后续处理说明"
              />
            </el-form-item>
            <el-form-item label="公开展示">
              <div>
                <el-switch v-model="messageForm.publicVisible" inline-prompt active-text="公开" inactive-text="私有" />
                <p class="mt-1 text-xs text-gray-400">即使消息设为公开，问题本身未公开时，其他用户仍无法查看。</p>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Promotion" :loading="messageButtonLoading" @click="submitMessage" v-hasPermi="['ping:issue:reply']">
                发送回复
              </el-button>
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <el-button @click="drawer.visible = false">关闭</el-button>
        <el-button type="primary" :loading="buttonLoading" @click="submitReview" v-hasPermi="['ping:issue:reply']">保存处理结果</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup name="PingIssue" lang="ts">
import { addIssueMessage, getIssue, listIssues, reviewIssue, updateIssueMessageVisibility } from '@/api/ping/issue';
import type {
  PingIssueAdminMessageForm,
  PingIssueMessageVO,
  PingIssueQuery,
  PingIssueReviewForm,
  PingIssueStatus,
  PingIssueType,
  PingIssueVO
} from '@/api/ping/issue/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statusOptions: Array<{ value: PingIssueStatus; label: string }> = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
  { value: 'closed', label: '已关闭' }
];

const issueList = ref<PingIssueVO[]>([]);
const currentIssue = ref<PingIssueVO>();
const loading = ref(true);
const detailLoading = ref(false);
const buttonLoading = ref(false);
const messageButtonLoading = ref(false);
const visibilityLoading = ref('');
const showSearch = ref(true);
const total = ref(0);
const dateRange = ref<[string, string] | []>([]);
const queryFormRef = ref<ElFormInstance>();

const queryParams = reactive<PingIssueQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  issueType: '',
  status: '',
  publicVisible: '',
  params: {}
});

const reviewForm = reactive<PingIssueReviewForm>({
  id: '',
  status: 'pending',
  publicVisible: false,
  remark: ''
});

const messageForm = reactive<PingIssueAdminMessageForm>({
  content: '',
  publicVisible: false
});

const drawer = reactive({ visible: false });
const previewUrls = computed(() => currentIssue.value?.attachments?.map((item) => item.url).filter(Boolean) || []);

const statusMeta = (status: PingIssueStatus): { label: string; type: 'warning' | 'primary' | 'success' | 'info' } => {
  const meta = {
    pending: { label: '待处理', type: 'warning' as const },
    processing: { label: '处理中', type: 'primary' as const },
    resolved: { label: '已解决', type: 'success' as const },
    closed: { label: '已关闭', type: 'info' as const }
  };
  return meta[status] || meta.pending;
};

const issueTypeMeta = (issueType: PingIssueType): { label: string; type: 'danger' | 'primary' | 'warning' } => {
  const meta = {
    problem: { label: '问题反馈', type: 'danger' as const },
    suggestion: { label: '意见建议', type: 'primary' as const },
    cooperation: { label: '合作', type: 'warning' as const }
  };
  return meta[issueType] || meta.problem;
};

const buildQuery = (): PingIssueQuery => ({
  ...queryParams,
  params: dateRange.value.length === 2 ? { beginTime: dateRange.value[0], endTime: dateRange.value[1] } : {}
});

const getList = async () => {
  loading.value = true;
  try {
    const res = await listIssues(buildQuery());
    issueList.value = res.rows;
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
  dateRange.value = [];
  handleQuery();
};

const fillReviewForm = (issue: PingIssueVO) => {
  reviewForm.id = issue.id;
  reviewForm.status = issue.status;
  reviewForm.publicVisible = issue.publicVisible;
  reviewForm.remark = issue.remark || '';
};

const refreshCurrentIssue = async () => {
  if (!currentIssue.value) return;
  const res = await getIssue(currentIssue.value.id);
  currentIssue.value = res.data;
  fillReviewForm(res.data);
};

const openDetail = async (row: PingIssueVO) => {
  drawer.visible = true;
  detailLoading.value = true;
  currentIssue.value = row;
  fillReviewForm(row);
  messageForm.content = '';
  messageForm.publicVisible = false;
  try {
    await refreshCurrentIssue();
  } finally {
    detailLoading.value = false;
  }
};

const submitReview = async () => {
  buttonLoading.value = true;
  try {
    await reviewIssue({ ...reviewForm });
    proxy?.$modal.msgSuccess(reviewForm.publicVisible ? '处理结果已保存，问题已公开' : '处理结果已保存');
    await Promise.all([refreshCurrentIssue(), getList()]);
  } finally {
    buttonLoading.value = false;
  }
};

const submitMessage = async () => {
  if (!currentIssue.value || !messageForm.content.trim()) {
    proxy?.$modal.msgError('请填写管理员回复内容');
    return;
  }
  messageButtonLoading.value = true;
  try {
    await addIssueMessage(currentIssue.value.id, {
      content: messageForm.content.trim(),
      publicVisible: messageForm.publicVisible
    });
    proxy?.$modal.msgSuccess('管理员回复已发送');
    messageForm.content = '';
    messageForm.publicVisible = false;
    await Promise.all([refreshCurrentIssue(), getList()]);
  } finally {
    messageButtonLoading.value = false;
  }
};

const toggleMessageVisibility = async (message: PingIssueMessageVO) => {
  visibilityLoading.value = message.id;
  try {
    await updateIssueMessageVisibility({ id: message.id, publicVisible: message.publicVisible });
    proxy?.$modal.msgSuccess(message.publicVisible ? '该消息已公开' : '该消息已设为私有');
  } catch (error) {
    await refreshCurrentIssue();
    throw error;
  } finally {
    visibilityLoading.value = '';
  }
};

onMounted(getList);
</script>

<style lang="scss" scoped>
.issue-query-form {
  :deep(.el-input),
  :deep(.el-select) {
    width: 200px;
  }

  :deep(.el-date-editor) {
    width: 360px;
  }
}

.issue-detail {
  min-height: 320px;
}
</style>
