
<script setup lang="ts">
import { Sparkles, AlertCircle } from 'lucide-vue-next'

defineEmits(['dismiss']);
</script>

<template>
  <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <Sparkles class="w-6 h-6 mt-1 flex-shrink-0" />
          <div>
            <h2 class="text-xl font-bold mb-3">AI Email Summary</h2>
            <div class="space-y-2">
              <p class="text-lg">
                You have <strong>{{  }} unread emails</strong>
              </p>
              <div class="flex flex-wrap gap-3 text-sm">

              </div>

            <button 
              @click="$emit('dismiss')"
              class="mt-4 text-sm underline hover:no-underline"
            >
              Dismiss notification
            </button>
          </div>
        </div>
        <button 
          @click="$emit('dismiss')"
          class="text-white/80 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  </div>
  </div>    
</template>
