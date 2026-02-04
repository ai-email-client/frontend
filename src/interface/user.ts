export interface UserRequest {
    provider: string
    emailAddress: string
}

export interface UserProfile {
    emailAddress: string
    messagesTotal: number | 1
    threadsTotal: number | 1
    historyId: string
}
