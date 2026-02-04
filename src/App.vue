<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  Moon
} from 'lucide-vue-next'
import AppSidebar from './components/AppSidebar.vue'
import userService from './services/user'
import { UserProfile } from './interface/user'

const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(false)
const darkMode = ref(false)

const showLayout = computed(() => route.name !== 'Home' && route.name !== 'Login')
const user = ref<UserProfile | null>(null)

const handleAuthCheck = async () => {
  const publicPages = ['Login', 'Callback']
  const isPublicPage = publicPages.includes(route.name as string)

  if (isPublicPage) {
    return
  }

  const token = localStorage.getItem('jwt_token')

  if (!token) {
    router.replace('/login')
  } else {
    if (!user.value) {
      try {
        user.value = await userService.get_profile()
      } catch (error) {
        handleLogout()
      }
    }
    router.replace('/inbox')
  }
}

const handleLogout = () => {
  localStorage.removeItem('jwt_token')
  router.replace('/login')
}

onMounted(async () => {
  await router.isReady()
  handleAuthCheck()
})

watch(
  () => route.name,
  () => {
    handleAuthCheck()
  }
)
</script>

<template>
  <div class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'">

    <AppSidebar v-if="showLayout" :user="user" :collapsed="sidebarCollapsed" :darkMode="darkMode"
      @toggleCollapse="sidebarCollapsed = !sidebarCollapsed" />

    <div class="flex flex-1 flex-col min-w-0 overflow-hidden">

      <header v-if="showLayout" class="h-16 flex items-center justify-between px-6 border-b shrink-0 z-10"
        :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'">
        <div class="flex items-center gap-4">
          <button @click="darkMode = !darkMode"
            class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
            <Moon :size="24" />
          </button>
        </div>
      </header>

      <router-view v-model:darkMode="darkMode" />
    </div>
  </div>
</template>