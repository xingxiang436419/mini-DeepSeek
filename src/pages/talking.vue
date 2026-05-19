<template>
  <div ref="scrollContainer"
    class="h-full w-full flex flex-col items-center justify-start overflow-auto"
    @scroll="handleScroll">
    <!-- 聊天记录列表 -->
    <div class="w-[65%] m-auto  mt-[5px]">
      <talkingBorder></talkingBorder>
      <div :style="{ height: inputHeight + 'px' }"></div>
    </div>
    <!-- 输入框 -->
    <div ref="inputRef" class="bottom-0 min-h-[120px] flex flex-col fixed">
      <inputSearch></inputSearch>
      <div class="text-center p-y-[4px] font-light text-xs line-heigth-[16px] bg-white">内容由AI生成，请注意甄别</div>
    </div>
  </div>

</template>
<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import inputSearch from '@/components/inputSearch.vue'
import talkingBorder from '@/components/talkingBorder.vue';
import { useHistoryStore } from '@/stores/historyList';
import { storeToRefs } from 'pinia';

const historyStore = useHistoryStore()
const { historyList } = storeToRefs(historyStore)
const scrollContainer=ref(null)


const inputRef=ref(null)
const inputHeight=ref(145)
const inputObserver=ref(null)

function updateInputHeight(){
  if(inputRef.value){
    inputHeight.value=inputRef.value.offsetHeight
  }
}

onMounted(()=>{
  nextTick(()=>{
    updateInputHeight()

    // 使用 ResizeObserver 监听输入框高度变化
    if(inputRef.value){
      inputObserver.value=new ResizeObserver(()=>{
        updateInputHeight()
      })
      inputObserver.value.observe(inputRef.value)
    }
  })
  // 同时监听窗口大小变化（处理窗口缩放）
  window.addEventListener('resize',updateInputHeight)
})

onUnmounted(()=>{
  window.removeEventListener('resize',updateInputHeight)
  // 销毁 ResizeObserver
  if(inputObserver.value){
    inputObserver.value.disconnect()
  }
})

// 是否允许自动滚动（用户手动滚动后设为false）
const shouldAutoScroll = ref(true)
// 距离底部的阈值（像素），小于此值认为用户在底部附近
const scrollThreshold = 100

// 检查是否在底部附近（使用window级别的滚动）
function isNearBottom() {
  const { scrollHeight, offsetHeight,scrollTop} = scrollContainer.value
  // 计算距离底部的距离
  return scrollHeight - offsetHeight - scrollTop < scrollThreshold
}

// 处理滚动事件
function handleScroll() {
  // 用户手动滚动后，检查是否还在底部附近
  shouldAutoScroll.value = isNearBottom()
}

// 智能滚动到底部（使用window级别的滚动）
function scrollToBottom() {
  nextTick(() => {
    if (shouldAutoScroll.value) {
      scrollContainer.value.scrollTop=scrollContainer.value.scrollHeight
    }
  })
}

// 监听消息变化
watch(() =>historyList.value.messages , () => {
  scrollToBottom()
},{deep:true})

</script>
<style scoped>
</style>
