import api from './api'

import {
    MessageBatchModifyLabelRequest, MessageModifyLabelRequest
} from '../interface/request'
import {
    EmailDetailResponse, EmailFetchResponse,
    CategoryListResponse

} from '../interface/response'
import {
    Attachment

} from '../interface/email'
import {
    Category,
} from '../interface/category'



export default {
    async getEmails(
        limit: number = 10,
        labels: string[] = ["INBOX", "UNREAD"],
        query: string | null = null,
        pageToken: string | null = null
    ) {
        try {
            const payload = {
                limit: limit,
                label: labels,
                query: query,
                page_token: pageToken
            }

            const response = await api.post<EmailFetchResponse>('/email/messages', payload)
            return response.data

        } catch (error) {
            console.error('Failed to fetch emails:', error)
            throw error
        }
    },

    async getEmailById(id: string) {
        try {
            const payload = {
                msg_id: id
            }
            const response = await api.post<EmailDetailResponse>('/email/message/get', payload)

            return response.data

        } catch (error: any) {
            console.error("Error get email by id:", error.response.data)
        }
    },

    async downloadAttachment(file: Attachment, msgId: string) {
        try {
            const payload = {
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
            const response = await api.get<CategoryListResponse>('/email/labels')
            return response.data
        } catch (error) {
            throw error
        }
    },
    async getLabelById(id: string) {
        try {
            const payload = {
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


            const payload = {

                body: body
            }
            const response = await api.post<Category>('/email/label/create', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async initLabel() {
        try {
            const response = await api.post<CategoryListResponse>('/email/initialize/labels')
            return response.data
        } catch (error) {
            throw error
        }
    },

    async syncLabels(names: string[]) {
        try {
            const payload = {
                names: names
            }
            const response = await api.post<CategoryListResponse>('/email/labels/sync', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async messageModify(body: MessageModifyLabelRequest) {
        try {


            const payload = {
                body
            }
            const response = await api.post<CategoryListResponse>('/email/message/modify', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },

    async messageBatchModify(body: MessageBatchModifyLabelRequest) {
        try {
            const payload = {

                body: body
            }
            const response = await api.post<CategoryListResponse>('/email/message/batch_modify', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async messageDelete(id: string) {
        try {


            const payload = {

                id: id
            }
            const response = await api.post<CategoryListResponse>('/email/message/delete', payload)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async messageBatchDelete(ids: string[]) {
        try {


            const payload = {

                ids: ids
            }
            const response = await api.post<CategoryListResponse>('/email/message/batch_delete', payload)
            return response.data
        } catch (error) {
            throw error
        }
    }
}