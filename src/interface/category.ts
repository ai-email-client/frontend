import type { Component } from 'vue'

export enum EmailCategory {
    APPOINTMENT = "appointment",
    MEETING = "meeting",
    INVITATION = "invitation",
    INVOICE = "invoice",
    MARKETING = "marketing",
    NOTIFICATION = "notification",
    ANNOUNCEMENT = "announcement",
    OTHER = "other"
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
    id: string;
    name: string;
    messageListVisibility: MessageListVisibility | null;
    labelListVisibility: LabelListVisibility | null;
    type: CategoryType | null;
    messagesTotal: number | null;
    messagesUnread: number | null;
    threadsTotal: number | null;
    threadsUnread: number | null;
    color: CategoryColor | null;
}

export interface CategoryListResponse {
    categories: Category[];
}

export interface CreateLabelResponse {
    id: string;
    name: string;
    messageListVisibility: MessageListVisibility;
    labelListVisibility: LabelListVisibility;
    color: CategoryColor;
}

export interface CategoryMenuItem {
    icon: Component
    label: string
    to?: string
    badge: number
    isOpen?: boolean
    children?: {
        label: string
        to: string
    }[]
}