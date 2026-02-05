import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Category } from '../interface/category'

export const useLabelStore = defineStore('labels', () => {
    const categoryLabels = ref<Record<string, Category>>({})
    const rawLabels = ref<Category[]>([])

    const setLabels = (raw: Category[], mapped: any) => {
        rawLabels.value = raw
        categoryLabels.value = mapped
    }

    const getLabelIdByName = (name: string) => {
        return categoryLabels.value[name.toLowerCase()]?.id
    }

    return { categoryLabels, rawLabels, setLabels, getLabelIdByName }
})