<script setup lang="ts">
import {
  ref,
  watch,
  onMounted
} from 'vue'

import AppSidebar from '../components/AppSidebar.vue'
import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'

import {
  EmailShortDetail
} from '../interface/email'

import emailService from '../services/email'

const darkMode = ref(false)
const sidebarCollapsed = ref(false)

const LABELS = ["INBOX", "UNREAD"]
const loading = ref(false)
const emails = ref<EmailShortDetail[]>([])
const pageToken = ref<string | null>(null)
const selectedEmailId = ref<string | null>(null)
const selectedEmail = ref<any>(null)
const isLoadingEmail = ref(false)

const handleFetchEmails = async (isLoadMore = false) => {
  if (loading.value || (isLoadMore && !pageToken.value)) return

  try {
    loading.value = true

    const result = await emailService.fetchEmails(
      LABELS,
      pageToken.value,
      emails.value,
      isLoadMore
    )

    emails.value = result.emails
    pageToken.value = result.pageToken

    if (result.selectedEmailId !== undefined) {
      selectedEmailId.value = result.selectedEmailId
    }
    if (result.selectedEmail !== undefined) {
      selectedEmail.value = result.selectedEmail
    }

  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  handleFetchEmails(false)
}

const onLoadMore = () => {
  handleFetchEmails(true)
}

onMounted(() => {
  handleFetchEmails()
})

watch(selectedEmailId, async (newId) => {
  if (!newId) {
    selectedEmail.value = null
    return
  }

  try {
    isLoadingEmail.value = true
    const fullEmail = await emailService.getEmailContent(newId)
    selectedEmail.value = fullEmail
  } catch (error) {
    console.error('Fetch detail error:', error)
    selectedEmail.value = null
  } finally {
    isLoadingEmail.value = false
  }
})
</script>

<template>
  <div class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'">
    <AppSidebar :user="null" :collapsed="sidebarCollapsed" :darkMode="darkMode"
      @toggleCollapse="sidebarCollapsed = !sidebarCollapsed" />

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">

      <header class="h-16 flex items-center justify-between px-6 border-b shrink-0 z-10"
        :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
        <div class="flex items-center gap-4">

        </div>
      </header>

      <div class="flex flex-1 overflow-hidden relative">

        <EmailList :emails="emails" :selectedId="selectedEmailId" :darkMode="darkMode" :loading="loading"
          @select="(id) => selectedEmailId = id" @refresh="onRefresh" />

        <div
          class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm transition-colors duration-300 relative"
          :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'">
          <EmailDetail :email="selectedEmail" :loading="isLoadingEmail" :darkMode="darkMode" />
        </div>

      </div>
    </div>

  </div>
</template>