import api from './api'

import type {
    Email,
    EmailSummary,
    EmailShortList,
    Attachment
} from '../interface/email'
import { Category, CategoryListResponse } from '../interface/category'

export default {
    async getEmails(label: string[] = ["INBOX", "UNREAD"], pageToken: string | null = null) {
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
                limit: 5,
                label: label,
                page_token: pageToken
            }

            const response = await api.post<EmailShortList>('/email/fetch', payload, {
                timeout: 120000
            })
            return response.data

        } catch (error) {
            console.error('Failed to fetch emails:', error)
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
                timeout: 120000
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

        const payload = {
            email_text: plain_text
        }

        const response = await api.post<EmailSummary>('/email/summary', payload, {
            timeout: 120000
        })
        return response.data
    },

    async downloadAttachment(file: Attachment, msgId: string) {
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
                message_id: msgId,
                attachment_id: file.attachmentId
            }
            const response = await api.post(`/email/message/attachment`, payload, {
                timeout: 120000
            })

            return response.data

        } catch (error) {
            throw error
        }
    },

    async getCategories() {
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
                }
            }
            const response = await api.post<CategoryListResponse>('/email/categories', payload, {
                timeout: 20000
            })
            return response.data
        } catch (error) {
            throw error
        }
    }
}