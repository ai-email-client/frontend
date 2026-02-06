import api from './api'
import { LoginResponse } from '../interface/auth'

export default {
    async loginByGoogle() {
        try {
            const response = await api.get<LoginResponse>('/auth/login/gmail')
            return response.data
        } catch (error) {
            console.error('Login by Google failed:', error)
        }
    },
}
