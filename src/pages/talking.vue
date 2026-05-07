<template>
  <!-- 聊天记录列表 -->
  <div ref="scrollContainer" class="flex-1 w-full overflow-y-auto">
    <talkingBorder></talkingBorder>
  </div>
  <!-- 输入框 -->
  <div class="self-bottom min-h-[100px] w-full mb-[10px] flex flex-col justify-end">
    <inputSearch></inputSearch>
  </div>
</template>
<script setup>
import { ref, watch, nextTick } from 'vue'
import inputSearch from '@/components/inputSearch.vue'
import talkingBorder from '@/components/talkingBorder.vue';
import { useHistoryStore } from '@/stores/historyList';
import { storeToRefs } from 'pinia';

const scrollContainer = ref(null)
const historyStore = useHistoryStore()
const { historyList } = storeToRefs(historyStore)

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

watch(() => historyList.value.length, () => {
  scrollToBottom()
})

watch(() => historyList.value[historyList.value.length - 1]?.answer, () => {
  scrollToBottom()
})
</script>
<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>