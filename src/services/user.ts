import {
    UserProfile,
} from "../interface/user"

import userAPI from "../api/user"

const userService = {
    async get_profile(): Promise<UserProfile> {

        const response = await userAPI.get_profile()
        return response
    },
    async setup_pin(pin: string) {
        const response = await userAPI.setup_pin(pin)
        return response
    }
}

export default userService