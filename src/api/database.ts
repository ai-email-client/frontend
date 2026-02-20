import api from './api'
import { EmailAnalysisResponse } from '../interface/response'

export default {
    async get_summary(msg_id: string): Promise<EmailAnalysisResponse> {
        try {
            const response = await api.get('/database/get_summary/' + msg_id)
            return response.data
        } catch (error) {
            console.error('Failed to fetch database summary:', error)
            return {} as EmailAnalysisResponse
        }
    },
    async get_user_pin(email: string): Promise<any> {
        try {
            const response = await api.get('/database/email/' + email)
            return response.data
        } catch (error) {
            console.error('Failed to get user pin:', error)
        }
    },

}
