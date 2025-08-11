<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ $t('skills.title') }}
        </h1>
        <p class="text-lg text-gray-600">
          {{ $t('skills.subtitle') }}
        </p>
      </div>

      <!-- Skill Analysis Component -->
      <SkillAnalysis
        @login-required="handleLoginRequired"
        @skills-applied="handleSkillsApplied"
      />

      <!-- Skills Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <div class="card">
            <form @submit.prevent="generateRecommendations" class="space-y-6">
          <!-- Programming Languages -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('skills.programmingLanguages') }}
            </label>
            <div class="space-y-2">
              <input
                v-model="newLanguage"
                @keyup.enter="addLanguage"
                type="text"
                :placeholder="$t('skills.selectLanguages')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div class="flex flex-wrap gap-2 mt-2">
                <SkillTag
                  v-for="language in skills.languages"
                  :key="language"
                  :text="language"
                  @remove="removeLanguage(language)"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="suggestion in languageSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="addLanguageFromSuggestion(suggestion)"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  + {{ suggestion }}
                </button>
              </div>
            </div>
          </div>

          <!-- Frameworks -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('skills.frameworks') }}
            </label>
            <div class="space-y-2">
              <input
                v-model="newFramework"
                @keyup.enter="addFramework"
                type="text"
                :placeholder="$t('skills.selectFrameworks')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div class="flex flex-wrap gap-2 mt-2">
                <SkillTag
                  v-for="framework in skills.frameworks"
                  :key="framework"
                  :text="framework"
                  @remove="removeFramework(framework)"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="suggestion in frameworkSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="addFrameworkFromSuggestion(suggestion)"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  + {{ suggestion }}
                </button>
              </div>
            </div>
          </div>

          <!-- Interests -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('skills.interests') }}
            </label>
            <div class="space-y-2">
              <input
                v-model="newInterest"
                @keyup.enter="addInterest"
                type="text"
                :placeholder="$t('skills.selectInterests')"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <div class="flex flex-wrap gap-2 mt-2">
                <SkillTag
                  v-for="interest in skills.interests"
                  :key="interest"
                  :text="interest"
                  @remove="removeInterest(interest)"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="suggestion in interestSuggestions"
                  :key="suggestion"
                  type="button"
                  @click="addInterestFromSuggestion(suggestion)"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  + {{ suggestion }}
                </button>
              </div>
            </div>
          </div>

          <!-- Experience Level -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('skills.experienceLevel') }}
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="level in experienceLevels"
                :key="level.value"
                type="button"
                @click="skills.experienceLevel = level.value"
                :class="[
                  'p-3 rounded-lg border-2 text-center transition-all',
                  skills.experienceLevel === level.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <div class="text-lg">{{ level.icon }}</div>
                <div class="font-medium">{{ level.label }}</div>
                <div class="text-xs text-gray-500">{{ level.description }}</div>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              type="submit"
              :disabled="!hasValidSkills || isLoading"
              :class="[
                'w-full py-3 px-4 rounded-lg font-medium text-lg transition-all',
                hasValidSkills && !isLoading
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ $t('common.loading') }}
              </span>
              <span v-else>
                {{ $t('skills.getRecommendations') }}
              </span>
            </button>
          </div>
        </form>
          </div>
        </div>

        <!-- Search History Sidebar -->
        <div class="lg:col-span-1">
          <div class="card">
            <SearchHistory
              @history-item-selected="onHistoryItemSelected"
              :max-items="5"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import SkillTag from '@/components/SkillTag.vue'
import SearchHistory from '@/components/SearchHistory.vue'
import SkillAnalysis from '@/components/SkillAnalysis.vue'
import type { SkillsFormData } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const { t } = useI18n()

// Form state
const newLanguage = ref('')
const newFramework = ref('')
const newInterest = ref('')

// Initialize skills from store or defaults
const skills = ref<SkillsFormData>({
  languages: [...userStore.skills.languages],
  frameworks: [...userStore.skills.frameworks],
  interests: [...userStore.skills.interests],
  experienceLevel: userStore.skills.experienceLevel
})

const isLoading = ref(false)

// Suggestions for quick adding
const languageSuggestions = ref([
  'JavaScript', 'Python', 'Java', 'TypeScript', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby'
])

const frameworkSuggestions = ref([
  'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Express'
])

const interestSuggestions = ref([
  'Web Development', 'Machine Learning', 'DevOps', 'Mobile Development', 'Game Development',
  'Data Science', 'Blockchain', 'AI', 'Security', 'Cloud Computing'
])

const experienceLevels = computed(() => [
  {
    value: 'beginner' as const,
    label: t('skills.beginner'),
    icon: '🌱',
    description: t('skills.beginnerDesc') || 'New to programming'
  },
  {
    value: 'intermediate' as const,
    label: t('skills.intermediate'),
    icon: '🚀',
    description: t('skills.intermediateDesc') || 'Some experience'
  },
  {
    value: 'advanced' as const,
    label: t('skills.advanced'),
    icon: '⭐',
    description: t('skills.advancedDesc') || 'Experienced developer'
  }
])

// Computed properties
const hasValidSkills = computed(() =>
  skills.value.languages.length > 0 ||
  skills.value.frameworks.length > 0 ||
  skills.value.interests.length > 0
)

// Methods for adding/removing skills
const addLanguage = () => {
  if (newLanguage.value.trim() && !skills.value.languages.includes(newLanguage.value.trim())) {
    skills.value.languages.push(newLanguage.value.trim())
    newLanguage.value = ''
  }
}

const addLanguageFromSuggestion = (language: string) => {
  if (!skills.value.languages.includes(language)) {
    skills.value.languages.push(language)
  }
}

const removeLanguage = (language: string) => {
  skills.value.languages = skills.value.languages.filter((l: string) => l !== language)
}

const addFramework = () => {
  if (newFramework.value.trim() && !skills.value.frameworks.includes(newFramework.value.trim())) {
    skills.value.frameworks.push(newFramework.value.trim())
    newFramework.value = ''
  }
}

const addFrameworkFromSuggestion = (framework: string) => {
  if (!skills.value.frameworks.includes(framework)) {
    skills.value.frameworks.push(framework)
  }
}

const removeFramework = (framework: string) => {
  skills.value.frameworks = skills.value.frameworks.filter((f: string) => f !== framework)
}

const addInterest = () => {
  if (newInterest.value.trim() && !skills.value.interests.includes(newInterest.value.trim())) {
    skills.value.interests.push(newInterest.value.trim())
    newInterest.value = ''
  }
}

const addInterestFromSuggestion = (interest: string) => {
  if (!skills.value.interests.includes(interest)) {
    skills.value.interests.push(interest)
  }
}

const removeInterest = (interest: string) => {
  skills.value.interests = skills.value.interests.filter((i: string) => i !== interest)
}

// Generate recommendations
const generateRecommendations = async () => {
  if (!hasValidSkills.value) return

  isLoading.value = true

  try {
    // Save skills to store and clear cached recommendations
    userStore.updateSkills(skills.value)

    // Navigate to recommendations page
    await router.push('/recommendations')
  } catch (error) {
    console.error('Error generating recommendations:', error)
    // Handle error (show toast, etc.)
  } finally {
    isLoading.value = false
  }
}

// Handle search history item selection
const onHistoryItemSelected = (historySkills: SkillsFormData) => {
  skills.value = { ...historySkills }
}

// Handle skill analysis events
const handleLoginRequired = async () => {
  try {
    const authUrl = await authStore.loginWithGitHub()
    window.location.href = authUrl
  } catch (error) {
    console.error('Login failed:', error)
    // Could show error notification here
  }
}

const handleSkillsApplied = (detectedSkills: SkillsFormData) => {
  // Apply detected skills to the form
  skills.value = {
    languages: [...new Set([...skills.value.languages, ...detectedSkills.languages])],
    frameworks: [...new Set([...skills.value.frameworks, ...detectedSkills.frameworks])],
    interests: [...new Set([...skills.value.interests, ...detectedSkills.interests])],
    experienceLevel: detectedSkills.experienceLevel || skills.value.experienceLevel
  }
}
</script>
