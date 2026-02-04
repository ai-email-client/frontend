export interface UserRequest {
    provider: string
    emailAddress: string
}

export interface UserProfile {
    emailAddress: string
    messagesTotal: number
    threadsTotal: number
    historyId: string
}
