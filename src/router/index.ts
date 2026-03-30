import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/plan' },
    { path: '/plan', name: 'plan', component: () => import('@/views/PlanView.vue') },
    { path: '/recipes', name: 'recipes', component: () => import('@/views/RecipesView.vue') },
    { path: '/grocery', name: 'grocery', component: () => import('@/views/GroceryView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
  ],
})

export default router
