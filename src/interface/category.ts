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
    messageListVisibility: MessageListVisibility;
    labelListVisibility: LabelListVisibility;
    type: CategoryType;
    messagesTotal: number;
    messagesUnread: number;
    threadsTotal: number;
    threadsUnread: number;
    color: CategoryColor;
}

export interface CategoryListResponse {
    categories: Category[];
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