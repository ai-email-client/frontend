<script setup lang="ts">
import {
  ref,
  onMounted
} from 'vue'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
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
  }
})

const loading = ref(false)

const labels = ["INBOX"]
const limit = 5

const emails = ref<EmailShortResponse[]>([])
const selectedEmail = ref<EmailDetailResponse | null>(null)
const isLoadingEmail = ref(false)
const summary = ref<DifySummary | null>(null)

const nextPageToken = ref<string | null>(null)

const stackToken = ref<(string | null)[]>([null])
const currentPage = ref(0)

const totalMessage = ref(1)

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

    emails.value = newEmails.messages
    nextPageToken.value = newEmails.page_token

    loading.value = false
    for (const email of newEmails.messages) {
      if (await databaseService.get_summary(email.msg_id)) {
        return
      }
      const emailDetail = await emailService.getMessageByID(email.msg_id)
      await triggerSummaryInBackground(emailDetail)
    }
  } catch (error) {
    console.error("Failed to fetch emails", error)
  }
}

const triggerSummaryInBackground = (email: EmailDetailResponse) => {
  const req: DifySummaryRequest = {
    sender: email.sender,
    msg_id: email.msg_id,
    plain_text: email.plain_text || "",
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
  if (summary_exists) {
    summary.value = summary_exists
  }

  isLoadingEmail.value = false
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) {
    return
  }

  currentPage.value++
  emails.value = []

  const targetPage = currentPage.value
  let tokenToUse: string | null = null

  if (targetPage < stackToken.value.length) {
    tokenToUse = stackToken.value[targetPage]
  }
  else {
    tokenToUse = nextPageToken.value
  }

  await fetchEmails(labels, limit, tokenToUse, null, true)

  if (targetPage >= stackToken.value.length) {
    stackToken.value.push(tokenToUse)
  }

}

const prevPage = async () => {
  if (currentPage.value === 0) return

  currentPage.value--
  emails.value = []

  const targetPage = currentPage.value
  const tokenToUse = stackToken.value[targetPage]

  await fetchEmails(labels, limit, tokenToUse, null, true)

}

const getTotalMessage = async () => {
  loading.value = true
  const response = await userService.get_profile()
  if (response.messagesTotal) {
    totalMessage.value = response.messagesTotal
  }
  loading.value = false
}

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(labels, limit, stackToken.value[0], null)
  }
  getTotalMessage()
})

</script>

<template>
  <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
    <div class="flex flex-1 overflow-hidden relative">
      <EmailList :emails="emails" :selectedEmail="selectedEmail" :darkMode="darkMode" :loading="loading"
        @select="(msgId: string) => getEmailById(msgId)"
        @refresh="() => fetchEmails(labels, limit, stackToken[currentPage], null)" @prevPage="prevPage"
        @nextPage="nextPage" :currentPage="currentPage + 1" :totalMessage="totalMessage" :limit="limit" />

      <div
        class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm transition-colors duration-300 relative"
        :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'">
        <EmailDetail 
          :email="selectedEmail"
          :summary="summary"
          :loading="isLoadingEmail" 
          :darkMode="darkMode" 
        />
      </div>
    </div>
  </div>
</template>