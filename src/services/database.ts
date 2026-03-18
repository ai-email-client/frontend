import databaseAPI from "../api/database"
import { EmailAnalysisResponse, OverviewResponse } from "../interface/response"

const databaseService = {
    async get_summary(msg_id: string): Promise<EmailAnalysisResponse> {
        const response = await databaseAPI.get_summary(msg_id)
        return response
    },
    async summary_exists(msg_id: string): Promise<boolean> {
        const response = await databaseAPI.summary_exists(msg_id)
        return response
    },
    async get_user_pin(email: string): Promise<any> {
        const response = await databaseAPI.get_user_pin(email)
        return response
    },
    async check_summary(msg_id: string): Promise<boolean> {
        const response = await databaseAPI.check_summary(msg_id)
        return response
    },
    async get_source_email(msg_id: string): Promise<any> {
        const response = await databaseAPI.get_source_email(msg_id)
        return response
    },
    async get_overview(): Promise<OverviewResponse[]> {
        const response = await databaseAPI.get_overview()
        return response
    }
}

export default databaseService
