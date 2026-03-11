export interface Header {
  name: string;
  value: string;
}

export interface Payload{
  mimeType: string;
  headers: Header[];
}

export interface Attachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string | null;
  headers: Header[];
  data: string;
}

export interface AttachmentData{
  size: number;
  data: string;
}

export interface ClassificationLabelFieldValue {
  fieldId: string;
  selection: string;
}

export interface ClassificationLabelValue {
  labelId: string;
  fields: ClassificationLabelFieldValue[];
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

export interface MessageGmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: MessagePart;
  attachments: Attachment[];
  text_plain: string;
  text_html: string;
  sizeEstimate: number;
  raw: string;
  classificationLabelValues: ClassificationLabelValue[];
}

export interface Message {
    id: string;
    threadId: string;
    message_id: string;
    cc: string;
    bcc: string;
    in_reply_to: string;
    references: string;
    labelIds: string[];
    date: string;
    to: string;
    sender: string;
    subject: string;
    snippet: string;
    text_plain: string;
    text_html: string;
    attachments: Attachment[];
}

export interface Sender {
  name?: string | null;
  type?: string | null;
}

export interface Draft{
  id: string;
  message: Message;
}
