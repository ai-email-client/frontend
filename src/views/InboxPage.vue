<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  onUnmounted,
  watch
} from 'vue'

import EmailList from '../components/EmailList.vue'
// import EmailDetail from '../components/EmailDetail.vue'
import Divider from '../components/Divider.vue'
import type { UserProfile } from '../interface/user'

import {
  MessageMetaDataResponse
} from '../interface/response'

import emailService from '../services/email'
import difyService from '../services/dify'
import userService from '../services/user'
// import { DifySummaryRequest } from '../interface/request'
// import { DifySummary } from '../interface/dify'
// import databaseService from '../services/database'

const props = defineProps({
  user: {
    type: Object as () => UserProfile,
    default: null
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  listWidth: {
    type: Number,
    default: 450
  }
})

const emit = defineEmits(['update:listWidth'])

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const emailList = ref<MessageMetaDataResponse[]>([])
const selectedEmail = ref<MessageMetaDataResponse | null>(null)
// const isLoadingEmail = ref(false)
// const summary = ref<DifySummary | null>(null)

// ── Layout Control ──
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

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
const stackToken      = ref<string[]>([""])
const currentPage     = ref(0)
const totalMessage    = ref(1)

let pollingInterval: ReturnType<typeof setInterval> | null = null;

const fetchEmails = async (
  labelIds: string[],
  maxResults: number,
  pageToken: string,
  query: string,
  includeSpamTrash: boolean
) => {
  loading.value = true
  selectedEmail.value = null
  
  try {
    const response = await emailService.fetchEmails(
      labelIds, maxResults, pageToken, query, includeSpamTrash
    )
    nextPageToken.value = response.nextPageToken
    if (!stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }

    if (!response.messages || response.messages.length === 0) {
      emailList.value = []
      nextPageToken.value = response.nextPageToken || ''
      loading.value = false
      return
    }

    const detailPromises = response.messages.map(message => 
      emailService.getMessageByID(message.id, { 
        format: 'metadata',
        metadataHeaders: ['Date', 'From', 'Subject', 'To']
      })
    )

    const emailDetails = await Promise.all(detailPromises)

    emailList.value = emailDetails
    

  } catch (error) {
    console.error('Failed to fetch emails', error)
  } finally {
    loading.value = false
  }
}

// const fetchEmails = async (
//   labels: string[],
//   limit: number,
//   pageToken: string | null,
//   q: string | null,
//   is_next: boolean = false
// ) => {
//   loading.value = true
//   selectedEmail.value = null
//   try {
//     const newEmails = await emailService.fetchEmails(labels, limit, pageToken, q, is_next)
//     emailList.value = newEmails.messages
//     nextPageToken.value = newEmails.page_token
//     loading.value = false
//     for (const email of newEmails.messages) {
//       const summary_exists = await databaseService.check_summary(email.msg_id)
//       console.log(summary_exists)
//       if (!summary_exists) {
//         const emailDetail = await emailService.getMessageByID(email.msg_id)
//         await triggerSummaryInBackground(emailDetail)
//       }
//     }
//   } catch (error) {
//     console.error('Failed to fetch emails', error)
//   }
// }

// const checkSummarySilently = async () => {
//   if (selectedEmail.value && !summary.value) {
//     const summary_exists = await databaseService.get_summary(selectedEmail.value.msg_id);
//     if (summary_exists) {
//       summary.value = summary_exists;
//     }
//   }
// }

// const triggerSummaryInBackground = (email: EmailDetailResponse) => {
//   const req: DifySummaryRequest = {
//     sender: email.sender,
//     msg_id: email.msg_id,
//     plain_text: email.plain_text || '',
//     email_tags: email.tag || []
//   }
//   difyService.getSummary(req)
// }



const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  await fetchEmails(
    labels,
    limit,
    stackToken.value[currentPage.value],
    '',
    true
  )
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  await fetchEmails(
    labels,
    limit,
    stackToken.value[currentPage.value],
    '',
    true
  )
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
const handleExpand   = () => { currentWidth.value = 450 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(
      labels,
      limit,
      stackToken.value[currentPage.value],
      '',
      true
    )
  }
  getTotalMessage()
})

// watch(emailList, (newList) => {
//   if (newList && newList.length > 0) {
//     databaseService.get_source_email(newList[0].msg_id)
//     if (!pollingInterval) {
//       pollingInterval = setInterval(checkSummarySilently, 5000);
//     }
//   } 
//   else if (newList && newList.length === 0 && pollingInterval) {
//     clearInterval(pollingInterval);
//     pollingInterval = null;
//   }
// }, { deep: true, immediate: true });

// onUnmounted(() => {
//   if (pollingInterval) clearInterval(pollingInterval);
// });

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
        :selectedEmail="selectedEmail"
        :loading="loading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select=""
        @refresh="() => fetchEmails(
          labels,
          limit,
          stackToken[currentPage],
          '',
          true
        )"
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
<!-- 
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
    </div> -->
  </div>
</template>
