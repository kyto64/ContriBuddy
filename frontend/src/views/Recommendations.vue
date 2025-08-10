<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ $t('recommendations.title') }}
            </h1>
            <p class="text-lg text-gray-600 mt-2">
              {{ $t('recommendations.subtitle') }}: {{ skillsSummary }}
            </p>
          </div>
          <RouterLink
            to="/skills"
            class="btn-secondary"
          >
            {{ $t('recommendations.backToSkills') }}
          </RouterLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xl text-gray-700">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="card max-w-md mx-auto">
          <div class="text-red-600 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('common.error') }}</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button @click="loadRecommendations" class="btn-primary">
            {{ $t('common.tryAgain') }}
          </button>
        </div>
      </div>

      <!-- No Skills State -->
      <div v-else-if="!userStore.hasSkills" class="text-center py-12">
        <div class="card max-w-md mx-auto">
          <div class="text-gray-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('skills.title') }}</h3>
          <p class="text-gray-600 mb-4">{{ $t('skills.subtitle') }}</p>
          <RouterLink to="/skills" class="btn-primary">
            {{ $t('skills.title') }}
          </RouterLink>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-else-if="recommendations.length > 0" class="space-y-6">
        <div class="flex items-center justify-between mb-6">
          <p class="text-sm text-gray-600">
            {{ $t('recommendations.found') }} {{ recommendations.length }} {{ $t('recommendations.projects') }}
          </p>
          <div class="flex space-x-2">
            <button
              @click="sortBy = 'score'"
              :class="[
                'px-3 py-1 text-sm rounded',
                sortBy === 'score' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ $t('recommendations.bestMatch') }}
            </button>
            <button
              @click="sortBy = 'stars'"
              :class="[
                'px-3 py-1 text-sm rounded',
                sortBy === 'stars' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ $t('recommendations.mostStars') }}
            </button>
            <button
              @click="sortBy = 'issues'"
              :class="[
                'px-3 py-1 text-sm rounded',
                sortBy === 'issues' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ $t('recommendations.mostIssues') }}
            </button>
          </div>
        </div>

        <div class="grid gap-6">
          <ProjectCard
            v-for="recommendation in sortedRecommendations"
            :key="recommendation.repo.id"
            :recommendation="recommendation"
          />
        </div>
      </div>

      <!-- No Results State -->
      <div v-else class="text-center py-12">
        <div class="card max-w-md mx-auto">
          <div class="text-gray-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('recommendations.noResults') }}</h3>
          <p class="text-gray-600 mb-4">{{ $t('recommendations.tryDifferent') }}</p>
          <RouterLink to="/skills" class="btn-primary">
            {{ $t('recommendations.backToSkills') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ApiService } from '@/services/api'
import ProjectCard from '@/components/ProjectCard.vue'
import type { ProjectRecommendation } from '@/types'

const userStore = useUserStore()

const recommendations = ref<ProjectRecommendation[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const sortBy = ref<'score' | 'stars' | 'issues'>('score')

// Computed properties
const skillsSummary = computed(() => {
  const skills = userStore.skills
  const allSkills = [
    ...skills.languages,
    ...skills.frameworks,
    ...skills.interests
  ]

  if (allSkills.length === 0) return '-'
  if (allSkills.length <= 3) return allSkills.join(', ')
  return `${allSkills.slice(0, 3).join(', ')} and ${allSkills.length - 3} more`
})

const sortedRecommendations = computed(() => {
  const sorted = [...recommendations.value]

  switch (sortBy.value) {
    case 'score':
      return sorted.sort((a, b) => b.matchScore - a.matchScore)
    case 'stars':
      return sorted.sort((a, b) => b.repo.stargazers_count - a.repo.stargazers_count)
    case 'issues':
      return sorted.sort((a, b) => b.repo.open_issues_count - a.repo.open_issues_count)
    default:
      return sorted
  }
})

// Methods
const loadRecommendations = async () => {
  if (!userStore.hasSkills) {
    return
  }

  isLoading.value = true
  error.value = null
  userStore.setLoading(true)

  try {
    console.log('🔍 Loading recommendations for skills:', userStore.skills)

    const results = await ApiService.generateRecommendations(userStore.skills)
    recommendations.value = results
    userStore.setRecommendations(results)

    console.log(`✅ Loaded ${results.length} recommendations`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load recommendations'
    userStore.setError(error.value)
    console.error('❌ Error loading recommendations:', err)
  } finally {
    isLoading.value = false
    userStore.setLoading(false)
  }
}

// Lifecycle
onMounted(() => {
  // Load from store first
  if (userStore.recommendations.length > 0) {
    recommendations.value = userStore.recommendations
  } else if (userStore.hasSkills) {
    // Generate new recommendations if we have skills but no cached results
    loadRecommendations()
  }
})
</script>
