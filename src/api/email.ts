import api from './api'

import {
    MessageBatchModifyLabelRequest, MessageModifyLabelRequest
} from '../interface/request'
import {
    CategoryListResponse
} from '../interface/response'
import {
    Attachment

} from '../interface/email'
import {
    Category,
} from '../interface/category'
import { MessageParam, MessagesParam } from '../interface/param'

export default {
    async fetch_emails(
        param: MessagesParam
    ) {
        try {
            const response = await api.get<any  >('/email/messages', 
                {
                    params: param,
                    paramsSerializer: {
                        indexes: null 
                    }
                }
            )
            return response.data

        } catch (error) {
            console.error('Failed to fetch emails:', error)
            throw error
        }
    },

    async get_message_by_id(
        id: string,
        param: MessageParam
    ) {
        try {
            const response = await api.get<any>(`/email/message/${id}`,{
                params: param,
                paramsSerializer: {
                    indexes: null 
                }
            })

            return response.data

        } catch (error: any) {
            console.error("Error get message by id:", error.response.data)
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
            const response = await api.get<Category>(`/email/label/${id}`)
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
            const response = await api.delete<CategoryListResponse>(`/email/message/${id}`)
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
    },
    async messageTrash(id: string) {
        try {
            const response = await api.put(`/email/message/trash/${id}`)
            return response.data
        } catch (error) {
            throw error
        }
    },
    async messageUntrash(id: string) {
        try {
            const response = await api.put(`/email/message/untrash/${id}`)
            return response.data
        } catch (error) {
            throw error
        }
    },


}