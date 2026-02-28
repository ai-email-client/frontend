import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(true)
  
  const setLoading = (status: boolean) => {
    isLoading.value = status
  }

  return { isLoading, setLoading }
})