<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键词" prop="keyword">
              <el-input v-model="queryParams.keyword" clearable placeholder="标题、别名或标签" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="分类" prop="category">
              <el-input v-model="queryParams.category" clearable placeholder="文章分类" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" clearable placeholder="全部状态" style="width: 140px">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['ping:blog:add']" type="primary" plain icon="Plus" @click="handleAdd">新增文章</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['ping:blog:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['ping:blog:remove']" type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >删除</el-button
            >
          </el-col>
          <right-toolbar v-model:show-search="showSearch" @query-table="getList" />
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="blogList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="封面" width="112" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              class="blog-cover-thumb"
              fit="cover"
              :preview-src-list="[scope.row.coverUrl]"
              preview-teleported
              :src="scope.row.coverUrl"
            />
            <span v-else class="text-gray-400">无封面</span>
          </template>
        </el-table-column>
        <el-table-column label="文章" min-width="260">
          <template #default="scope">
            <div class="blog-title-cell">
              <div class="blog-title-row">
                <el-tag v-if="scope.row.featured" size="small" type="danger">推荐</el-tag>
                <span class="blog-title">{{ scope.row.title }}</span>
              </div>
              <span class="blog-slug">/blog/{{ scope.row.slug }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="category" width="130" align="center" />
        <el-table-column label="标签" prop="tags" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
              {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
        <el-table-column label="发布时间" prop="publishTime" width="168" align="center">
          <template #default="scope">
            <span>{{ proxy?.parseTime(scope.row.publishTime, '{y}-{m}-{d} {h}:{i}') || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button v-hasPermi="['ping:blog:edit']" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button v-hasPermi="['ping:blog:remove']" link type="danger" icon="Delete" @click="handleDelete(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="1200px" top="3vh" append-to-body destroy-on-close>
      <div class="blog-dialog-body">
        <el-form ref="blogFormRef" :model="form" :rules="rules" label-width="96px">
          <el-row :gutter="18">
            <el-col :span="16">
              <el-form-item label="文章标题" prop="title">
                <el-input v-model="form.title" maxlength="200" show-word-limit placeholder="请输入文章标题" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="文章分类" prop="category">
                <el-input v-model="form.category" maxlength="64" placeholder="例如：网络技术" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="文章别名" prop="slug">
                <el-input v-model="form.slug" maxlength="160" placeholder="留空时根据标题生成">
                  <template #append>
                    <el-button icon="Refresh" @click="generateSlug">生成</el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="发布状态" prop="status">
                <el-radio-group v-model="form.status">
                  <el-radio value="draft">草稿</el-radio>
                  <el-radio value="published">发布</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="文章摘要" prop="summary">
                <el-input v-model="form.summary" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="用于文章列表和搜索引擎描述" />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="文章封面" prop="coverOssId">
                <image-upload
                  v-model="form.coverOssId"
                  :limit="1"
                  :file-size="8"
                  :file-type="['png', 'jpg', 'jpeg', 'webp']"
                  :compress-support="true"
                />
              </el-form-item>
            </el-col>
            <el-col :span="17">
              <el-row :gutter="12">
                <el-col :span="24">
                  <el-form-item label="文章标签" prop="tags">
                    <el-input v-model="form.tags" maxlength="255" placeholder="多个标签使用逗号分隔，例如：Ping,网络监控,IPv6" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="发布时间" prop="publishTime">
                    <el-date-picker
                      v-model="form.publishTime"
                      type="datetime"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      placeholder="发布时留空则立即发布"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="排序" prop="sortOrder">
                    <el-input-number v-model="form.sortOrder" :min="0" :max="999999" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="推荐" prop="featured">
                    <el-switch v-model="form.featured" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="24">
              <el-form-item label="文章正文" prop="content">
                <editor v-model="form.content" :min-height="420" :height="420" :file-size="8" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-divider content-position="left">搜索引擎配置</el-divider>
            </el-col>
            <el-col :span="24">
              <el-form-item label="SEO标题" prop="seoTitle">
                <el-input v-model="form.seoTitle" maxlength="255" placeholder="留空时使用文章标题" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="SEO描述" prop="seoDescription">
                <el-input v-model="form.seoDescription" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="留空时使用文章摘要" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="SEO关键词" prop="seoKeywords">
                <el-input v-model="form.seoKeywords" maxlength="255" placeholder="多个关键词使用逗号分隔" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" maxlength="512" placeholder="仅后台可见" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="buttonLoading" @click="submitForm">保存文章</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PingBlog" lang="ts">
import { addBlogPost, deleteBlogPosts, getBlogPost, listBlogPosts, updateBlogPost } from '@/api/ping/blog';
import type { PingBlogPostForm, PingBlogPostQuery, PingBlogPostVO } from '@/api/ping/blog/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' }
];
const blogList = ref<PingBlogPostVO[]>([]);
const loading = ref(true);
const buttonLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const blogFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({ visible: false, title: '' });

const initFormData: PingBlogPostForm = {
  id: undefined,
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverOssId: null,
  category: '网络技术',
  tags: '',
  status: 'draft',
  featured: false,
  sortOrder: 0,
  publishTime: undefined,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  remark: ''
};

const data = reactive<PageData<PingBlogPostForm, PingBlogPostQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    category: '',
    status: ''
  },
  rules: {
    title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
    category: [{ required: true, message: '文章分类不能为空', trigger: 'blur' }],
    summary: [{ required: true, message: '文章摘要不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '文章正文不能为空', trigger: 'change' }],
    status: [{ required: true, message: '请选择发布状态', trigger: 'change' }]
  }
});

const { form, queryParams, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  try {
    const response = await listBlogPosts(queryParams.value);
    blogList.value = response.rows;
    total.value = response.total;
  } finally {
    loading.value = false;
  }
};

const reset = () => {
  form.value = { ...initFormData };
  blogFormRef.value?.resetFields();
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

const handleSelectionChange = (selection: PingBlogPostVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  dialog.title = '新增博客文章';
  dialog.visible = true;
};

const handleUpdate = async (row?: PingBlogPostVO) => {
  reset();
  const id = row?.id || ids.value[0];
  const response = await getBlogPost(id);
  Object.assign(form.value, response.data);
  dialog.title = '编辑博客文章';
  dialog.visible = true;
};

const generateSlug = () => {
  const generated = form.value.title
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  form.value.slug = generated || `post-${crypto.randomUUID().slice(0, 8)}`;
};

const submitForm = () => {
  blogFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.id ? await updateBlogPost(form.value) : await addBlogPost(form.value);
      proxy?.$modal.msgSuccess('保存成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleDelete = async (row?: PingBlogPostVO) => {
  const selectedIds = row?.id || ids.value;
  await proxy?.$modal.confirm(`是否确认删除文章“${row?.title || selectedIds}”？`);
  await deleteBlogPosts(selectedIds);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

onMounted(getList);
</script>

<style scoped>
.blog-cover-thumb {
  width: 80px;
  height: 50px;
  border-radius: 4px;
}

.blog-title-cell {
  min-width: 0;
}

.blog-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.blog-title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blog-slug {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blog-dialog-body {
  max-height: 78vh;
  overflow-y: auto;
  padding-right: 10px;
}
</style>
