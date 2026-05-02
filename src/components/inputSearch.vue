<template>
  <el-input
  ref="inputSearch"
  v-model="userQuestion"
  type="textarea"
  :autosize="{ minRows: 4, maxRows: 16 }"
  placeholder="给DeepSeek发送消息"
  @keydown.enter="handleEnter"
  />
  <div class="flex justify-between w-full">
    <input type="file">
    <el-button type="primary" @click="sendQuestion"
    :isLoading="isTyping"
    :disabled="userQuestion.trim().length==0">发送</el-button>
  </div>
</template>

<script setup>
import {ref, computed,toRef, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import {useHistoryStore} from '@/stores/historyList'
const router = useRouter()
const route = useRoute()
const userQuestion = ref('')
const isTyping = ref(false)
const assistantAnswer = ref('')
let routeId = computed(()=>{
  const val=route.params.id
  return val?val:null
})
const historyStore = useHistoryStore()
let currentList= toRef(historyStore,'historyList')


onMounted(()=>{
    if(routeId.value){
      console.log('测试onmounted的执行时机')
      historyStore.getcurrentTalking(routeId.value)
    }else{
      historyStore.historyList=[]
    }
})


async function sendQuestion() {
  if (!userQuestion.value.trim()) return

  const question = userQuestion.value
  userQuestion.value = ''
  isTyping.value = true // 开启按钮的 loading 状态

  try {
    // 1. 发送标准 POST 请求
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-8f4a545bcde1428aaaaae4f0ab89b939`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: question }
        ],
        stream: false // 【关键】设置为 false，表示非流式，直接返回结果
      })
    })

    // 2. 解析 JSON 格式的返回结果
    const data = await response.json()

    // 3. 提取 AI 回复的内容并赋值
    // DeepSeek 的返回结构是 data.choices[0].message.content
    assistantAnswer.value = data.choices[0].message.content
    currentList.value.push({question,answer:assistantAnswer.value})

    let tempId=null
    //实现路由跳转
    tempId= routeId.value?routeId.value:null
    if(!tempId){
      tempId=tempId?tempId:Date.now()
      const sumMessage= summarizeText(assistantAnswer.value)
      historyStore.addHistory(tempId,sumMessage)
    }
    router.push(`/talking/${tempId}`)
    historyStore.savecurrentTalking(tempId)


  } catch (error) {
    console.error('接口调用失败:', error)
  } finally {
    isTyping.value = false // 关闭 loading
  }
}

function summarizeText(text) {
  // 1. 去掉 Markdown 标签（比如代码块、加粗等）
  let cleanText = text.replace(/[#*`]/g, '').trim()

  // 2. 替换掉换行符，变成空格
  cleanText = cleanText.replace(/\n/g, ' ')

  // 3. 截取长度
  const maxLength = 12
  return cleanText.length > maxLength
    ? cleanText.substring(0, maxLength) + '...'
    : cleanText
}
function handleEnter(event) {
  if (event.shiftKey) {
    return
  }
  event.preventDefault()
  sendQuestion()
}
</script>

<style>

</style>

