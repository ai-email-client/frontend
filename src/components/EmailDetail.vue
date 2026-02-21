<script setup lang="ts">
import {
  sanitizeHtml,
  formatSize,
  senderFormat,
  getLabel,
  formatDateTime
} from '../utils'

import {
  computed,
  ref,
  watch
} from 'vue';

import {
  Reply, Forward, Trash2,
  Clock, Tag, Paperclip,
  File, Download, FileCode, FileText
} from 'lucide-vue-next'

import EmailShadow from './EmailShadow.vue'
import { useLabelStore } from '../stores/categoryStore'

import { EmailDetailResponse } from '../interface/response'
import Summary from './Summary.vue';
import { DifySummary } from '../interface/dify';

const props = defineProps<{
  email: EmailDetailResponse | null,
  summary: DifySummary | null,
  loading: boolean,
  darkMode: boolean
}>()

const showHtml = ref(true)

const labelStore = useLabelStore()

const hasHtml = computed(() => {
  return !!props.email?.html && props.email.html.trim().length > 0
})

const hasText = computed(() => {
  return !!props.email?.plain_text && props.email.plain_text.trim().length > 0
})

watch(() => props.email, (newEmail) => {
  if (!newEmail) return

  const _hasHtml = !!newEmail.html && newEmail.html.trim().length > 0
  const _hasText = !!newEmail.plain_text && newEmail.plain_text.trim().length > 0

  if (_hasHtml) {
    showHtml.value = true
  } else if (_hasText) {
    showHtml.value = false
  } else {
    showHtml.value = true
  }

}, { immediate: true })

defineEmits(['sendEmail', 'archiveEmail', 'trashEmail', 'replyEmail', 'forwardEmail'])
</script>

<template>
  <div class="h-16 border-b flex items-center justify-between px-6 shrink-0 w-full"
    :class="darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'">
    <div class="flex-1 min-w-0 pr-4">
      <h1 class="text-lg sm:text-xl font-bold truncate" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
        {{ email?.subject || '' }}
      </h1>
    </div>

    <div class="flex items-center gap-1 rounded-lg border transition-colors" 
        :class="darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-200/50 border-gray-200'">
        <button @click="$emit('trashEmail')" class="p-2 rounded-md transition-all group" 
          :class="darkMode
            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700 hover:shadow-sm'
            : 'text-gray-500 hover:text-red-500 hover:bg-white hover:shadow-sm'">
          <Trash2 :size="18" />
        </button>
        <div class="p-1 rounded-lg flex items-center gap-1" :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
          <button @click="showHtml = true" :disabled="!hasHtml"
            class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all" :class="[
              showHtml && hasHtml
                ? (darkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'),
              !hasHtml ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
            ]" :title="!hasHtml ? 'No HTML content' : 'View Original HTML'">
            <FileCode :size="14" /> HTML
          </button>
          <button @click="showHtml = false" :disabled="!hasText"
            class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all" :class="[
              !showHtml && hasText
                ? (darkMode ? 'bg-gray-700 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'),
              !hasText ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
            ]" :title="!hasText ? 'No Plain Text content' : 'View Plain Text'">
            <FileText :size="14" /> Text
          </button>
        </div>
    </div>
  </div>

  <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    <span>Loading email content...</span>
  </div>

  <div v-else-if="email" class="flex-1 overflow-y-auto p-5 custom-scrollbar"
    :class="darkMode ? 'border-gray-800 bg-gray-400' : 'border-gray-200 bg-gray-50'">
      <Summary :data="summary" :darkMode="darkMode" :loading="loading" />
      <div class="flex justify-between items-start mb-8">
        <div class="flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors w-full" 
          :class="darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/80 border-gray-100'">
          <div class="w-14 h-14 shrink-0 rounded-full bg-white text-gray-900 flex items-center justify-center font-bold text-xl shadow-lg ring-4"
              :class="darkMode ? 'ring-gray-800' : 'ring-white'">
              {{ senderFormat(email?.sender)?.name ? senderFormat(email?.sender)?.name.charAt(0).toUpperCase() : '?' }}
          </div>
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex flex-wrap items-center gap-2 mb-0.5">
              <span class="font-bold text-lg truncate" :class="darkMode ? 'text-white' : 'text-gray-900'">
                {{ senderFormat(email?.sender)?.email }}
              </span>
              <span 
                v-for="(label, index) in labelStore.getLabelByIds(getLabel(email.tag))" 
                :key="index"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-black/5 dark:border-white/10 shrink-0"
                :style="{ 
                  backgroundColor: label?.color?.backgroundColor, 
                  color: label?.color?.textColor 
                }"
                >
                  <Tag class="w-3 h-3 opacity-70" />
                  <span class="truncate max-w-[80px]">{{ label?.name }}</span>
                </span>
            </div>
          </div>
          <div class="text-right text-sm flex flex-col items-end gap-2 shrink-0 ml-auto">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full whitespace-nowrap"
                :class="darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-500'">
                <Clock :size="14" />
                {{ formatDateTime(email.time) }}
            </div>
          </div>
        </div>
      </div>
      <!-- Content -->
      <div class="prose max-w-none break-words" :class="darkMode ? 'prose-invert' : ''">
        <div v-if="showHtml">
          <div class="bg-white">
            <EmailShadow :content="sanitizeHtml(props.email?.html)" />
          </div>
        </div>
        <div v-else>
          <div class="whitespace-pre-wrap font-mono text-sm leading-relaxed rounded-lg p-4"
            :class="darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-200 text-gray-900'">
            {{ email.plain_text }}
          </div>
        </div>
      </div>

      <div v-if="email.attachments && email.attachments.length > 0" class="mb-12 pt-6 border-t mt-8"
        :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
        <h3 class="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-500">
          <Paperclip :size="16" />
          Attachments ({{ email.attachments.length }})
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="(file, index) in email.attachments" :key="index"
            class="flex items-center p-3 border rounded-lg hover:bg-opacity-50 transition-colors group cursor-pointer"
            :class="darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'">
            <div class="p-2 rounded-lg mr-3 shadow-sm text-blue-500" :class="darkMode ? 'bg-gray-700' : 'bg-white'">
              <File :size="20" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
                {{ file.filename }}
              </p>
              <p class="text-xs text-gray-500">{{ formatSize(file.size) }}</p>
            </div>

            <button class="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <Download :size="18" class="group-hover:text-blue-500" />
            </button>
          </div>
        </div>
      </div>

      <div class="border-t pt-8" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
        <div class="flex gap-4 flex-wrap">
          <button
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md">
            <Reply :size="18" /> Reply
          </button>
          <button
            class="px-6 py-2.5 border rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
            :class="darkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'">
            <Forward :size="18" /> Forward
          </button>
        </div>
      </div>
  </div>

  <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
      <span class="text-2xl">📧</span>
    </div>
    <span class="text-lg">Select an email to read</span>
  </div>
</template>