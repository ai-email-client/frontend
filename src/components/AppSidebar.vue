<script setup lang="ts">
import {
  Mail,
  Inbox,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  Folder,
  AlertOctagon
} from 'lucide-vue-next'

import { ref } from 'vue'

import { CategoryMenuItem, EmailCategory } from '../interface/category'
import { formatLabel } from '../utils';
import { UserProfile } from '../interface/user';
import { SpamType } from '../interface/spam';
import { LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router';

const router = useRouter()

defineProps<{
  user: UserProfile | null,
  collapsed: boolean,
  darkMode: boolean
}>()

defineEmits(['toggleCollapse'])
const toggleSubmenu = (item: any) => {
  item.isOpen = !item.isOpen
}

const handleLogout = () => {
  localStorage.removeItem('jwt_token')
  router.push('/login')
}

const menuItems = ref<CategoryMenuItem[]>([
  {
    icon: Inbox,
    label: 'Inbox',
    to: '/inbox',
    badge: 0
  },
  {
    icon: Folder,
    label: 'Category',
    badge: 0,
    isOpen: false,
    children: Object.values(EmailCategory).map((category) => ({
      label: formatLabel(category),
      to: `/category/${category}`
    }))
  },
  {
    icon: AlertOctagon,
    label: 'Spam',
    to: '/spam',
    badge: 0,
    isOpen: false,
    children: Object.values(SpamType).map((spamType) => ({
      label: formatLabel(spamType),
      to: `/spam/${spamType}`
    }))
  },
  {
    icon: Send,
    label: 'Send',
    to: '/sent',
    badge: 0
  },
  {
    icon: Trash2,
    label: 'Trash',
    to: '/trash',
    badge: 0
  },
])

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

    <nav class="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
      <template v-for="(item, index) in menuItems" :key="index">

        <router-link v-if="!item.children" :to="item.to!" custom v-slot="{ navigate, isActive }">
          <div @click="navigate" class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group"
            :class="[
              isActive
                ? (darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                : 'hover:bg-gray-200/50'
            ]">
            <component :is="item.icon" :size="20" />
            <span v-if="!collapsed" class="font-medium flex-1">{{ item.label }}</span>
            <span v-if="!collapsed && item.badge > 0" class="ml-auto text-xs px-2 py-1 rounded-full"
              :class="darkMode ? 'bg-gray-800' : 'bg-gray-200'">
              {{ item.badge }}
            </span>
          </div>
        </router-link>

        <div v-else>
          <div @click="toggleSubmenu(item)"
            class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-200/50"
            :class="{ 'text-blue-500': item.isOpen }">
            <component :is="item.icon" :size="20" />

            <div v-if="!collapsed" class="flex flex-1 items-center justify-between">
              <span class="font-medium">{{ item.label }}</span>
              <ChevronDown :size="16" class="transition-transform duration-200"
                :class="{ 'rotate-180': item.isOpen }" />
            </div>
          </div>

          <div v-if="item.isOpen && !collapsed" class="mt-1 ml-4 border-l-2 pl-2 space-y-1"
            :class="darkMode ? 'border-gray-700' : 'border-gray-200'">

            <router-link v-for="(child, cIndex) in item.children" :key="cIndex" :to="child.to" custom
              v-slot="{ navigate, isActive }">
              <div @click="navigate"
                class="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-sm transition-colors" :class="[
                  isActive
                    ? (darkMode ? 'text-blue-400 bg-blue-600/10' : 'text-blue-600 bg-blue-50')
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                ]">
                <Circle :size="8" :class="{ 'fill-current': isActive }" />
                <span>{{ child.label }}</span>
              </div>
            </router-link>

          </div>
        </div>

      </template>
    </nav>

    <div class="p-4 border-t" :class="darkMode ? 'border-gray-800' : 'border-gray-200'">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium shadow-lg shrink-0">
          {{ user?.emailAddress?.charAt(0).toUpperCase() }}
        </div>

        <div v-if="!collapsed" class="flex-1 min-w-0 flex items-center justify-between group">
          <div class="flex-1 min-w-0 mr-2">
            <p class="text-sm font-medium truncate" :class="darkMode ? 'text-white' : 'text-gray-900'">
              {{ user?.emailAddress }}
            </p>
            <p class="text-xs truncate" :class="darkMode ? 'text-gray-500' : 'text-gray-500'">
              User
            </p>
          </div>

          <button @click="handleLogout" class="p-1.5 rounded-md transition-colors duration-200" :class="darkMode
            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'" title="Logout">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>