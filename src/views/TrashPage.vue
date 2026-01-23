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

const loading = ref(false)

const emails = ref<EmailShortDetail[]>([])
const selectedEmailId = ref<string | null>(null)

const selectedEmail = ref<any | null>(null)
const isLoadingEmail = ref(false)

const page_token = ref<string | null>(null)

const fetchEmails = async () => {
  try {
    loading.value = true

    selectedEmail.value = null
    selectedEmailId.value = null
    const data = await emailService.getEmails()
    emails.value = data.emails
    page_token.value = data.page_token

    if (data.emails.length >= 0) {
      selectedEmailId.value = data.emails[0].msg_id
    }

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(selectedEmailId, async (newId) => {
  if (!newId) {
    selectedEmail.value = null
    return
  }

  try {
    isLoadingEmail.value = true
    const fullEmail = await emailService.getEmailById(newId)
    selectedEmail.value = fullEmail


  } catch (error) {
    console.error("Failed to fetch email details in HomePage.vue", error)
    selectedEmail.value = null
    throw error
  } finally {
    isLoadingEmail.value = false
  }
})
onMounted(() => {
  fetchEmails()
})

const onRefresh = () => {
  fetchEmails()
}
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