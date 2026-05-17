<template>
  <div v-if="messages.length!=0" class="flex flex-col p-x-[4px]">
    <template v-for="(item,index) in messages" :key="index">
      <!-- 用户提出的问题 -->
      <div class="flex justify-end items-start m-1 gap-2">
        <div class="self-end text-right bg-blue-100 rounded p-2 max-w-[80%] inline-block break-words msg-bubble user-bubble">
          {{ item.question }}
        </div>
        <div class="msg-avatar user-avatar flex-shrink-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
      <!-- DeepSeek的解答 -->
      <div class="flex justify-start items-start m-1 gap-2">
        <div class="msg-avatar ai-avatar flex-shrink-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div class="self-start text-left rounded p-2 max-w-[80%] inline-block break-words msg-bubble ai-bubble">
          <MarkdownRenderer :initAnswer="item.answer"></MarkdownRenderer>
        </div>
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
.msg-bubble {
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s;
}
.msg-bubble:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.ai-bubble {
  background: #f8f9fa;
  border: 1px solid #f0f0f0;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  color: #fff;
}
.user-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.ai-avatar {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}
</style>
