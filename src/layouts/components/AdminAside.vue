<template>
  <div class="w-full h-full flex flex-col justify-start items-center">
    我是用户以前的对话记录
    <div v-for="(item) in historys" :key="item.id" @click="routeChange(item.id)"
    class="h-[40px] mt-3 line-height-[40px]">
      <span
        class="cursor-pointer">
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
const historys = toRef(historyStore, 'historys')
const router=useRouter()

function routeChange(id){
  historyStore.getcurrentTalking(id)
  router.push(`/talking/${id}`)
}
onMounted(()=>{
  // historyStore.getcurrentTalking(route.params.id)
  historyStore.initHistory()
})

</script>

<style>

</style>
