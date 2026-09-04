<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
                <el-option v-for="dict in ad_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="连接地址" prop="url">
              <el-input v-model="queryParams.url" placeholder="请输入连接地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="图片地址" prop="imgUrl">
              <el-input v-model="queryParams.imgUrl" placeholder="请输入图片地址" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="到期时间" prop="delTime">
              <el-date-picker clearable v-model="queryParams.delTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择到期时间" />
            </el-form-item>
            <el-form-item label="权重" prop="weight">
              <el-input v-model="queryParams.weight" placeholder="请输入权重" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['web:adLinks:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['web:adLinks:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['web:adLinks:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['web:adLinks:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="adLinksList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键" align="center" prop="id" v-if="true" />
        <el-table-column label="名称" align="center" prop="name" />
        <el-table-column label="类型" align="center" prop="type">
          <template #default="scope">
            <dict-tag :options="ad_type" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="连接地址" align="center" prop="url" />
        <el-table-column label="图片地址" align="center" prop="imgUrl" />
        <el-table-column label="到期时间" align="center" prop="delTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.delTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权重" align="center" prop="weight" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['web:adLinks:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['web:adLinks:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改广告链接对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="adLinksFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option v-for="dict in ad_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入连接地址" />
        </el-form-item>
        <el-form-item label="图片地址" prop="imgUrl">
          <el-input v-model="form.imgUrl" placeholder="请输入图片地址" />
        </el-form-item>
        <el-form-item label="到期时间" prop="delTime">
          <el-date-picker clearable v-model="form.delTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择到期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input v-model="form.weight" placeholder="请输入权重" />
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

<script setup name="AdLinks" lang="ts">
import { listAdLinks, getAdLinks, delAdLinks, addAdLinks, updateAdLinks } from '@/api/web/adLinks';
import { AdLinksVO, AdLinksQuery, AdLinksForm } from '@/api/web/adLinks/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ad_type } = toRefs<any>(proxy?.useDict('ad_type'));

const adLinksList = ref<AdLinksVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const adLinksFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AdLinksForm = {
  id: undefined,
  name: undefined,
  type: undefined,
  url: undefined,
  imgUrl: undefined,
  delTime: undefined,
  weight: 0
};
const data = reactive<PageData<AdLinksForm, AdLinksQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    type: undefined,
    url: undefined,
    imgUrl: undefined,
    delTime: undefined,
    weight: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
    url: [{ required: true, message: '连接地址不能为空', trigger: 'blur' }],
    imgUrl: [{ required: true, message: '图片地址不能为空', trigger: 'blur' }],
    delTime: [{ required: true, message: '到期时间不能为空', trigger: 'blur' }],
    weight: [{ required: true, message: '权重不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询广告链接列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAdLinks(queryParams.value);
  adLinksList.value = res.rows;
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
  adLinksFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: AdLinksVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加广告链接';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AdLinksVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAdLinks(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改广告链接';
};

/** 提交按钮 */
const submitForm = () => {
  adLinksFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAdLinks(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addAdLinks(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AdLinksVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除广告链接编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delAdLinks(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'web/adLinks/export',
    {
      ...queryParams.value
    },
    `adLinks_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
