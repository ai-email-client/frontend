import api from './api'
import { UserProfile } from '../interface/user'

export default {
    async get_profile(): Promise<UserProfile> {
        try {
            const response = await api.get<UserProfile>('/user/profile', { timeout: 1000 })
            return response.data
        } catch (error) {
            throw error
        }
    }
}