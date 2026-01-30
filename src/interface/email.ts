import { EmailCategory } from "../interface/category"

export interface Sender {
    name: string
    type: string
}

export interface Attachment {
    filename: string
    mimeType: string
    size: number
    attachmentId: string | null
}

export interface AttachmentResponse {
    mimeType: string
    size: number
    attachmentId: string | null
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

export interface EmailShortList {
    messages: EmailShortDetail[]
    page_token: string
}

export interface EmailSummaryResponse {
    sender: Sender
    email_category: EmailCategory
    date: string
    time: string
    location: string
    instructions: string[]
    required_items: string[]
    summary: string
    is_spam: boolean
    is_threat: boolean
    spam_type: string | null
    spam_confidence: number
    security_type: string
    security_confidence: number
    extraction_status: string
    confidence: number
}

export interface EmailSummary {
    clean_email: EmailSummaryResponse
}

export interface MessageModify {
    id: string
    addLabelIds: string[]
    removeLabelIds: string[]
}

export interface MessageBatchModify {
    id: string[]
    addLabelIds: string[]
    removeLabelIds: string[]
}
