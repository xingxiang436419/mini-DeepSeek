import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAsideStore = defineStore('aside', () => {
  const asideWidth = ref(1)
  return { asideWidth }
})
