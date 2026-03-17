import {
    DifySummary,
    DifyWritter
} from "../interface/dify"

import {
    DifySummaryRequest,
    DifySummaryBatchRequest,
    WritterRequest
} from "../interface/request"



import difyAPI from "../api/dify"

const difyService = {
    async getSummary(
        req: DifySummaryRequest
    ): Promise<DifySummary> {
        const response = await difyAPI.get_summary(req)
        return response
    },
    async getSummaryBatch(
        req: DifySummaryBatchRequest
    ): Promise<DifySummary[]> {
        try {
            const response = await difyAPI.getSummaryBatch(req)
            return response
        } catch (error) {
            console.error('Error fetching summary batch:', error)
            return []
        }
    },
    async writter(
        req: WritterRequest
    ): Promise<DifyWritter> {
        const response = await difyAPI.writter(req)
        return response
    }
}

export default difyService