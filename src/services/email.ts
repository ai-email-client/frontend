import type {
    Attachment,
    Message,
} from '../interface/email'
import {
    Category
} from '../interface/category'
import {
    AttachmentResponse,
    CreateLabelResponse,
    CategoryListResponse,
    FetchMessagesResponse,
} from '../interface/response'

import emailAPI from '../api/email'
import { MessageModifyLabelRequest } from '../interface/request'
import { MessageParam } from '../interface/param'

const emailService = {
    fetchEmails: async (
        labelIds: string[],
        maxResults: number,
        pageToken: string | null,
        query: string | null,
        includeSpamTrash: boolean,
    ): Promise<FetchMessagesResponse> => {

        const data = await emailAPI.fetch_emails(
            {   maxResults: maxResults,
                labelIds: labelIds,
                pageToken: pageToken,
                q: query,
                includeSpamTrash: includeSpamTrash
            }
        )

        return data
    },
    getMessageByID: async (
        msgId: string,
        param: MessageParam
    ): Promise<Message> => {
        if (!msgId) {
            throw new Error('Message ID is required')
        }

        const data = await emailAPI.get_message_by_id(
            msgId,
            param
        )

        if (!data) {
            throw new Error('Message not found')
        }

        return data
    },
    downloadAttachment: async (
        file: Attachment,
        msgId: string
    ): Promise<AttachmentResponse> => {
        const response = await emailAPI.downloadAttachment(file, msgId)

        if (!response) {
            alert('Cannot download file')
            return {
                mimeType: '',
                size: 0,
                attachmentId: null
            }
        }

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', file.filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return {
            mimeType: file.mimeType,
            size: file.size,
            attachmentId: file.attachmentId
        }
    },
    getLabelById: async (
        labelId: string
    ): Promise<Category> => {
        try {
            const data = await emailAPI.getLabelById(labelId)
            if (!data) {
                throw new Error('Label not found')
            }
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    createLabel: async (
        body: Category
    ): Promise<CreateLabelResponse> => {
        try {
            const data = await emailAPI.createLabel(body)
            const res = { category: data }
            return res
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    syncLabels: async (): Promise<CategoryListResponse> => {
        try {
            const data = await emailAPI.syncLabels()
            if (!data) {
                throw new Error('Sync labels failed')
            }
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    getLabels: async (): Promise<CategoryListResponse> => {
        try {
            const data = await emailAPI.getLabels()
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    initLabels: async (): Promise<CategoryListResponse> => {
        try {
            const data = await emailAPI.initLabel()
            if (!data) {
                throw new Error('Init labels failed')
            }
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    messageModify: async (
        req: MessageModifyLabelRequest
    ): Promise<void> => {
        try {
            await emailAPI.messageModify(req)
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    }
}

export default emailService