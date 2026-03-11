import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message } from '../interface/email'

export interface DraftState {
  draftId: string | null
  threadId: string | null
  messageId: string | null
  message: Message | null
  type: 'new' | 'reply' | 'forward' | 'edit'
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  in_reply_to: string | null 
  references: string | null
  quotedBody: string | null 
  isMinimized: boolean
}

export const useComposerStore = defineStore('composer', () => {
  const activeComposer = ref<DraftState | null>(null)
  const lastUpdated = ref<number>(0)
  const uploadingDraftId = ref<string | null>(null)

  const openComposer = (
    type: 'new' | 'reply' | 'forward' | 'edit',
    draftId: string | null = null,
    originalEmail: Message | null = null
  ) => {
    let initialTo = ''
    let initialCc = ''
    let initialBcc = ''
    let initialSubject = ''
    let initialBody = ''
    let initialQuotedBody: string | null = null
    let threadId: string | null = null
    let messageId: string | null = null
    let inReplyTo: string | null = null
    let references: string | null = null

    if (originalEmail) {
      const from = originalEmail.sender
      const date = originalEmail.date
      const subject = originalEmail.subject
      const to = originalEmail.to
    
      threadId = originalEmail.threadId || null
      messageId = originalEmail.id || null

      if (type === 'reply') {
        initialTo = from
        initialSubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`
        initialBody = ''
        
        inReplyTo = originalEmail.in_reply_to || null 
        
        const prevRefs = originalEmail.references || ''
        const currentId = originalEmail.id || ''
        references = `${prevRefs} ${currentId}`.trim()

        initialQuotedBody = `<br><div class="gmail_quote">On ${date}, ${from} wrote:<br><blockquote class="gmail_attr" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex">${originalEmail.text_html || originalEmail.text_plain}</blockquote></div>`

      } else if (type === 'forward') {
        initialSubject = subject.toLowerCase().startsWith('fwd:') ? subject : `Fwd: ${subject}`
        initialBody = ''
        initialQuotedBody = `<br><div class="gmail_quote">---------- Forwarded message ----------<br>From: ${from}<br>Date: ${date}<br>Subject: ${subject}<br><br>${originalEmail.text_html || originalEmail.text_plain}</div>`
        references = originalEmail.references || null

      } else if (type === 'edit') {
        initialTo = to || ''
        initialCc = originalEmail.cc || ''
        initialBcc = originalEmail.bcc || ''
        initialSubject = subject || ''
        
        inReplyTo = originalEmail.in_reply_to || null
        references = originalEmail.references || null
        
        const fullHtml = originalEmail.text_html || originalEmail.text_plain || ''
        
        if (fullHtml.includes('<div class="gmail_quote">')) {
          const parts = fullHtml.split('<div class="gmail_quote">')
          initialBody = parts[0]
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim()
          initialQuotedBody = '<div class="gmail_quote">' + parts[1]
        } else {
          initialBody = fullHtml
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim()
          initialQuotedBody = null
        }
      }
    }

    activeComposer.value = {
      draftId,
      threadId,
      messageId,
      type,
      message: originalEmail,
      to: initialTo,
      cc: initialCc,
      bcc: initialBcc,
      subject: initialSubject,
      body: initialBody,
      in_reply_to: inReplyTo,
      references: references,
      quotedBody: initialQuotedBody,
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