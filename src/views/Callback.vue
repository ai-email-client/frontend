<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import auth from '../services/auth'

const route = useRoute()
const router = useRouter()
const statusMessage = ref('')
const isError = ref(false)

const saveTokenAndRedirect = (token: string) => {
    localStorage.setItem('jwt_token', token)
    statusMessage.value = 'Login Success'
    setTimeout(() => router.replace('/inbox'), 3000)
}

onMounted(async () => {
    const provider = (route.params.provider as string) ?? 'gmail'

    const token = route.query.token as string
    if (token) {
        saveTokenAndRedirect(token)
        return
    }

    const code = route.query.code as string
    const state = route.query.state as string

    if (!code) {
        handleError('Login Failed: missing authorization code')
        return
    }

    try {
        const { token: fetchedToken } = await auth.handleCallback(provider, code, state)

        if (!fetchedToken) {
            handleError('Login Failed: no token received')
            return
        }

        saveTokenAndRedirect(fetchedToken)
    } catch (e) {
        handleError('Login Failed')
    }
})

const handleError = (msg = '') => {
    isError.value = true
    statusMessage.value = msg
    setTimeout(() => router.replace('/login'), 2000)
}
</script>

<template>
    <div class="callback-container">
        <div class="card">
            <div v-if="!isError" class="spinner-wrapper">
                <div class="spinner"></div>
            </div>

            <div v-else class="error-icon">
                ⚠️
            </div>

            <h2 :class="{ 'text-error': isError }">{{ statusMessage }}</h2>

            <p class="sub-text" v-if="!isError">Please wait a moment, the system is redirecting you...</p>
        </div>
    </div>
</template>

<style scoped>
.callback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f3f4f6;
}

.card {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 320px;
    animation: slideUp 0.5s ease-out;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

h2 {
    font-size: 1.25rem;
    color: #1f2937;
    font-weight: 600;
    margin-bottom: 8px;
}

.sub-text {
    color: #6b7280;
    font-size: 0.875rem;
}

.text-error {
    color: #ef4444;
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>