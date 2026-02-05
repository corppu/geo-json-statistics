import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import GeoJSONMapContainer from './components/GeoJSONMapContainer.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: GeoJSONMapContainer,
  },
  {
    path: '/:provider',
    name: 'Map',
    component: GeoJSONMapContainer,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
