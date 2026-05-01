<template>
  <!-- 聊天记录列表 -->
  <div class="flex-1 w-full overflow-y-auto">
    <talkingBorder></talkingBorder>
  </div>
  <!-- 输入框 -->
  <div class="self-bottom h-[150px] z-1 w-full mt-5">
    <inputSearch></inputSearch>
  </div>
</template>
<script setup>
import inputSearch from '@/components/inputSearch.vue'
import talkingBorder from '@/components/talkingBorder.vue';
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
