export enum SpamType {
    PHISHING = 'Phishing',
    SPAM_MARKETING = 'Spam_Marketing',
    BENIGN = 'Benign',
    PROMOTIONAL = 'Promotional',
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

