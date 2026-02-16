import databaseAPI from "../api/database"

const databaseService = {
    async get_summary(): Promise<any> {
        const response = await databaseAPI.get_summary()
        return response
    },
    async get_user_pin(email: string): Promise<any> {
        const response = await databaseAPI.get_user_pin(email)
        return response
    },
}

export default databaseService
