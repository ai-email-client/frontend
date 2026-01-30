<script setup lang="ts">
import {
  sanitizeHtml,
  formatSize
} from '../utils'

import {
  computed,
  ref,
  watch
} from 'vue';

// import emailService from '../services/email'
// import Summary from './Summary.vue'
import {
  Reply, Forward, Archive, Trash2,
  Star, Clock, Tag, Paperclip,
  File, Download, FileCode, FileText
} from 'lucide-vue-next'
import {
  Email,
} from '../interface/email'

import EmailShadow from './EmailShadow.vue'

import emailService from '../api/email'

const props = defineProps<{
  email: Email | null,
  loading: boolean,
  darkMode: boolean
}>()

defineEmits(['toggleDarkMode'])


const showHtml = ref(true)

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

</script>

<template>
  <div class="h-16 border-b flex items-center justify-between px-6 shrink-0"
    :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
    <div class="flex items-center gap-4">
      <div class="flex p-1 rounded-lg" :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
        <button
          class="p-2 rounded-md shadow-sm transition-all hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Archive :size="18" />
        </button>
        <button
          class="p-2 rounded-md shadow-sm transition-all hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Trash2 :size="18" />
        </button>
        <button
          class="p-2 rounded-md shadow-sm transition-all hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
          <Star :size="18" />
        </button>

        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

      </div>
    </div>
  </div>

  <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    <span>Loading email content...</span>
  </div>

  <div v-else-if="email" class="flex-1 overflow-y-auto p-8 custom-scrollbar">
    <div class="max-w-4xl mx-auto">

      <div class="flex justify-between items-start mb-8">
        <div>
          <h1 class="text-2xl font-bold mb-4 break-words leading-tight"
            :class="darkMode ? 'text-white' : 'text-gray-900'">
            {{ email.subject || '(No Subject)' }}
            <span class="text-xs font-normal text-gray-400 ml-2 select-all">{{ email.msg_id }}</span>
          </h1>

          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow-md">
              {{ email.sender ? email.sender.charAt(0) : '?' }}
            </div>
            <div>
              <div class="font-semibold text-lg" :class="darkMode ? 'text-white' : 'text-gray-900'">
                {{ email.sender }}
              </div>
              <div class="text-sm flex items-center gap-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                <span>to me</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-right text-gray-500 text-sm flex flex-col items-end gap-2 shrink-0">
          <div class="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <Clock :size="14" />
            {{ email.time }}
          </div>

          <div v-if="email.tag && email.tag.length" class="flex flex-wrap gap-1 justify-end max-w-[200px]">
            <div v-if="typeof email.tag === 'string'" class="flex items-center gap-1">
              <Tag :size="14" /> {{ email.tag }}
            </div>
            <div v-else v-for="(t, i) in email.tag" :key="i"
              class="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100">
              <Tag :size="12" /> {{ t }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mb-4">
        <div class="bg-gray-100 p-1 rounded-lg flex items-center gap-1">

          <button @click="showHtml = true" :disabled="!hasHtml"
            class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all" :class="[
              showHtml && hasHtml
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',

              !hasHtml ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
            ]" :title="!hasHtml ? 'No HTML content' : 'View Original HTML'">
            <FileCode :size="14" /> HTML
          </button>

          <button @click="showHtml = false" :disabled="!hasText"
            class="px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all" :class="[
              !showHtml && hasText
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',

              !hasText ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
            ]" :title="!hasText ? 'No Plain Text content' : 'View Plain Text'">
            <FileText :size="14" /> Text
          </button>

        </div>
      </div>

      <div class="prose max-w-none break-words" :class="darkMode ? 'prose-invert' : ''">

        <div v-if="showHtml">
          <EmailShadow :content="sanitizeHtml(props.email?.html)" />
        </div>

        <div v-else>
          <div class="whitespace-pre-wrap font-mono text-sm leading-relaxed 
            text-gray-700 dark:text-gray-300 
            bg-gray-50 dark:bg-gray-900 
            p-6 rounded-lg border border-gray-200 dark:border-gray-700">
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
              <Download :size="18" @click="emailService.downloadAttachment(file, email.msg_id)" />
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
  </div>

  <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
    <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
      <span class="text-2xl">📧</span>
    </div>
    <span class="text-lg">Select an email to read</span>
  </div>
</template>