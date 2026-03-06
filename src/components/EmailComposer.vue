<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Paperclip, File, X, Loader2, Send ,Cloud } from 'lucide-vue-next' 
import emailService from '../services/email';
import { useComposerStore } from '../stores/composerStore';
import { formatSize, getFileData } from '../utils'; 
import { Attachment } from '../interface/email';
import { DraftCreateRequest } from '../interface/request';

const emit = defineEmits(['emailSent'])
const composerStore = useComposerStore()

const draft = computed(() => composerStore.activeComposer)

const fileInput = ref<HTMLInputElement | null>(null)
const newDraft = ref<DraftCreateRequest>()
const existingAttachments = ref<Attachment[]>([])

const isSaving = ref(false)
const isSending = ref(false)
const isLoadingDraft = ref(false)

let autoSaveTimeout: ReturnType<typeof setTimeout>

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
    
    saveDraft()
  }
}

const removeExistingAttachment = (index: number) => {
  existingAttachments.value.splice(index, 1)
  saveDraft()
}

const saveDraft = async () => {
  if (!draft.value) return
  isSaving.value = true
  try {
    newDraft.value = {
      to: draft.value.to,
      subject: draft.value.subject,
      message: draft.value.body,
      attachments: existingAttachments.value 
    }
    if (draft.value.draftId) composerStore.setUploading(draft.value.draftId)
    if (draft.value.draftId) {
      await emailService.updateDraft(draft.value.draftId, newDraft.value)
    } else {
      const res = await emailService.createDraft(newDraft.value)
      if (res?.id) draft.value.draftId = res.id 
    }
    composerStore.triggerRefresh()
  } finally {
    isSaving.value = false
    composerStore.setUploading(null)
  }
}

const loadAttachments = async () => {
  if (!draft.value?.message || !draft.value.message.attachments || draft.value.message.attachments.length === 0) {
    existingAttachments.value = []
    return existingAttachments.value
  }
  isLoadingDraft.value = true
  try {
    const results = await Promise.all(draft.value.message.attachments.map(async (att) => {
      if (att.attachmentId && !att.data) {
        try {
          const res = await emailService.getAttachment(draft.value?.message?.id || '', att.attachmentId)
          return { ...att, data: res.data }
        } catch (e) { return att }
      }
      return att
    }))
    existingAttachments.value = results
  } finally {
    isLoadingDraft.value = false
  }
}

const sendEmail = async () => {
  if (!draft.value?.to) return alert("Please specify a recipient.")
  
  isSending.value = true
  try {
    clearTimeout(autoSaveTimeout)
    await saveDraft() 

    if (!draft.value?.draftId) throw new Error('Could not create draft before sending')
    
    const res = await emailService.sendDraft(draft.value.draftId)
    if (res) {
      alert("Email sent successfully!")
      emit('emailSent')
      composerStore.closeComposer() 
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    alert("Failed to send email.")
  } finally {
    isSending.value = false
  }
}
watch(() => draft.value?.draftId, (newId) => {
  if (newId) {
    loadAttachments()
  } else {
    existingAttachments.value = []
  }
}, { immediate: true })

watch(() => [draft.value?.to, draft.value?.subject, draft.value?.body], () => {
  if (!draft.value) return
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 2000)
}, { deep: true })
</script>

<template>
  <div v-if="draft" class="fixed bottom-0 right-10 w-[520px] bg-white shadow-2xl border border-gray-200 rounded-t-xl z-50 flex flex-col"
    :class="[ draft.isMinimized ? 'h-12' : 'h-[600px]' ]">
    
    <div class="flex justify-between items-center p-3 bg-gray-800 text-white rounded-t-lg cursor-pointer" @click="composerStore.toggleMinimize()">
      <div class="flex items-center gap-2 overflow-hidden">
        <span class="text-[10px] font-bold uppercase text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded shrink-0">{{ draft.type }}</span>
        <span class="text-sm font-medium truncate">{{ draft.subject || 'New Message' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div v-if="isSaving || isLoadingDraft" class="text-[10px] text-gray-400 flex items-center gap-1">
          <Loader2 :size="10" class="animate-spin" /> {{ isLoadingDraft ? 'Loading...' : 'Saving...' }}
        </div>
        <button @click.stop="composerStore.closeComposer()" class="p-1 hover:text-red-400 transition-colors"><X :size="16" /></button>
      </div>
    </div>
    
    <div v-if="!draft.isMinimized" class="flex flex-col flex-1 overflow-hidden">
      <div class="p-3 space-y-1">
        <div class="flex border-b border-gray-100 items-center py-1">
          <span class="text-gray-400 text-xs w-14">To</span>
          <input v-model="draft.to" class="w-full p-1 outline-none text-sm" />
        </div>
        <div class="flex border-b border-gray-100 items-center py-1">
          <span class="text-gray-400 text-xs w-14">Subject</span>
          <input v-model="draft.subject" class="w-full p-1 outline-none text-sm font-medium" />
        </div>
      </div>

      <textarea v-model="draft.body" class="w-full p-4 flex-1 outline-none resize-none text-sm custom-scrollbar" placeholder="Compose your email..."></textarea>
      
      <div v-if="existingAttachments.length > 0" class="px-4 py-3 border-t bg-gray-50 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        <div v-for="(file, i) in existingAttachments" :key="i" 
          class="flex items-center gap-2 p-2 rounded-lg border shadow-sm transition-all group"
          :class="[file.attachmentId ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-gray-200']">
          
          <Cloud v-if="file.attachmentId" :size="14" class="text-blue-400" />
          <File v-else :size="14" class="text-gray-400" />
          
          <div class="flex flex-col min-w-0 max-w-[140px]">
            <span class="text-[11px] font-semibold truncate text-gray-700">{{ file.filename }}</span>
            <span class="text-[9px] uppercase font-bold" :class="[file.attachmentId ? 'text-blue-500/60' : 'text-gray-400']">
              {{ file.attachmentId ? 'In Draft' : formatSize(file.size) }}
            </span>
          </div>
          <button @click="removeExistingAttachment(i)" class="p-1 text-gray-300 hover:text-red-500"><X :size="14" /></button>
        </div>
      </div>

      <div class="p-4 border-t flex items-center justify-between bg-white">
        <div class="flex items-center gap-2">
          <button @click="sendEmail" :disabled="isSending || !draft.to || isLoadingDraft"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <Loader2 v-if="isSending" :size="16" class="mr-2 animate-spin" />
            <Send v-else :size="16" class="mr-2" />
            Send
          </button>

          <button @click="fileInput?.click()" class="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors" title="Attach files">
            <Paperclip :size="20" />
          </button>
          <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileSelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
</style>