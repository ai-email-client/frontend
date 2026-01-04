import api from './api'
import type { Email, EmailShortList } from '../interface/email'

export default {
    async getEmails() {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        if (!accessToken) throw new Error("No access token found")
        if (!refreshToken) throw new Error("No refresh token found")

        const payload = {
            provider: 'gmail',
            token_data: {
                access_token: accessToken,
                refresh_token: refreshToken
            },
            limit: 20
        }
        const response = await api.post<EmailShortList>('/email/fetch', payload)
        return response.data.emails
    },

    async getEmailById(id: string) {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        if (!accessToken) throw new Error("No access token found")
        if (!refreshToken) throw new Error("No refresh token found")

        const payload = {
            provider: 'gmail',
            token_data: {
                access_token: accessToken,
                refresh_token: refreshToken
            },
            message_id: id
        }
        try {
            const response = await api.post<Email>('/email/message', payload)

            console.log("✅ Success! Data received:", response.data)

            return response.data

        } catch (error: any) {
            console.error("❌ Error fetching email:", error)

            if (error.response) {
                console.error("Status:", error.response.status)
                console.error("Server Message:", error.response.data)
            } else {
                console.error("Network/Client Error:", error.message)
            }
            throw error
        }
    }
}