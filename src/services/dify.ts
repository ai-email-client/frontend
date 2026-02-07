import {
    DifySummary,
    DifySummaryRequest
} from "../interface/dify"

import difyAPI from "../api/dify"

const difyService = {
    async getSummary(
        req: DifySummaryRequest
    ): Promise<DifySummary> {
        const response = await difyAPI.getSummary(req)
        return response
    },
    async testSummary(
        req: DifySummaryRequest
    ): Promise<any> {
        const response = await difyAPI.testSummary(req)
        return response
    }
}

export default difyService