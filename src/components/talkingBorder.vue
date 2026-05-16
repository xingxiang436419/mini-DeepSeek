<template>
  <div v-if="messages.length!=0" class="flex flex-col">
    <template v-for="(item,index) in messages" :key="index">
      <!-- 用户提出的问题 -->
      <div class="self-end text-right bg-blue-100 rounded p-2 m-1 max-w-[80%] inline-block break-words">
        {{ item.question }}
      </div>
      <!-- DeepSeek的解答 -->
      <div class="self-start text-left bg-gray-100 rounded p-2 m-1 max-w-[80%] inline-block break-words">
        <MarkdownRenderer :initAnswer="item.answer"></MarkdownRenderer>
      </div>
    </template>
  </div>
</template>
<script setup>
import { useHistoryStore } from '@/stores/historyList';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
const historyStore = useHistoryStore();
const { historyList } = storeToRefs(historyStore)
const messages=computed(()=>{
  return historyList.value.messages
})
</script>
<style>
</style>
