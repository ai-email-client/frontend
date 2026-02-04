import {
    UserProfile,
} from "../interface/user"

import userAPI from "../api/user"

const userService = {
    async get_profile(): Promise<UserProfile> {
        const response = await userAPI.get_profile()
        return response
    }
}

export default userService