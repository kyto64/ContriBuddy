<template>
  <div class="card hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center space-x-2 mb-2">
          <img
            :src="recommendation.repo.owner.avatar_url"
            :alt="recommendation.repo.owner.login"
            class="w-6 h-6 rounded-full"
          />
          <a
            :href="recommendation.repo.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {{ recommendation.repo.full_name }}
          </a>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
        </div>

        <p v-if="recommendation.repo.description" class="text-gray-600 mb-3 line-clamp-2">
          {{ recommendation.repo.description }}
        </p>
      </div>

      <div class="ml-4 text-right">
        <div class="flex items-center justify-end space-x-1 mb-1">
          <div class="text-2xl font-bold text-primary-600">
            {{ recommendation.matchScore }}
          </div>
          <div class="text-sm text-gray-500">%</div>
        </div>
        <div class="text-xs text-gray-500">match</div>
      </div>
    </div>

    <!-- Repository Stats -->
    <div class="flex items-center space-x-4 mb-4 text-sm text-gray-600">
      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
        </svg>
        <span>{{ formatNumber(recommendation.repo.stargazers_count) }}</span>
      </div>

      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
        </svg>
        <span>{{ formatNumber(recommendation.repo.forks_count) }}</span>
      </div>

      <div class="flex items-center space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ recommendation.repo.open_issues_count }} {{ $t('recommendations.helpWantedIssues') }}</span>
      </div>

      <div v-if="recommendation.repo.language" class="flex items-center space-x-1">
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: getLanguageColor(recommendation.repo.language) }"
        ></div>
        <span>{{ recommendation.repo.language }}</span>
      </div>
    </div>

    <!-- Match Reasons -->
    <div v-if="recommendation.reasons.length > 0" class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">{{ $t('recommendations.matchReasons') }}:</h4>
      <div class="space-y-1">
        <div
          v-for="reason in recommendation.reasons.slice(0, 3)"
          :key="reason"
          class="flex items-center space-x-2 text-sm text-gray-600"
        >
          <svg class="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{{ reason }}</span>
        </div>
      </div>
    </div>

    <!-- Topics -->
    <div v-if="recommendation.repo.topics.length > 0" class="mb-4">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="topic in recommendation.repo.topics.slice(0, 5)"
          :key="topic"
          class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
        >
          {{ topic }}
        </span>
        <span
          v-if="recommendation.repo.topics.length > 5"
          class="px-2 py-1 text-gray-500 text-xs"
        >
          +{{ recommendation.repo.topics.length - 5 }} more
        </span>
      </div>
    </div>

    <!-- Suggested Issues -->
    <div v-if="recommendation.suggestedIssues.length > 0" class="border-t pt-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">
        {{ $t('recommendations.goodFirstIssues') }}
        <span class="text-gray-500 font-normal">({{ recommendation.suggestedIssues.length }})</span>
      </h4>
      <div class="space-y-2">
        <a
          v-for="issue in recommendation.suggestedIssues.slice(0, 2)"
          :key="issue.id"
          :href="issue.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ issue.title }}
              </p>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-500">
                  #{{ issue.number }}
                </span>
                <div class="flex space-x-1">
                  <span
                    v-for="label in issue.labels.slice(0, 3)"
                    :key="label.name"
                    class="px-1.5 py-0.5 text-xs rounded"
                    :style="{
                      backgroundColor: `#${label.color}30`,
                      color: `#${label.color}`
                    }"
                  >
                    {{ label.name }}
                  </span>
                </div>
              </div>
            </div>
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </div>
        </a>
      </div>

      <div v-if="recommendation.suggestedIssues.length > 2" class="mt-3 text-center">
        <a
          :href="`${recommendation.repo.html_url}/issues`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {{ $t('recommendations.viewAll') }} {{ recommendation.suggestedIssues.length }} {{ $t('recommendations.helpWantedIssues') }} →
        </a>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex space-x-3 mt-6 pt-4 border-t">
      <a
        :href="recommendation.repo.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-primary flex-1 text-center"
      >
        {{ $t('recommendations.viewOnGitHub') }}
      </a>
      <a
        :href="`${recommendation.repo.html_url}/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22`"
        target="_blank"
        rel="noopener noreferrer"
        class="btn-secondary flex-1 text-center"
      >
        {{ $t('recommendations.goodFirstIssues') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectRecommendation } from '@/types'

interface Props {
  recommendation: ProjectRecommendation
}

defineProps<Props>()

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Vue': '#4FC08D',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051'
  }
  return colors[language] || '#6b7280'
}
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
