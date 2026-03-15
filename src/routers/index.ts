import { createRouter, createWebHashHistory, useRoute } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'


const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../App.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
    path: '/inbox',
    name: 'Inbox',
    component: () => import('../views/MailboxPage.vue'),
    meta: { labels: ['INBOX'], includeSpamTrash: false }
    },
    {
        path: '/draft',
        name: 'Draft',
        component: () => import('../views/DraftPage.vue'),
    },
    {
        path: '/sent',
        name: 'Sent',
        component: () => import('../views/MailboxPage.vue'),
        meta: { labels: ['SENT'], includeSpamTrash: false }
    },
    {
        path: '/category/:category',
        name: 'Category',
        component: () => import('../views/MailboxPage.vue'),
        meta: { includeSpamTrash: false }
    },
    {
        path: '/trash',
        name: 'Trash',
        component: () => import('../views/MailboxPage.vue'),
        meta: { labels: ['TRASH'], includeSpamTrash: true }
    },
    {
        path: '/spam/:spamType',
        name: 'Spam',
        component: () => import('../views/MailboxPage.vue'),
        meta: { includeSpamTrash: true }
    },
    {
        path: '/callback',
        name: 'Callback',
        component: () => import('../views/Callback.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router