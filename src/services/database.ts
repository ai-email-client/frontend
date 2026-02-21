import databaseAPI from "../api/database"
import { EmailAnalysisResponse } from "../interface/response"

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
}

export default databaseService
