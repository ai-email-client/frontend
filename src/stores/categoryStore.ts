import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Category, CategoryEnum} from '../interface/category'
import emailService from '../services/email'
import { CategoryListResponse } from '../interface/response'

export const useLabelStore = defineStore('labels', () => {
    const categoryLabels = ref<Record<string, Category>>({})
    const rawLabels = ref<Category[]>([])
    const isReady = ref(false)

    const initialize = async () => {
        if (isReady.value) return
            try {
                if (!rawLabels.value.length) {
                    rawLabels.value = await getLabels()
                } 
                const currentCategories = rawLabels.value || []

                const categoryMap = new Map<string, Category>()
                
                currentCategories.forEach((cat) => {
                    if (cat.name) {
                        categoryMap.set(cat.name.toLowerCase(), cat)
                    }
                })

                const missingCategories: string[] = []
                
                Object.values(CategoryEnum).forEach((catEnum) => {
                    const key = catEnum.toLowerCase()
                    const foundCategory = categoryMap.get(key)

                    if (foundCategory) {
                        categoryLabels.value[key] = foundCategory
                    } else {
                        missingCategories.push(catEnum)
                    }
                })
                if (missingCategories.length === 0) {
                    rawLabels.value = [...currentCategories]
                    return
                }

                let newCategories: Category[] = []
                if (missingCategories.length > 0) {
                    try {
                        const syncResponse = await emailService.syncLabels(missingCategories)
                        if (syncResponse && syncResponse.labels) {
                            newCategories = syncResponse.labels
                            
                            newCategories.forEach(cat => {
                                if (cat.name) {
                                    categoryLabels.value[cat.name.toLowerCase()] = cat
                                }
                            })
                        }
                    } catch (syncError) {
                        console.error("Sync Labels Failed (Non-blocking):", syncError)
                    }
                }

                rawLabels.value = [...currentCategories, ...newCategories]

            } catch (error) {
                console.error("Store Init Failed:", error)
            } finally {
                isReady.value = true 
            }
    }

    const getLabels = async () => {
        const response: CategoryListResponse = await emailService.getLabels()
        rawLabels.value = response.labels || []
        return response.labels || []
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
        isReady,
        initialize,
        getLabels,
        getLabelIdByName,
        getLabelById,
        getLabelByIds,
        getLabelNameById,
        getLabelNameByName,
        getLabelNameByIds
    }
})