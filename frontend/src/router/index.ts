import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SkillsInput from '../views/SkillsInput.vue'
import Recommendations from '../views/Recommendations.vue'
import Dashboard from '../views/Dashboard.vue'
import GitHubCallback from '../views/GitHubCallback.vue'

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
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/auth/github/callback',
      name: 'github-callback',
      component: GitHubCallback
    }
  ]
})

export default router
