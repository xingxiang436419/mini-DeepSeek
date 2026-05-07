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
      :loading="isTyping"
      :disabled="userQuestion.trim().length === 0">发送</el-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted,isProxy } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/historyList'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const userQuestion = ref('')
const isTyping = ref(false)

const routeId = computed(() => {
  const val = route.params.id
  return val ? val : null
})

const historyStore = useHistoryStore()
const { historyList: currentList } = storeToRefs(historyStore)

onMounted(() => {
  if (routeId.value) {
    historyStore.getcurrentTalking(routeId.value)
  } else {
    historyStore.historyList = []
  }
})

async function sendQuestion() {
  if (!userQuestion.value.trim()) return

  const question = userQuestion.value
  userQuestion.value = ''
  isTyping.value = true // 开启按钮的 loading 状态

  // 【关键】流式开始时就创建消息条目
  const newMessage = { question, answer: '' }
  currentList.value.push(newMessage)

  // 【修正】从数组里把刚刚 push 进去的那个 Proxy 拿出来
  const reactiveMessage = currentList.value[currentList.value.length - 1]



  try {
    const messages = buildMessages(question)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-8f4a545bcde1428aaaaae4f0ab89b939`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: true  // 开启流式
      })
    })

    // 【关键】流式处理数据
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            const content = data.choices[0]?.delta?.content || ''
            // 【关键】实时更新答案，触发响应式更新
            // console.log('当前操作的是否是响应式对象：',isProxy(newMessage)?'是':'否') 打印结果：否
            // newMessage.answer += content

            // 随后的循环里操作这个 reactiveMessage
            // console.log('当前操作的是否是响应式对象：',isProxy(reactiveMessage)?'是':'否') 打印结果：是
            reactiveMessage.answer += content

            // 这里的 delay 才是为了控制视觉上的“匀速”
            await new Promise(resolve => setTimeout(resolve, 30));
          } catch (e) {
            console.error('解析失败:', e)
          }
        }
      }
    }

    let tempId = routeId.value ? routeId.value : null
    if (!tempId) {
      tempId = Date.now()
      const sumMessage = summarizeText(newMessage.answer)
      historyStore.addHistory(tempId, sumMessage)
    }
    router.push(`/talking/${tempId}`)
    historyStore.savecurrentTalking(tempId)

  } catch (error) {
    console.error('接口调用失败:', error)
    currentList.value.pop()
  } finally {
    isTyping.value = false
  }
}

function buildMessages(newQuestion) {
  const messages = []

  // 1. 添加系统提示（可选，让 AI 扮演特定角色）
  // messages.push({
  //   role: "system",
  //   content: "你是 DeepSeek，一个有用且智能的 AI 助手。"
  // })

  // 2. 遍历历史对话，组装 messages
  for (const item of currentList.value) {
    messages.push({ role: "user", content: item.question })
    messages.push({ role: "assistant", content: item.answer })
  }

  // 3. 添加当前问题
  messages.push({ role: "user", content: newQuestion })

  return messages
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
