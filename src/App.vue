<script setup lang="ts">
import {
  ref,
  computed
} from 'vue'
import {
  useRoute
} from 'vue-router'
import {
  Moon
} from 'lucide-vue-next'
import AppSidebar from './components/AppSidebar.vue'

const route = useRoute()

const sidebarCollapsed = ref(false)
const darkMode = ref(false)

const showSidebar = computed(() => route.name !== 'Login')

</script>

<template>
  <div class="flex h-screen w-full transition-colors duration-300"
    :class="darkMode ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-900'">
    <AppSidebar v-if="showSidebar" :user="null" :collapsed="sidebarCollapsed" :darkMode="darkMode"
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
      <router-view v-model:darkMode="darkMode" />
    </div>
  </div>
</template>