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
                const response: CategoryListResponse = await emailService.getLabels()
                const currentCategories = response.categories || []

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

                let newCategories: Category[] = []
                if (missingCategories.length > 0) {
                    try {
                        const syncResponse = await emailService.syncLabels(missingCategories)
                        if (syncResponse && syncResponse.categories) {
                            newCategories = syncResponse.categories
                            
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

    const getLabelIdByName = (name: string) => {
        return categoryLabels.value[name?.toLowerCase()]?.id
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
        getLabelIdByName,
        getLabelById,
        getLabelByIds,
        getLabelNameById,
        getLabelNameByName,
        getLabelNameByIds
    }
})