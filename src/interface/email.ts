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
    id: string                                   
    threadId: string                             
    message_id: string | null         
    historyId: string | null          

    sender: Sender | null             
    to: Sender[] | null
    cc: Sender[] | null
    bcc: Sender[] | null                

    subject: string | null
    snippet: string | null            
    text_plain: string | null
    text_html: string | null

    attachments: Attachment[] | null

    in_reply_to: string | null        
    references: string | null         

    labelIds: string[] | null     
    date: string | null              
    internalDate: string | null      
    sizeEstimate: number | null
}

export interface Sender {
  name?: string | null;
  email?: string | null;
}

export interface Draft{
  id: string;
  message: Message;
}
