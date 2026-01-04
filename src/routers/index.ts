import { createRouter, createWebHashHistory } from 'vue-router'

import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginPage
    },
    {
        path: '/home',
        name: 'HomePage',
        component: HomePage
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router