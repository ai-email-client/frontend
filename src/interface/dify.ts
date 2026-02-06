import { Sender } from "./email"

export interface DifySummaryRequest {
    msg_id: string
    plain_text: string
    email_tags: string[]
}

export interface DifyResponse {
    sender: Sender
    email_category: string
    date: string
    time: string
    location: string
    instructions: string[] | null
    required_items: string[] | null
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