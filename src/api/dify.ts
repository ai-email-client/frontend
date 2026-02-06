import api from "./api"
import {
    DifyResponse,
    DifySummaryRequest
} from "../interface/dify"

export default {
    async getSummary(req: DifySummaryRequest): Promise<DifyResponse> {
        try {
            const response = await api.post<DifyResponse>('/dify/summary', req)
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