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
        <input type="file" hidden>
      </label>
      <el-button type="primary" @click="sendQuestion" v-if="!isTyping"
        :disabled="userQuestion.trim().length === 0"
        class="send-btn">
        <el-icon><Promotion /></el-icon>
      </el-button>
      <el-button v-else type="primary" class="stop-btn">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4.88C2 3.68009 2 3.08013 2.30557 2.65954C2.40426 2.52371 2.52371 2.40426 2.65954 2.30557C3.08013 2 3.68009 2 4.88 2H11.12C12.3199 2 12.9199 2 13.3405 2.30557C13.4763 2.40426 13.5957 2.52371 13.6944 2.65954C14 3.08013 14 3.68009 14 4.88V11.12C14 12.3199 14 12.9199 13.6944 13.3405C13.5957 13.4763 13.4763 13.5957 13.3405 13.6944C12.9199 14 12.3199 14 11.12 14H4.88C3.68009 14 3.08013 14 2.65954 13.6944C2.52371 13.5957 2.40426 13.4763 2.30557 13.3405C2 12.9199 2 12.3199 2 11.12V4.88Z" fill="currentColor"></path></svg>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed,watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/historyList'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const userQuestion = ref('')
const isNewTalking=ref(false)


const routeId = computed(() => {
  const val = route.params.id
  return val ? val : null
})

const historyStore = useHistoryStore()
const { historyList: currentList,skipNextRouteSync,isTyping} = storeToRefs(historyStore)

//已摘要游标
const abstractedCursor = computed({
  get() {
    return currentList.value.abstractedCursor
  },
  set(value) {
    currentList.value.abstractedCursor = value
  }
})


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

async function sendQuestion() {
  if (!userQuestion.value.trim()) return

  const question = userQuestion.value
  userQuestion.value = ''


  //构造发送请求时的message
  const messages = buildMessages(question)

  // 【关键】流式开始时就创建消息条目
  const newMessage = { question, answer: '' }
  currentList.value.messages.push(newMessage)

  // 【修正】从数组里把刚刚 push 进去的那个 Proxy 拿出来
  const reactiveMessage = currentList.value.messages[currentList.value.messages.length - 1]


  try {
    isTyping.value = true // 开启按钮的 loading 状态

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


    //页面跳转
    let tempId = routeId.value ? routeId.value : null
    if (!tempId) {
      isNewTalking.value=true
      tempId = Date.now()
      historyStore.addHistory(tempId, '新对话')
      skipNextRouteSync.value=true
      // console.log('第四个测试点执行了\n'+skipNextRouteSync.value)
      await router.push(`/talking/${tempId}`)
    }



    // 【关键】流式处理数据
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      // 处理流式输出，实现打字机效果
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

    //生成当前对话的总结
    isTyping.value = false
    if(isNewTalking.value){
      const sumMessage = summarizeText(reactiveMessage.answer)
      historyStore.updateHistory(tempId,sumMessage)
      isNewTalking.value=false
    }


    await generateSum()
    historyStore.savecurrentTalking(tempId)


  } catch (error) {
    console.error('接口调用失败:', error)
    currentList.value.messages.pop()
  } finally {
    // isTyping.value = false
  }
}

function buildMessages(newQuestion) {
  const messages = []

  // 1. 添加系统提示（可选，让 AI 扮演特定角色）
  // messages.push({
  //   role: "system",
  //   content: "你是一个有用且智能的 AI 助手。"
  // })


  if(currentList.value.summary){
    messages.push(
      {
        role:'system',
        content:`以下是此前对话记录摘要：${currentList.value.summary}。可以将其作为后续回答问题时的上下文参考，以便更好的回答用户的问题`
      }
    )
  }

  const recentList=currentList.value.messages.slice(-6)
  // 2. 遍历历史对话，组装 messages
  for (const item of recentList) {
    if(item.question){
      messages.push({ role: "user", content: item.question })
    }
    if(item.answer){
      messages.push({ role: "assistant", content: item.answer })
    }
  }

  // 3. 添加当前问题
  messages.push({ role: "user", content: newQuestion })

  return messages
}

async function generateSum(){
  if(currentList.value.messages.length<=6){
    return ''
  }else{
    let messageToSum=[]

    for(const item of currentList.value.messages.slice(abstractedCursor.value,-6)){
      if(item.question){
        messageToSum.push({role:'user',content:item.question})
      }
      if(item.answer){
        messageToSum.push({role:'assistant',content:item.answer})
      }
    }

      messageToSum.push({
      role: 'user',
      content: `总结精炼历史对话并返回，要求格式为：\n User:... \n AI:... \n`
    })

    abstractedCursor.value+=1

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-8f4a545bcde1428aaaaae4f0ab89b939`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messageToSum,
        stream: false  // 关闭流式
      })
    })

    const data=await response.json()
    currentList.value.summary = currentList.value.summary+`第${abstractedCursor.value}次对话:`+ `${data.choices?.[0]?.message?.content||''}`
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
