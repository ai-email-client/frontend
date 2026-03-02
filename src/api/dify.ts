import api from "./api"
import {
    DifySummary
} from "../interface/dify"
import {
    DifySummaryRequest
} from "../interface/request"

export default {
    async getSummary(req: DifySummaryRequest): Promise<DifySummary> {
        try {
            const response = await api.post<DifySummary>('/dify/summary', req)
            return response.data
        } catch (error) {
            console.error('Error getting Dify summary:', error)
            throw error
        }
    },
    async summaryBatch(req: string[]): Promise<void> {
        try {
            const response = await api.post<void>('/dify/summary_batch', req)
            return response.data
        } catch (error) {
            console.error('Error getting Dify summary batch:', error)
            throw error
        }
    }
}