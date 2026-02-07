export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string | null;
}

export interface ClassificationLabelFieldValue {
  fieldId: string;
  selection: string;
}

export interface ClassificationLabelValue {
  labelId: string;
  fields: ClassificationLabelFieldValue[];
}

export interface Header {
  name: string;
  value: string;
}

export interface MessagePartBody {
  attachmentId: string;
  size: number;
  data: string;
}

export interface MessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: Header[];
  body: MessagePartBody;
  parts: Record<string, any>[];
}

export interface Message {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: MessagePart;
  sizeEstimate: number;
  raw: string;
  classificationLabelValues: ClassificationLabelValue[];
}

export interface Sender {
  name?: string | null;
  type?: string | null;
}

