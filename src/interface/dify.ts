import { Sender } from './email';

export enum Status {
  new = "new",
  processing = "processing",
  done = "done",
  error = "error",
}

export interface DifySummary {
  sender: Sender | null;
  email_category: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  instructions: string[] | null;
  required_items: string[] | null;
  summary: string | null;
  is_spam: boolean | null;
  is_threat: boolean | null;
  spam_type: string | null;
  spam_confidence: number | null;
  security_type: string | null;
  security_confidence: number | null;
  extraction_status: string | null;
  confidence: number | null;
}

export interface DifyWritter{
  tone_used: string;
  draft: string;
  confidence: number;
}
