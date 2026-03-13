import api from './api'
import { LoginResponse } from '../interface/response'

export default {
    async loginByGoogle(): Promise<LoginResponse> {
        try {
            const response = await api.get<LoginResponse>('/auth/login/gmail')
            return response.data
        } catch (error) {
            console.error('Login by Google failed:', error)
        }
        return {
            url: ''
        }
    },
}
