<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="链接地址" prop="url">
              <el-input v-model="queryParams.url" placeholder="请输入链接地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图片地址" prop="imgUrl">
              <el-input v-model="queryParams.imgUrl" placeholder="请输入图片地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="权重" prop="weight">
              <el-input-number v-model="queryParams.weight" :min="0" controls-position="right" placeholder="请输入权重" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['web:sponsors:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['web:sponsors:edit']">
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['web:sponsors:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['web:sponsors:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="sponsorsList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="链接地址" align="center" prop="url" show-overflow-tooltip />
        <el-table-column label="图片" align="center" prop="imgUrl" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.imgUrl"
              class="sponsor-image"
              :src="scope.row.imgUrl"
              :preview-src-list="[scope.row.imgUrl]"
              preview-teleported
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column label="图片地址" align="center" prop="imgUrl" show-overflow-tooltip />
        <el-table-column label="权重" align="center" prop="weight" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['web:sponsors:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['web:sponsors:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog :title="dialog.title" v-model="dialog.visible" width="560px" append-to-body>
      <el-form ref="sponsorsFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="图片地址" prop="imgUrl">
          <el-input v-model="form.imgUrl" placeholder="请输入图片地址" />
        </el-form-item>
        <el-form-item v-if="form.imgUrl" label="图片预览">
          <el-image class="sponsor-preview" :src="form.imgUrl" :preview-src-list="[form.imgUrl]" preview-teleported fit="contain" />
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input-number v-model="form.weight" :min="0" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Sponsors" lang="ts">
import { listSponsors, getSponsors, delSponsors, addSponsors, updateSponsors } from '@/api/web/sponsors';
import { SponsorsVO, SponsorsQuery, SponsorsForm } from '@/api/web/sponsors/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const sponsorsList = ref<SponsorsVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const sponsorsFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SponsorsForm = {
  id: undefined,
  name: undefined,
  url: undefined,
  imgUrl: undefined,
  weight: 0
};
const data = reactive<PageData<SponsorsForm, SponsorsQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    url: undefined,
    imgUrl: undefined,
    weight: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    url: [{ required: true, message: '链接地址不能为空', trigger: 'blur' }],
    imgUrl: [{ required: true, message: '图片地址不能为空', trigger: 'blur' }],
    weight: [{ required: true, message: '权重不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listSponsors(queryParams.value);
  sponsorsList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  sponsorsFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: SponsorsVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加赞助商';
};

const handleUpdate = async (row?: SponsorsVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getSponsors(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改赞助商';
};

const submitForm = () => {
  sponsorsFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSponsors(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSponsors(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

const handleDelete = async (row?: SponsorsVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除赞助商编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delSponsors(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'web/sponsors/export',
    {
      ...queryParams.value
    },
    `sponsors_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.sponsor-image {
  width: 72px;
  height: 42px;
  border-radius: 4px;
}

.sponsor-preview {
  width: 180px;
  height: 90px;
  border-radius: 4px;
}
</style>
