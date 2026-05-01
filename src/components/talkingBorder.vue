<template>
  <div v-if="historyList.length!=0">
    <div class="flex flex-col" v-for="(item,index) in historyList" :key="index">
      <!-- 用户提出的问题 -->
      <div class="self-end text-right bg-blue-100 rounded p-2 m-1 max-w-[80%] inline-block break-words">
        {{ item.question }}
      </div>
      <!-- DeepSeek的解答 -->
      <div class="self-start text-left bg-gray-100 rounded p-2 m-1 max-w-[80%] inline-block break-words">
        <MarkdownRenderer :initAnswer="item.answer"></MarkdownRenderer>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useHistoryStore } from '@/stores/historyList';
import MarkdownRenderer from './MarkdownRenderer.vue';
import { toRef} from 'vue';
const historyStore = useHistoryStore();
const historyList = toRef(historyStore, 'historyList')
</script>
<style>
</style>
