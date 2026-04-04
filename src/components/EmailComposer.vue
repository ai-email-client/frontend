<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount, onMounted, nextTick } from 'vue'
import {
  Paperclip, File, X,
  Loader2, Send, Cloud,
  Trash2, Sparkles, Check,
  Minimize2, Maximize2,
  RotateCcw, AlertCircle, Clock
} from 'lucide-vue-next'
import emailService from '../services/email'
import difyService from '../services/dify'
import { useComposerStore } from '../stores/composerStore'
import { getFileData } from '../utils'
import { Attachment } from '../interface/email'
import { DraftCreateRequest, WritterRequest } from '../interface/request'
import EmailShadow from './EmailShadow.vue'
import RecipientInput from './RecipientInput.vue'

const emit = defineEmits(['emailSent'])
const composerStore = useComposerStore()
const draft = computed(() => composerStore.activeComposer)

const fileInput = ref<HTMLInputElement | null>(null)
const bodyEditor = ref<HTMLElement | null>(null)
const showCcBcc = ref(false)

const existingAttachments = ref<Attachment[]>([])
const lastSavedContent = ref('')
const lastSavedAt = ref<Date | null>(null)
const saveError = ref<string | null>(null)

const isSaving = ref(false)
const isSending = ref(false)
const isAiLoading = ref(false)
const isInitializing = ref(false)

const MAX_HISTORY = 20
const bodyHistory = ref<string[]>([])
const historyIndex = ref(-1)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < bodyHistory.value.length - 1)

const pushHistory = (value: string) => {
  bodyHistory.value = bodyHistory.value.slice(0, historyIndex.value + 1)
  bodyHistory.value.push(value)
  if (bodyHistory.value.length > MAX_HISTORY) bodyHistory.value.shift()
  historyIndex.value = bodyHistory.value.length - 1
}

const undo = () => {
  if (!canUndo.value || !draft.value) return
  historyIndex.value--
  draft.value.body = bodyHistory.value[historyIndex.value]
  syncEditorContent()
}

const redo = () => {
  if (!canRedo.value || !draft.value) return
  historyIndex.value++
  draft.value.body = bodyHistory.value[historyIndex.value]
  syncEditorContent()
}

const syncEditorContent = () => {
  nextTick(() => {
    if (bodyEditor.value && draft.value) {
      bodyEditor.value.innerHTML = draft.value.body
    }
  })
}

const handleBodyInput = (event: Event) => {
  if (!draft.value) return
  draft.value.body = (event.target as HTMLElement).innerHTML
}

const currentContentKey = computed(() => {
  if (!draft.value) return ''
  return [
    draft.value.to.join(','),
    draft.value.cc.join(','),
    draft.value.bcc.join(','),
    draft.value.subject,
    draft.value.body,
  ].join('|')
})

const isDirty = computed(() => currentContentKey.value !== lastSavedContent.value)

const bodyStats = computed(() => {
  const raw = draft.value?.body ?? ''
  const text = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  const chars = text.length
  const words = text === '' ? 0 : text.split(/\s+/).filter(Boolean).length
  const lines = text === '' ? 0 : text.split('\n').length
  const readingMinutes = Math.ceil(words / 200)
  return { chars, words, lines, readingMinutes }
})

const saveStatusLabel = computed(() => {
  if (isSaving.value) return 'saving'
  if (saveError.value) return 'error'
  if (isDirty.value) return 'unsaved'
  if (lastSavedAt.value) return 'saved'
  return 'idle'
})

const lastSavedLabel = computed(() => {
  if (!lastSavedAt.value) return ''
  const diff = Math.round((Date.now() - lastSavedAt.value.getTime()) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  return `${Math.round(diff / 60)}m ago`
})

const isFormValid = computed(() => (draft.value?.to?.length ?? 0) > 0)

const getCombinedHtmlContent = (): string => {
  if (!draft.value) return ''

  let content = draft.value.body

  if (draft.value.quotedBody) {
    let cleanQuote = draft.value.quotedBody
    cleanQuote = cleanQuote.replace(/^(?:<br\s*\/?>\s*)+/i, '')

    if (content.trim() === '' || content === '<br>') {
      content = cleanQuote
    } else {
      content += '<br><br>' + cleanQuote
    }
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    ${content}
  </body>
</html>`
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)
  const processed = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      data: await getFileData(file),
      headers: [],
      attachmentId: '',
    }))
  )
  existingAttachments.value = [...(existingAttachments.value), ...processed]
  saveDraft(true)
}

const removeExistingAttachment = (index: number) => {
  existingAttachments.value.splice(index, 1)
  saveDraft(true)
}

const totalAttachmentSize = computed(() =>
  existingAttachments.value.reduce((sum, f) => sum + (f.size ?? 0), 0)
)

const saveDraft = async (force = false) => {
  if (!draft.value) return
  const hasContent = draft.value.to.length > 0 || draft.value.subject || draft.value.body
  if (!hasContent) return
  if (!isDirty.value && !force) return

  isSaving.value = true
  saveError.value = null

  try {
    const payload: DraftCreateRequest = {
      to: draft.value.to,
      cc: draft.value.cc.length > 0 ? draft.value.cc : undefined,
      bcc: draft.value.bcc.length > 0 ? draft.value.bcc : undefined,
      subject: draft.value.subject,
      content: getCombinedHtmlContent(),
      content_type: 'html',
      threadId: draft.value.threadId || undefined,
      in_reply_to: draft.value.in_reply_to || undefined,
      references: draft.value.references || undefined,
      attachments: existingAttachments.value,
    }

    if (draft.value.draftId) {
      await emailService.updateDraft(draft.value.draftId, payload)
    } else {
      const res = await emailService.createDraft(payload)
      if (res?.id) {
        draft.value.draftId = res.id
        if (res.message?.threadId) draft.value.threadId = res.message.threadId
      }
    }

    lastSavedContent.value = currentContentKey.value
    lastSavedAt.value = new Date()
    composerStore.triggerRefresh()
  } catch (error: any) {
    console.error('Save Error:', error)
    saveError.value = error?.message ?? 'Save failed'
  } finally {
    isSaving.value = false
  }
}

const sendEmail = async () => {
  if (!draft.value?.to) return
  isSending.value = true
  try {
    clearTimeout(autoSaveTimeout)
    await saveDraft(true)
    if (!draft.value?.draftId) throw new Error('No Draft ID found')
    await emailService.sendDraft(draft.value.draftId)
    emit('emailSent')
    composerStore.closeComposer()
  } catch (error) {
    console.error('Send Error:', error)
  } finally {
    isSending.value = false
  }
}

const sendToDify = async () => {
  if (!draft.value || isAiLoading.value) return
  isAiLoading.value = true
  pushHistory(draft.value.body)
  try {
    const request: WritterRequest = {
      topic: draft.value.subject,
      email_text: draft.value.quotedBody || '',
      ai_summary: '',
      user_draft: draft.value.body,
      target_person: '',
    }
    const aiResponse = await difyService.writter(request)
    if (aiResponse?.draft && draft.value) {
      pushHistory(aiResponse.draft)
      draft.value.body = aiResponse.draft
      syncEditorContent()
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    undo()
  } finally {
    isAiLoading.value = false
  }
}

const discardDraft = async () => {
  if (!confirm('Discard this draft?')) return
  if (draft.value?.draftId) await emailService.deleteDraft(draft.value.draftId)
  composerStore.closeComposer()
  await nextTick()
  composerStore.triggerRefresh()
}

let autoSaveTimeout: ReturnType<typeof setTimeout>

const scheduleSave = (delay = 3000) => {
  if (isInitializing.value) return 
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => saveDraft(), delay)
}

watch(
  () => [
    draft.value?.to.join(','),
    draft.value?.cc.join(','),
    draft.value?.bcc.join(','),
    draft.value?.subject,
  ],
  () => scheduleSave(2000)
)

let historyTimeout: ReturnType<typeof setTimeout>

watch(
  () => draft.value?.body,
  (newVal, oldVal) => {
    if (newVal === oldVal || newVal === undefined) return

    clearTimeout(historyTimeout)
    historyTimeout = setTimeout(() => pushHistory(newVal), 1000)

    scheduleSave(3000)
  }
)

const recipientWarning = ref<string | null>(null)

watch(
  () => [draft.value?.to, draft.value?.cc, draft.value?.bcc],
  () => {
    const all: string[] = []
    ;[draft.value?.to ?? [], draft.value?.cc ?? [], draft.value?.bcc ?? []].forEach((field) => {
      all.push(...field.map(s => s.trim().toLowerCase()).filter(Boolean))
    })
    const dupes = all.filter((v, i) => all.indexOf(v) !== i)
    recipientWarning.value = dupes.length
      ? `Duplicate recipient: ${[...new Set(dupes)].join(', ')}`
      : null
  }
)

watch(
  () => composerStore.activeComposer,
  (newComposer) => {
    if (!newComposer) return

    isInitializing.value = true   

    bodyHistory.value = [newComposer.body ?? '']
    historyIndex.value = 0
    lastSavedAt.value = null
    saveError.value = null

    if (newComposer.type === 'edit' && newComposer.message?.attachments?.length) {
      existingAttachments.value = newComposer.message.attachments
    } else {
      existingAttachments.value = []
    }

    syncEditorContent()

    nextTick(() => {
      lastSavedContent.value = currentContentKey.value
      isInitializing.value = false
    })
  },
  { immediate: true }
)

let clockInterval: ReturnType<typeof setInterval>
onMounted(() => {
  clockInterval = setInterval(() => {
    if (lastSavedAt.value) lastSavedAt.value = new Date(lastSavedAt.value.getTime())
  }, 30_000)
  syncEditorContent()
})

onBeforeUnmount(() => {
  clearTimeout(autoSaveTimeout)
  clearTimeout(historyTimeout)
  clearInterval(clockInterval)
})
</script>

<template>
  <div
    v-if="draft"
    class="fixed bottom-0 right-4 md:right-10 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl border border-gray-200 rounded-t-2xl z-50 flex flex-col transition-all duration-300 ease-in-out"
    :class="[draft.isMinimized ? 'h-14' : 'h-[90vh] md:h-[80vh]']"
  >
    <!-- ── Header ────────────────────────────── -->
    <div
      class="flex justify-between items-center px-4 py-3 bg-gray-900 text-white rounded-t-2xl cursor-pointer select-none"
      @click="composerStore.toggleMinimize()"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500">
          <Send :size="12" class="text-white" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-400 font-bold uppercase tracking-wider">{{ draft.type }}</span>
          <span class="text-base font-medium truncate max-w-[300px]">{{ draft.subject || 'New Message' }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-800 border border-gray-700 min-w-[80px] justify-center">
          <template v-if="saveStatusLabel === 'saving'">
            <Loader2 :size="10" class="animate-spin text-blue-400 flex-shrink-0" />
            <span class="text-[10px] text-gray-300">Saving…</span>
          </template>
          <template v-else-if="saveStatusLabel === 'error'">
            <AlertCircle :size="10" class="text-red-400 flex-shrink-0" />
            <span class="text-[10px] text-red-300">Save failed</span>
          </template>
          <template v-else-if="saveStatusLabel === 'unsaved'">
            <Clock :size="10" class="text-amber-400 flex-shrink-0" />
            <span class="text-[10px] text-amber-300">Unsaved</span>
          </template>
          <template v-else-if="saveStatusLabel === 'saved'">
            <Check :size="10" class="text-green-400 flex-shrink-0" />
            <span class="text-[10px] text-gray-400">{{ lastSavedLabel }}</span>
          </template>
        </div>

        <div class="flex items-center border-l border-gray-700 ml-2 pl-2 gap-1">
          <button
            @click.stop="composerStore.toggleMinimize()"
            class="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <component :is="draft.isMinimized ? Maximize2 : Minimize2" :size="16" />
          </button>
          <button
            @click.stop="composerStore.closeComposer()"
            class="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
          >
            <X :size="20" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Body (hidden when minimized) ─────── -->
    <div v-if="!draft.isMinimized" class="flex flex-col flex-1 overflow-hidden bg-white">

      <!-- Recipients + Subject -->
      <div class="px-4 py-2 space-y-0.5 border-b border-gray-100">
        <div class="flex items-center group py-1.5">
          <label class="text-gray-400 text-sm w-16 font-medium flex-shrink-0">To</label>
          <RecipientInput
            v-model="draft.to"
            placeholder="Recipients"
            class="flex-1"
          />
          <button
            @click="showCcBcc = !showCcBcc"
            class="text-[10px] text-blue-500 hover:underline px-2 font-bold uppercase tracking-tight"
          >
            {{ showCcBcc ? 'Hide Cc/Bcc' : 'Cc/Bcc' }}
          </button>
        </div>

        <div v-if="recipientWarning" class="flex items-center gap-1.5 pl-16 pb-1 text-[11px] text-amber-600">
          <AlertCircle :size="12" />
          {{ recipientWarning }}
        </div>

        <div v-if="showCcBcc" class="flex items-center py-1.5 border-t border-gray-50">
          <label class="text-gray-400 text-sm w-16 font-medium flex-shrink-0">Cc</label>
          <RecipientInput
            v-model="draft.cc"
            placeholder="Copy to…"
            class="flex-1"
          />
        </div>

        <div v-if="showCcBcc" class="flex items-center py-1.5 border-t border-gray-100">
          <label class="text-gray-400 text-sm w-16 font-medium flex-shrink-0">Bcc</label>
          <RecipientInput
            v-model="draft.bcc"
            placeholder="Secret copy to…"
            class="flex-1"
          />
        </div>

        <div class="flex items-center py-1.5 border-t border-gray-100">
          <label class="text-gray-400 text-sm w-16 font-medium flex-shrink-0">Subject</label>
          <input
            v-model="draft.subject"
            class="flex-1 outline-none text-base font-semibold bg-transparent placeholder-gray-300"
            placeholder="Subject line"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-0">
        <div
          ref="bodyEditor"
          contenteditable="true"
          @input="handleBodyInput"
          class="w-full p-6 outline-none text-base text-gray-800 leading-relaxed min-h-[250px] flex-shrink-0"
          data-placeholder="Write your thoughts here…"
        />

        <div v-if="draft.quotedBody" class="mx-6 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <div class="h-px flex-1 bg-gray-100" />
            <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Previous Messages</span>
            <div class="h-px flex-1 bg-gray-100" />
          </div>
          <EmailShadow
            :emailId="draft.messageId || ''"
            :content="draft.quotedBody || ''"
            :attachments="existingAttachments"
            class="opacity-50 pointer-events-none select-none overflow-hidden max-h-[400px] border-l-4 border-blue-50/50 pl-4"
          />
          <div class="text-center mt-2">
            <span class="text-[10px] text-gray-400 italic">Historical content will be included in the sent email</span>
          </div>
        </div>
      </div>

      <!-- Body stats bar -->
      <div class="px-6 py-1.5 border-t border-gray-50 flex items-center gap-4 bg-gray-50/40">
        <span class="text-[10px] text-gray-400">
          <span class="font-medium text-gray-500">{{ bodyStats.words }}</span> words
        </span>
        <span class="text-[10px] text-gray-400">
          <span class="font-medium text-gray-500">{{ bodyStats.chars }}</span> chars
        </span>
        <span class="text-[10px] text-gray-400">
          ~<span class="font-medium text-gray-500">{{ bodyStats.readingMinutes }}</span> min read
        </span>
        <div class="flex items-center gap-1 ml-auto">
          <button
            @click="undo"
            :disabled="!canUndo"
            class="p-1 rounded hover:bg-gray-200 text-gray-400 disabled:opacity-30 transition-colors"
            title="Undo (ctrl+z)"
          >
            <RotateCcw :size="12" />
          </button>
          <button
            @click="redo"
            :disabled="!canRedo"
            class="p-1 rounded hover:bg-gray-200 text-gray-400 disabled:opacity-30 transition-colors scale-x-[-1]"
            title="Redo (ctrl+y)"
          >
            <RotateCcw :size="12" />
          </button>
        </div>
      </div>

      <!-- Attachments -->
      <div
        v-if="existingAttachments.length > 0"
        class="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 overflow-x-auto"
      >
        <div
          v-for="(file, i) in existingAttachments"
          :key="i"
          class="group flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-all"
        >
          <div class="p-1 rounded bg-blue-50 text-blue-500">
            <Cloud v-if="file.attachmentId" :size="14" />
            <File v-else :size="14" />
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-sm font-semibold text-gray-700 truncate max-w-[150px]">{{ file.filename }}</span>
            <span class="text-[9px] text-gray-400 uppercase">{{ (file.size / 1024).toFixed(0) }} KB</span>
          </div>
          <button
            @click="removeExistingAttachment(i)"
            class="ml-1 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X :size="14" />
          </button>
        </div>
        <span class="self-center text-[10px] text-gray-400 ml-1">
          Total: {{ (totalAttachmentSize / 1024).toFixed(0) }} KB
        </span>
      </div>

      <!-- Action toolbar -->
      <div class="p-5 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
        <div class="flex items-center gap-3">
          <button
            @click="sendEmail"
            :disabled="isSending || !isFormValid"
            class="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white pl-6 pr-8 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            <div v-if="isSending" class="flex items-center">
              <Loader2 :size="18" class="mr-2 animate-spin" /> Sending
            </div>
            <div v-else class="flex items-center">
              <Send :size="18" class="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Send
            </div>
          </button>

          <button
            @click="sendToDify"
            :disabled="!draft || isAiLoading"
            class="flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-600 border border-purple-100 px-5 py-3 rounded-2xl text-base font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <Loader2 v-if="isAiLoading" :size="16" class="animate-spin text-purple-400" />
            <Sparkles v-else :size="16" class="text-purple-500" />
            {{ isAiLoading ? 'Rewriting…' : 'AI Rewrite' }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="fileInput?.click()"
            class="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 transition-colors"
            title="Attach files"
          >
            <Paperclip :size="22" />
          </button>
          <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelect" />

          <div class="w-px h-8 bg-gray-100 mx-1" />

          <button
            @click="discardDraft"
            class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"
            title="Discard draft"
          >
            <Trash2 :size="22" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f3f4f6; border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #e5e7eb; }

[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: #d1d5db;
  pointer-events: none;
}

[contenteditable]:focus {
  outline: none;
}
</style>