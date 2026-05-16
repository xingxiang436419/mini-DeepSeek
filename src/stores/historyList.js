import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', () => {
  const historyList = ref({
    summary:'',
    abstractedCursor:0,
    messages:[]
  })
  const historys = ref([])

  function getcurrentTalking(id) {
    historyList.value = JSON.parse(localStorage.getItem('history-' + id)) || {
    summary:'',
    abstractedCursor:0,
    messages:[]
    }
  }

  function savecurrentTalking(id) {
    localStorage.setItem('history-' + id, JSON.stringify(historyList.value))
  }

  function addHistory(id, text) {
    historys.value = JSON.parse(localStorage.getItem('historys')) || []
    historys.value.push({ id: id, text: text })
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

  return { historyList, getcurrentTalking, savecurrentTalking, addHistory, historys, initHistory, deleteHistory, updateHistory }
})
