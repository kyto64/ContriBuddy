import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { ApiService } from '@/services/api'
import type { AuthUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const token = computed(() => localStorage.getItem('auth_token'))

  // Actions
  async function initializeAuth(): Promise<void> {
    if (!ApiService.isAuthenticated()) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const userData = await ApiService.getCurrentUser()
      user.value = userData
    } catch (err) {
      console.error('Failed to initialize auth:', err)
      error.value = 'Failed to load user data'
      // Clear invalid token
      logout()
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGitHub(): Promise<string> {
    try {
      error.value = null
      const authData = await ApiService.getGitHubAuthUrl()
      return authData.url
    } catch (err) {
      error.value = 'Failed to get GitHub authentication URL'
      throw err
    }
  }

  async function handleGitHubCallback(code: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const authResponse = await ApiService.handleGitHubCallback(code)

      if (authResponse.success) {
        user.value = authResponse.user
      } else {
        throw new Error('Authentication failed')
      }
    } catch (err) {
      console.error('GitHub callback error:', err)
      error.value = 'GitHub authentication failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await ApiService.logout()
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with logout even if API call fails
    } finally {
      user.value = null
      isLoading.value = false
    }
  }

  async function refreshUser(): Promise<void> {
    if (!isAuthenticated.value) {
      return
    }

    try {
      const userData = await ApiService.getCurrentUser()
      user.value = userData
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      error.value = 'Failed to refresh user data'
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    token,

    // Actions
    initializeAuth,
    loginWithGitHub,
    handleGitHubCallback,
    logout,
    refreshUser,
    clearError
  }
})
