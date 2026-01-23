import api from './api'
import { LoginResponse } from '../interface/auth'

export default {
    async loginByGoogle() {
        const response = await api.get<LoginResponse>('/auth/login/gmail')
        return response.data
    },
}
