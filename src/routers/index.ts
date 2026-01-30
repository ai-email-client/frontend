import { createRouter, createWebHashHistory } from 'vue-router'

import App from '../App.vue'
import LoginPage from '../views/LoginPage.vue'
import InboxPage from '../views/InboxPage.vue'
import SpamPage from '../views/SpamPage.vue'
import SentPage from '../views/SentPage.vue'
import TrashPage from '../views/TrashPage.vue'
import CategoryPage from '../views/CategoryPage.vue'

const routes = [
    {
        path: '/home',
        name: 'Home',
        component: App
    },
    {
        path: '/',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/inbox',
        name: 'Inbox',
        component: InboxPage
    },
    {
        path: '/sent',
        name: 'Sent',
        component: SentPage
    },
    {
        path: '/category/:category',
        name: 'Category',
        component: CategoryPage
    },
    {
        path: '/trash',
        name: 'Trash',
        component: TrashPage
    },
    {
        path: '/spam',
        name: 'Spam',
        component: SpamPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router