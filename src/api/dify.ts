import api from "./api"
import {
    DifySummary,
    DifyWritter
} from "../interface/dify"
import {
    DifySummaryRequest,
    WritterRequest
} from "../interface/request"

export default {
    async get_summary(req: DifySummaryRequest): Promise<DifySummary> {
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
    },
    async writter(req: WritterRequest): Promise<DifyWritter> {
        try {
            const response = await api.post<DifyWritter>('/dify/writter', req)
            return response.data
        } catch (error) {
            console.error('Error getting Dify writter:', error)
            throw error
        }
    }
}