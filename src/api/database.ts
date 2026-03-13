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
    async summary_exists(msg_id: string): Promise<boolean> {
        try {
            const response = await api.get('/database/summary_exists/' + msg_id)
            return response.data
        } catch (error) {
            console.error('Failed to check database summary:', error)
            return false
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
    async check_summary(msg_id: string): Promise<boolean> {
        try {
            const response = await api.get('/database/check_summary/' + msg_id)
            return response.data
        } catch (error) {
            console.error('Failed to check database summary:', error)
            return false
        }
    },
    async get_source_email(msg_id: string): Promise<any> {
        try {
            const response = await api.get('/database/get_source_email/' + msg_id)
            return response.data
        } catch (error) {
            console.error('Failed to get source email:', error)
            return null
        }
    }

}
