<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  provide
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  Moon,
  Loader2
} from 'lucide-vue-next'

import AppSidebar from './components/AppSidebar.vue'
import userService from './services/user'
import { UserProfile } from './interface/user'
import emailService from './services/email'
import { Category, CategoryListResponse, EmailCategory } from './interface/category'

const route = useRoute()
const router = useRouter()

// State
const sidebarCollapsed = ref(false)
const darkMode = ref(false)
const user = ref<UserProfile | null>(null)
const labels = ref<Category[]>([])

const categoryLabels = ref<Record<string, Category>>({})
const isAppLoading = ref(true)

// Computed
const showLayout = computed(() => {
  const hiddenLayoutPages = ['Home', 'Login', 'Callback']
  return !hiddenLayoutPages.includes(route.name as string)
})

const handleAuthCheck = async () => {
  const publicPages = ['Login', 'Callback']

  if (!route.name) return

  const isPublicPage = publicPages.includes(route.name as string)

  if (isPublicPage) {
    isAppLoading.value = false
    return
  }

  const token = localStorage.getItem('jwt_token')

  if (!token) {
    handleLogout()
    return
  }

  if (!user.value) {
    try {
      user.value = await userService.get_profile()

      const labels = await emailService.getLabels()
      matchLabels(labels)
    } catch (error) {
      handleLogout()
      return
    }
  }

  if (route.path === '/' || route.name === 'Login') {
    router.replace('/inbox')
  }

  isAppLoading.value = false
}

const matchLabels = async (allLabels: CategoryListResponse) => {
  const missingCategories: string[] = []

  Object.values(EmailCategory).forEach((category) => {
    const foundLabel = allLabels.categories.find((l: Category) =>
      l.name.toLowerCase() === category.toLowerCase()
    )

    if (foundLabel) {
      categoryLabels.value[category] = foundLabel
      console.log(`Matched: ${category} -> ID: ${foundLabel.id}`)
    } else {
      missingCategories.push(category)
    }
  })

  if (missingCategories.length > 0) {
    try {
      const createdLabels = await emailService.syncLabels(missingCategories)
      console.log(createdLabels)
    } catch (error) {
      console.error(error)
    }
  }
}

const handleLogout = () => {
  localStorage.removeItem('jwt_token')
  user.value = null
  router.replace('/login')
  isAppLoading.value = false
}

onMounted(async () => {
  await router.isReady()
  await handleAuthCheck()
})

watch(
  () => route.name,
  async (newName) => {
    if (newName) {
      await handleAuthCheck()
    }
  }
)
</script>

<template>
  <div class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'">

    <div v-if="isAppLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950">
      <div class="flex flex-col items-center gap-2">
        <Loader2 class="animate-spin text-blue-500" :size="48" />
        <span class="text-sm text-gray-500">Loading Application...</span>
      </div>
    </div>

    <template v-else>
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
    </template>

  </div>
</template>