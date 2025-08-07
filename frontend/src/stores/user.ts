import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSkills, ProjectRecommendation } from '@/types'

export const useUserStore = defineStore('user', () => {
  // State
  const skills = ref<UserSkills>({
    languages: [],
    frameworks: [],
    interests: [],
    experienceLevel: 'beginner'
  })

  const recommendations = ref<ProjectRecommendation[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasSkills = computed(() =>
    skills.value.languages.length > 0 ||
    skills.value.frameworks.length > 0 ||
    skills.value.interests.length > 0
  )

  const topRecommendations = computed(() =>
    recommendations.value
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
  )

  // Actions
  function updateSkills(newSkills: Partial<UserSkills>) {
    skills.value = { ...skills.value, ...newSkills }
  }

  function setRecommendations(newRecommendations: ProjectRecommendation[]) {
    recommendations.value = newRecommendations
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  function clearRecommendations() {
    recommendations.value = []
    error.value = null
  }

  function reset() {
    skills.value = {
      languages: [],
      frameworks: [],
      interests: [],
      experienceLevel: 'beginner'
    }
    recommendations.value = []
    error.value = null
    isLoading.value = false
  }

  return {
    // State
    skills,
    recommendations,
    isLoading,
    error,

    // Getters
    hasSkills,
    topRecommendations,

    // Actions
    updateSkills,
    setRecommendations,
    setLoading,
    setError,
    clearRecommendations,
    reset
  }
})
