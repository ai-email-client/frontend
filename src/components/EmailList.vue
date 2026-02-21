<script setup lang="ts">
import {
  Search,
  PenSquare,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock
} from 'lucide-vue-next'
import { 
  EmailShortResponse 
} from '../interface/response';
import { useLabelStore } from '../stores/categoryStore';
import { formatTimeAgo, getFirstCharacter, getLabel, senderFormat } from '../utils';

const labelStore = useLabelStore();

defineProps<{
  emails: EmailShortResponse[],
  selectedEmail: EmailShortResponse | null,
  darkMode: boolean,
  loading: boolean
  currentPage: number
  totalMessage: number
  limit: number
  collapsed?: boolean
}>()

defineEmits(['select', 'refresh', 'prevPage', 'nextPage', 'sendEmail'])
</script>

<template>
  <div
    class="w-full flex flex-col border-r h-full transition-colors duration-300 overflow-hidden"
    :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
  >

    <template v-if="collapsed">
      <div class="flex flex-col items-center gap-2 py-3 flex-1 overflow-y-auto custom-scrollbar">
        <button
          @click="$emit('refresh')"
          :disabled="loading"
          title="Refresh"
          class="w-9 h-9 rounded-full flex items-center justify-center transition-colors mb-1 shrink-0"
          :class="darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'"
        >
          <RotateCw :size="18" :class="{ 'animate-spin': loading }" />
        </button>

        <div class="w-6 border-t shrink-0" :class="darkMode ? 'border-gray-700' : 'border-gray-200'" />

        <button
          v-for="email in emails"
          :key="email.msg_id"
          @click="$emit('select', email.msg_id)"
          :title="`${getFirstCharacter(senderFormat(email.sender)?.name ?? '')} — ${email.subject}`"
          class="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-150 shrink-0 shadow-sm"
          :class="[
            selectedEmail?.msg_id === email.msg_id
              ? 'bg-blue-600 text-white scale-110 shadow-md'
              : (darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105')
          ]"
        >
          {{ getFirstCharacter(senderFormat(email.sender)?.name ?? '') }}

          <span
            v-if="email.tag.includes('UNREAD')"
            class="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2"
            :class="darkMode ? 'border-gray-900' : 'border-white'"
          />
        </button>

      </div>
    </template>

    <template v-else>
      <div class="p-4 border-b shrink-0" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
        <div class="flex items-center justify-between mb-4">
          <button
            @click="$emit('refresh')"
            :disabled="loading"
            class="p-2 rounded-full hover:bg-gray-100 transition-all"
            title="Refresh"
          >
            <RotateCw :size="18" :class="{ 'animate-spin': loading }" />
          </button>
          <h2 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-gray-900'">Inbox</h2>
          <button
            @click="$emit('sendEmail')"
            :disabled="loading"
            class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <PenSquare :size="18" />
          </button>
        </div>

        <div class="flex items-center justify-between mb-4">
          <button
            @click="$emit('prevPage')"
            :disabled="currentPage <= 1 || loading"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            :class="darkMode ? 'text-gray-300' : 'text-gray-600'"
          >
            <ChevronLeft :size="18" />
          </button>
          <span class="text-xs font-medium" :class="darkMode ? 'text-gray-100' : 'text-gray-500'">
            Page {{ currentPage }} / {{ Math.ceil(totalMessage / limit) || 1 }}
          </span>
          <button
            @click="$emit('nextPage')"
            :disabled="currentPage * limit >= totalMessage || loading"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            :class="darkMode ? 'text-gray-300' : 'text-gray-600'"
          >
            <ChevronRight :size="18" />
          </button>
        </div>

        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
            :size="16"
          />
          <input
            type="text"
            placeholder="Search emails..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            :class="darkMode
              ? 'bg-gray-900 border-gray-800 text-gray-200 placeholder-gray-600 focus:bg-gray-900'
              : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white'"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div
          v-for="email in emails"
          :key="email.msg_id"
          @click="$emit('select', email.msg_id)"
          class="p-4 border-b border-l-4 cursor-pointer transition-all group relative"
          :class="[
            darkMode ? 'border-b-gray-800' : 'border-b-gray-100',
            selectedEmail?.msg_id === email.msg_id
              ? (darkMode ? 'bg-blue-500/20 border-l-blue-500' : 'bg-blue-50 border-l-blue-500')
              : (darkMode ? 'border-l-transparent hover:bg-gray-800' : 'border-l-transparent hover:bg-gray-50')
          ]"
        >
          <div 
            class="flex items-start justify-between gap-4">
            <div
              class="flex-1 min-w-0 transition-opacity duration-200"
              :class="!email.tag.includes('UNREAD') ? 'opacity-50' : 'opacity-100'"
            >
              <div class="flex items-center justify-between gap-3 mb-1">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <div v-if="email.tag.includes('UNREAD')" class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <h3
                    class="text-md truncate flex-shrink-0 max-w-[150px] sm:max-w-[200px]"
                    :class="[
                      email.tag.includes('UNREAD') ? 'font-semibold' : 'font-medium',
                      darkMode
                        ? (email.tag.includes('UNREAD') ? 'text-gray-100' : 'text-gray-400')
                        : (email.tag.includes('UNREAD') ? 'text-black' : 'text-gray-500')
                    ]"
                  >
                    {{ senderFormat(email.sender)?.name }}
                  </h3>
                  <div class="flex items-center gap-1.5 overflow-hidden">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-black/5 dark:border-white/10"
                      :style="{ 
                        backgroundColor: labelStore.getLabelById(getLabel(email.tag)[0])?.color?.backgroundColor, 
                        color: labelStore.getLabelById(getLabel(email.tag)[0])?.color?.textColor 
                      }"
                    >
                      <Tag class="w-3 h-3 opacity-70" />
                      <span class="truncate max-w-[80px]">{{ labelStore.getLabelById(getLabel(email.tag)[0])?.name }}</span>
                    </span>
                  </div>
                </div>
                <div
                  class="text-xs flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
                  :class="darkMode
                    ? (email.tag.includes('UNREAD') ? 'text-gray-300' : 'text-gray-500')
                    : (email.tag.includes('UNREAD') ? 'text-gray-600' : 'text-gray-400')"
                >
                  <Clock class="w-3 h-3" />
                  {{ formatTimeAgo(email.time) }}
                </div>
              </div>
              <h3
                class="text-sm truncate"
                :class="[
                  email.tag.includes('UNREAD') ? 'font-semibold' : 'font-normal',
                  darkMode
                    ? (email.tag.includes('UNREAD') ? 'text-gray-100' : 'text-gray-400')
                    : (email.tag.includes('UNREAD') ? 'text-black' : 'text-gray-600')
                ]"
              >
                {{ email.subject }}
              </h3>
              <div
                class="text-xs line-clamp-2 mb-2 transition-colors"
                :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                {{ email.snippet }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>