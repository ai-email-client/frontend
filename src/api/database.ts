import api from './api'

export default {
    async get_summary(): Promise<any> {
        try {
            const response = await api.get('/database/summary')
            return response.data
        } catch (error) {
            console.error('Failed to fetch database summary:', error)
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
