<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="拦截检测">
              <el-input v-model="checkValue" placeholder="请输入URL或IP" clearable @keyup.enter="handleCheck" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" icon="Search" :loading="checkLoading" @click="handleCheck">检测</el-button>
            </el-form-item>
            <el-form-item v-if="checkResult">
              <el-tag :type="checkResult.blocked ? 'danger' : 'success'">
                {{ checkResult.blocked ? `已命中：${checkResult.value}（${checkResult.matchType}）` : '未命中' }}
              </el-tag>
            </el-form-item>
            <el-form-item label="匹配值" prop="value">
              <el-input v-model="queryParams.value" placeholder="请输入匹配值" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="是否生效" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择是否生效" clearable>
                <el-option v-for="dict in url_blacklist_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="拦截到期时间" prop="stopTime">
              <el-date-picker clearable v-model="queryParams.stopTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择拦截到期时间" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['web:blacklist:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['web:blacklist:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['web:blacklist:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['web:blacklist:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="blacklistList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="匹配值" align="center" prop="value" />
        <el-table-column label="是否生效" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="url_blacklist_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="拦截到期时间" align="center" prop="stopTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.stopTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['web:blacklist:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['web:blacklist:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改域名黑名单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blacklistFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="匹配值" prop="value">
          <el-input v-model="form.value" placeholder="请输入匹配值" />
        </el-form-item>
        <el-form-item label="是否生效" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in url_blacklist_status" :key="dict.value" :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="拦截到期时间" prop="stopTime">
          <el-date-picker clearable v-model="form.stopTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择拦截到期时间">
          </el-date-picker>
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

<script setup name="Blacklist" lang="ts">
import { listBlacklist, getBlacklist, delBlacklist, addBlacklist, updateBlacklist, infoBlacklist } from '@/api/web/blacklist';
import { BlacklistVO, BlacklistQuery, BlacklistForm, BlacklistInfoVO } from '@/api/web/blacklist/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { url_blacklist_status } = toRefs<any>(proxy?.useDict('url_blacklist_status'));

const blacklistList = ref<BlacklistVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const checkValue = ref('');
const checkLoading = ref(false);
const checkResult = ref<BlacklistInfoVO>();

const queryFormRef = ref<ElFormInstance>();
const blacklistFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BlacklistForm = {
  id: undefined,
  value: undefined,
  status: undefined,
  stopTime: undefined
};
const data = reactive<PageData<BlacklistForm, BlacklistQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    value: undefined,
    status: undefined,
    stopTime: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'ID不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询域名黑名单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listBlacklist(queryParams.value);
  blacklistList.value = res.rows;
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
  blacklistFormRef.value?.resetFields();
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

/** 拦截检测 */
const handleCheck = async () => {
  if (!checkValue.value) {
    proxy?.$modal.msgWarning('请输入URL或IP');
    return;
  }
  checkLoading.value = true;
  try {
    const res = await infoBlacklist(checkValue.value);
    checkResult.value = res.data;
  } finally {
    checkLoading.value = false;
  }
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: BlacklistVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加域名黑名单';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: BlacklistVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getBlacklist(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改域名黑名单';
};

/** 提交按钮 */
const submitForm = () => {
  blacklistFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateBlacklist(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBlacklist(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: BlacklistVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除域名黑名单编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delBlacklist(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'web/blacklist/export',
    {
      ...queryParams.value
    },
    `blacklist_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
