import api from './api'

import type {
    Email,
    EmailSummary,
    EmailShortList
} from '../interface/email'

export default {
    async getEmails() {
        try {
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
                limit: 25
            }

            const response = await api.post<EmailShortList>('/email/fetch', payload, {
                timeout: 10000
            })
            return response.data

        } catch (error) {
            console.error('Failed to fetch emails:', error)
            throw error
        }
    },

    async getEmailsNextPage(pageToken: string) {
        try {
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
                limit: 25,
                page_token: pageToken
            }

            const response = await api.post<EmailShortList>('/email/fetch', payload, {
                timeout: 10000
            })
            return response.data

        } catch (error) {
            console.error('Failed to fetch next page emails:', error)
            throw error
        }
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
            const response = await api.post<Email>('/email/message', payload, {
                timeout: 10000
            })

            return response.data

        } catch (error: any) {
            console.error("Error fetching email:", error)

            if (error.response) {
                console.error("Status:", error.response.status)
                console.error("Server Message:", error.response.data)
            } else {
                console.error("Network/Client Error:", error.message)
            }
            throw error
        }
    },

    async getSummary(plain_text: string) {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        if (!accessToken) throw new Error("No access token found")
        if (!refreshToken) throw new Error("No refresh token found")

        const payload = {
            email_text: plain_text
        }

        const response = await api.post<EmailSummary>('/email/summary', payload, {
            timeout: 120000
        })
        return response.data
    }
}