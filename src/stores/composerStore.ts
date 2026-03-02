import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message } from '../interface/email'
import { getHeaderValue } from '../utils'

export interface DraftState {
  draftId: string | null
  type: 'new' | 'reply' | 'forward'
  to: string
  subject: string
  body: string
  isMinimized: boolean
}

export const useComposerStore = defineStore('composer', () => {
  const activeComposer = ref<DraftState | null>(null)

  const openComposer = (type: 'new' | 'reply' | 'forward', originalEmail: Message | null = null) => {
    let initialTo = ''
    let initialSubject = ''
    let initialBody = ''

    if (originalEmail) {
      const headers = originalEmail.payload.headers
      const from = getHeaderValue(headers, 'From') || ''
      const subject = getHeaderValue(headers, 'Subject') || ''
      const date = getHeaderValue(headers, 'Date') || ''
      const snippet = originalEmail.snippet || ''
      const textPlain = originalEmail.text_plain || ''

      if (type === 'reply') {
        initialTo = from
        initialSubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`
        initialBody = `\n\n\n--- On ${date}, ${from} wrote:\n> ${snippet}`
      } else if (type === 'forward') {
        initialSubject = subject.startsWith('Fwd:') ? subject : `Fwd: ${subject}`
        initialBody = `\n\n\n--- Forwarded message ---\nFrom: ${from}\nDate: ${date}\nSubject: ${subject}\n\n${textPlain || snippet}`
      }
    }

    activeComposer.value = {
      draftId: null,
      type,
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

  return { activeComposer, openComposer, closeComposer, toggleMinimize }
})