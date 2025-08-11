<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
      <div class="text-center">
        <!-- Loading State -->
        <div v-if="isLoading" class="space-y-4">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ $t('auth.signingIn') }}
          </h2>
          <p class="text-gray-600">
            {{ $t('auth.pleaseWait') }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ $t('auth.signInFailed') }}
          </h2>
          <p class="text-gray-600">
            {{ error }}
          </p>
          <div class="space-y-2">
            <button
              @click="retryAuth"
              class="btn-primary w-full"
            >
              {{ $t('auth.tryAgain') }}
            </button>
            <RouterLink
              to="/"
              class="btn-secondary w-full inline-block text-center"
            >
              {{ $t('auth.backToHome') }}
            </RouterLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else class="space-y-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ $t('auth.signInSuccess') }}
          </h2>
          <p class="text-gray-600">
            {{ $t('auth.redirecting') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref<string | null>(null)

const handleCallback = async (): Promise<void> => {
  const code = route.query.code as string
  const errorParam = route.query.error as string

  if (errorParam) {
    error.value = `GitHub authentication error: ${errorParam}`
    isLoading.value = false
    return
  }

  if (!code) {
    error.value = 'No authorization code received from GitHub'
    isLoading.value = false
    return
  }

  try {
    await authStore.handleGitHubCallback(code)

    // Redirect to the originally intended page or home
    const redirect = route.query.redirect as string || '/'
    setTimeout(() => {
      router.push(redirect)
    }, 1500)

  } catch (err) {
    console.error('GitHub callback error:', err)
    error.value = err instanceof Error ? err.message : 'Authentication failed'
  } finally {
    isLoading.value = false
  }
}

const retryAuth = async (): Promise<void> => {
  try {
    const authUrl = await authStore.loginWithGitHub()
    window.location.href = authUrl
  } catch (err) {
    console.error('Retry auth failed:', err)
  }
}

onMounted(() => {
  handleCallback()
})
</script>
