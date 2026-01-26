import DOMPurify from 'dompurify'

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

export const formatLabel = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}