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
  Sun
} from 'lucide-vue-next'
import AppSidebar from './components/AppSidebar.vue'
import { UserProfile } from './interface/user'
import { useLabelStore } from './stores/categoryStore'
import { useUiStore } from './stores/uiStore'
import { useComposerStore } from './stores/composerStore'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const labelStore = useLabelStore()
const composerStore = useComposerStore()

const sidebarCollapsed = ref(false)
const darkMode = ref(false)
const user = ref<UserProfile | null>(null)

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

const handleAuthCheck = async () => {
  const publicPages = ['Login', 'Callback']
  if (!route.name) return

  if (publicPages.includes(route.name as string)) {
    uiStore.setLoading(false)
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

}

const handleLogout = () => {
  localStorage.removeItem('jwt_token')
  user.value = null
  router.replace('/login')
  uiStore.setLoading(false)
}

onMounted(async () => {
  const navEntries = window.performance.getEntriesByType("navigation")
  
  if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload") {
    await handleAuthCheck()
    router.replace('/inbox') 
  }
  
  await router.isReady()
  await labelStore.getLabels()
})

watch(
  () => route.name,
  async () => {
    await handleAuthCheck()
  }
)

watch(() => route.params.code, () => {
  if (route.params.code === '401') {
    localStorage.removeItem('jwt_token')
    router.push('/login')
  }
})

</script>

<template>
  <div
    class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
      <AppSidebar
        v-if="showLayout"
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
        <div class="fixed w-[50%] bottom-0 right-10 z-50"> <EmailComposer />
</div>
        <router-view
          v-model:darkMode="darkMode"
          v-model:listWidth="listWidth"
          v-model:presetWidths="presetWidths"
        />
      </div>
  </div>
</template>