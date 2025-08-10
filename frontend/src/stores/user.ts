import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserSkills, ProjectRecommendation } from '@/types'
import { useSearchHistory } from '@/composables/useSearchHistory'

export const useUserStore = defineStore('user', () => {
  // Search history composable
  const { searchHistory, formattedHistory, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()

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
    const oldSkills = { ...skills.value }
    skills.value = { ...skills.value, ...newSkills }

    // Add to search history if skills have changed significantly
    const hasChanged =
      JSON.stringify(oldSkills.languages.sort()) !== JSON.stringify(skills.value.languages.sort()) ||
      JSON.stringify(oldSkills.frameworks.sort()) !== JSON.stringify(skills.value.frameworks.sort()) ||
      JSON.stringify(oldSkills.interests.sort()) !== JSON.stringify(skills.value.interests.sort()) ||
      oldSkills.experienceLevel !== skills.value.experienceLevel

    if (hasChanged && hasSkills.value) {
      addToHistory(skills.value)
    }

    // Clear cached recommendations when skills change
    clearRecommendations()
  }

  function loadSkillsFromHistory(historySkills: UserSkills) {
    skills.value = { ...historySkills }
    clearRecommendations()
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

    // Search History
    searchHistory,
    formattedHistory,

    // Getters
    hasSkills,
    topRecommendations,

    // Actions
    updateSkills,
    loadSkillsFromHistory,
    setRecommendations,
    setLoading,
    setError,
    clearRecommendations,
    reset,

    // Search History Actions
    addToHistory,
    removeFromHistory,
    clearHistory
  }
})
