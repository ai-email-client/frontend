import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category, CategoryListResponse } from '../interface/category'
import emailService from '../services/email'
import { EmailCategory } from '../interface/category'

export const useLabelStore = defineStore('labels', () => {
    const categoryLabels = ref<Record<string, Category>>({})
    const rawLabels = ref<Category[]>([])
    const isReady = ref(false)

    const initialize = async () => {
        if (isReady.value) return

        try {
            const response: CategoryListResponse = await emailService.getLabels()
            rawLabels.value = response.categories || []

            const missingCategories: string[] = []
            Object.values(EmailCategory).forEach((catEnum) => {
                const found = rawLabels.value.find((l) =>
                    l.name.toLowerCase() === catEnum.toLowerCase()
                )

                if (found) {
                    categoryLabels.value[catEnum.toLowerCase()] = found
                } else {
                    missingCategories.push(catEnum)
                }
            })

            if (missingCategories.length > 0) {
                console.log(`Syncing missing labels: ${missingCategories.join(', ')}`)
                const newLabels = await emailService.syncLabels(missingCategories)
                if (newLabels) {
                    rawLabels.value.push(...newLabels.categories)
                    newLabels.categories.forEach(l => {
                        categoryLabels.value[l.name.toLowerCase()] = l
                    })
                }
            }

            isReady.value = true

        } catch (error) {
            console.error("Store Init Failed:", error)
        }
    }

    const getLabelIdByName = (name: string) => {
        return categoryLabels.value[name?.toLowerCase()]?.id
    }

    const getLabelById = (id: string) => {
        return rawLabels.value.find((label: Category) => label.id === id)
    }

    return {
        categoryLabels,
        rawLabels,
        isReady,
        initialize,
        getLabelIdByName,
        getLabelById
    }
})