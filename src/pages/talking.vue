<template>
  <!-- 聊天记录列表 -->
  <div
    ref="scrollContainer"
    class="flex-1 w-full overflow-y-auto"
    @scroll="handleScroll"
  >
    <talkingBorder></talkingBorder>
  </div>
  <!-- 输入框 -->
  <div class="self-bottom min-h-[100px] w-full mb-[10px] flex flex-col justify-end">
    <inputSearch></inputSearch>
  </div>
</template>
<script setup>
import { ref, watch, nextTick, } from 'vue'
import inputSearch from '@/components/inputSearch.vue'
import talkingBorder from '@/components/talkingBorder.vue';
import { useHistoryStore } from '@/stores/historyList';
import { storeToRefs } from 'pinia';

const scrollContainer = ref(null)
const historyStore = useHistoryStore()
const { historyList } = storeToRefs(historyStore)

// 是否允许自动滚动（用户手动滚动后设为false）
const shouldAutoScroll = ref(true)
// 距离底部的阈值（像素），小于此值认为用户在底部附近
const scrollThreshold = 100

// 检查是否在底部附近
function isNearBottom() {
  if (!scrollContainer.value) return true
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  // 计算距离底部的距离
  return scrollHeight - scrollTop - clientHeight < scrollThreshold
}

// 处理滚动事件
function handleScroll() {
  // 用户手动滚动后，检查是否还在底部附近
  shouldAutoScroll.value = isNearBottom()
}

// 智能滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value && shouldAutoScroll.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

// 监听消息变化
watch(() => historyList.value.messages.length, () => {
  scrollToBottom()
})

watch(() => historyList.value.messages[historyList.value.messages.length - 1]?.answer, () => {
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
