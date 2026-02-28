import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Category} from '../interface/category'
import emailService from '../services/email'
import { CategoryListResponse } from '../interface/response'

export const useLabelStore = defineStore('labels', () => {
    const categoryLabels = ref<Record<string, Category>>({})
    const rawLabels = ref<Category[]>([])

    const getLabels = async () => {
        if (rawLabels.value.length > 0) {
            return
        }

        const response: CategoryListResponse = await emailService.syncLabels()
        rawLabels.value = response.labels || []
    }

    const getLabelIdByName = (name: string): string => {
        return rawLabels.value.find((label: Category) => label.name === name)?.id || ''
    }

    const getLabelById = (id: string) => {
        return rawLabels.value.find((label: Category) => label.id === id)
    }

    const getLabelByIds = (id: string[]) => {
        return id.map((item: string) => getLabelById(item))
    }

    const getLabelNameById = (id: string) => {
        return rawLabels.value.find((label: Category) => label.id === id)?.name
    }

    const getLabelNameByName = (name: string) => {
        return rawLabels.value.find((label: Category) => label.name === name)?.name
    }

    const getLabelNameByIds = (label: string[]) => {
        return label.map((item: string) => getLabelNameById(item))
    }

    return {
        categoryLabels,
        rawLabels,
        getLabels,
        getLabelIdByName,
        getLabelById,
        getLabelByIds,
        getLabelNameById,
        getLabelNameByName,
        getLabelNameByIds
    }
})