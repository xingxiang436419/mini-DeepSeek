import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', () => {
  const historyList = ref({
    summarys:[],
    messages:[]
  })
  const historys = ref([])

  //从首页发第一条消息并跳到新会话是否要从本地存储中取数据
  const skipNextRouteSync =ref(false)

  const isTyping = ref(false)

  function getcurrentTalking(id) {
    const emptyTalking = {
      summarys: [],
      messages: []
    }

    if (!id) {
      historyList.value = emptyTalking
      return
    }

    historyList.value = JSON.parse(localStorage.getItem('history-' + id)) || emptyTalking
  }

  function savecurrentTalking(id) {
    localStorage.setItem('history-' + id, JSON.stringify(historyList.value))
  }

  function addHistory(id, text) {
    historys.value = JSON.parse(localStorage.getItem('historys')) || []
    historys.value.unshift({ id: id, text: text })
    localStorage.setItem('historys', JSON.stringify(historys.value))
  }

  function initHistory() {
    historys.value = JSON.parse(localStorage.getItem('historys')) || []
  }

  function deleteHistory(id) {
    historys.value = historys.value.filter(item => item.id !== id)
    localStorage.setItem('historys', JSON.stringify(historys.value))
    localStorage.removeItem('history-' + id)
  }

  function updateHistory(id, newText) {
    const item = historys.value.find(h => h.id === id)
    if (item) {
      item.text = newText
      localStorage.setItem('historys', JSON.stringify(historys.value))
    }
  }

  return { historyList, getcurrentTalking, savecurrentTalking, addHistory,
     historys, initHistory, deleteHistory, updateHistory ,skipNextRouteSync
    ,isTyping}
})
