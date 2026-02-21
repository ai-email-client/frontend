<script setup lang="ts">
import {
  ref,
  onMounted
} from 'vue'
import {
  useRoute
} from 'vue-router'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'

import {
  EmailShortResponse,
  EmailDetailResponse
} from '../interface/response'

import { useLabelStore } from '../stores/categoryStore'
import emailService from '../services/email'
import databaseService from '../services/database'
import { DifySummary } from '../interface/dify'

const route = useRoute()
const labelStore = useLabelStore()

const props = defineProps<{
  darkMode: boolean
}>()

const loading = ref(false)
const limit = 5

const emails = ref<EmailShortResponse[]>([])
const selectedEmail = ref<EmailDetailResponse | null>(null)
const isLoadingEmail = ref(false)
const summary = ref<DifySummary | null>(null)

const nextPageToken = ref<string | null>(null)

const stackToken = ref<(string | null)[]>([null])
const currentPage = ref(0)

const totalMessage = ref(1)

const getCurrentLabel = () => {
  const currentCategoryName = route.params.category as string

  return [labelStore.getLabelIdByName(currentCategoryName.toLowerCase()) || 'INBOX']
}

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
  } catch (error) {
    console.error("Failed to fetch emails", error)
  }
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

  await fetchEmails(getCurrentLabel(), limit, tokenToUse, null, true)

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

  await fetchEmails(getCurrentLabel(), limit, tokenToUse, null, true)

}

const getTotalMessage = async () => {
  loading.value = true
  const response = await emailService.getLabelById(getCurrentLabel()[0])
  if (response.messagesTotal) {
    console.log(response.messagesTotal)
    totalMessage.value = response.messagesTotal

  }
  loading.value = false
}

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(getCurrentLabel(), limit, null, null)
    getTotalMessage()
    if (emails.value.length > 0) {
      getEmailById(emails.value[0].msg_id)
    }
  }
})


</script>
<template>
  <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
    <div class="flex flex-1 overflow-hidden relative">
      <EmailList :emails="emails" :selectedEmail="selectedEmail" :darkMode="darkMode" :loading="loading"
        @select="(msgId: string) => getEmailById(msgId)"
        @refresh="() => fetchEmails(getCurrentLabel(), limit, stackToken[currentPage], null)" @prevPage="prevPage"
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