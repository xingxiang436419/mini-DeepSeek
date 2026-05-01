import { ref} from 'vue'
import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', () => {
  const historyList = ref([])
  const historys = ref([])

  function getcurrentTalking(id){
    historyList.value = JSON.parse(localStorage.getItem('history-'+id)) || []
  }

  function savecurrentTalking(id){
    localStorage.setItem('history-'+id, JSON.stringify(historyList.value))
  }

  function addHistory(id, text){
    historys.value = JSON.parse(localStorage.getItem('historys')) || []
    historys.value.push({id: id, text: text})
    localStorage.setItem('historys', JSON.stringify(historys.value))
  }

  function initHistory(){
    historys.value = JSON.parse(localStorage.getItem('historys')) || []
  }


  return { historyList, getcurrentTalking, savecurrentTalking, addHistory, historys, initHistory }
})

