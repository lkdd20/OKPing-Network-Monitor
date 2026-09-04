<template>
  <section class="command-block">
    <div class="command-block__header">
      <span class="command-block__title">{{ title }}</span>
      <el-tooltip content="复制命令" placement="top">
        <el-button :disabled="!command" link type="primary" icon="DocumentCopy" @click="copyCommand" />
      </el-tooltip>
    </div>
    <pre class="command-block__content"><code>{{ command || emptyText }}</code></pre>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    command?: string;
    emptyText?: string;
  }>(),
  {
    command: '',
    emptyText: '暂无可用命令'
  }
);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const copyCommand = async () => {
  if (!props.command) {
    return;
  }
  try {
    await navigator.clipboard.writeText(props.command);
    proxy?.$modal.msgSuccess('命令已复制');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.command;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    proxy?.$modal.msgSuccess('命令已复制');
  }
};
</script>

<style scoped lang="scss">
.command-block {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.command-block__header {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-light);
}

.command-block__title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.command-block__content {
  min-height: 88px;
  max-height: 300px;
  margin: 0;
  overflow: auto;
  padding: 14px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
