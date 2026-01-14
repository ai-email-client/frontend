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
        ADD_ATTR: ['target']
    })
}