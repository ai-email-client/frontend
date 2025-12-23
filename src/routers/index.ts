import { createRouter, createWebHashHistory } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import InboxPage from '../views/InboxPage.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/',
        name: 'Inbox',
        component: InboxPage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router