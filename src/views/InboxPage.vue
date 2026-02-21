<script setup lang="ts">
import {
  ref,
  onMounted,
  computed
} from 'vue'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
import Divider from '../components/Divider.vue'
import type { UserProfile } from '../interface/user'

import {
  EmailShortResponse,
  EmailDetailResponse
} from '../interface/response'

import emailService from '../services/email'
import difyService from '../services/dify'
import userService from '../services/user'
import { DifySummaryRequest } from '../interface/request'
import { DifySummary } from '../interface/dify'
import databaseService from '../services/database'

const props = defineProps({
  user: {
    type: Object as () => UserProfile,
    default: null
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  // ▼ Received from App.vue via v-model:listWidth
  listWidth: {
    type: Number,
    default: 350
  }
})

const emit = defineEmits(['update:listWidth'])

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const emailList = ref<EmailShortResponse[]>([])
const selectedEmail = ref<EmailDetailResponse | null>(null)
const isLoadingEmail = ref(false)
const summary = ref<DifySummary | null>(null)

// ── Layout Control ──
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140   // snap-to-collapse threshold

// Read/write listWidth through emit so App.vue stays in sync
const currentWidth = computed({
  get: () => props.listWidth,
  set: (val) => emit('update:listWidth', val)
})

const collapsed   = computed(() => currentWidth.value <= MIN_PX + 4)
const showViewer  = computed(() => selectedEmail.value !== null)

const loading         = ref(false)
const labels          = ['INBOX']
const limit           = 5
const nextPageToken   = ref<string | null>(null)
const stackToken      = ref<(string | null)[]>([null])
const currentPage     = ref(0)
const totalMessage    = ref(1)

const fetchEmails = async (
  labels: string[],
  limit: number,
  pageToken: string | null,
  q: string | null,
  is_next: boolean = false
) => {
  loading.value = true
  selectedEmail.value = null
  try {
    const newEmails = await emailService.fetchEmails(labels, limit, pageToken, q, is_next)
    emailList.value = newEmails.messages
    nextPageToken.value = newEmails.page_token
    loading.value = false
    for (const email of newEmails.messages) {
      const summary_exists = await databaseService.get_summary(email.msg_id)
      if (summary_exists !== null) return
      const emailDetail = await emailService.getMessageByID(email.msg_id)
      await triggerSummaryInBackground(emailDetail)
    }
  } catch (error) {
    console.error('Failed to fetch emails', error)
  }
}

const triggerSummaryInBackground = (email: EmailDetailResponse) => {
  const req: DifySummaryRequest = {
    sender: email.sender,
    msg_id: email.msg_id,
    plain_text: email.plain_text || '',
    email_tags: email.tag || []
  }
  difyService.getSummary(req)
}

const getEmailById = async (msgId: string) => {
  if (!msgId) return
  isLoadingEmail.value = true
  selectedEmail.value = null
  summary.value = null
  const response = await emailService.getMessageByID(msgId)
  selectedEmail.value = response
  const summary_exists = await databaseService.get_summary(msgId)
  if (summary_exists) summary.value = summary_exists
  isLoadingEmail.value = false
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  const targetPage = currentPage.value
  let tokenToUse: string | null = null
  if (targetPage < stackToken.value.length) {
    tokenToUse = stackToken.value[targetPage]
  } else {
    tokenToUse = nextPageToken.value
  }
  await fetchEmails(labels, limit, tokenToUse, null, true)
  if (targetPage >= stackToken.value.length) stackToken.value.push(tokenToUse)
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  const tokenToUse = stackToken.value[currentPage.value]
  await fetchEmails(labels, limit, tokenToUse, null, true)
}

const getTotalMessage = async () => {
  loading.value = true
  const response = await userService.get_profile()
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
  loading.value = false
}

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  const newWidth = raw < SNAP_PX ? MIN_PX : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
  currentWidth.value = newWidth
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 350 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(labels, limit, stackToken.value[0], null)
  }
  getTotalMessage()
})

</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 flex overflow-hidden"
  >
    <div
      :style="{ width: `${currentWidth}px`, minWidth: `${MIN_PX}px`, flexShrink: 0 }"
      class="flex-col overflow-hidden transition-none"
      :class="showViewer ? 'hidden md:flex' : 'flex'"
    >
      <EmailList
        :emails="emailList"
        :selected-email="selectedEmail"
        :loading="loading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select="(msgId: string) => getEmailById(msgId)"
        @refresh="() => fetchEmails(labels, limit, stackToken[currentPage], null)"
        @prevPage="prevPage"
        @nextPage="nextPage"
      />
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
      <EmailDetail
        :email="selectedEmail"
        :summary="summary"
        :loading="isLoadingEmail"
        :dark-mode="darkMode"
        @back="selectedEmail = null"
      />
    </div>
  </div>
</template>