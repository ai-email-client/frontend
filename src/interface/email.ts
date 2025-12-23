export interface Email {
    id: number
    subject: string
    sender: string
    snippet: string
    body: string
    time: Date
    unread: boolean
    tag?: string
}

export interface EmailList {
    emails: Email[]
}

export interface EmailShortDetail {
    id: number
    subject: string
    sender: string
    snippet: string
}
