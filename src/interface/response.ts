import { DifySummary } from './dify';
import { Attachment } from './email';
import { Category } from './category';

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
  page_token: string | null;
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
  categories: Category[];
}
export interface LoginResponse {
    url: string
}