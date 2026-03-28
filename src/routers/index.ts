import { createRouter, createWebHashHistory } from 'vue-router'


const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../App.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginPage.vue')
    },
    {
        path: '/inbox',
        name: 'Inbox',
        component: () => import('../views/MailboxDifyPage.vue'),
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
        meta: { labels: ['SENT'], includeSpamTrash: true }
    },
    {
        path: '/category/:category',
        name: 'Category',
        component: () => import('../views/MailboxDifyPage.vue'),
        meta: { includeSpamTrash: false }
    },
    {
        path: '/trash',
        name: 'Trash',
        component: () => import('../views/MailboxPage.vue'),
        meta: { labels: ['TRASH'], includeSpamTrash: true }
    },
    {
        path: '/spam',
        name: 'Spam',
        component: () => import('../views/SpamPage.vue'),
        meta: { includeSpamTrash: true }
    },
    {
        path: '/callback',
        name: 'Callback',
        component: () => import('../views/Callback.vue')
    },
    {
        path: '/overview',
        name: 'Overview',
        component: () => import('../views/OverviewPage.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router