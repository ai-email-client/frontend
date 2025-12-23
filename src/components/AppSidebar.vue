<script setup lang="ts">
import { Mail, Inbox, Send, Star, Archive, Trash2, Settings, User, ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  collapsed: boolean,
  darkMode: boolean
}>()
defineEmits(['toggleCollapse'])
</script>

<template>
  <div 
    class="flex flex-col h-full transition-all duration-300 ease-in-out border-r"
    :class="[
      collapsed ? 'w-20' : 'w-64',
      darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
    ]"
  >
    <div class="p-6 flex items-center justify-between">
      <div v-if="!collapsed" class="flex items-center gap-3 font-bold text-xl transition-opacity duration-300">
        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Mail :size="18" />
        </div>
        <span :class="darkMode ? 'text-white' : 'text-gray-900'">ZenMail</span>
      </div>
      <div v-else class="mx-auto w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
        <Mail :size="18" />
      </div>

      <button 
        @click="$emit('toggleCollapse')"
        class="p-1.5 rounded-lg hover:bg-gray-200/20 transition-colors"
        :class="{ 'mx-auto mt-4': collapsed }"
      >
        <ChevronRight v-if="collapsed" :size="16" />
        <ChevronLeft v-else :size="16" />
      </button>
    </div>

    <nav class="flex-1 px-4 space-y-2 mt-4">
      <div 
        v-for="(item, index) in [
          { icon: Inbox, label: 'Inbox', badge: 12, active: true },
          { icon: Star, label: 'Starred', badge: 0, active: false },
          { icon: Send, label: 'Sent', badge: 0, active: false },
          { icon: Archive, label: 'Archive', badge: 0, active: false },
          { icon: Trash2, label: 'Trash', badge: 0, active: false },
        ]" 
        :key="index"
        class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group"
        :class="[
          item.active 
            ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') 
            : 'hover:bg-gray-200/50'
        ]"
      >
        <component :is="item.icon" :size="20" />
        <span v-if="!collapsed" class="font-medium">{{ item.label }}</span>
        <span 
          v-if="!collapsed && item.badge > 0" 
          class="ml-auto text-xs px-2 py-1 rounded-full"
          :class="darkMode ? 'bg-gray-800' : 'bg-gray-200'"
        >
          {{ item.badge }}
        </span>
      </div>
    </nav>

    <div class="p-4 border-t" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-lg">
          JD
        </div>
        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate" :class="darkMode ? 'text-white' : 'text-gray-900'">John Doe</p>
          <p class="text-xs truncate text-gray-500">john@example.com</p>
        </div>
        <button v-if="!collapsed" class="p-2 hover:bg-gray-200/20 rounded-lg">
          <Settings :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>