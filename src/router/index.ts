import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/plan' },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { public: true } },
    { path: '/plan', name: 'plan', component: () => import('@/views/PlanView.vue') },
    { path: '/recipes', name: 'recipes', component: () => import('@/views/RecipesView.vue') },
    { path: '/grocery', name: 'grocery', component: () => import('@/views/GroceryView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isPublic = to.meta.public === true

  if (!authStore.isAuthenticated && !isPublic) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (authStore.isAuthenticated && isPublic) {
    return { path: '/plan' }
  }
})

export default router
