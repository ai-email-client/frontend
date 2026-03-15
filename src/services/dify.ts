import {
    DifySummary,
    DifyWritter
} from "../interface/dify"

import {
    DifySummaryRequest,
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
    async summaryBatch(
        req: string[]
    ): Promise<void> {
        const response = await difyAPI.summaryBatch(req)
        return response
    },
    async writter(
        req: WritterRequest
    ): Promise<DifyWritter> {
        const response = await difyAPI.writter(req)
        return response
    }
}

export default difyService