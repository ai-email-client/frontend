import { Sender } from "./email"

export interface EmailSummaryRequest {
    email_text: string
}

export interface DifySummaryRequest {
    inputs: EmailSummaryRequest
    user: string
    response_mode: string
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