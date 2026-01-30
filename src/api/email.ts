import api from './api'

import type {
    Email,
    EmailSummary,
    EmailShortList,
    MessageModify,
    Attachment,
    MessageBatchModify
} from '../interface/email'

import {
    Category,
    CategoryListResponse,
    CreateLabelResponse
} from '../interface/category'

export default {
    async getEmails(
        limit: number = 10,
        labels: string[] = ["INBOX", "UNREAD"],
        pageToken: string | null = null
    ) {
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
                limit: limit,
                label: labels,
                page_token: pageToken
            }

            const response = await api.post<EmailShortList>('/email/messages', payload)
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
            const response = await api.post<Email>('/email/message/get', payload)

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

        const response = await api.post<EmailSummary>('/email/summary', payload)
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
            const response = await api.post(`/email/message/attachment`, payload)

            return response.data

        } catch (error) {
            throw error
        }
    },

    async getLabels() {
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
            const response = await api.post<CategoryListResponse>('/email/labels', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async getLabelById(id: string) {
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
                id: id
            }
            const response = await api.post<Category>('/email/label/get', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async createLabel(body: Category) {
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
                body: body
            }
            const response = await api.post<CreateLabelResponse>('/email/label/create', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async messageModify(body: MessageModify) {
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
                body
            }
            const response = await api.post<CategoryListResponse>('/email/message/modify', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async messageBatchModify(body: MessageBatchModify) {
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
                body: body
            }
            const response = await api.post<CategoryListResponse>('/email/message/batch-modify', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async messageDelete(id: string) {
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
                id
            }
            const response = await api.post<CategoryListResponse>('/email/message/delete', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async messageBatchDelete(ids: string[]) {
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
                ids
            }
            const response = await api.post<CategoryListResponse>('/email/message/batch-delete', payload)
            return response.data
        } catch (error) {
            throw error
        }
    }
}