<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
import { EmailShortDetail } from '../interface/email' 
import emailService from '../services/email' 

const darkMode = ref(false)
const sidebarCollapsed = ref(false)

const emails = ref<EmailShortDetail[]>([]) 
const selectedEmailId = ref<string | null>(null)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const data = await emailService.getEmails()
    emails.value = data 

    if (emails.value.length >= 0) {
      selectedEmailId.value = data[0].id
    }
  } catch (err) {
    error.value = 'Server Down'
  } finally {
    loading.value = false
  }
})

const selectedEmail = ref<any | null>(null)
const isLoadingEmail = ref(false) 

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
    console.error("Failed to fetch email details", error)
    selectedEmail.value = null
  } finally {
    isLoadingEmail.value = false
  }
})

</script>

<template>
  <div 
    class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <AppSidebar 
      :collapsed="sidebarCollapsed" 
      :darkMode="darkMode"
      @toggleCollapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">
      
      <header 
        class="h-16 flex items-center justify-between px-6 border-b shrink-0 z-10"
        :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
      >        
        <div class="flex items-center gap-4">
        <button 
          @click="$emit('toggleDarkMode')"
          class="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 dark:text-gray-300"
          :class="darkMode ? 'hover:bg-gray-800' : ''"
        >
          <Sun v-if="darkMode" :size="20" />
          <Moon v-else :size="20" />
        </button>
      </div>
      </header>

      <div class="flex flex-1 overflow-hidden relative">
        
        <EmailList 
          :emails="emails" 
          :selectedId="selectedEmailId" 
          :darkMode="darkMode"
          @select="(id) => selectedEmailId = id"
        />

        <div 
          class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm transition-colors duration-300 relative" 
          :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'"
        >
          <EmailDetail 
            :email="selectedEmail" 
            :loading="isLoadingEmail"
            :darkMode="darkMode"
          />
        </div>

      </div>
    </div>

  </div>
</template>