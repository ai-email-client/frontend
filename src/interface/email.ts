import { EmailCategory } from "../interface/category"

export interface Sender {
    name: string
    type: string
}

export interface EmailSummary {
    sender: Sender
    email_category: EmailCategory
    date: string
    time: string
    location: string
    instructions: string[]
    required_items: string[]
    summary: string
    extraction_status: string
    confidence: number
}

export interface FetchEmailResult {
    emails: EmailShortDetail[]
    pageToken: string | null
    selectedEmailId: string | null | undefined
    selectedEmail: any | null | undefined
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
    html: string | null
    plain_text: string | null
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
    page_token: string
}