<template>
  <div class="w-full h-full flex flex-col">
    <div
      v-for="item in historys"
      :key="item.id"
      @click="routeChange(item.id)"
      :class="[
        'group flex items-center px-3 py-2.5 mb-1.5 rounded-lg cursor-pointer transition-all duration-200',
        { 'active':Number(item.id) === Number(route.params.id) ,'hover:bg-gray-200': !isActive(item.id)}
      ]"
    >
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
  </div>
</template>

<script setup>
import { toRef, onMounted } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import { useHistoryStore } from '@/stores/historyList';

const historyStore = useHistoryStore();
const historys = toRef(historyStore, 'historys');
const router = useRouter();
const route=useRoute()
function routeChange(id) {
  router.push(`/talking/${id}`);
}

function isActive(id){
  return Number(route.params.id) === Number(id);
}

onMounted(() => {
  historyStore.initHistory();
});
</script>

<style scoped>
.active {
  @apply bg-green-400;
}
</style>
