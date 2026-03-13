<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { 
  Paperclip, File, X, 
  Loader2, Send, Cloud, 
  Trash2, Sparkles, Check,
  Minimize2, Maximize2
} from 'lucide-vue-next' 
import emailService from '../services/email'
import difyService from '../services/dify'
import { useComposerStore } from '../stores/composerStore'
import { getFileData } from '../utils' 
import { Attachment } from '../interface/email'
import { DraftCreateRequest, WritterRequest } from '../interface/request'
import EmailShadow from './EmailShadow.vue'

const emit = defineEmits(['emailSent'])
const composerStore = useComposerStore()

const draft = computed(() => composerStore.activeComposer)
const fileInput = ref<HTMLInputElement | null>(null)
const existingAttachments = ref<Attachment[]>([])
const lastSavedContent = ref('')

const isSaving = ref(false)
const isSending = ref(false)
const showCcBcc = ref(false)

const isDirty = computed(() => {
  if (!draft.value) return false
  const currentContent = draft.value.to + draft.value.cc + draft.value.bcc + draft.value.subject + draft.value.body
  return currentContent !== lastSavedContent.value
})

let autoSaveTimeout: ReturnType<typeof setTimeout>

const getCombinedHtmlContent = () => {
  if (!draft.value) return ''
  
  let content = draft.value.body.replace(/\n/g, '<br>')
  
  if (draft.value.quotedBody) {
    let cleanQuote = draft.value.quotedBody
    
    if (content.trim() === '') {
      return cleanQuote
    } else {
      cleanQuote = cleanQuote.replace(/^(?:<br\s*\/?>\s*)+/i, '')
      content += '<br><br>' + cleanQuote
    }
  }
  return content
}

const getCombinedPlainText = () => {
  if (!draft.value) return ''
  
  let text = draft.value.body
  
  if (draft.value.quotedBody) {
    let cleanTextQuote = draft.value.quotedBody
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim()
      
    if (text.trim() === '') {
      return cleanTextQuote
    } else {
      return text + '\n\n' + cleanTextQuote
    }
  }
  return text
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    const filePromises = files.map(async (file) => {
      const base64Data = await getFileData(file)
      return {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        data: base64Data,
        headers: [],
        attachmentId: null
      }
    })
    
    const processedFiles = await Promise.all(filePromises)
    existingAttachments.value = [...existingAttachments.value, ...processedFiles]
    saveDraft(true)
  }
}

const removeExistingAttachment = (index: number) => {
  existingAttachments.value.splice(index, 1)
  saveDraft(true)
}

const saveDraft = async (force = false) => {
  if (!draft.value || (!draft.value.to && !draft.value.subject && !draft.value.body)) return
  if (!isDirty.value && !force) return 

  isSaving.value = true
  try {
    const payload: DraftCreateRequest = {
      to: draft.value.to,
      cc: draft.value.cc || undefined,
      bcc: draft.value.bcc || undefined,
      subject: draft.value.subject,
      content: {
        text_html: getCombinedHtmlContent(),
        text_plain: getCombinedPlainText()
      },
      threadId: draft.value.threadId || undefined,
      in_reply_to: draft.value.in_reply_to || undefined,
      references: draft.value.references || undefined,
      attachments: existingAttachments.value 
    }
    
    console.log("Saving Payload:", payload)
    
    if (draft.value.draftId) {
      await emailService.updateDraft(draft.value.draftId, payload)
    } else {
      const res = await emailService.createDraft(payload)
      if (res?.id) {
        draft.value.draftId = res.id
        if (res.message?.threadId) draft.value.threadId = res.message.threadId
      }
    }

    lastSavedContent.value = draft.value.to + draft.value.cc + draft.value.bcc + draft.value.subject + draft.value.body
    composerStore.triggerRefresh()
  } catch (error) {
    console.error("Save Error:", error)
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
    console.error("Send Error:", error)
  } finally {
    isSending.value = false
  }
}

const sendToDify = async () => {
  if (!draft.value?.body) return
  try {
    const request: WritterRequest = {
      topic: draft.value.subject,
      email_text: draft.value.quotedBody || '',
      ai_summary: "",
      user_draft: draft.value.body,
      target_person: ""
    }
    const aiResponse = await difyService.writter(request)
    if (aiResponse?.draft) {
        draft.value.body = aiResponse.draft
    }
  } catch (error) {
    console.error("AI Service Error:", error)
  }
}

const discardDraft = async () => {
  if (!confirm("Discard this draft?")) return
  if (draft.value?.draftId) await emailService.deleteDraft(draft.value.draftId)
  composerStore.closeComposer()
  composerStore.triggerRefresh()
}

watch(() => [draft.value?.to, draft.value?.cc, draft.value?.bcc, draft.value?.subject, draft.value?.body], () => {
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 3000)
}, { deep: true })

onBeforeUnmount(() => clearTimeout(autoSaveTimeout))
</script>

<template>
  <div v-if="draft" 
    class="fixed bottom-0 right-4 md:right-10 w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl border border-gray-200 rounded-t-2xl z-50 flex flex-col transition-all duration-300 ease-in-out"
    :class="[ draft.isMinimized ? 'h-14' : 'h-[90vh] md:h-[80vh]' ]">
    
    <div class="flex justify-between items-center px-4 py-3 bg-gray-900 text-white rounded-t-2xl cursor-pointer select-none" 
      @click="composerStore.toggleMinimize()">
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500">
           <Send :size="12" class="text-white" />
        </div>
        <div class="flex flex-col">
            <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">{{ draft.type }}</span>
            <span class="text-sm font-medium truncate max-w-[300px]">{{ draft.subject || 'New Message' }}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div v-if="isSaving" class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-800 border border-gray-700">
            <Loader2 :size="12" class="animate-spin text-blue-400" />
            <span class="text-[10px] text-gray-300">Saving...</span>
        </div>
        <div v-else-if="lastSavedContent" class="flex items-center gap-1 text-[10px] text-gray-500">
            <Check :size="10" /> Saved
        </div>
        
        <div class="flex items-center border-l border-gray-700 ml-2 pl-2 gap-1">
            <button @click.stop="composerStore.toggleMinimize()" class="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                <component :is="draft.isMinimized ? Maximize2 : Minimize2" :size="16" />
            </button>
            <button @click.stop="composerStore.closeComposer()" class="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                <X :size="20" />
            </button>
        </div>
      </div>
    </div>
    
    <div v-if="!draft.isMinimized" class="flex flex-col flex-1 overflow-hidden bg-white">
      <div class="px-4 py-2 space-y-0.5 border-b border-gray-100">
        
        <div class="flex items-center group py-1.5">
          <label class="text-gray-400 text-xs w-16 font-medium">To</label>
          <input v-model="draft.to" 
            class="flex-1 outline-none text-sm bg-transparent placeholder-gray-300" 
            placeholder="Recipients" />
          <button @click="showCcBcc = !showCcBcc" class="text-[10px] text-blue-500 hover:underline px-2 font-bold uppercase tracking-tight">
            {{ showCcBcc ? 'Hide Cc/Bcc' : 'Cc/Bcc' }}
          </button>
        </div>

        <div v-if="showCcBcc" class="flex items-center py-1.5 border-t border-gray-50">
          <label class="text-gray-400 text-xs w-16 font-medium">Cc</label>
          <input v-model="draft.cc" 
            class="flex-1 outline-none text-sm bg-transparent placeholder-gray-300" 
            placeholder="Copy to..." />
        </div>

        <div v-if="showCcBcc" class="flex items-center py-1.5 border-t border-gray-100">
          <label class="text-gray-400 text-xs w-16 font-medium">Bcc</label>
          <input v-model="draft.bcc" 
            class="flex-1 outline-none text-sm bg-transparent placeholder-gray-300" 
            placeholder="Secret copy to..." />
        </div>

        <div class="flex items-center py-1.5 border-t border-gray-100">
          <label class="text-gray-400 text-xs w-16 font-medium">Subject</label>
          <input v-model="draft.subject" 
            class="flex-1 outline-none text-sm font-semibold bg-transparent placeholder-gray-300" 
            placeholder="Subject line" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-0">
        <textarea 
          v-model="draft.body" 
          class="w-full p-6 outline-none resize-none text-base text-gray-800 leading-relaxed min-h-[250px] flex-shrink-0" 
          placeholder="Write your thoughts here..."
        ></textarea>

        <div v-if="draft.quotedBody" class="mx-6 mb-6">
            <div class="flex items-center gap-2 mb-4">
                <div class="h-px flex-1 bg-gray-100"></div>
                <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Previous Messages</span>
                <div class="h-px flex-1 bg-gray-100"></div>
            </div>
            <EmailShadow 
              :content="draft.quotedBody || ''"
              :attachments="existingAttachments"
              class="opacity-50 pointer-events-none select-none overflow-hidden max-h-[400px] border-l-4 border-blue-50/50 pl-4"
            />
            <div class="text-center mt-2">
                 <span class="text-[10px] text-gray-400 italic">Historical content will be included in the sent email</span>
            </div>
        </div>
      </div>

      <div v-if="existingAttachments.length > 0" 
        class="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-2 overflow-x-auto">
        <div v-for="(file, i) in existingAttachments" :key="i" 
          class="group flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-all">
          <div class="p-1 rounded bg-blue-50 text-blue-500">
             <Cloud v-if="file.attachmentId" :size="14" />
             <File v-else :size="14" />
          </div>
          <div class="flex flex-col overflow-hidden">
              <span class="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{{ file.filename }}</span>
              <span class="text-[9px] text-gray-400 uppercase">{{ (file.size / 1024).toFixed(0) }} KB</span>
          </div>
          <button @click="removeExistingAttachment(i)" 
            class="ml-1 p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X :size="14" />
          </button>
        </div>
      </div>

      <div class="p-5 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
        <div class="flex items-center gap-3">
          <button @click="sendEmail" :disabled="isSending || !draft.to"
            class="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white pl-6 pr-8 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-200 active:scale-95 transition-all">
            <div v-if="isSending" class="flex items-center">
                <Loader2 :size="18" class="mr-2 animate-spin" /> Sending
            </div>
            <div v-else class="flex items-center">
                <Send :size="18" class="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Send
            </div>
          </button>

          <button @click="sendToDify" 
            :disabled="!draft.body"
            class="flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-600 border border-purple-100 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50">
            <Sparkles :size="16" class="text-purple-500" /> 
            AI Rewrite
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button @click="fileInput?.click()" 
            class="p-3 hover:bg-gray-100 rounded-2xl text-gray-500 transition-colors"
            title="Attach files">
            <Paperclip :size="22" />
          </button>
          <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelect" />
          
          <div class="w-px h-8 bg-gray-100 mx-1"></div>
          
          <button @click="discardDraft" 
            class="p-3 hover:bg-red-50 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"
            title="Discard draft">
            <Trash2 :size="22" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f3f4f6;
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #e5e7eb;
}

textarea {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

textarea::placeholder {
  color: #d1d5db;
  font-style: normal;
}
</style>