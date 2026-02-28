import { DifySummary } from './dify';
import { Attachment, Message, Payload, Sender } from './email';
import { Category } from './category';

export interface AttachmentResponse {
  mimeType: string;
  size: number;
  attachmentId?: string | null;
}

export interface FetchMessagesResponse {
  messages: Message[]
  nextPageToken: string
  resultSizeEstimate: number
}

export interface MessagesResponse {
  id: string;
  threadId: string;
}

export interface MessageMinimalResponse {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export interface MessageMetaDataResponse{
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
  payload: Payload
}

export interface EmailAnalysisResponse {
  sender: Sender;
  source_email_id: string;
  confidence: number;
  date: string | null;
  time: string | null;
  location: string | null;
  email_category: string;
  summary: string;
  extraction_status: string;
  instructions: string[];
  required_items: string[];
  is_spam: boolean;
  spam_confidence: number;
  spam_type: string | null;
  is_threat: boolean;
  security_confidence: number;
  security_type: string | null;
}

export interface CreateLabelResponse {
  category: Category;
}

export interface CredentialResponse {
  access_token: string;
  refresh_token: string;
  scopes: string[];
  id_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface DifyOutputs {
  clean_email: DifySummary;
}

export interface DifyDataResponse {
  id: string;
  workflow_id: string;
  status: string;
  outputs: DifyOutputs;
  error?: string | null;
  elapsed_time: number;
  total_tokens: number;
  total_steps: number;
  created_at: number;
  finished_at: number;
}

export interface DifyResponse {
  task_id: string;
  workflow_run_id: string;
  data: DifyDataResponse;
}

export interface EmailShortResponse {
  msg_id: string;
  subject: string;
  sender: string;
  snippet: string;
  time: string;
  tag: string[];
  attachments: Attachment[];
}

export interface EmailFetchResponse {
  page_token: string | '';
  messages: EmailShortResponse[];
}

export interface EmailDetailResponse {
  msg_id: string;
  subject: string;
  sender: string;
  snippet: string;
  html: string | null;
  plain_text: string | null;
  time: string;
  tag: string[];
  attachments: Attachment[];
}

export interface EmailPlainResponse {
  msg_id: string;
  plain_text?: string | null;
  tag: string[];
}

export interface EmailFetchPlainResponse {
  messages: EmailPlainResponse[];
  page_token?: string | null;
}

export interface CategoryListResponse {
  labels: Category[];
}
export interface LoginResponse {
  url: string
}