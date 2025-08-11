<template>
  <div class="skill-analysis-section bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {{ $t('skills.analysis.title') }}
      </h3>

      <div class="flex gap-2">
        <button
          v-if="!isLoggedIn"
          @click="$emit('login-required')"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {{ $t('nav.loginWithGitHub') }}
        </button>

        <button
          v-else-if="!isAnalyzing"
          @click="startAnalysis"
          :disabled="isAnalyzing"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg v-if="!analysis" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ analysis ? $t('skills.analysis.refresh') : $t('skills.analysis.startAnalysis') }}
        </button>

        <div v-else class="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
          <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t('skills.analysis.analyzing') }}
        </div>
      </div>
    </div>

    <!-- Login Required State -->
    <div v-if="!isLoggedIn" class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <svg class="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('skills.analysis.loginRequired') }}
      </h4>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t('skills.analysis.loginDescription') }}
      </p>
    </div>

    <!-- No Analysis State -->
    <div v-else-if="!analysis && !isAnalyzing" class="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <svg class="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('skills.analysis.noAnalysis') }}
      </h4>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ $t('skills.analysis.noAnalysisDescription') }}
      </p>
    </div>

    <!-- Analysis Results -->
    <div v-else-if="analysis" class="space-y-6">
      <!-- Confidence Score -->
      <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">{{ $t('skills.analysis.confidence') }}</h4>
          <div class="flex items-center mt-1">
            <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="confidenceColorClass"
                :style="{ width: `${analysis.confidence}%` }"
              ></div>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ analysis.confidence }}%</span>
          </div>
        </div>

        <button
          @click="applySkillsToForm"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {{ $t('skills.analysis.applyToForm') }}
        </button>
      </div>

      <!-- Skills Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Programming Languages -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            {{ $t('skills.analysis.languages') }}
          </h4>
          <div v-if="analysis.languages.length > 0" class="space-y-2">
            <div v-for="lang in analysis.languages.slice(0, 6)" :key="lang.name" class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ lang.name }}</span>
              <div class="flex items-center">
                <span :class="skillLevelClass(lang.level)" class="px-2 py-1 rounded text-xs font-medium mr-2">
                  {{ $t(`skills.${lang.level}`) }}
                </span>
                <span class="text-xs text-gray-500">{{ Math.round(lang.confidence) }}%</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">No languages detected</p>
        </div>

        <!-- Frameworks & Tools -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            {{ $t('skills.analysis.frameworks') }}
          </h4>
          <div v-if="analysis.frameworks.length > 0" class="space-y-2">
            <div v-for="framework in analysis.frameworks.slice(0, 6)" :key="framework.name" class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ framework.name }}</span>
              <div class="flex items-center">
                <span :class="skillLevelClass(framework.level)" class="px-2 py-1 rounded text-xs font-medium mr-2">
                  {{ $t(`skills.${framework.level}`) }}
                </span>
                <span class="text-xs text-gray-500">{{ Math.round(framework.confidence) }}%</span>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">No frameworks detected</p>
        </div>
      </div>

      <!-- Interests -->
      <div v-if="analysis.interests.length > 0" class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
          <svg class="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.997 1.997 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {{ $t('skills.analysis.interests') }}
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="interest in analysis.interests"
            :key="interest"
            class="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
          >
            {{ interest }}
          </span>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ analysis.summary.totalRepositories }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('skills.analysis.totalRepos') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ analysis.summary.publicRepositories }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('skills.analysis.publicRepos') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ analysis.summary.estimatedCommits }}+</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('skills.analysis.estimatedCommits') }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ analysis.summary.recentActivity }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('skills.analysis.recentActivity') }}</div>
        </div>
      </div>

      <!-- Experience Level -->
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h4 class="font-medium text-gray-900 dark:text-white mb-3">{{ $t('skills.analysis.experienceLevel') }}</h4>
        <div class="flex items-center">
          <span :class="experienceLevelClass" class="px-4 py-2 rounded-lg font-medium">
            {{ $t(`skills.${analysis.experienceLevel}`) }}
          </span>
          <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {{ $t(`skills.${analysis.experienceLevel}Desc`) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { ApiService } from '../services/api'
import type { SkillAnalysisResult } from '../types'

// Props and Emits
const emit = defineEmits<{
  'login-required': []
  'skills-applied': [skills: any]
}>()

// Store
const authStore = useAuthStore()

// Reactive state
const analysis = ref<SkillAnalysisResult | null>(null)
const isAnalyzing = ref(false)
const error = ref<string | null>(null)

// Computed
const isLoggedIn = computed(() => authStore.isAuthenticated)

const confidenceColorClass = computed(() => {
  if (!analysis.value) return 'bg-gray-400'
  const confidence = analysis.value.confidence
  if (confidence >= 80) return 'bg-green-500'
  if (confidence >= 60) return 'bg-yellow-500'
  if (confidence >= 40) return 'bg-orange-500'
  return 'bg-red-500'
})

const experienceLevelClass = computed(() => {
  if (!analysis.value) return ''

  switch (analysis.value.experienceLevel) {
    case 'advanced':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'intermediate':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 'beginner':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
})

// Methods
const skillLevelClass = (level: string) => {
  switch (level) {
    case 'advanced':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    case 'intermediate':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    case 'beginner':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }
}

const startAnalysis = async () => {
  if (!isLoggedIn.value) {
    emit('login-required')
    return
  }

  isAnalyzing.value = true
  error.value = null

  try {
    const result = await ApiService.analyzeSkills()
    analysis.value = result
  } catch (err: any) {
    console.error('Skill analysis failed:', err)
    error.value = err.response?.data?.message || 'Failed to analyze skills'

    // If auth is required, emit login event
    if (err.response?.data?.requiresAuth) {
      emit('login-required')
    }
  } finally {
    isAnalyzing.value = false
  }
}

const applySkillsToForm = () => {
  if (!analysis.value) return

  const formData = {
    languages: analysis.value.languages.slice(0, 8).map(lang => lang.name),
    frameworks: analysis.value.frameworks.slice(0, 10).map(fw => fw.name),
    interests: analysis.value.interests.slice(0, 6),
    experienceLevel: analysis.value.experienceLevel
  }

  emit('skills-applied', formData)
}

// Load existing analysis on mount
const loadExistingAnalysis = async () => {
  if (!isLoggedIn.value) return

  try {
    const existingAnalysis = await ApiService.getSkillAnalysis()
    if (existingAnalysis) {
      analysis.value = existingAnalysis
    }
  } catch (err) {
    // Ignore errors when loading existing analysis
    console.warn('Could not load existing analysis:', err)
  }
}

// Load existing analysis when component mounts
loadExistingAnalysis()
</script>

<style scoped>
.skill-analysis-section {
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dark .skill-analysis-section {
  border-color: #374151;
}

.skill-analysis-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .skill-analysis-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
