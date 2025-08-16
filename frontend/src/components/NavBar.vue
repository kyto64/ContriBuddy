<template>
  <nav class="bg-white shadow-lg border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">K</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Kontri</span>
          </RouterLink>
        </div>

        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <RouterLink
              to="/"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === 'home' }"
            >
              {{ $t('nav.home') }}
            </RouterLink>
            <RouterLink
              to="/skills"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === 'skills' }"
            >
              {{ $t('nav.findProjects') }}
            </RouterLink>
            <RouterLink
              v-if="authStore.isAuthenticated"
              to="/dashboard"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 bg-primary-50': $route.name === 'dashboard' }"
            >
              {{ $t('nav.dashboard') }}
            </RouterLink>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <LanguageSwitcher />

          <!-- Authentication UI -->
          <div class="flex items-center space-x-2">
            <!-- Loading state -->
            <div v-if="authStore.isLoading" class="flex items-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>

            <!-- Authenticated user -->
            <div v-else-if="authStore.isAuthenticated" class="flex items-center space-x-3">
              <div class="flex items-center space-x-2">
                <img
                  :src="authStore.user?.avatar_url"
                  :alt="authStore.user?.login"
                  class="w-8 h-8 rounded-full border-2 border-gray-200"
                >
                <span class="text-sm font-medium text-gray-700">
                  {{ authStore.user?.name || authStore.user?.login }}
                </span>
              </div>

              <!-- User Menu Dropdown -->
              <div class="relative" ref="userMenuRef">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center text-sm text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-full"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                >
                  <a
                    :href="`https://github.com/${authStore.user?.login}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {{ $t('nav.viewProfile') }}
                  </a>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {{ $t('nav.logout') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Login button -->
            <button
              v-else
              @click="handleLogin"
              class="btn-primary px-4 py-2 text-sm"
              :disabled="authStore.isLoading"
            >
              {{ $t('nav.loginWithGitHub') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from './LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()

// Handle click outside to close menu
const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogin = async (): Promise<void> => {
  try {
    const authUrl = await authStore.loginWithGitHub()
    window.location.href = authUrl
  } catch (error) {
    console.error('Login failed:', error)
    // Could show error notification here
  }
}

const handleLogout = async (): Promise<void> => {
  try {
    await authStore.logout()
    showUserMenu.value = false
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>
