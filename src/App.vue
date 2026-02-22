<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  Moon,
  Loader2,
  Sun
} from 'lucide-vue-next'
import AppSidebar from './components/AppSidebar.vue'
import userService from './services/user'
import { UserProfile } from './interface/user'
import { useLabelStore } from './stores/categoryStore'

const route = useRoute()
const router = useRouter()
const labelStore = useLabelStore()

const sidebarCollapsed = ref(false)
const darkMode = ref(false)
const user = ref<UserProfile | null>(null)
const isAppLoading = ref(true)

const MIN_PX = 80
const listWidth = ref(450)
const collapsed = computed(() => listWidth.value <= MIN_PX + 4)

const showLayout = computed(() => {
  const hiddenLayoutPages = ['Home', 'Login', 'Callback']
  return !hiddenLayoutPages.includes(route.name as string)
})

const presetWidths = [
  { label: '⟵',  title: 'Collapse',    value: MIN_PX },
  { label: 'S',   title: 'Small', value: 350    },
  { label: 'M',   title: 'Medium',value: 450    },
  { label: 'L',   title: 'Large', value: 550    },
]

const applyPreset = (preset: { value: number }) => {
  listWidth.value = preset.value
}

const handleUser = async () => {
  if (!user.value) {
    try {
      user.value = await userService.get_profile()
    } catch {
      handleLogout()
    }
  }
}

const handleAuthCheck = async () => {
  const publicPages = ['Login', 'Callback']
  if (!route.name) return

  if (publicPages.includes(route.name as string)) {
    isAppLoading.value = false
    return
  }

  const token = localStorage.getItem('jwt_token')
  if (!token) {
    handleLogout()
    return
  }

  if (route.path === '/' || route.name === 'Login') {
    router.replace('/inbox')
  }

  isAppLoading.value = false
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
  await handleUser()
  await labelStore.initialize()
})

watch(
  () => route.name,
  async (newName) => {
    if (newName) await handleAuthCheck()
  }
)
</script>

<template>
  <div
    class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <div
      v-if="isAppLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950"
    >
      <div class="flex flex-col items-center gap-2">
        <Loader2 class="animate-spin text-blue-500" :size="48" />
        <span class="text-sm text-gray-500">Loading Application...</span>
      </div>
    </div>

    <template v-else>
      <AppSidebar
        v-if="showLayout"
        :user="user"
        :collapsed="sidebarCollapsed"
        :dark-mode="darkMode"
        @toggleCollapse="sidebarCollapsed = !sidebarCollapsed"
      />

      <div class="flex flex-1 flex-col min-w-0 overflow-hidden">

        <header
          v-if="showLayout"
          class="h-16 flex items-center justify-between px-6 border-b shrink-0 z-10"
          :class="darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'"
        >
          <div class="flex items-center gap-2">
            <button
              @click="darkMode = !darkMode"
              class="p-2 rounded-lg transition-colors"
              :class="darkMode
                ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              <Sun v-if="darkMode" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
            </button>

            <div class="w-px h-5 mx-2" :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'" />

            <button
              v-for="(p, i) in presetWidths"
              :key="i"
              @click="applyPreset(p)"
              :title="p.title"
              class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
              :class="[
                listWidth === p.value
                  ? (darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-600')
                  : (darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')
              ]"
            >
              {{ p.label }}
            </button>

            <span
              class="ml-2 text-[11px] tabular-nums transition-colors"
              :class="darkMode ? 'text-gray-600' : 'text-gray-300'"
            >
              {{ collapsed ? 'collapsed' : `${Math.round(listWidth)}px` }}
            </span>
          </div>
        </header>

        <router-view
          v-model:darkMode="darkMode"
          v-model:listWidth="listWidth"
          v-model:presetWidths="presetWidths"
        />
      </div>
    </template>
  </div>
</template>