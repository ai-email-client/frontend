import { Category } from './category';
import { Attachment, Message } from './email';

export interface UserRequest {
  email_address: string;
  provider: string;
}

export interface DifySummaryRequest {
  sender: string;
  msg_id: string;
  text_plain: string;
  email_tags: string[];
}

export interface DifySummaryBatchRequest {
  emails: DifySummaryRequest[];
}

export interface AttachmentRequest {
  msg_id: string;
  attachment_id: string;
}

export interface EmailFetchRequest {
  label?: (string | null)[];
  limit?: number | null;
  query?: string | null;
  page_token?: string | null;
}

export interface EmailMessageRequest {
  msg_id: string;
}

export interface MessageIdRequest {
  id: string;
}

export interface MessageBatchDeleteRequest {
  ids: string[];
}

export interface CreateLabelRequest {
  body: Category;
}

export interface GetLabelRequest {
  id: string;
}

export interface SyncLabelsRequest {
  names: string[];
}

export interface MessageBatchModifyLabelRequest {
  ids: string[];
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

export interface MessageModifyLabelRequest {
  id: string;
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

export interface DraftCreateRequest {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  content?: string;
  content_type?: 'html' | 'plain';
  attachments?: Attachment[];
  threadId?: string;
  in_reply_to?: string;
  references?: string;
  message?: Message | null;
}

export interface WritterRequest {
    email_text?: string | "";
    ai_summary?: string | "";
    user_draft?: string | "";
    topic?: string | "";
    target_person?: string | "";
}