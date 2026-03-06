import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message } from '../interface/email'
import { getHeaderValue } from '../utils'

export interface DraftState {
  draftId: string | null
  message: Message | null
  type: 'new' | 'reply' | 'forward' | 'edit'
  to: string
  subject: string
  body: string
  isMinimized: boolean
}

export const useComposerStore = defineStore('composer', () => {
  const activeComposer = ref<DraftState | null>(null)
  
  const lastUpdated = ref<number>(0) 
  const uploadingDraftId = ref<string | null>(null) 

  const openComposer = (type: 'new' | 'reply' | 'forward' | 'edit', originalEmail: Message | null = null, draftId: string | null = null) => {
    let initialTo = ''
    let initialSubject = ''
    let initialBody = ''

    if (originalEmail) {
      const headers = originalEmail.payload.headers

      if (type === 'reply') {
        initialTo = getHeaderValue(headers, 'From') || ''
        initialSubject = `Re: ${getHeaderValue(headers, 'Subject') || ''}`
        initialBody = `\n\n\n--- On ${getHeaderValue(headers, 'Date')}, ${getHeaderValue(headers, 'From')} wrote:\n> ${originalEmail.snippet}`
      } else if (type === 'forward') {
        initialSubject = `Fwd: ${getHeaderValue(headers, 'Subject') || ''}`
        initialBody = `\n\n\n--- Forwarded message ---\nFrom: ${getHeaderValue(headers, 'From') || ''}\nDate: ${getHeaderValue(headers, 'Date') || ''}\nSubject: ${getHeaderValue(headers, 'Subject') || ''}\n\n${originalEmail.snippet}`
      } else if (type === 'edit') {
        initialTo = getHeaderValue(headers, 'To') || ''
        initialSubject = getHeaderValue(headers, 'Subject') || ''
        initialBody = originalEmail.snippet || ''
      }
    }

    activeComposer.value = {
      draftId: draftId,
      type,
      message: originalEmail,
      to: initialTo,
      subject: initialSubject,
      body: initialBody,
      isMinimized: false
    }
  }

  const closeComposer = () => {
    activeComposer.value = null
  }

  const toggleMinimize = () => {
    if (activeComposer.value) {
      activeComposer.value.isMinimized = !activeComposer.value.isMinimized
    }
  }

  const triggerRefresh = () => {
    lastUpdated.value = Date.now()
  }

  const setUploading = (id: string | null) => {
    uploadingDraftId.value = id
  }

  return { 
    activeComposer, 
    lastUpdated, 
    uploadingDraftId, 
    openComposer, 
    closeComposer, 
    toggleMinimize, 
    triggerRefresh, 
    setUploading 
  }
})