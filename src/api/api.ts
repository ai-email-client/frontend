import axios from 'axios'
import {
    useRouter
} from 'vue-router'

const router = useRouter()

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

api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt_token')
            console.log(router.currentRoute.value.name)
            if (router.currentRoute.value.name !== 'Login') {
                router.push('/login')
            }
        }
        return Promise.reject(error)
    }
)

export default api