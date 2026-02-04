import api from './api'
import { UserProfile } from '../interface/user'

export default {
    async get_profile(): Promise<UserProfile> {
        try {
            const response = await api.get<UserProfile>('/user/profile').then((response) => {
                return response.data
            })
            return response
        } catch (error) {
            throw error
        }
    }
}