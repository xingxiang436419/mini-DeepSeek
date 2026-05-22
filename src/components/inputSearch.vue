<template>
  <div class="max-w-[774px] w-[774px] inputContainer">
    <el-input
      ref="inputSearch"
      v-model="userQuestion"
      type="textarea"
      :autosize="{ minRows: 4, maxRows: 16 }"
      placeholder="给DeepSeek发送消息"
      @keydown.enter="handleEnter"
    />
    <div class="flex justify-between w-full items-center">
      <label class="file-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        <input type="file" hidden multiple>
      </label>
      <el-button type="primary" @click="sendQuestion" v-if="!isTyping"
        :disabled="userQuestion.trim().length === 0"
        class="send-btn">
        <el-icon><Promotion /></el-icon>
      </el-button>
      <el-button v-else type="primary" class="stop-btn" @click="stopTalking">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4.88C2 3.68009 2 3.08013 2.30557 2.65954C2.40426 2.52371 2.52371 2.40426 2.65954 2.30557C3.08013 2 3.68009 2 4.88 2H11.12C12.3199 2 12.9199 2 13.3405 2.30557C13.4763 2.40426 13.5957 2.52371 13.6944 2.65954C14 3.08013 14 3.68009 14 4.88V11.12C14 12.3199 14 12.9199 13.6944 13.3405C13.5957 13.4763 13.4763 13.5957 13.3405 13.6944C12.9199 14 12.3199 14 11.12 14H4.88C3.68009 14 3.08013 14 2.65954 13.6944C2.52371 13.5957 2.40426 13.4763 2.30557 13.3405C2 12.9199 2 12.3199 2 11.12V4.88Z" fill="currentColor"></path></svg>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import {useSearch} from '@/composables/search'
const {userQuestion,sendQuestion,route,skipNextRouteSync,historyStore,handleEnter,isTyping,stopTalking}=useSearch()


//用watch代替在路由守卫里获取当前对话页面的聊天界面的逻辑
watch(
  () => route.params.id,
  (id) => {
    if(skipNextRouteSync.value){
      skipNextRouteSync.value=false
      return
    }
    historyStore.getcurrentTalking(id)
  },
  { immediate: true }
)

</script>

<style>
.inputContainer{
  background-color: #fff;
  box-sizing: border-box;
  padding: 12px 12px 0 16px;
  border-radius: 20px;
  border: 1px solid #E8E8E8;
}

.inputContainer .el-textarea__inner {
  border: none;
  padding: 0;
  box-shadow: none;
  resize: none;
}

.file-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #999;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}
.file-btn:hover {
  background-color: #f0f0f0;
  color: #666;
}

.send-btn {
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  min-width: 32px !important;
}

.stop-btn {
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  min-width: 32px !important;
}
</style>
