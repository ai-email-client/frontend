import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DifySummary } from '../interface/dify'

export const useSummaryStore = defineStore('summary', () => {
  const summaries = ref<Record<string, DifySummary | 'processing' | 'error'>>({})

  const setSummary = (msg_id: string, data: DifySummary | 'processing' | 'error') => {
    summaries.value[msg_id] = data
  }

  const getSummary = (msg_id: string): DifySummary | 'processing' | 'error' | null => summaries.value[msg_id] ?? null

  const pruneByIds = (activeIds: string[]) => {
    const active = new Set(activeIds)
    Object.keys(summaries.value).forEach(id => {
      if (!active.has(id)) delete summaries.value[id]
    })
  }

  const clearSummaries = () => {
    summaries.value = {}
  }

  return { summaries, setSummary, getSummary, pruneByIds, clearSummaries }
})