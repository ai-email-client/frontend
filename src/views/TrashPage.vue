<script setup lang="ts">
import {
    ref,
    onMounted
} from 'vue'

import {
    Moon,
} from 'lucide-vue-next'

import AppSidebar from '../components/AppSidebar.vue'
import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'

import {
    Email,
    EmailShortDetail
} from '../interface/email'

import emailService from '../services/email'

const darkMode = ref(false)
const sidebarCollapsed = ref(false)
const loading = ref(false)

const labels = ["TRASH"]
const limit = 5

const emails = ref<EmailShortDetail[]>([])
const selectedEmail = ref<Email | null>(null)
const isLoadingEmail = ref(false)

const pageToken = ref<string | null>(null)

const stackToken = ref<string[]>([''])
const currentPage = ref(0)

const totalMessage = ref(0)

const fetchEmails = async () => {
    loading.value = true


    const response = await emailService.fetchEmails(labels, limit, null)
    emails.value = response.messages
    fetchEmailById(emails.value[0].msg_id)

    pageToken.value = response.page_token
    stackToken.value.push(response.page_token)


    loading.value = false
}

const fetchEmailById = async (msgId: string) => {
    isLoadingEmail.value = true
    const response = await emailService.getEmailById(msgId)
    selectedEmail.value = response
    isLoadingEmail.value = false
}

const nextPage = async () => {
    loading.value = true

    const nextToken = stackToken.value[currentPage.value + 1]
    const response = await emailService.fetchEmails(labels, limit, nextToken, true)

    emails.value = response.messages
    fetchEmailById(emails.value[0].msg_id)

    if (response.page_token && !stackToken.value.includes(response.page_token)) {
        stackToken.value.push(response.page_token)
    }
    currentPage.value++



    loading.value = false
}

const prevPage = async () => {
    loading.value = true



    const prevToken = stackToken.value[currentPage.value - 1]
    const response = await emailService.fetchEmails(labels, limit, prevToken, true)

    emails.value = response.messages
    fetchEmailById(emails.value[0].msg_id)

    currentPage.value--
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
    fetchEmails()
    getTotalMessage()
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
                    <button @click="darkMode = !darkMode"
                        class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                        <Moon :size="24" />
                    </button>
                </div>
            </header>

            <div class="flex flex-1 overflow-hidden relative">

                <EmailList :emails="emails" :selectedEmail="selectedEmail" :darkMode="darkMode" :loading="loading"
                    @select="(email: EmailShortDetail) => fetchEmailById(email.msg_id)" @refresh="fetchEmails"
                    @prevPage="prevPage" @nextPage="nextPage" :currentPage="currentPage + 1"
                    :totalMessage="totalMessage" :limit="limit" />

                <div class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm transition-colors duration-300 relative"
                    :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'">
                    <EmailDetail :email="selectedEmail" :loading="isLoadingEmail" :darkMode="darkMode" />
                </div>

            </div>
        </div>

    </div>
</template>