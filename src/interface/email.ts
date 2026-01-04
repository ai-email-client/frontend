export interface Attachment {
    filename: string
    mimeType: string
    size: number
    attachmentId: string | null
}

export interface Email {
    id: string
    subject: string
    sender: string
    snippet: string
    body: string
    time: string
    tag: string[]
    attachments: Attachment[]
}

export interface EmailList {
    emails: Email[]
}

export interface EmailShortDetail {
    id: string
    subject: string
    sender: string
    snippet: string
    time: string
    tag: string[]
    attachments: Attachment[]
}

export interface EmailShortList {
    emails: EmailShortDetail[]
}
