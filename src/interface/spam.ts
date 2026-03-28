export enum SpamType {
    PHISHING = 'Phishing',
    PROMOTIONAL = 'Promotional',
    BULK = 'Bulk',
    SPAM_MARKETING = 'Spam Marketing',
    OTHER = 'Other'
}

export interface Spam {
    msg_id: string;
    spam_type: SpamType;
    is_spam: boolean;
    is_threat: boolean;
    security_confidence: number;
    spam_confidence: number;
}

