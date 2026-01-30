import type {
    Attachment,
    AttachmentResponse,
    Email,
    EmailShortList
} from '../interface/email'

import emailAPI from '../api/email'
import { Category, CreateLabelResponse } from '../interface/category'

// TODO: 
// 1. Complete fetchEmails
// 2. Complete getEmailById
// 3. Complete downloadAttachment

const emailService = {
    fetchEmails: async (
        labels: string[],
        limit: number,
        currentToken: string | null,
        isLoadMore = false
    ): Promise<EmailShortList> => {

        const pageToken = isLoadMore ? currentToken : null

        try {
            const data = await emailAPI.getEmails(limit, labels, pageToken)

            return {
                messages: data.messages,
                page_token: data.page_token,
            }

        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    getEmailById: async (
        msgId: string
    ): Promise<Email> => {
        try {
            const data = await emailAPI.getEmailById(msgId)
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
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
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    }
}

export default emailService