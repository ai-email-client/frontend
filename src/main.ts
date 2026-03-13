import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routers'
import { createPinia } from 'pinia'
import { setupInterceptors } from './api/api'

const app = createApp(App)

app.use(router)
app.use(createPinia())

setupInterceptors(router)

app.mount('#app')

