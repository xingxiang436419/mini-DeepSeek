import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHistoryStore } from '@/stores/historyList'
import { storeToRefs } from 'pinia'


export function useSearch(){

  const router = useRouter()
  const route = useRoute()
  const userQuestion = ref('')
  const isNewTalking=ref(false)
  const currentController=ref(null)



  const routeId = computed(() => {
    const val = route.params.id
    return val ? val : null
  })

  const historyStore = useHistoryStore()
  const { historyList: currentList,skipNextRouteSync,isTyping} = storeToRefs(historyStore)



  function stopTalking(){
    currentController.value.abort()
  }

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

    let tempId = routeId.value ? routeId.value : null
    //页面跳转
    if (!tempId) {
      isNewTalking.value=true
      tempId = Date.now()
      historyStore.addHistory(tempId, '新对话')
      skipNextRouteSync.value=true
      // console.log('第四个测试点执行了\n'+skipNextRouteSync.value)
      await router.push(`/talking/${tempId}`)
    }

    try {
      isTyping.value = true // 开启按钮的 loading 状态

      const controller=new AbortController()
      currentController.value=controller


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
        }),
        signal:controller.signal
      })


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
      if(error.name==='AbortError'){
        //生成当前对话的总结
        isTyping.value = false
        if(isNewTalking.value){
          const sumMessage = summarizeText(reactiveMessage.answer)
          historyStore.updateHistory(tempId,sumMessage)
          isNewTalking.value=false
        }

        await generateSum()
        historyStore.savecurrentTalking(tempId)

      }else{
        console.error('接口调用失败:', error)
        currentList.value.messages.pop()
      }
    } finally {
      isTyping.value = false
      currentController.value = null
    }
  }

  function buildMessages(newQuestion) {
    const messages = []

    // 1. 添加系统提示（可选，让 AI 扮演特定角色）
    // messages.push({
    //   role: "system",
    //   content: "你是一个有用且智能的 AI 助手。"
    // })


    if(currentList.value.summarys.length!=0){
      messages.push(
        {
          role:'system',
          content:`以下是此前对话记录摘要：${currentList.value.summarys.join('\n')}。可以将其作为后续回答问题时的上下文参考，以便更好的回答用户的问题`
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

      for(const item of currentList.value.messages.slice(currentList.value.summarys.length,-6)){
        if(item.question){
          messageToSum.push({role:'user',content:item.question})
        }
        if(item.answer){
          messageToSum.push({role:'assistant',content:item.answer})
        }
      }

        messageToSum.push({
        role: 'user',
        content: `总结精炼历史对话并返回，要求格式为(不要说其他任何的废话，就按照我说的格式返回)： User:... \n AI:... \n`
      })


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
      currentList.value.summarys.push(`${data.choices?.[0]?.message?.content||''}`)
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

  return {handleEnter,currentList,skipNextRouteSync,
    sendQuestion,route,historyStore,userQuestion,isTyping,
    stopTalking
    }
}
