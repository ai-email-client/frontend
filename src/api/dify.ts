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
    async testSummary(req: DifySummaryRequest): Promise<any> {
        try {
            const response = await api.post<any>('/dify/test-summary', req)
            return response.data
        } catch (error) {
            console.error('Error testing Dify summary:', error)
            throw error
        }
    }
}