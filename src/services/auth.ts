import auth from '../api/auth'

const isElectron = (): boolean => {
    return !!window.ipcRenderer
}

const getOrigin = (): 'web' | 'electron' => {
    return isElectron() ? 'electron' : 'web'
}

const authService = {
    login: async (
        provider: string
    ) => {
        return await auth.login(provider, {
            origin: getOrigin()
        })
    },
    handleCallback: async (
        provider: string, 
        code: string, 
        state: string
    ) => {
        return await auth.handleCallback(provider, code, state, {
            origin: getOrigin()
        })
    }
    
}

export default authService