import axios from 'axios'
import type { Router } from 'vue-router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 120000,
    headers: {
        'Content-Type': 'application/json'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token')
        if (token) {
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    },
    (error) => Promise.reject(error)
)

let isRedirecting = false

export function setupInterceptors(router: Router) {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status
            const currentRoute = router.currentRoute.value.name

            if (status === 401 && currentRoute !== 'Login' && !isRedirecting) {
                isRedirecting = true
                localStorage.removeItem('jwt_token')

                router.push({ name: 'Login', query: { reason: 'session_expired' } }).finally(() => {
                    isRedirecting = false
                })
            }

            return Promise.reject(error)
        }
    )
}

export default api