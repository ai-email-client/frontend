<script setup lang="ts">
import { Search, Star, PenSquare } from 'lucide-vue-next'

// Props และ Emits เพื่อคุยกับหน้าหลัก
defineProps<{
  emails: any[],
  selectedId: number | null,
  darkMode: boolean
}>()

defineEmits(['select'])
</script>

<template>
  <div 
    class="w-96 flex flex-col border-r h-full"
    :class="darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'"
  >
    <div class="p-4 border-b" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold" :class="darkMode ? 'text-white' : 'text-gray-900'">Inbox</h2>
        <button class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <PenSquare :size="18" />
        </button>
      </div>
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
        <input 
          type="text" 
          placeholder="Search emails..."
          class="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          :class="darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'"
        />
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div 
        v-for="email in emails" 
        :key="email.id"
        @click="$emit('select', email.id)"
        class="p-4 border-b cursor-pointer transition-all hover:pl-5 group relative"
        :class="[
          darkMode ? 'border-gray-800' : 'border-gray-100',
          selectedId === email.id 
            ? (darkMode ? 'bg-blue-900/20 border-l-2 border-l-blue-500' : 'bg-blue-50 border-l-2 border-l-blue-500')
            : 'hover:bg-gray-50/50'
        ]"
      >
        <div class="flex justify-between items-start mb-1">
          <span 
            class="font-semibold text-sm truncate pr-2"
            :class="[
              email.unread ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'
            ]"
          >
            {{ email.from }}
          </span>
          <span class="text-xs text-gray-500 whitespace-nowrap">{{ email.time }}</span>
        </div>
        
        <h3 
          class="text-sm mb-1 truncate"
          :class="[
            email.unread ? 'font-semibold' : 'font-normal',
            darkMode ? 'text-gray-300' : 'text-gray-700'
          ]"
        >
          {{ email.subject }}
        </h3>
        
        <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ email.preview }}</p>
        
        <div class="flex items-center gap-2">
          <span 
            v-if="email.tag"
            class="text-[10px] px-2 py-0.5 rounded-full font-medium"
            :class="[
              email.tag === 'work' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
            ]"
          >
            {{ email.tag }}
          </span>
          <Star 
            v-if="email.starred" 
            :size="14" 
            class="ml-auto fill-yellow-400 text-yellow-400" 
          />
        </div>
      </div>
    </div>
  </div>
</template>