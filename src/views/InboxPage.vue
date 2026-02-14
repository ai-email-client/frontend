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

const pageToken = ref<string | null>(null)

const stackToken = ref<string[]>([])
const currentPage = ref(0)

const totalMessage = ref(1)

const fetchEmails = async () => {
  loading.value = true

  const newEmails = await emailService.fetchEmails(labels, limit, null, null)

  emails.value = newEmails.messages
  pageToken.value = newEmails.page_token
  stackToken.value.push(newEmails.page_token)

  loading.value = false

  newEmails.messages.forEach(async (email: EmailShortResponse) => {
    const emailDetail = await emailService.getEmailById(email.msg_id)
    triggerSummaryInBackground(emailDetail)
  })
}

const triggerSummaryInBackground = (email: EmailDetailResponse) => {
  const req = {
    msg_id: email.msg_id,
    plain_text: email.plain_text,
    email_tags: email.tag
  }
  difyService.testSummary(req).then((res) => {
    console.log('Summary triggered for email:', res)
  }).catch((err) => {
    console.error('Error triggering summary for email:', email.msg_id, err)
  })
}

const getEmailById = async (msgId: string) => {
  if (!msgId) {
    return
  }
  isLoadingEmail.value = true
  const response = await emailService.getEmailById(msgId)
  selectedEmail.value = response

  isLoadingEmail.value = false
}

const nextPage = async () => {
  loading.value = true

  const nextToken = stackToken.value[currentPage.value + 1]
  const response = await emailService.fetchEmails(labels, limit, nextToken, null, true)

  emails.value = response.messages

  if (response.page_token && !stackToken.value.includes(response.page_token)) {
    stackToken.value.push(response.page_token)
  }
  currentPage.value++

  selectedEmail.value = null

  loading.value = false
}

const prevPage = async () => {
  loading.value = true

  const prevToken = stackToken.value[currentPage.value - 1]
  const response = await emailService.fetchEmails(labels, limit, prevToken, null, true)

  emails.value = response.messages

  currentPage.value--

  selectedEmail.value = null

  loading.value = false
}

const getTotalMessage = async () => {
  loading.value = true
  const response = await emailService.getLabelById(labels[0])
  if (response.messagesTotal) {
    totalMessage.value = response.messagesTotal
  }
  loading.value = false
}



onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails()
    if (emails.value.length > 0) {
      getEmailById(emails.value[0].msg_id)
    }
  }
  getTotalMessage()
})

</script>

<template>
  <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
    <div class="flex flex-1 overflow-hidden relative">
      <EmailList :emails="emails" :selectedEmail="selectedEmail" :darkMode="darkMode" :loading="loading"
        @select="(msgId: string) => getEmailById(msgId)" @refresh="fetchEmails" @prevPage="prevPage"
        @nextPage="nextPage" :currentPage="currentPage + 1" :totalMessage="totalMessage" :limit="limit" />

      <div
        class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm transition-colors duration-300 relative"
        :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'">
        <EmailDetail :email="selectedEmail" :loading="isLoadingEmail" :darkMode="darkMode" />
      </div>
    </div>
  </div>
</template>