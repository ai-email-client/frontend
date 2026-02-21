<script setup lang="ts">
import {
    Sparkles
} from 'lucide-vue-next'
import {
    DifySummary
} from '../interface/dify';


const props = defineProps<{
    data: DifySummary | null,
    darkMode: boolean
}>()

</script>

<template>
    <div v-if="data?.summary" class="border-b p-6 transition-colors"
        :class="darkMode ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800' 
        : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'">
        <div class="rounded-xl border overflow-hidden animate-in fade-in slide-in-from-top-4"
            :class="darkMode ? 'bg-gray-900/50 border-purple-500/30' : 'bg-white border-purple-200 shadow-sm'">
            <div class="px-5 py-3 border-b flex justify-between items-center"
                :class="darkMode ? 'bg-purple-900/20 border-purple-500/20' : 'bg-purple-50/50 border-purple-100'">
                <div class="flex items-start gap-3">
                    <Sparkles class="w-5 h-5 flex-shrink-0 mt-0.5" 
                    :class="darkMode ? 'text-purple-400' : 'text-purple-600'" />
                    <div>
                        <h3 class="font-semibold mb-1.5 text-sm" 
                            :class="darkMode ? 'text-purple-300' : 'text-purple-900'">
                            AI Summary
                        </h3>
                        <p class="leading-relaxed text-sm" 
                            :class="darkMode ? 'text-slate-300' : 'text-slate-700'">
                            {{ data.summary }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>