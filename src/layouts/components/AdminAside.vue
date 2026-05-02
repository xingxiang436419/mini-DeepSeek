<template>
  <div class="w-full h-full flex flex-col">
    <div
      v-for="item in historys"
      :key="item.id"
      @click="routeChange(item.id)"
      class="group flex items-center px-3 py-2.5 mb-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200"
    >
      <div class="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-blue-500 transition-colors duration-200 mr-3 shrink-0"></div>
      <span
        class="text-sm text-gray-600 group-hover:text-gray-900 truncate transition-colors duration-200"
      >
        {{ item.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHistoryStore } from '@/stores/historyList';

const historyStore = useHistoryStore();
const historys = toRef(historyStore, 'historys');
const router = useRouter();

function routeChange(id) {
  historyStore.getcurrentTalking(id);
  router.push(`/talking/${id}`);
}

onMounted(() => {
  historyStore.initHistory();
});
</script>

<style scoped>
</style>