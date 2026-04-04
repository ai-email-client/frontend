<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Inbox, RotateCw, Sparkles,
  ChevronLeft, ChevronRight,
  AlertTriangle, ArrowUpRight,
  Clock, Mail, Flame, TrendingUp, Minus,
  CheckCircle
} from 'lucide-vue-next'
import { formatDateTime, formatTimeAgo, getFirstCharacter } from '../utils'
import emailService from '../services/email'
import { useUiStore } from '../stores/uiStore'
import EmailShadow from '../components/EmailShadow.vue'
import Divider from '../components/Divider.vue'
import type { Message } from '../interface/email'
import databaseService from '../services/database'
import { OverviewResponse } from '../interface/response'
import { useComposerStore } from '../stores/composerStore'

const props = defineProps<{
  darkMode: boolean
  listWidth?: number
}>()
const emit = defineEmits(['update:listWidth'])

const uiStore      = useUiStore()
const composerStore = useComposerStore()

const emails        = ref<Message[]>([])
const overviews     = ref<OverviewResponse[]>([])
const selectedEmail = ref<Message | null>(null)
const activeFilter  = ref('all')

const label           = ['INBOX', 'UNREAD']
const limit           = 10
const query           = ''
const format          = 'full'
const metadataHeaders : string[] = []

const nextPageToken = ref<string | null>(null)
const stackToken    = ref<string[]>([''])
const currentPage   = ref(0)
const totalMessage  = ref(1)

const containerRef = ref<HTMLElement | null>(null)
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

const currentWidth = computed({
  get: () => props.listWidth ?? 400,
  set: (val) => emit('update:listWidth', val),
})
const showViewer = computed(() => selectedEmail.value !== null)

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  currentWidth.value = raw < SNAP_PX
    ? MIN_PX
    : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
}
const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 400    }

const importanceLevels = [
  { key: 'all',    label: 'All',    icon: Inbox         },
  { key: 'high',   label: 'High',   icon: Flame         },
  { key: 'medium', label: 'Medium', icon: TrendingUp    },
  { key: 'low',    label: 'Low',    icon: Minus         },
]

const importanceConfig: Record<string, {
  label: string
  icon: any
  dot: string
  badge: { light: string; dark: string }
  border: { light: string; dark: string }
  bg: { light: string; dark: string }
}> = {
  high: {
    label: 'High',
    icon: Flame,
    dot: 'bg-red-500',
    badge: {
      light: 'bg-red-50 text-red-600 border-red-200',
      dark:  'bg-red-900/30 text-red-400 border-red-700/30',
    },
    border: {
      light: 'border-l-red-400',
      dark:  'border-l-red-500',
    },
    bg: {
      light: 'bg-red-50',
      dark:  'bg-red-500/10',
    },
  },
  medium: {
    label: 'Medium',
    icon: TrendingUp,
    dot: 'bg-amber-500',
    badge: {
      light: 'bg-amber-50 text-amber-600 border-amber-200',
      dark:  'bg-amber-900/30 text-amber-400 border-amber-700/30',
    },
    border: {
      light: 'border-l-amber-400',
      dark:  'border-l-amber-500',
    },
    bg: {
      light: 'bg-amber-50',
      dark:  'bg-amber-500/10',
    },
  },
  low: {
    label: 'Low',
    icon: Minus,
    dot: 'bg-blue-400',
    badge: {
      light: 'bg-blue-50 text-blue-600 border-blue-200',
      dark:  'bg-blue-900/30 text-blue-400 border-blue-700/30',
    },
    border: {
      light: 'border-l-blue-300',
      dark:  'border-l-blue-500',
    },
    bg: {
      light: 'bg-blue-50',
      dark:  'bg-blue-500/10',
    },
  },
}

const getImportance = (emailId: string): string | null => {
  const overview = overviews.value.find(o => o.msg_id === emailId)
  return overview?.importance?.level?.toLowerCase() ?? null
}

const getImportanceConfig = (level: string | null) =>
  level ? importanceConfig[level] ?? null : null

const selectedSummary = computed(() => {
  if (!selectedEmail.value) return null
  const overview = overviews.value.find(o => o.msg_id === selectedEmail.value?.id)
  return overview
})

let abortController: AbortController | null = null
const BATCH = 1

const filteredEmails = async () => {
  abortController?.abort()
  abortController = new AbortController()
  const signal = abortController.signal

  emails.value = []

  if (activeFilter.value === 'all') {
    await fetchEmails()
    return
  }

  const ids = overviews.value
    .filter(e => e.importance?.level?.toLowerCase() === activeFilter.value)
    .map(e => e.msg_id)

  const results: Message[] = []

  for (let i = 0; i < ids.length; i += BATCH) {
    if (signal.aborted) return

    const batch = await Promise.allSettled(
      ids.slice(i, i + BATCH).map(async (id) => {
        const message = await emailService.getMessageByID(id, { format: 'full' }, signal)
        if (signal.aborted) return
        return message
      })
    )

    const settled = batch
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => (r as PromiseFulfilledResult<Message>).value)
      .flat()

    results.push(...settled)
    emails.value = [...results].sort((a, b) =>
      new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    )
  }
}

const stats = computed(() => ({
  total:  overviews.value.length,
  high:   overviews.value.filter(s => s.importance?.level?.toLowerCase() === 'high').length,
  medium: overviews.value.filter(s => s.importance?.level?.toLowerCase() === 'medium').length,
  low:    overviews.value.filter(s => s.importance?.level?.toLowerCase() === 'low').length,
}))

const totalPages = computed(() => Math.ceil(stats.value.total / limit) || 1)
const canPrev    = computed(() => currentPage.value > 0)
const canNext    = computed(() =>
  currentPage.value < stackToken.value.length - 1 || !!nextPageToken.value
)

const fetchEmails = async (pageToken = '') => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = null

    const response = await emailService.fetchEmails(
      label, limit, pageToken, query, false, format, metadataHeaders
    )
    nextPageToken.value = response.nextPageToken
    if (response.nextPageToken && !stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }
    emails.value = response.messages

    const res = await databaseService.get_overview()
    overviews.value = res
  } catch (error) {
    console.error('fetchEmails error:', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const nextPage = async () => {
  if (!canNext.value) return
  currentPage.value++
  emails.value = []
  await fetchEmails(stackToken.value[currentPage.value] ?? '')
}

const prevPage = async () => {
  if (!canPrev.value) return
  currentPage.value--
  emails.value = []
  await fetchEmails(stackToken.value[currentPage.value])
}

const getTotalMessage = async () => {
  try {
    const response = await emailService.getLabelById('INBOX')
    if (response.messagesUnread) totalMessage.value = response.messagesUnread
  } catch {}
}

const handleOpenReplyComposer = () => {
  composerStore.openComposer('reply', null, selectedEmail.value)
}

const markAsSpam = async (email: Message) => {
  try {
    await emailService.messageModify({
      id: email.id,
      addLabelIds: ['SPAM']
    })
    email.labelIds = email.labelIds?.filter(id => id !== 'SPAM') || []
    await fetchEmails()
  } catch (error) {
    console.error('make_spam error:', error)
  }
}

const markAsRead = async (email: Message) => {
  try {
    await emailService.messageModify({
      id: email.id,
      removeLabelIds: ['UNREAD']
    })
    email.labelIds = email.labelIds?.filter(id => id !== 'UNREAD') || []
    await fetchEmails()
  } catch (error) {
    console.error('mark_as_read error:', error)
  }
}

onMounted(() => {
  fetchEmails()
  getTotalMessage()
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden"
    :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">

    <div class="shrink-0 px-6 py-4 border-b"
      :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">

      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
            :class="darkMode ? 'bg-blue-900/30' : 'bg-blue-50'">
            <Inbox :size="18" class="text-blue-500" />
          </div>
          <div>
            <h1 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-900'">
              Unread Overview
            </h1>
            <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              AI-prioritized inbox
            </p>
          </div>
        </div>
        <button @click="fetchEmails()" :disabled="uiStore.isLoading"
          class="p-2 rounded-lg transition-colors"
          :class="darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
          <RotateCw :size="16" :class="{ 'animate-spin': uiStore.isLoading }" />
        </button>
      </div>

      <div class="grid grid-cols-4 gap-2 mb-5">
        <div v-for="stat in [
          { label: 'Unread',  value: stats.total,  color: 'text-gray-500',   bg: darkMode ? 'bg-gray-800/60' : 'bg-gray-50'    },
          { label: 'High',    value: stats.high,   color: 'text-red-500',    bg: darkMode ? 'bg-red-900/20'  : 'bg-red-50'     },
          { label: 'Medium',  value: stats.medium, color: 'text-amber-500',  bg: darkMode ? 'bg-amber-900/20': 'bg-amber-50'   },
          { label: 'Low',     value: stats.low,    color: 'text-blue-400',   bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50'    },
        ]" :key="stat.label"
          class="rounded-2xl p-3 text-center border"
          :class="[stat.bg, darkMode ? 'border-gray-700/40' : 'border-gray-100']">
          <p class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</p>
          <p class="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            {{ stat.label }}
          </p>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button v-for="f in importanceLevels" :key="f.key"
          @click="activeFilter = f.key; selectedEmail = null; filteredEmails()"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border"
          :class="activeFilter === f.key
            ? (darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700/40' : 'bg-blue-50 text-blue-600 border-blue-200')
            : (darkMode ? 'text-gray-500 border-gray-700/40 hover:bg-gray-800' : 'text-gray-400 border-gray-200 hover:bg-gray-50')">
          <component :is="f.icon" :size="12" />
          {{ f.label }}
        </button>
      </div>
    </div>

    <div ref="containerRef" class="flex flex-1 overflow-hidden">

      <div
        :style="{ width: `${currentWidth}px`, minWidth: `${MIN_PX}px`, flexShrink: 0 }"
        class="flex-col overflow-hidden transition-none"
        :class="showViewer ? 'hidden md:flex' : 'flex'"
      >
        <div v-if=" activeFilter == 'all'" class="flex items-center justify-between px-4 py-2 border-b"
          :class="darkMode ? 'border-gray-800' : 'border-gray-100'">
          <div class="flex items-center gap-1">
            <button @click="prevPage" :disabled="!canPrev || uiStore.isLoading"
              class="p-1 rounded transition-colors disabled:opacity-30"
              :class="darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
              <ChevronLeft :size="14" />
            </button>
            <span class="text-xs px-1" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              {{ currentPage + 1 }} / {{ totalPages }}
            </span>
            <button @click="nextPage" :disabled="!canNext || uiStore.isLoading"
              class="p-1 rounded transition-colors disabled:opacity-30"
              :class="darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
              <ChevronRight :size="14" />
            </button>
          </div>
          <span class="text-xs" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
            {{ stats.total }}
          </span>
        </div>
        <div v-else class="flex items-center justify-between px-4 py-2 border-b"
          :class="darkMode ? 'border-gray-800' : 'border-gray-100'">
          <span class="text-xs" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
            {{ stats[activeFilter as keyof typeof stats] }}
          </span>
        </div>

        <div v-if="!uiStore.isLoading && emails.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-3 select-none">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
            :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
            <Inbox :size="26" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
          </div>
          <p class="text-sm font-semibold" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            All caught up
          </p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-for="email in emails" :key="email.id"
            @click="selectedEmail = email"
            class="px-4 py-3 border-b border-l-4 cursor-pointer transition-all group"
            :class="[
              darkMode ? 'border-b-gray-800/60' : 'border-b-gray-100',
              selectedEmail?.id === email.id
                ? (getImportanceConfig(getImportance(email.id))
                    ? (darkMode
                        ? getImportanceConfig(getImportance(email.id))!.bg.dark + ' ' + getImportanceConfig(getImportance(email.id))!.border.dark
                        : getImportanceConfig(getImportance(email.id))!.bg.light + ' ' + getImportanceConfig(getImportance(email.id))!.border.light)
                    : (darkMode ? 'bg-blue-500/10 border-l-blue-500' : 'bg-blue-50 border-l-blue-400'))
                : (darkMode ? 'border-l-transparent hover:bg-gray-800/40' : 'border-l-transparent hover:bg-gray-50')
            ]">
            <div class="flex items-start gap-3">

              <div class="relative shrink-0">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  :class="getImportanceConfig(getImportance(email.id))
                    ? (darkMode ? 'bg-gray-600' : 'bg-gray-400')
                    : (darkMode ? 'bg-gray-700' : 'bg-gray-300')"
                  :style="getImportance(email.id) === 'high' ? 'background: linear-gradient(135deg, #ef4444, #f97316)' :
                           getImportance(email.id) === 'medium' ? 'background: linear-gradient(135deg, #f59e0b, #eab308)' :
                           getImportance(email.id) === 'low' ? 'background: linear-gradient(135deg, #3b82f6, #6366f1)' : ''"
                >
                  {{ getFirstCharacter(email.sender?.name || '') }}
                </div>
                <span
                  v-if="getImportance(email.id)"
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ring-0"
                  :class="[
                    getImportanceConfig(getImportance(email.id))!.dot,
                    darkMode ? 'border-gray-900' : 'border-white'
                  ]"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <span class="text-sm font-semibold truncate"
                    :class="darkMode ? 'text-gray-100' : 'text-gray-900'">
                    {{ email.sender?.name || email.sender?.email }}
                  </span>
                  <span class="text-[10px] shrink-0 flex items-center gap-1"
                    :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
                    <Clock :size="9" />
                    {{ formatTimeAgo(email.date || '') }}
                  </span>
                </div>

                <p class="text-xs font-medium truncate mb-1"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                  {{ email.subject }}
                </p>

                <!-- Summary snippet + importance badge -->
                <div class="flex items-start justify-between gap-2">
                  <p class="text-[11px] line-clamp-2 flex-1"
                    :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                    {{ email.snippet }}
                  </p>

                  <!-- Importance badge -->
                  <span
                    v-if="getImportanceConfig(getImportance(email.id))"
                    class="shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border mt-0.5"
                    :class="darkMode
                      ? getImportanceConfig(getImportance(email.id))!.badge.dark
                      : getImportanceConfig(getImportance(email.id))!.badge.light"
                  >
                    <component :is="getImportanceConfig(getImportance(email.id))!.icon" :size="9" />
                    {{ getImportanceConfig(getImportance(email.id))!.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden md:block">
        <Divider
          :dark-mode="darkMode"
          @drag="handleDrag"
          @collapse="handleCollapse"
          @expand="handleExpand"
        />
      </div>

      <div
        class="flex-col flex-1 min-w-0"
        :class="showViewer ? 'flex' : 'hidden md:flex'"
      >
        <div v-if="!selectedEmail"
          class="flex-1 flex flex-col items-center justify-center gap-4 select-none"
          :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">
          <div class="w-20 h-20 rounded-2xl flex items-center justify-center"
            :class="darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'">
            <Inbox :size="32" :class="darkMode ? 'text-gray-600' : 'text-gray-300'" />
          </div>
          <p class="text-base font-semibold" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
            Select an email to read
          </p>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-6 space-y-4"
          :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">

          <div
            class="p-4 rounded-2xl border"
            :class="[
              darkMode ? 'bg-gray-800/50 border-gray-700/40' : 'bg-white border-gray-100 shadow-sm',
            ]">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h2 class="text-xl font-bold leading-snug"
                :class="darkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedEmail.subject }}
              </h2>
              <span
                v-if="selectedSummary?.importance?.level"
                class="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border mt-0.5"
                :class="darkMode
                  ? (getImportanceConfig(selectedSummary.importance.level.toLowerCase())?.badge.dark ?? '')
                  : (getImportanceConfig(selectedSummary.importance.level.toLowerCase())?.badge.light ?? '')"
              >
                <component
                  :is="getImportanceConfig(selectedSummary.importance.level.toLowerCase())?.icon ?? Minus"
                  :size="12"
                />
                {{ selectedSummary.importance.level }}
              </span>
            </div>
            <p v-if="selectedSummary?.importance?.reason"
              class="text-xs leading-relaxed"
              :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              {{ selectedSummary.importance.reason }}
            </p>
          </div>

          <div v-if="selectedSummary"
            class="rounded-2xl border overflow-hidden"
            :class="darkMode ? 'bg-gray-800/50 border-blue-700/20' : 'bg-white border-blue-100 shadow-sm'">

            <div class="flex items-center gap-2 px-4 py-3 border-b"
              :class="darkMode ? 'border-gray-700/40 bg-blue-900/10' : 'border-blue-50 bg-blue-50/50'">
              <Sparkles :size="13" class="text-blue-400" />
              <span class="text-xs font-semibold uppercase tracking-wider text-blue-500">
                AI Summary
              </span>
              <span v-if="selectedSummary.email_category"
                class="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                :class="darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-white text-gray-500 border-gray-200'">
                {{ selectedSummary.email_category }}
              </span>
            </div>

            <div class="px-4 py-4 space-y-3">
              <p v-if="selectedSummary.summary"
                class="text-sm leading-relaxed"
                :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ selectedSummary.summary }}
              </p>
              <p v-else class="text-sm italic"
                :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                {{ selectedSummary.importance?.reason ?? 'No summary available.' }}
              </p>
              <div v-if="selectedSummary.instructions?.length">
                <p class="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                  :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                  Action required
                </p>
                <ul class="space-y-1">
                  <li v-for="(item, i) in selectedSummary.instructions" :key="i"
                    class="flex items-start gap-2 text-xs"
                    :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                    <ArrowUpRight :size="12" class="text-blue-400 mt-0.5 shrink-0" />
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="selectedSummary.date || selectedSummary.time || selectedSummary.location"
                class="flex flex-wrap gap-3 text-xs pt-1 border-t"
                :class="[darkMode ? 'text-gray-400 border-gray-700/40' : 'text-gray-500 border-gray-100']">
                <span v-if="selectedSummary.date">📅 {{ selectedSummary.date }}</span>
                <span v-if="selectedSummary.time">🕐 {{ selectedSummary.time }}</span>
                <span v-if="selectedSummary.location">📍 {{ selectedSummary.location }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 p-4 rounded-2xl border"
            :class="darkMode ? 'bg-gray-800/50 border-gray-700/40' : 'bg-white border-gray-100 shadow-sm'">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                :style="getImportance(selectedEmail.id) === 'high'   ? 'background: linear-gradient(135deg,#ef4444,#f97316)' :
                         getImportance(selectedEmail.id) === 'medium' ? 'background: linear-gradient(135deg,#f59e0b,#eab308)' :
                         getImportance(selectedEmail.id) === 'low'    ? 'background: linear-gradient(135deg,#3b82f6,#6366f1)' :
                         (darkMode ? 'background:#374151' : 'background:#9ca3af')"
              >
                {{ getFirstCharacter(selectedEmail.sender?.name || '') }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-sm truncate"
                  :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                  {{ selectedEmail.sender?.name }}
                </p>
                <p class="text-xs truncate" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                  {{ selectedEmail.sender?.email }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full shrink-0"
              :class="darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'">
              <Clock :size="11" />
              {{ formatDateTime(selectedEmail.date || '') }}
            </div>
          </div>

          <div class="rounded-2xl border overflow-hidden"
            :class="darkMode ? 'border-gray-700/40' : 'border-gray-100 shadow-sm'">
            <div v-if="selectedEmail.text_html" class="bg-white">
              <EmailShadow
                :emailId="selectedEmail.id"
                :content="selectedEmail.text_html || ''"
                :attachments="selectedEmail.attachments || []"
              />
            </div>
            <div v-else
              class="whitespace-pre-wrap font-mono text-sm leading-7 p-6"
              :class="darkMode ? 'bg-gray-800/60 text-gray-300' : 'bg-white text-gray-700'">
              {{ selectedEmail.text_plain || selectedEmail.snippet }}
            </div>
          </div>

          <div class="flex gap-3 pt-2 pb-10 border-t"
            :class="darkMode ? 'border-gray-700/40' : 'border-gray-100'">
            <button
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              @click="handleOpenReplyComposer">
              <Mail :size="14" /> Reply
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :disabled="selectedEmail.labelIds?.includes('SPAM')"
              @click="markAsSpam(selectedEmail)"
              :class="darkMode
                ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'">
              <AlertTriangle :size="14" /> Mark Spam
            </button>

            <button
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              @click="markAsRead(selectedEmail)"
              :class="darkMode
                ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'">
              <CheckCircle :size="14" /> Mark Read
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
