import DOMPurify from 'dompurify'
import emailService from './api/email'
import { Attachment } from './interface/email'


DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
    }
})

export function sanitizeHtml(content: string | null | undefined): string {
    if (!content) return ''

    return DOMPurify.sanitize(content, {
        ADD_ATTR: ['target', 'id', 'class', 'style'],
        ADD_TAGS: ['style', 'center'],
        WHOLE_DOCUMENT: true,
        FORCE_BODY: true,
    })
}

export function formatSize(bytes: number) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export async function downloadAttachment(file: Attachment, msgId: string) {
    const response = await emailService.downloadAttachment(file, msgId)

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