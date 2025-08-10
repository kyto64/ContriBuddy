import { ref, computed } from 'vue'
import type { UserSkills, SearchHistoryItem, FormattedSearchHistoryItem } from '@/types'

const COOKIE_NAME = 'contribhub_search_history'
const MAX_HISTORY_ITEMS = 10
const COOKIE_EXPIRY_DAYS = 30

/**
 * Parse cookie value and return search history
 */
function parseCookie(cookieValue: string): SearchHistoryItem[] {
  try {
    const data = JSON.parse(decodeURIComponent(cookieValue))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift()
  }
  return undefined
}

/**
 * Set cookie with expiry date
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Generate a simple ID for search history item
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Generate a human-readable label for search history
 */
function generateLabel(skills: UserSkills): string {
  const parts: string[] = []

  if (skills.languages.length > 0) {
    const langList = skills.languages.slice(0, 2).join(', ')
    parts.push(skills.languages.length > 2 ? `${langList} +${skills.languages.length - 2}` : langList)
  }

  if (skills.frameworks.length > 0) {
    const frameworkList = skills.frameworks.slice(0, 2).join(', ')
    parts.push(skills.frameworks.length > 2 ? `${frameworkList} +${skills.frameworks.length - 2}` : frameworkList)
  }

  if (skills.interests.length > 0) {
    const interestList = skills.interests.slice(0, 2).join(', ')
    parts.push(skills.interests.length > 2 ? `${interestList} +${skills.interests.length - 2}` : interestList)
  }

  return parts.length > 0 ? parts.join(' | ') : `${skills.experienceLevel} developer`
}

/**
 * Check if two skills objects are similar (to avoid duplicate entries)
 */
function areSkillsSimilar(skills1: UserSkills, skills2: UserSkills): boolean {
  const sameLanguages = JSON.stringify(skills1.languages.sort()) === JSON.stringify(skills2.languages.sort())
  const sameFrameworks = JSON.stringify(skills1.frameworks.sort()) === JSON.stringify(skills2.frameworks.sort())
  const sameInterests = JSON.stringify(skills1.interests.sort()) === JSON.stringify(skills2.interests.sort())
  const sameLevel = skills1.experienceLevel === skills2.experienceLevel

  return sameLanguages && sameFrameworks && sameInterests && sameLevel
}

export function useSearchHistory() {
  const searchHistory = ref<SearchHistoryItem[]>([])

  /**
   * Load search history from cookies
   */
  function loadHistory(): void {
    const cookieValue = getCookie(COOKIE_NAME)
    if (cookieValue) {
      searchHistory.value = parseCookie(cookieValue)
    }
  }

  /**
   * Save search history to cookies
   */
  function saveHistory(): void {
    setCookie(COOKIE_NAME, JSON.stringify(searchHistory.value), COOKIE_EXPIRY_DAYS)
  }

  /**
   * Add a new search to history
   */
  function addToHistory(skills: UserSkills): void {
    // Check if similar skills already exist in history
    const existingIndex = searchHistory.value.findIndex(item =>
      areSkillsSimilar(item.skills, skills)
    )

    if (existingIndex !== -1) {
      // Update timestamp of existing item and move to top
      const existingItem = searchHistory.value[existingIndex]
      searchHistory.value.splice(existingIndex, 1)
      searchHistory.value.unshift({
        ...existingItem,
        timestamp: Date.now()
      })
    } else {
      // Add new item to the beginning
      const newItem: SearchHistoryItem = {
        id: generateId(),
        skills: { ...skills },
        timestamp: Date.now(),
        label: generateLabel(skills)
      }

      searchHistory.value.unshift(newItem)
    }

    // Keep only the latest items
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  /**
   * Remove an item from history
   */
  function removeFromHistory(id: string): void {
    searchHistory.value = searchHistory.value.filter(item => item.id !== id)
    saveHistory()
  }

  /**
   * Clear all search history
   */
  function clearHistory(): void {
    searchHistory.value = []
    setCookie(COOKIE_NAME, '', -1) // Set expiry date to past to delete cookie
  }

  /**
   * Get formatted history items for display
   */
  const formattedHistory = computed((): FormattedSearchHistoryItem[] => {
    return searchHistory.value.map(item => ({
      ...item,
      relativeTime: getRelativeTime(item.timestamp),
      skillsCount: item.skills.languages.length + item.skills.frameworks.length + item.skills.interests.length
    }))
  })

  /**
   * Get relative time string
   */
  function getRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) {
      return 'just now'
    } else if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else if (days === 1) {
      return 'yesterday'
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return new Date(timestamp).toLocaleDateString()
    }
  }

  // Initialize history on composable creation
  loadHistory()

  return {
    searchHistory,
    formattedHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loadHistory
  }
}
