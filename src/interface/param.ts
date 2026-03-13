export type MessageFormat = 'full' | 'metadata' | 'minimal' | 'raw';

export interface MessagesParam {
  maxResults?: number;
  pageToken?: string | null;
  q?: string | null;
  labelIds?: string[];
  includeSpamTrash?: boolean;
  format?: MessageFormat | string;
  metadataHeaders?: string[] | null;
}
export interface DraftsParam {
  maxResults?: number;
  pageToken?: string | null;
  q?: string | null;
  includeSpamTrash?: boolean;
  format?: string;
  metadataHeaders?: string[];
}

export interface MessageParam {
  format?: MessageFormat | string; 
  metadataHeaders?: string[] | null; 
}