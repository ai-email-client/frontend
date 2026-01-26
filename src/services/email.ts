import type { Attachment, EmailShortDetail, FetchEmailResult } from '../interface/email'
import emailAPI from '../api/email'

export default {
    fetchEmails: async (
        LABELS: string[],
        currentToken: string | null,
        currentEmails: EmailShortDetail[] = [],
        isLoadMore = false
    ): Promise<FetchEmailResult> => {

        const apiToken = isLoadMore ? currentToken : null

        try {
            const data = await emailAPI.getEmails(LABELS, apiToken)

            let newEmails: EmailShortDetail[] = []
            let newPageToken: string | null = data.page_token || null

            let newSelectedId: string | null | undefined = undefined
            let newSelectedEmail: any | null | undefined = undefined

            if (isLoadMore) {
                newEmails = [...currentEmails, ...(data.emails || [])]

            } else {
                newEmails = data.emails || []
                newSelectedEmail = null
                if (newEmails.length > 0) {
                    newSelectedId = newEmails[0].msg_id
                } else {
                    newSelectedId = null
                }
            }

            return {
                emails: newEmails,
                pageToken: newPageToken,
                selectedEmailId: newSelectedId,
                selectedEmail: newSelectedEmail
            }

        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    getEmailContent: async (msgId: string) => {
        try {
            const data = await emailAPI.getEmailById(msgId)
            return data
        } catch (err) {
            console.error('Fetch error:', err)
            throw err
        }
    },
    downloadAttachment: async (file: Attachment, msgId: string) => {
        const response = await emailAPI.downloadAttachment(file, msgId)

        if (!response) {
            alert('Cannot download file')
            return
        }

        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', file.filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }
}