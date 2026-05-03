<template>
  <div class="w-full h-full flex flex-col">
    <div
      v-for="item in historys"
      :key="item.id"
      @click="routeChange(item.id)"
      :class="[
        'group flex items-center justify px-3 py-2.5 mb-1.5 rounded-lg cursor-pointer transition-all duration-200',
        { 'active': Number(item.id) === Number(route.params.id), 'hover:bg-gray-200': !isActive(item.id) }
      ]"
    >
      <template v-if="editingId !== item.id">
        <!-- 正常显示状态 -->
        <div class="flex items-center flex-1 min-w-0">
          <div
            :class="[
              'w-2 h-2 rounded-full transition-colors duration-200 mr-3 shrink-0',
              isActive(item.id) ? 'bg-blue-500' : 'bg-gray-400 group-hover:bg-blue-500'
            ]"
          ></div>
          <span
            :class="[
              'text-sm truncate transition-colors duration-200',
              isActive(item.id) ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
            ]"
          >
            {{ item.text }}
          </span>
        </div>
        <!-- 右侧下拉菜单 -->
        <span
          @click.stop
          class="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
        >
          <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, item.id)">
            <el-icon class="text-gray-500"><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">
                  <el-icon><EditPen /></el-icon>
                  重命名</el-dropdown-item>
                <el-dropdown-item command="delete">
                  <el-icon><Delete /></el-icon>
                  删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </template>
      <template v-else>
        <!-- 编辑状态：显示 input -->
        <input
          ref="editInput"
          v-model="editText"
          @blur="finishEdit(item.id)"
          @keydown.enter="finishEdit(item.id)"
          class="flex-1 px-2 py-1 text-sm border border-blue-500 rounded outline-none"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted, ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useHistoryStore } from '@/stores/historyList';
// import { ElMessage, ElMessageBox } from 'element-plus'

const historyStore = useHistoryStore();
const historys = toRef(historyStore, 'historys');
const router = useRouter();
const route = useRoute();

const editingId = ref(null);
const editText = ref('');

function isActive(id) {
  return Number(id) === Number(route.params.id);
}

function routeChange(id) {
  router.push(`/talking/${id}`);
}

onMounted(() => {
  historyStore.initHistory();
});

function handleCommand(command, id) {
  switch (command) {
    case 'rename':
      startEdit(id);
      break;
    case 'delete':
      // ElMessageBox.confirm(
      // '删除后，该对话不可恢复，请确认是否删除？',
      // '永久删除对话',
      // {
      //   confirmButtonText: '删除',
      //   cancelButtonText: '取消',
      //   type: 'warning',
      // }).then(() => {
      //   ElMessage({
      //     type: 'success',
      //     message: '删除成功',
      //   })
        historyStore.deleteHistory(id);
        router.push('/');
      // })
      break;
  }
}

function startEdit(id) {
  const item = historys.value.find(h => h.id === id);
  if (item) {
    editingId.value = id;
    editText.value = item.text;
    nextTick(() => {
      const input = document.querySelector('.edit-input-focus');
      if (input) input.focus();
    });
  }
}

function finishEdit(id) {
  if (editText.value.trim()) {
    historyStore.updateHistory(id, editText.value.trim());
  }
  editingId.value = null;
  editText.value = '';
}
</script>

<style scoped>
.active {
  @apply bg-blue-200;
}
.edit-input-focus {
  @apply outline-none;
}
</style>
