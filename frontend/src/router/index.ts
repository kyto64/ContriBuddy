import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SkillsInput from '../views/SkillsInput.vue'
import Recommendations from '../views/Recommendations.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/skills',
      name: 'skills',
      component: SkillsInput
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations
    }
  ]
})

export default router
