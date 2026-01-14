import api from './api'
import { User } from '../interface/user'

const url = '/user'
export default {
    async getUser() {
        const response = await api.get<User>(url + '/profile')
        return response.data
    }
}