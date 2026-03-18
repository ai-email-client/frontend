<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ShieldAlert, ShieldCheck, ShieldX,
  AlertTriangle, RotateCw, Trash2,
  Mail, Clock, Tag, TrendingUp,
  ChevronLeft, ChevronRight, Badge, 
  Flag
} from 'lucide-vue-next'
import { formatTimeAgo, getFirstCharacter } from '../utils'
import emailService from '../services/email'
import { useSummaryStore } from '../stores/summaryStore'
import { useUiStore } from '../stores/uiStore'
import difyService from '../services/dify'
import { Message } from '../interface/email'
import { DifySummary } from '../interface/dify'
import EmailShadow from '../components/EmailShadow.vue'
import Divider from '../components/Divider.vue'
import { SpamType } from '../interface/spam'

const props = defineProps<{
  darkMode: boolean
  listWidth?: number
}>()

const emit = defineEmits(['update:listWidth'])

const summaryStore = useSummaryStore()
const uiStore      = useUiStore()

const emails        = ref<Message[]>([])
const selectedEmail = ref<Message | null>(null)
const activeFilter  = ref('all')

const label           = ['SPAM']
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
  get: () => props.listWidth ?? 360,
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
const handleExpand   = () => { currentWidth.value = 360    }

const filters = [
  { key: 'all',                   label: 'All',                     icon: ShieldAlert   },
  { key: SpamType.PHISHING,       label: SpamType.PHISHING,         icon: ShieldX       },
  { key: SpamType.SPAM_MARKETING, label: SpamType.SPAM_MARKETING,   icon: Flag          },
  { key: SpamType.PROMOTIONAL,    label: SpamType.PROMOTIONAL,      icon: TrendingUp    },
  { key: SpamType.BULK,           label: SpamType.BULK,             icon: Badge         },
  { key: SpamType.OTHER,          label: SpamType.OTHER,            icon: Mail          },
  { key: 'threat',                label: 'Threats',                 icon: AlertTriangle },
]

const selectedSummary = computed((): DifySummary | null => {
  if (!selectedEmail.value) return null
  const s = summaryStore.getSummary(selectedEmail.value.id)
  if (!s || s === 'processing' || s === 'error') return null
  return s as DifySummary
})

const filteredEmails = computed(() => {
  return emails.value.filter(email => {
    if (activeFilter.value === 'all') return true
    const s = summaryStore.getSummary(email.id)
    if (!s || s === 'processing' || s === 'error') return false
    const summary = s as DifySummary
    if (activeFilter.value === SpamType.PHISHING)       return summary.spam_type === SpamType.PHISHING
    if (activeFilter.value === SpamType.SPAM_MARKETING) return summary.spam_type === SpamType.SPAM_MARKETING
    if (activeFilter.value === SpamType.PROMOTIONAL)    return summary.spam_type === SpamType.PROMOTIONAL
    if (activeFilter.value === 'threat')         return summary.is_threat === true
    return true
  })
})

const stats = computed(() => {
  const summaries = emails.value
    .map(e => summaryStore.getSummary(e.id))
    .filter(s => s && s !== 'processing' && s !== 'error') as DifySummary[]
  return {
    total:       totalMessage.value,
    phishing:    summaries.filter(s => s.spam_type?.toLowerCase() === SpamType.PHISHING.toLowerCase()).length,
    marketing:   summaries.filter(s => s.spam_type?.toLowerCase() === SpamType.SPAM_MARKETING.toLowerCase()).length,
    promotional: summaries.filter(s => s.spam_type?.toLowerCase() === SpamType.PROMOTIONAL.toLowerCase()).length,
    threats:     summaries.filter(s => s.is_threat).length,
  }
})

const totalPages = computed(() => Math.ceil(totalMessage.value / limit) || 1)
const canPrev    = computed(() => currentPage.value > 0)
const canNext    = computed(() =>
  currentPage.value < stackToken.value.length - 1 || !!nextPageToken.value
)

const getSpamBadge = (summary: DifySummary | null) => {
  if (!summary) return null
  if (summary.spam_type?.toLowerCase() === SpamType.PHISHING.toLowerCase())       return { label: 'Phishing',    color: 'red'    }
  if (summary.spam_type?.toLowerCase() === SpamType.SPAM_MARKETING.toLowerCase()) return { label: 'Marketing',   color: 'amber'  }
  if (summary.spam_type?.toLowerCase() === SpamType.PROMOTIONAL.toLowerCase())    return { label: 'Promotional', color: 'green'  }
  if (summary.is_threat)                      return { label: 'Threat',      color: 'orange' }
  return { label: 'Spam', color: 'gray' }
}

const badgeClass = (color: string) => {
  const dark = props.darkMode
  const map: Record<string, string> = {
    red:    dark ? 'bg-red-900/40 text-red-400 border-red-700/40'          : 'bg-red-50 text-red-600 border-red-200',
    amber:  dark ? 'bg-amber-900/30 text-amber-400 border-amber-700/30'    : 'bg-amber-50 text-amber-600 border-amber-200',
    orange: dark ? 'bg-orange-900/30 text-orange-400 border-orange-700/30' : 'bg-orange-50 text-orange-600 border-orange-200',
    green:  dark ? 'bg-green-900/30 text-green-400 border-green-700/30'    : 'bg-green-50 text-green-600 border-green-200',
    gray:   dark ? 'bg-gray-700 text-gray-400 border-gray-600'             : 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return map[color] ?? map.gray
}

const confidenceColor = (val?: number | null) => {
  if (!val) return 'text-gray-400'
  if (val >= 80) return 'text-red-500'
  if (val >= 60) return 'text-amber-500'
  return 'text-green-500'
}


const fetchEmails = async (pageToken = '') => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = null
    getTotalMessage()
    const response = await emailService.fetchEmails(
      label, limit, pageToken, query, true, format, metadataHeaders
    )
    nextPageToken.value = response.nextPageToken
    if (response.nextPageToken && !stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }
    summaryStore.pruneByIds(response.messages.map(e => e.id))
    emails.value = response.messages
    fetchSummary(response.messages)
  } catch (error) {
    console.error('fetchEmails error:', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const fetchSummary = (emails: Message[]) => {
  emails.forEach(e => summaryStore.setSummary(e.id, 'processing'))

  difyService.getSummaryBatch({ 
    emails: emails.map(e => ({ 
      msg_id: e.id, 
      email_tags: e.labelIds || [],
      sender: e.sender?.email || '',
      text_plain: e.text_plain || e.text_html || ''
    }))
  })
    .then(res => {
      res.forEach((item: DifySummary) => {
        if (item.status === 'done') {
          summaryStore.setSummary(item.msg_id!, item)
        } else if (item.status === 'error') {
          summaryStore.setSummary(item.msg_id!, 'error')
        } else {
          summaryStore.setSummary(item.msg_id!, 'processing')
        }
      })
    })
    .catch(() => {
      emails.forEach(e => summaryStore.setSummary(e.id, 'error'))
    })
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
  const response = await emailService.getLabelById(label[0])
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
}

const handleDelete = async (email: Message) => {
  try {
    uiStore.setLoading(true)
    await emailService.deleteMessage(email.id)
    emails.value = emails.value.filter(e => e.id !== email.id)
  } catch (error) {
    console.error('Failed to delete email', error)
  } finally {
    uiStore.setLoading(false)
  }
}

onMounted(() => {
  fetchEmails()
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden"
    :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">

    <div class="shrink-0 px-6 py-4 border-b"
      :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
            :class="darkMode ? 'bg-red-900/30' : 'bg-red-50'">
            <ShieldAlert :size="18" class="text-red-500" />
          </div>
          <div>
            <h1 class="text-lg font-bold" :class="darkMode ? 'text-white' : 'text-gray-900'">
              Spam & Threats
            </h1>
            <p class="text-xs" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              AI-analyzed spam detection
            </p>
          </div>
        </div>
        <button @click="fetchEmails()" :disabled="uiStore.isLoading"
          class="p-2 rounded-lg transition-colors"
          :class="darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'">
          <RotateCw :size="16" :class="{ 'animate-spin': uiStore.isLoading }" />
        </button>
      </div>

      <div class="grid grid-cols-5 gap-2 mb-4">
        <div v-for="stat in [
          { label: 'Total',     value: stats.total,       color: 'text-gray-500'   },
          { label: 'Phishing',  value: stats.phishing,    color: 'text-red-500'    },
          { label: 'Marketing', value: stats.marketing,   color: 'text-amber-500'  },
          { label: 'Promo',     value: stats.promotional, color: 'text-green-500'  },
          { label: 'Threats',   value: stats.threats,     color: 'text-orange-500' },
        ]" :key="stat.label"
          class="rounded-xl p-2.5 text-center border"
          :class="darkMode ? 'bg-gray-800/60 border-gray-700/40' : 'bg-gray-50 border-gray-100'">
          <p class="text-lg font-bold" :class="stat.color">{{ stat.value }}</p>
          <p class="text-[10px] font-medium" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            {{ stat.label }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button v-for="f in filters" :key="f.key"
          @click="activeFilter = f.key; selectedEmail = null"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border"
          :class="activeFilter === f.key
            ? (darkMode ? 'bg-red-900/30 text-red-400 border-red-700/40' : 'bg-red-50 text-red-600 border-red-200')
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
        <div class="flex items-center justify-between px-4 py-2 border-b"
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
        </div>

        <div v-if="!uiStore.isLoading && filteredEmails.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-3 select-none">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
            :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
            <ShieldCheck :size="26" :class="darkMode ? 'text-green-600' : 'text-green-400'" />
          </div>
          <p class="text-sm font-semibold" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
            No spam found
          </p>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-for="email in filteredEmails" :key="email.id"
            @click="selectedEmail = email"
            class="px-4 py-3 border-b border-l-4 cursor-pointer transition-all"
            :class="[
              darkMode ? 'border-b-gray-800' : 'border-b-gray-100',
              selectedEmail?.id === email.id
                ? (darkMode ? 'bg-red-500/10 border-l-red-500' : 'bg-red-50 border-l-red-400')
                : (darkMode ? 'border-l-transparent hover:bg-gray-800/60' : 'border-l-transparent hover:bg-gray-50')
            ]">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white bg-red-500">
                {{ getFirstCharacter(email.sender?.name || '') }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <span class="text-sm font-semibold truncate"
                    :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                    {{ email.sender?.name || email.sender?.email }}
                  </span>
                  <span class="text-[10px] shrink-0"
                    :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
                    {{ formatTimeAgo(email.date || '') }}
                  </span>
                </div>
                <p class="text-xs truncate mb-1.5"
                  :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ email.subject }}
                </p>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="summaryStore.getSummary(email.id) === 'processing'"
                    class="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"
                    :class="darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse inline-block" />
                    Analyzing
                  </span>
                  <template v-else-if="summaryStore.getSummary(email.id) && summaryStore.getSummary(email.id) !== 'error'">
                    <span
                      v-if="getSpamBadge(summaryStore.getSummary(email.id) as DifySummary)"
                      class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border"
                      :class="badgeClass(getSpamBadge(summaryStore.getSummary(email.id) as DifySummary)!.color)">
                      {{ getSpamBadge(summaryStore.getSummary(email.id) as DifySummary)?.label }}
                    </span>
                    <span class="text-[10px] font-mono font-bold"
                      :class="confidenceColor((summaryStore.getSummary(email.id) as DifySummary)?.spam_confidence)">
                      {{ (summaryStore.getSummary(email.id) as DifySummary)?.spam_confidence?.toFixed(0) }}%
                    </span>
                    <span v-if="(summaryStore.getSummary(email.id) as DifySummary)?.is_threat"
                      class="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border"
                      :class="darkMode ? 'bg-orange-900/30 text-orange-400 border-orange-700/30' : 'bg-orange-50 text-orange-600 border-orange-200'">
                      <AlertTriangle :size="9" /> Threat
                    </span>
                  </template>
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
            <ShieldAlert :size="32" class="text-red-400" />
          </div>
          <p class="text-base font-semibold" :class="darkMode ? 'text-gray-600' : 'text-gray-400'">
            Select an email to inspect
          </p>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-6 space-y-4"
          :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">

          <h2 class="text-xl font-bold leading-snug p-4 rounded-2xl border"
            :class="darkMode ? 'text-white bg-gray-800/50 border-gray-700/40' : 'text-gray-900 bg-white border-gray-100 shadow-sm'">
            {{ selectedEmail.subject }}
          </h2>

          <div v-if="selectedSummary"
            class="rounded-2xl border overflow-hidden"
            :class="darkMode ? 'bg-gray-800/50 border-red-700/30' : 'bg-white border-red-100 shadow-sm'">

            <div class="flex items-center justify-between px-4 py-3 border-b"
              :class="darkMode ? 'border-gray-700/40 bg-red-900/10' : 'border-red-50 bg-red-50/50'">
              <div class="flex items-center gap-2">
                <ShieldX :size="14" class="text-red-500" />
                <span class="text-xs font-semibold uppercase tracking-wider text-red-500">
                  Threat Analysis
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="getSpamBadge(selectedSummary)"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  :class="badgeClass(getSpamBadge(selectedSummary)!.color)">
                  {{ getSpamBadge(selectedSummary)?.label }}
                </span>
                <span v-if="selectedSummary.is_threat"
                  class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  :class="darkMode ? 'bg-orange-900/30 text-orange-400 border-orange-700/30' : 'bg-orange-50 text-orange-600 border-orange-200'">
                  <AlertTriangle :size="10" /> Threat Detected
                </span>
              </div>
            </div>

            <div class="px-4 py-4 space-y-4">
              <p v-if="selectedSummary.summary"
                class="text-sm leading-relaxed"
                :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ selectedSummary.summary }}
              </p>

              <div class="grid grid-cols-2 gap-3">
                <div v-for="meter in [
                  { label: 'Spam Confidence',     value: selectedSummary.spam_confidence     },
                  { label: 'Security Confidence', value: selectedSummary.security_confidence },
                ]" :key="meter.label"
                  class="rounded-xl p-3 border"
                  :class="darkMode ? 'bg-gray-800 border-gray-700/40' : 'bg-gray-50 border-gray-100'">
                  <p class="text-[10px] font-semibold uppercase tracking-wider mb-2"
                    :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                    {{ meter.label }}
                  </p>
                  <span class="text-2xl font-bold font-mono" :class="confidenceColor(meter.value)">
                    {{ meter.value?.toFixed(1) ?? '—' }}%
                  </span>
                  <div class="mt-2 h-1.5 rounded-full overflow-hidden"
                    :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div class="h-full rounded-full transition-all duration-500"
                      :class="(meter.value ?? 0) >= 80 ? 'bg-red-500' : 'bg-amber-500'"
                      :style="`width: ${meter.value ?? 0}%`" />
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <div v-if="selectedSummary.spam_type"
                  class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
                  :class="darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'">
                  <Tag :size="12" class="text-red-400" />
                  Spam: <span class="font-semibold">{{ selectedSummary.spam_type }}</span>
                </div>
                <div v-if="selectedSummary.security_type"
                  class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
                  :class="darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'">
                  <ShieldAlert :size="12" class="text-orange-400" />
                  Security: <span class="font-semibold">{{ selectedSummary.security_type }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 p-4 rounded-2xl border"
            :class="darkMode ? 'bg-gray-800/50 border-gray-700/40' : 'bg-white border-gray-100 shadow-sm'">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 bg-red-500">
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
              {{ formatTimeAgo(selectedEmail.date || '') }}
            </div>
          </div>

          <div class="rounded-2xl border overflow-hidden"
            :class="darkMode ? 'border-gray-700/40' : 'border-gray-100 shadow-sm'">
            <div v-if="selectedEmail.text_html" class="bg-white">
              <EmailShadow
                :content="selectedEmail.text_html || ''"
                :attachments="selectedEmail.attachments || []"
              />
            </div>
            <div v-else
              class="whitespace-pre-wrap font-mono text-sm leading-7 p-6"
              :class="darkMode ? 'bg-gray-800/60 text-gray-300' : 'bg-white text-gray-700'">
              {{ selectedEmail.text_plain }}
            </div>
          </div>

          <div class="flex gap-3 pt-2 pb-10 border-t"
            :class="darkMode ? 'border-gray-700/40' : 'border-gray-100'">
            <button
              @click="handleDelete(selectedEmail)"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :class="darkMode
                ? 'border-gray-700 text-gray-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/40'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-red-50 hover:text-red-500 hover:border-red-200'">
              <Trash2 :size="14" /> Delete
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
              :class="darkMode
                ? 'border-gray-700 text-gray-400 hover:bg-gray-800'
                : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'">
              <Mail :size="14" /> Not Spam
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>