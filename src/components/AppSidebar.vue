<script setup lang="ts">
import {
  Mail,
  Inbox,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Folder,
  AlertOctagon
} from 'lucide-vue-next'

import type { User } from '../interface/user'

defineProps<{
  user: User | null,
  collapsed: boolean,
  darkMode: boolean
}>()

defineEmits(['toggleCollapse'])

const menuItems = [
  { icon: Inbox, label: 'Inbox', to: '/inbox', badge: 0 },
  { icon: Folder, label: 'Category', to: '/category', badge: 0 },
  { icon: AlertOctagon, label: 'Spam', to: '/spam', badge: 0 },
  { icon: Send, label: 'Send', to: '/sent', badge: 0 },
  { icon: Trash2, label: 'Trash', to: '/trash', badge: 0 },
]
</script>

<template>
  <div class="flex flex-col h-full transition-all duration-300 ease-in-out border-r" :class="[
    collapsed ? 'w-20' : 'w-64',
    darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
  ]">

    <div class="p-6 flex items-center justify-between">
      <div v-if="!collapsed" class="flex items-center gap-2 font-bold text-xl transition-opacity duration-300">
        <div class="p-1.5 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Mail :size="26" />
        </div>
        <span :class="darkMode ? 'text-white' : 'text-gray-900'">Hermes</span>
      </div>
      <div v-else class="p-1.5 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
        <Mail :size="26" />
      </div>

      <button @click="$emit('toggleCollapse')" class="p-1.5 rounded-lg hover:bg-gray-200/20 transition-colors"
        :class="{ 'p-1.5': collapsed }">
        <ChevronRight v-if="collapsed" :size="18" />
        <ChevronLeft v-else :size="18" />
      </button>
    </div>

    <nav class="flex-1 px-4 space-y-2 mt-4">
      <router-link v-for="(item, index) in menuItems" :key="index" :to="item.to" custom v-slot="{ navigate, isActive }">
        <div @click="navigate" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group"
          :class="[
            isActive
              ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
              : 'hover:bg-gray-200/50'
          ]">
          <component :is="item.icon" :size="20" />

          <span v-if="!collapsed" class="font-medium">{{ item.label }}</span>

          <span v-if="!collapsed && item.badge > 0" class="ml-auto text-xs px-2 py-1 rounded-full"
            :class="darkMode ? 'bg-gray-800' : 'bg-gray-200'">
            {{ item.badge }}
          </span>
        </div>
      </router-link>
    </nav>

    <div class="p-4 border-t" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-lg">
          {{ user?.name?.charAt(0).toUpperCase() }}
        </div>
        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate" :class="darkMode ? 'text-white' : 'text-gray-900'">
            {{ user?.name }}
          </p>
          <p class="text-xs truncate text-gray-500">{{ user?.email }}</p>
        </div>
        <router-link to="/settings" custom v-slot="{ navigate }">
          <button v-if="!collapsed" @click="navigate" class="p-2 hover:bg-gray-200/20 rounded-lg">
            <Settings :size="18" />
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>