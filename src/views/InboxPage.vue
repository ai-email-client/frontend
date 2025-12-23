<script setup lang="ts">
import { ref, computed } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import EmailList from '../components/EmailList.vue'
import { Sun, Moon, Clock, Tag, MoreHorizontal, Reply, Forward, Star, Trash2, Archive } from 'lucide-vue-next'

const darkMode = ref(false)
const sidebarCollapsed = ref(false)
const selectedEmailId = ref<number | null>(1)

const emails = ref([
  {
    id: 1,
    from: 'Sarah Chen',
    subject: 'Q4 Planning Discussion',
    snippet: 'Hi team, I wanted to discuss our Q4 roadmap and align on priorities...',
    body: 'Hi team,<br><br>I wanted to discuss our Q4 roadmap and align on priorities before the upcoming all-hands meeting. We need to finalize the budget allocation and resource planning.<br><br>Key points to discuss:<br>- New feature timeline<br>- Marketing budget<br>- Hiring plan<br><br>Let me know your availability.',
    time: '10:30 AM',
    unread: true,
    tag: 'work'
  },
  {
    id: 2,
    from: 'Design Weekly',
    subject: 'Your weekly inspiration digest',
    snippet: 'Discover the best design work from around the web this week...',
    body: 'Here is your weekly dose of design inspiration.',
    time: '9:15 AM',
    unread: true,
    tag: 'newsletter'
  },
  {
    id: 3,
    from: 'Marcus Rodriguez',
    subject: 'Re: Project Timeline Update',
    snippet: 'Thanks for the update. The timeline looks good, just one question about...',
    body: 'Thanks for the update.',
    time: 'Yesterday',
    unread: false,
    tag: 'work'
  }
])

const selectedEmail = computed(() => emails.value.find(e => e.id === selectedEmailId.value))

function toggleDarkMode() {
  darkMode.value = !darkMode.value
}
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

    <EmailList 
      :emails="emails" 
      :selectedId="selectedEmailId" 
      :darkMode="darkMode"
      @select="(id) => selectedEmailId = id"
    />

    <main class="flex-1 flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm" :class="darkMode ? 'bg-gray-900/50' : 'bg-white/50'">
      
      <div class="h-16 border-b flex items-center justify-between px-6" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
        <div class="flex items-center gap-4">
          <div class="flex bg-gray-100 p-1 rounded-lg" :class="darkMode ? 'bg-gray-800' : 'bg-gray-100'">
            <button class="p-2 hover:bg-white rounded-md shadow-sm transition-all" :class="darkMode ? 'hover:bg-gray-700' : ''"><Archive :size="18" /></button>
            <button class="p-2 hover:bg-white rounded-md shadow-sm transition-all" :class="darkMode ? 'hover:bg-gray-700' : ''"><Trash2 :size="18" /></button>
            <button class="p-2 hover:bg-white rounded-md shadow-sm transition-all" :class="darkMode ? 'hover:bg-gray-700' : ''"><Star :size="18" /></button>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <button 
            @click="toggleDarkMode"
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
            :class="darkMode ? 'hover:bg-gray-800' : ''"
          >
            <Sun v-if="darkMode" :size="20" />
            <Moon v-else :size="20" />
          </button>
        </div>
      </div>

      <div v-if="selectedEmail" class="flex-1 overflow-y-auto p-8">
        <div class="max-w-4xl mx-auto">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h1 class="text-2xl font-bold mb-4" :class="darkMode ? 'text-white' : 'text-gray-900'">
                {{ selectedEmail.subject }}
              </h1>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {{ selectedEmail.from.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-lg" :class="darkMode ? 'text-white' : 'text-gray-900'">
                    {{ selectedEmail.from }}
                  </div>
                  <div class="font-semibold text-m" :class="darkMode ? 'text-white' : 'text-gray-500'">
                    to me
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right text-gray-500 text-sm flex flex-col items-end gap-2">
              <div class="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full" :class="darkMode ? 'bg-gray-800' : ''">
                <Clock :size="14" />
                {{ selectedEmail.time }}
              </div>
              <div v-if="selectedEmail.tag" class="flex items-center gap-2">
                <Tag :size="14" />
                {{ selectedEmail.tag }}
              </div>
            </div>
          </div>

          <div 
            class="prose max-w-none mb-12"
            :class="darkMode ? 'prose-invert text-white' : 'text-gray-900'"
            v-html="selectedEmail.body"
          ></div>

          <div class="border-t pt-8" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
            <div class="flex gap-4">
              <button class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <Reply :size="18" /> Reply
              </button>
              <button class="px-6 py-2 border rounded-lg font-medium transition-colors flex items-center gap-2 hover:bg-gray-50" :class="darkMode ? 'border-gray-700 hover:bg-gray-800' : ''">
                <Forward :size="18" /> Forward
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        Select an email to view
      </div>

    </main>
  </div>
</template>