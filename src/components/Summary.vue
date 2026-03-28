<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { DifySummary } from '../interface/dify'

defineProps<{
  data: DifySummary | null
  darkMode: boolean
}>()
</script>

<template>
  <Transition name="summary">
    <div
      v-if="data?.summary"
      class="relative rounded-2xl overflow-hidden summary-card"
      :class="darkMode
        ? 'bg-gray-800/60 border border-purple-500/20'
        : 'bg-white border border-purple-100 shadow-md shadow-purple-100/50'"
    >

      <!-- Ambient glow blob (decorative) -->
      <div
        class="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-30"
        :class="darkMode ? 'bg-purple-600' : 'bg-purple-300'"
      />
      <div
        class="absolute -bottom-4 -left-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
        :class="darkMode ? 'bg-blue-500' : 'bg-blue-300'"
      />

      <!-- Header row -->
      <div
        class="relative flex items-center gap-2.5 px-5 pt-4 pb-3"
      >
        <!-- Sparkle icon with glowing ring -->
        <div
          class="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          :class="darkMode ? 'bg-purple-500/20' : 'bg-purple-100'"
        >
          <Sparkles
            class="w-4 h-4"
            :class="darkMode ? 'text-purple-300' : 'text-purple-600'"
          />
          <!-- Pulse ring -->
          <span
            class="absolute inset-0 rounded-full animate-ping opacity-20"
            :class="darkMode ? 'bg-purple-400' : 'bg-purple-400'"
          />
        </div>

        <div class="flex items-baseline gap-2">
          <span
            class="text-xs font-bold uppercase tracking-widest"
            :class="darkMode ? 'text-purple-400' : 'text-purple-600'"
          >
            AI Summary
          </span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            :class="darkMode ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-50 text-purple-500'"
          >
            Generated
          </span>
        </div>

        <!-- Shimmer line (decorative accent) -->
        <div class="ml-auto h-px flex-1 max-w-16 rounded shimmer-line"
          :class="darkMode ? 'bg-purple-500/30' : 'bg-purple-200'"
        />
      </div>

      <!-- Divider -->
      <div class="mx-5 h-px" :class="darkMode ? 'bg-purple-500/10' : 'bg-purple-50'" />

      <!-- Summary text -->
      <p
        class="relative px-5 pt-3.5 pb-5 text-sm leading-7"
        :class="darkMode ? 'text-gray-300' : 'text-gray-600'"
      >
        <!-- Opening quote mark (decorative) -->
        <span
          class="float-left mr-1 text-3xl leading-none font-serif select-none -mt-1"
          :class="darkMode ? 'text-purple-500/40' : 'text-purple-200'"
          aria-hidden="true"
        >"</span>
        {{ data.summary }}
      </p>

    </div>
  </Transition>
</template>

<style scoped>
.summary-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.summary-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.summary-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.summary-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.summary-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.summary-card:hover {
  transform: translateY(-1px);
}

@keyframes shimmer {
  0%   { opacity: 0.3; }
  50%  { opacity: 1; }
  100% { opacity: 0.3; }
}
.shimmer-line {
  animation: shimmer 2.5s ease-in-out infinite;
}
</style>