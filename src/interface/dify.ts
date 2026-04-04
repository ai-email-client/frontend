import { Sender } from './email';

export enum Status {
  new = "new",
  processing = "processing",
  done = "done",
  error = "error",
}

export interface Importance {
    level: string | null;
    reason: string | null;
}

export interface DifySummary {
  sender: Sender | null;
  email_category: string | null;
  date: string | null;
  time: string | null;
  location: Record<string, any> | string[] | string | null;
  instructions: string[] | null;
  required_items: string[] | null;
  summary: string | null;
  importance: Importance | null;
  is_spam: boolean | null;
  is_threat: boolean | null;
  spam_type: string | null;
  spam_confidence: number | null;
  security_type: string | null;
  security_confidence: number | null;
  extraction_status: string | null;
  confidence: number | null;
  status: string | null;
  msg_id: string | null;
}

export interface DifyWritter{
  tone_used: string;
  draft: string;
  confidence: number;
}
