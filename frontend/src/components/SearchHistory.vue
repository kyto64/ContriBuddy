<template>
  <div class="search-history">
    <!-- Search History Header -->
    <div v-if="searchHistory.length > 0" class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">
        {{ $t('search.history.title', 'Search History') }}
      </h3>
      <button
        @click="clearSearchHistory"
        class="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        {{ $t('search.history.clear', 'Clear All') }}
      </button>
    </div>

    <!-- History Items -->
    <div v-if="searchHistory.length > 0" class="space-y-3">
      <div
        v-for="item in formattedHistory"
        :key="item.id"
        class="group relative bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
        @click="loadHistoryItem(item)"
      >
        <!-- Remove Button -->
        <button
          @click.stop="removeHistoryItem(item.id)"
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
          :title="$t('search.history.remove', 'Remove from history')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- History Item Content -->
        <div class="pr-8">
          <!-- Skills Summary -->
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-gray-900">
              {{ item.label || generateFallbackLabel(item.skills) }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {{ item.skillsCount }} {{ item.skillsCount === 1 ? 'skill' : 'skills' }}
            </span>
          </div>

          <!-- Skills Breakdown -->
          <div class="space-y-1">
            <div v-if="item.skills.languages.length > 0" class="flex items-center gap-2">
              <span class="text-xs text-gray-500 w-16">{{ $t('skills.programmingLanguages', 'Languages') }}:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="lang in item.skills.languages.slice(0, 3)"
                  :key="lang"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {{ lang }}
                </span>
                <span
                  v-if="item.skills.languages.length > 3"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  +{{ item.skills.languages.length - 3 }}
                </span>
              </div>
            </div>

            <div v-if="item.skills.frameworks.length > 0" class="flex items-center gap-2">
              <span class="text-xs text-gray-500 w-16">{{ $t('skills.frameworks', 'Frameworks') }}:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="framework in item.skills.frameworks.slice(0, 3)"
                  :key="framework"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                >
                  {{ framework }}
                </span>
                <span
                  v-if="item.skills.frameworks.length > 3"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  +{{ item.skills.frameworks.length - 3 }}
                </span>
              </div>
            </div>

            <div v-if="item.skills.interests.length > 0" class="flex items-center gap-2">
              <span class="text-xs text-gray-500 w-16">{{ $t('skills.interests', 'Interests') }}:</span>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="interest in item.skills.interests.slice(0, 3)"
                  :key="interest"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800"
                >
                  {{ interest }}
                </span>
                <span
                  v-if="item.skills.interests.length > 3"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                >
                  +{{ item.skills.interests.length - 3 }}
                </span>
              </div>
            </div>
          </div>

          <!-- Timestamp and Experience Level -->
          <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              {{ item.relativeTime }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
              {{ getExperienceLevelLabel(item.skills.experienceLevel) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-sm text-gray-500">
        {{ $t('search.history.empty', 'No search history yet') }}
      </p>
      <p class="text-xs text-gray-400 mt-1">
        {{ $t('search.history.emptyDescription', 'Your search history will appear here after you submit skills') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import type { FormattedSearchHistoryItem, SkillsFormData } from '@/types'

const { t } = useI18n()
const userStore = useUserStore()

// Props
interface Props {
  showInCard?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  showInCard: true,
  maxItems: 10
})

// Emit events
const emit = defineEmits<{
  historyItemSelected: [skills: SkillsFormData]
}>()

// Computed
const searchHistory = computed(() =>
  userStore.formattedHistory.slice(0, props.maxItems)
)

const formattedHistory = computed(() => userStore.formattedHistory)

// Methods
function loadHistoryItem(item: FormattedSearchHistoryItem) {
  userStore.loadSkillsFromHistory(item.skills)
  emit('historyItemSelected', item.skills)
}

function removeHistoryItem(id: string) {
  userStore.removeFromHistory(id)
}

function clearSearchHistory() {
  if (confirm(t('search.history.confirmClear', 'Are you sure you want to clear all search history?'))) {
    userStore.clearHistory()
  }
}

function generateFallbackLabel(skills: SkillsFormData): string {
  const parts: string[] = []

  if (skills.languages.length > 0) {
    parts.push(skills.languages.slice(0, 2).join(', '))
  }

  if (skills.frameworks.length > 0) {
    parts.push(skills.frameworks.slice(0, 2).join(', '))
  }

  if (skills.interests.length > 0) {
    parts.push(skills.interests.slice(0, 2).join(', '))
  }

  return parts.length > 0 ? parts.join(' | ') : `${skills.experienceLevel} developer`
}

function getExperienceLevelLabel(level: 'beginner' | 'intermediate' | 'advanced'): string {
  switch (level) {
    case 'beginner':
      return t('skills.beginner', 'Beginner')
    case 'intermediate':
      return t('skills.intermediate', 'Intermediate')
    case 'advanced':
      return t('skills.advanced', 'Advanced')
    default:
      return level
  }
}
</script>
