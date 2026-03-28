import api from './api'
import { LoginResponse, CallbackResponse } from '../interface/response'

export default {
    async login(
        provider: string,
        params: { origin: 'web' | 'electron' }
    ): Promise<LoginResponse> {
        try {
            const response = await api.get<LoginResponse>(`/auth/login/${provider}`, {
                params,
            })
            return response.data
        } catch (error) {
            console.error('Login by Google failed:', error)
        }
        return {
            url: '',
            state: ''
        }
    },

    async handleCallback(
        provider: string, 
        code: string, 
        state: string,
        params: { origin: 'web' | 'electron' }
    ): Promise<CallbackResponse> {
        try {
            const response = await api.get<CallbackResponse>(`/auth/callback/${provider}`, {
                params: { code, state, ...params },
            })
            return response.data
        } catch (error) {
            console.error(`OAuth callback failed for provider "${provider}":`, error)
            throw error
        }
    },
}