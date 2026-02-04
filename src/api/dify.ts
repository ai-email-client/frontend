import api from "./api"
import {
    DifyResponse,
    DifySummaryRequest
} from "../interface/dify"

export default {
    async getSummary(req: DifySummaryRequest): Promise<DifyResponse> {
        const response = await api.post<DifyResponse>('/dify/summary', req)
        return response.data
    }
}