import { createRouter, createWebHashHistory } from 'vue-router'
import { useHistoryStore } from '@/stores/historyList'

const routes = [
  {
    path:'/',
    name: 'Home',
    component: () => import('@/layouts/admin.vue'),
    children: [
      {
        path: '',
        name: 'Index',
        component: () => import('@/pages/index.vue'),
      },
      {
        path:'talking/:id',
        name: 'Talking',
        component: () => import('@/pages/talking.vue'),
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  if (to.name === 'Talking' && to.params.id) {
    // const historyStore = useHistoryStore()
    // historyStore.getcurrentTalking(to.params.id)
  }
})

export default router
