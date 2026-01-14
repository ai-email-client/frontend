<script setup lang="ts">
import {
    MapPin,
    Calendar,
    Clock,
    ListTodo,
    Briefcase,
    Sparkles,
    ShieldCheck,
    AlertTriangle,
    User
} from 'lucide-vue-next'
import { computed } from 'vue'
import { EmailSummary } from '../interface/email';


const props = defineProps<{
    data: EmailSummary,
    darkMode: boolean
}>()

const confidenceColor = computed(() => {
    const score = props.data.confidence
    if (score >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 0.5) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
})

const confidenceLabel = computed(() => {
    return Math.round(props.data.confidence * 100) + '%'
})
</script>

<template>
    <div class="rounded-xl border overflow-hidden animate-in fade-in slide-in-from-top-4"
        :class="darkMode ? 'bg-gray-900/50 border-purple-500/30' : 'bg-white border-purple-200 shadow-sm'">

        <div class="px-5 py-3 border-b flex justify-between items-center"
            :class="darkMode ? 'bg-purple-900/20 border-purple-500/20' : 'bg-purple-50/50 border-purple-100'">
            <div class="flex items-center gap-2">
                <Sparkles class="text-purple-500" :size="18" />
                <span class="font-bold text-sm uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    AI Analysis
                </span>
                <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border"
                    :class="darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'">
                    {{ data.email_category }}
                </span>
            </div>

            <div class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold" :class="confidenceColor">
                <ShieldCheck v-if="data.confidence >= 0.8" :size="14" />
                <AlertTriangle v-else :size="14" />
                <span>Confidence: {{ confidenceLabel }}</span>
            </div>
        </div>

        <div class="p-5 space-y-6">

            <div>
                <p class="text-sm leading-relaxed" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ data.summary }}
                </p>
            </div>

            <div v-if="data.date || data.time || data.location" class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div v-if="data.date" class="flex items-center gap-3 p-3 rounded-lg border"
                    :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'">
                    <div class="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <Calendar :size="16" />
                    </div>
                    <div>
                        <p class="text-[10px] uppercase text-gray-500 font-bold">Date</p>
                        <p class="text-sm font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">{{
                            data.date }}</p>
                    </div>
                </div>

                <div v-if="data.time" class="flex items-center gap-3 p-3 rounded-lg border"
                    :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'">
                    <div
                        class="p-2 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                        <Clock :size="16" />
                    </div>
                    <div>
                        <p class="text-[10px] uppercase text-gray-500 font-bold">Time</p>
                        <p class="text-sm font-medium" :class="darkMode ? 'text-gray-200' : 'text-gray-900'">{{
                            data.time }}</p>
                    </div>
                </div>

                <div v-if="data.location" class="flex items-center gap-3 p-3 rounded-lg border"
                    :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'">
                    <div class="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <MapPin :size="16" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-[10px] uppercase text-gray-500 font-bold">Location</p>
                        <p class="text-sm font-medium truncate" :class="darkMode ? 'text-gray-200' : 'text-gray-900'"
                            :title="data.location">
                            {{ data.location }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="(data.instructions && data.instructions.length > 0) || (data.required_items && data.required_items.length > 0)"
                class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t"
                :class="darkMode ? 'border-gray-800' : 'border-gray-100'">

                <div v-if="data.instructions.length > 0">
                    <h4 class="flex items-center gap-2 text-xs font-bold uppercase mb-3 text-gray-500">
                        <ListTodo :size="16" /> Instructions
                    </h4>
                    <ul class="space-y-2">
                        <li v-for="(item, idx) in data.instructions" :key="idx" class="flex items-start gap-2 text-sm"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </div>

                <div v-if="data.required_items.length > 0">
                    <h4 class="flex items-center gap-2 text-xs font-bold uppercase mb-3 text-gray-500">
                        <Briefcase :size="16" /> Required Items
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="(item, idx) in data.required_items" :key="idx"
                            class="px-2.5 py-1 text-xs rounded-full border" :class="darkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-300'
                                : 'bg-gray-100 border-gray-200 text-gray-700'">
                            {{ item }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-4 mt-2 border-t text-xs text-gray-500"
                :class="darkMode ? 'border-gray-800' : 'border-gray-100'">
                <div class="flex items-center gap-2">
                    <User :size="12" />
                    <span>Sender: {{ data.sender?.name || 'Unknown' }}</span>
                </div>
                <div class="flex items-center gap-1">
                    Status: <span class="capitalize">{{ data.extraction_status }}</span>
                </div>
            </div>

        </div>
    </div>
</template>