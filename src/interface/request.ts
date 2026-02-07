import { Category } from './category';
import { Message } from './email';

export interface UserRequest {
  email_address: string;
  provider: string;
}

export interface DifySummaryRequest {
  msg_id: string;
  plain_text: string;
  email_tags: string[];
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
  id: string;
  message: Message;
}