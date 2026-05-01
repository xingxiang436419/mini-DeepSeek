<template>
  <div class="w-full h-full flex flex-col justify-start items-center">
    我是用户以前的对话记录
    <div v-for="(item) in historys" :key="item.id">
      <span
        @click="$router.push(`/talking/${item.id}`)"
        class="cursor-pointer">
        {{ item.text }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { toRef, onMounted } from 'vue';
// import { useRoute } from 'vue-router';
import { useHistoryStore } from '@/stores/historyList';
const historyStore = useHistoryStore();
const historys = toRef(historyStore, 'historys')
// const route=useRoute()

onMounted(()=>{
  // historyStore.getcurrentTalking(route.params.id)
  historyStore.initHistory()
})

</script>

<style>

</style>
