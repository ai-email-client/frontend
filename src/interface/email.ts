

export interface Sender {
    name: string
    type: string
}

export interface EmailSummary {
    sender: Sender
    email_category: string
    date: string
    time: string
    location: string
    instructions: string[]
    required_items: string[]
    summary: string
    extraction_status: string
    confidence: number
}

export interface Attachment {
    filename: string
    mimeType: string
    size: number
    attachmentId: string | null
}

export interface Email {
    msg_id: string
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
    msg_id: string
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

enum Category {
    SOCIAL = 'CATEGORY_SOCIAL',
    FORUMS = 'CATEGORY_FORUMS',
    PROMOTIONS = 'CATEGORY_PROMOTIONS',
    UPDATES = 'CATEGORY_UPDATES',
    PERSONAL = 'CATEGORY_PERSONAL',
    IMPORTANT = 'CATEGORY_IMPORTANT'
}