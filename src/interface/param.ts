export type MessageFormat = 'full' | 'metadata' | 'minimal' | 'raw';

export interface MessagesParam {
  maxResults?: number;
  pageToken?: string | null;
  q?: string | null;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export interface MessageParam {
  format?: MessageFormat | string; 
  metadataHeaders?: string[] | null; 
}