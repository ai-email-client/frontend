<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import emailService from '../services/email';
import { useComposerStore } from '../stores/composerStore';

const emit = defineEmits(['emailSent'])
const composerStore = useComposerStore()

const draft = computed(() => composerStore.activeComposer)

const isSaving = ref(false)
const isSending = ref(false)
let autoSaveTimeout: ReturnType<typeof setTimeout>

const saveDraft = async () => {
  if (!draft.value) return
  if (!draft.value.to && !draft.value.body.trim()) return
  if (isSaving.value) return 

  isSaving.value = true
  try {
    const payload = {
      to: draft.value.to,
      subject: draft.value.subject,
      body: draft.value.body
    }

    if (draft.value.draftId) {
      await emailService.updateDraft(draft.value.draftId, payload)
    } else {
      const res = await emailService.createDraft(payload)
      if (res && res.id) {
        draft.value.draftId = res.id 
      }
    }
  } catch (error) {
    console.error('Failed to save draft:', error)
  } finally {
    isSaving.value = false
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

watch(() => [draft.value?.to, draft.value?.subject, draft.value?.body], () => {
  if (!draft.value) return
  clearTimeout(autoSaveTimeout)
  autoSaveTimeout = setTimeout(() => {
    saveDraft()
  }, 2000)
}, { deep: true })

onBeforeUnmount(() => {
  clearTimeout(autoSaveTimeout)
})
</script>

<template>
  <div 
    v-if="draft" 
    class="composer-container flex flex-col bg-white shadow-2xl border border-gray-200 rounded-t-xl transition-all duration-300"
    :class="[
      draft.isMinimized ? 'h-12' : 'h-[80vh]' 
    ]"
  >
    <div 
      class="header flex justify-between items-center p-3 bg-gray-800 text-white rounded-t-lg cursor-pointer"
      @click="composerStore.toggleMinimize()"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-400">
          {{ draft.type }}
        </span>
        <span class="text-sm font-medium truncate">
          {{ draft.subject || 'New Message' }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="isSaving" class="text-[10px] animate-pulse">Saving...</span>
        <button @click.stop="composerStore.closeComposer()" class="hover:text-red-400 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <div v-if="!draft.isMinimized" class="flex flex-col flex-1 p-3 space-y-2">
      <div class="flex border-b items-center py-1">
        <span class="text-gray-400 text-xs w-12">To</span>
        <input v-model="draft.to" class="w-full p-1 outline-none text-sm" />
      </div>
      <div class="flex border-b items-center py-1">
        <span class="text-gray-400 text-xs w-12">Subject</span>
        <input v-model="draft.subject" class="w-full p-1 outline-none text-sm font-medium" />
      </div>
      <textarea 
        v-model="draft.body" 
        class="w-full p-2 flex-1 outline-none resize-none text-sm custom-scrollbar" 
        placeholder="Write your message..."
      ></textarea>
      
      <div class="p-3 border-t flex items-center justify-between">
        <button 
          @click="sendEmail" 
          :disabled="isSending || !draft.to"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-2 rounded-md font-bold transition-all flex items-center"
        >
          <span v-if="isSending" class="mr-2 animate-spin">🌀</span>
          {{ isSending ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>