<script setup lang="ts">
import {
  formatSize,
  senderFormat,
  getLabel,
  formatDateTime,
  getFirstCharacter,
  getHeaderValue
} from '../utils'

import {
  computed,
  ref,
  watch
} from 'vue';

import {
  Reply, Forward, Trash2,
  Clock, Tag, Paperclip,
  File, Download, FileCode, FileText,
  Mail
} from 'lucide-vue-next'

import EmailShadow from './EmailShadow.vue'
import { useLabelStore } from '../stores/categoryStore'
import Summary from './Summary.vue';
import { DifySummary } from '../interface/dify';
import { Attachment, Message } from '../interface/email';
import emailService from '../services/email';

const props = defineProps<{
  email: Message | null,
  // summary: DifySummary | null,
  loading: boolean,
  darkMode: boolean
}>()

const showHtml = ref(true)
const labelStore = useLabelStore()

const hasHtml = computed(() => !!props.email?.text_html && props.email.text_html.trim().length > 0)
const hasText = computed(() => !!props.email?.text_plain && props.email.text_plain.trim().length > 0)
const attachments = ref<Attachment[]>([])

const isProcessing = ref(false)
const isLoading = computed(() => props.loading || isProcessing.value || !props.email)

const avatarHue = computed(() => {
  if (!props.email) return 0
  const name = senderFormat(getHeaderValue(props.email.payload.headers, 'From'))?.name ?? ''
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
})

const loadAttachments = async () => {
  if (!props.email?.attachments || props.email.attachments.length === 0) {
    attachments.value = []
    return attachments.value
  }

  isProcessing.value = true 
  try {
    const results = await Promise.all(props.email.attachments.map(async (att) => {
      if (att.attachmentId && !att.data) {
        try {
          const res = await emailService.getAttachment(props.email!.id, att.attachmentId)
          return { ...att, data: res.data }
        } catch (e) { return att }
      }
      return att
    }))
    attachments.value = results
  } finally {
    isProcessing.value = false
  }
}

const downloadAttachment = (file: Attachment) => {
  if (!file.data) return
  
  const standardBase64 = file.data.replace(/-/g, '+').replace(/_/g, '/')
  
  const link = document.createElement('a')
  link.href = `data:${file.mimeType};base64,${standardBase64}`
  link.download = file.filename
  link.click()
}

watch(() => props.email, (newEmail) => {
  if (!newEmail) return
  loadAttachments()
  const _hasHtml = !!newEmail.text_html && newEmail.text_html.trim().length > 0
  const _hasText = !!newEmail.text_plain && newEmail.text_plain.trim().length > 0
  showHtml.value = _hasHtml ? true : _hasText ? false : true
}, { immediate: true })

defineEmits(['sendEmail', 'archiveEmail', 'trashEmail', 'replyEmail', 'forwardEmail'])
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden transition-colors duration-200"
    :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">

    <div
      class="h-14 border-b flex items-center justify-between px-5 shrink-0 gap-4"
      :class="darkMode ? 'border-gray-700/60 bg-gray-900' : 'border-gray-200 bg-white'"
    >
      <div class="flex items-center gap-2 shrink-1">
                <div
          class="flex items-center p-0.5 rounded-lg border gap-0.5"
          :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'"
        >
          <button
            @click="showHtml = true"
            :disabled="!hasHtml"
            :title="!hasHtml ? 'No HTML content' : 'View HTML'"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
            :class="[
              showHtml && hasHtml
                ? (darkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'),
              !hasHtml ? 'opacity-40 cursor-not-allowed' : ''
            ]"
          >
            <FileCode :size="12" /> HTML
          </button>
          <button
            @click="showHtml = false"
            :disabled="!hasText"
            :title="!hasText ? 'No plain text' : 'View plain text'"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
            :class="[
              !showHtml && hasText
                ? (darkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'),
              !hasText ? 'opacity-40 cursor-not-allowed' : ''
            ]"
          >
            <FileText :size="12" /> Text
          </button>
        </div>

        <div class="w-px h-5" :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'" />

        <button
          @click="$emit('trashEmail')"
          title="Delete"
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          :class="darkMode
            ? 'text-gray-500 hover:text-red-400 hover:bg-red-400/10'
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="flex-1 flex flex-col items-center justify-center gap-4"
      :class="darkMode ? 'text-gray-600' : 'text-gray-400'"
    >
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 rounded-full border-2 border-blue-500/20" />
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <span class="text-sm">Loading email...</span>
    </div>

    <div
      v-else-if="email"
      class="flex-1 overflow-y-auto custom-scrollbar"
      :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'"
    >
      <div class="max-w-6xl mx-auto px-6 py-6 space-y-5">

        <h2
          class="text-2xl font-bold leading-snug tracking-tight flex items-center justify-between gap-4 p-4 rounded-2xl border"
          :class="darkMode ? 'text-white bg-gray-800/50 border-gray-700/40' : 'text-gray-900 bg-white border-gray-100 shadow-sm'"
        >
          {{ getHeaderValue(email.payload.headers, 'Subject') || '(No Subject)' }}
        </h2>

        <!-- <Summary :data="summary" :darkMode="darkMode" :loading="loading" /> -->

        <div
          class="flex items-center justify-between gap-4 p-4 rounded-2xl border"
          :class="darkMode
            ? 'bg-gray-800/50 border-gray-700/40'
            : 'bg-white border-gray-100 shadow-sm'"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0 text-white shadow-md"
              :style="{
                background: `hsl(${avatarHue}, 60%, ${darkMode ? '38%' : '48%'})`
              }"
            >
              {{ getFirstCharacter(senderFormat(getHeaderValue(email.payload.headers, 'From'))?.name ?? '') }}
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="font-semibold text-sm truncate"
                  :class="darkMode ? 'text-gray-100' : 'text-gray-900'"
                >
                  {{ senderFormat(getHeaderValue(email.payload.headers, 'From'))?.name }}
                </span>
                <span
                  class="text-xs truncate"
                  :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
                >
                  &lt;{{ senderFormat(getHeaderValue(email.payload.headers, 'From'))?.email }}&gt;
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-1">
                <span
                  v-for="(label, index) in labelStore.getLabelByIds(getLabel(email.labelIds))"
                  :key="index"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-black/5"
                  :style="{ backgroundColor: label?.color?.backgroundColor, color: label?.color?.textColor }"
                >
                  <Tag class="w-2.5 h-2.5 opacity-70" />
                  {{ label?.name }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap"
            :class="darkMode ? 'bg-gray-700/60 text-white' : 'bg-gray-100 text-black'"
          >
            <Clock :size="12" />
            {{ formatDateTime(getHeaderValue(email.payload.headers, 'Date')) }}
          </div>
        </div>

        <div
          class="rounded-2xl border overflow-hidden"
          :class="darkMode ? 'border-gray-700/40' : 'border-gray-100 shadow-sm'"
        >
          <div v-if="showHtml" class="bg-white">
            <!-- {{ sanitizeHtml(props.email?.text_html)}} -->
            <EmailShadow 
              :content="props.email?.text_html" 
              :attachments="attachments" 
            />
          </div>

          <div
            v-else
            class="whitespace-pre-wrap font-mono text-sm leading-7 p-6"
            :class="darkMode ? 'bg-gray-800/60 text-gray-300' : 'bg-white text-gray-700'"
          >
            {{ email.text_plain }}
          </div>
        </div>

        <div
          v-if="email.attachments && email.attachments.length > 0"
          class="pt-2"
        >
          <p
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          >
            <Paperclip :size="13" />
            Attachments ({{ attachments.length }})
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="(file, index) in attachments"
              :key="index"
              @click="downloadAttachment(file)"
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group"
              :class="darkMode
                ? 'bg-gray-800/60 border-gray-700/50 hover:border-blue-500/40 hover:bg-gray-800'
                : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md shadow-sm'"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-500'"
              >
                <File :size="16" />
              </div>

              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-medium truncate"
                  :class="darkMode ? 'text-gray-200' : 'text-gray-800'"
                >
                  {{ file.filename }}
                </p>
                <p class="text-xs" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
                  {{ formatSize(file.size) }}
                </p>
              </div>

              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                :class="darkMode
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'"
              >
                <Download :size="15" />
              </button>
            </div>
          </div>
        </div>

        <div
          class="flex gap-3 pt-4 pb-10 border-t"
          :class="darkMode ? 'border-gray-700/40' : 'border-gray-100'"
        >
          <button
            @click="$emit('replyEmail')"
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <Reply :size="15" /> Reply
          </button>
          <button
            @click="$emit('forwardEmail')"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all"
            :class="darkMode
              ? 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
              : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm'"
          >
            <Forward :size="15" /> Forward
          </button>
        </div>

      </div>
    </div>

    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center gap-4 select-none"
      :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'"
    >
      <div
        class="w-20 h-20 rounded-2xl flex items-center justify-center mb-1 shadow-inner"
        :class="darkMode ? 'bg-gray-800 text-gray-600' : 'bg-white text-gray-300 shadow-sm'"
      >
        <Mail :size="36" />
      </div>
      <p
        class="text-base font-semibold"
        :class="darkMode ? 'text-gray-600' : 'text-gray-400'"
      >
        Select an email to read
      </p>
      <p
        class="text-sm"
        :class="darkMode ? 'text-gray-700' : 'text-gray-300'"
      >
        Choose from the list on the left
      </p>
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
  background-color: rgba(156, 163, 175, 0.35);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.6);
}
</style>