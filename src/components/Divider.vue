<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps({
  darkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'drag', clientX: number): void
  (e: 'collapse'): void
  (e: 'expand'): void
}>()

let dragging = false

const onMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  dragging = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onMouseMove = (e: MouseEvent) => {
  if (dragging) emit('drag', e.clientX)
}

const onMouseUp = () => {
  if (!dragging) return
  dragging = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div
    class="relative w-[5px] h-full flex items-center justify-center group cursor-col-resize select-none z-10 transition-colors"
    :class="darkMode ? 'bg-gray-800 hover:bg-blue-500/30' : 'bg-gray-200 hover:bg-blue-400/30'"
    @mousedown="onMouseDown"
  >
    <div class="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
      >
        <circle cx="9"  cy="5"  r="1" fill="currentColor"/>
        <circle cx="9"  cy="12" r="1" fill="currentColor"/>
        <circle cx="9"  cy="19" r="1" fill="currentColor"/>
        <circle cx="15" cy="5"  r="1" fill="currentColor"/>
        <circle cx="15" cy="12" r="1" fill="currentColor"/>
        <circle cx="15" cy="19" r="1" fill="currentColor"/>
      </svg>
    </div>

    <button
      class="absolute top-75 -left-6 w-6 h-10 rounded-full border shadow flex items-center justify-center
             opacity-0 group-hover:opacity-100 transition-opacity z-20"
      :class="darkMode
        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-blue-700 hover:border-blue-600 hover:text-white'
        : 'bg-white border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'"
      title="Collapse"
      @mousedown.stop
      @click.stop="$emit('collapse')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>

    <button
      class="absolute top-75 -right-6 w-6 h-10 rounded-full border shadow flex items-center justify-center
             opacity-0 group-hover:opacity-100 transition-opacity z-20"
      :class="darkMode
        ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-blue-700 hover:border-blue-600 hover:text-white'
        : 'bg-white border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'"
      title="Expand"
      @mousedown.stop
      @click.stop="$emit('expand')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  </div>
</template>
