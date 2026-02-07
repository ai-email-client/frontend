import { LucideIcon } from "lucide-vue-next";

export enum CategoryEnum {
  APPOINTMENT = "Appointment",
  MEETING = "Meeting",
  INVITATION = "Invitation",
  INVOICE = "Invoice",
  MARKETING = "Marketing",
  NOTIFICATION = "Notification",
  ANNOUNCEMENT = "Announcement",
}

export enum MessageListVisibility {
  HIDE = "hide",
  SHOW = "show",
}

export enum LabelListVisibility {
  SHOW = "labelShow",
  HIDE = "labelHide",
  SHOW_IF_UNREAD = "labelShowIfUnread",
}

export enum CategoryType {
  USER = "user",
  SYSTEM = "system",
}

export interface CategoryColor {
  textColor: string;
  backgroundColor: string;
}

export interface Category {
  id?: string | null;
  name?: string | null;
  messageListVisibility?: MessageListVisibility | null;
  labelListVisibility?: LabelListVisibility | null;
  type?: CategoryType | null;
  messagesTotal?: number | null;
  messagesUnread?: number | null;
  threadsTotal?: number | null;
  threadsUnread?: number | null;
  color?: CategoryColor | null;
}

export interface CategoryMenuItem {
  icon?: LucideIcon; 
  label: string;
  to?: string;
  badge: number | 0;
  isOpen?: boolean;
  children?: Record<string, any>[];
}