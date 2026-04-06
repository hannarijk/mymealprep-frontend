import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setTokenAccessor, setUnauthorizedHandler } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const authStore = useAuthStore()
setTokenAccessor(() => authStore.token)
setUnauthorizedHandler(() => {
  authStore.logout()
  router.push('/login')
})

app.mount('#app')
