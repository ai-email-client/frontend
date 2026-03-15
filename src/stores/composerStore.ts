import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message, Sender } from '../interface/email'

export interface DraftState {
  type: 'new' | 'reply' | 'forward' | 'edit'
  draftId: string | null
  threadId: string | null
  messageId: string | null
  message: Message | null
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

const joinRecipients = (list: Sender[] | string | null | undefined): string => {
  if (!list) return ''
  if (typeof list === 'string') return list
  return list
    .map(r => r.email?.trim())
    .filter(Boolean)
    .join(', ')
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
      const from = originalEmail.sender?.email || ''
      const date = originalEmail.date || ''
      const subject = originalEmail.subject || ''
      const to = joinRecipients(originalEmail.to as any)

      threadId = originalEmail.threadId || null
      messageId = originalEmail.id || null

      if (type === 'reply') {
        initialTo = from
        initialSubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`
        initialBody = ''

        inReplyTo = originalEmail.message_id || null

        const prevRefs = originalEmail.references || ''
        const currentId = originalEmail.message_id || ''
        references = `${prevRefs} ${currentId}`.trim()

        initialQuotedBody = `<br><br><div class="moz-cite-prefix">On ${date}, ${from} wrote:</div><blockquote type="cite">\n${originalEmail.text_html || originalEmail.text_plain}\n</blockquote>`

      } else if (type === 'forward') {
        initialSubject = subject.toLowerCase().startsWith('fwd:') ? subject : `Fwd: ${subject}`
        initialBody = ''

        initialQuotedBody = `<br><br>-------- Forwarded Message --------<br>Subject: ${subject}<br>Date: ${date}<br>From: ${from}<br>To: ${to}<br><br>${originalEmail.text_html || originalEmail.text_plain}`
        references = originalEmail.references || null

      } else if (type === 'edit') {
        initialTo   = joinRecipients(originalEmail.to)
        initialCc   = joinRecipients(originalEmail.cc)
        initialBcc  = joinRecipients(originalEmail.bcc)
        initialSubject = subject || ''

        inReplyTo  = originalEmail.in_reply_to || null
        references = originalEmail.references || null

        const fullHtml = originalEmail.text_html || originalEmail.text_plain || ''

        const quoteRegex = /(?:<br\s*\/?>\s*)*(<div[^>]*class=["']?gmail_quote["']?[^>]*>|<div[^>]*class=["']?moz-cite-prefix["']?[^>]*>|<div[^>]*id=["']?(?:divRplyFwdMsg|mail-editor-reference-message-container)["']?[^>]*>|<hr[^>]*tabindex=["']?-1["']?[^>]*>|<blockquote[^>]*type=["']?cite["']?[^>]*>|-------- Forwarded Message --------)/i

        const match = fullHtml.match(quoteRegex)

        if (match && match.index !== undefined) {
          const splitIndex = match.index
          initialBody = fullHtml.substring(0, splitIndex)
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim()
          initialQuotedBody = fullHtml.substring(splitIndex)
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
      draftId, threadId, messageId, type, message: originalEmail,
      to: initialTo, cc: initialCc, bcc: initialBcc,
      subject: initialSubject, body: initialBody,
      in_reply_to: inReplyTo, references: references,
      quotedBody: initialQuotedBody, isMinimized: false
    }
    console.log("Active Composer:", activeComposer.value)
  }

  const closeComposer = () => { activeComposer.value = null }
  const toggleMinimize = () => {
    if (activeComposer.value) activeComposer.value.isMinimized = !activeComposer.value.isMinimized
  }
  const triggerRefresh = () => { lastUpdated.value = Date.now() }
  const setUploading = (id: string | null) => { uploadingDraftId.value = id }

  return { activeComposer, lastUpdated, uploadingDraftId, openComposer, closeComposer, toggleMinimize, triggerRefresh, setUploading }
})