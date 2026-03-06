import { createRouter, createWebHashHistory } from 'vue-router'

import App from '../App.vue'
import LoginPage from '../views/LoginPage.vue'
import InboxPage from '../views/InboxPage.vue'
import SpamPage from '../views/SpamPage.vue'
import SentPage from '../views/SentPage.vue'
import TrashPage from '../views/TrashPage.vue'
import CategoryPage from '../views/CategoryPage.vue'
import CallbackPage from '../views/Callback.vue'
import DraftPage from '../views/DraftPage.vue'


const routes = [
    {
        path: '/',
        name: 'Home',
        component: App
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/inbox',
        name: 'Inbox',
        component: InboxPage
    },
    {
        path: '/draft',
        name: 'Draft',
        component: DraftPage
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
        path: '/spam/:spamType',
        name: 'Spam',
        component: SpamPage
    },
    {
        path: '/callback',
        name: 'Callback',
        component: CallbackPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router