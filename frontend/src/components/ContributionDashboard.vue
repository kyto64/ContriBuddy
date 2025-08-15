<template>
  <div class="contribution-dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('contributionDashboard.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t('contributionDashboard.subtitle') }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ $t('contributionDashboard.error.title') }}
          </h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          <button
            @click="loadContributionHistory"
            class="mt-2 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700"
          >
            {{ $t('contributionDashboard.retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="contributionData" class="space-y-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('contributionDashboard.summary.totalContributions') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ contributionData.summary.totalContributions.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('contributionDashboard.summary.pullRequests') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ contributionData.summary.totalPullRequests.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('contributionDashboard.summary.issues') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ contributionData.summary.totalIssues.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $t('contributionDashboard.summary.commits') }}</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ contributionData.summary.totalCommits.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Monthly Activity Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('contributionDashboard.charts.monthlyActivity') }}
          </h3>
          <div class="relative h-72">
            <canvas ref="monthlyActivityChart" class="block w-full h-full"></canvas>
          </div>
        </div>

        <!-- Top Languages Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('contributionDashboard.charts.topLanguages') }}
          </h3>
          <div class="relative h-72">
            <canvas ref="topLanguagesChart" class="block w-full h-full"></canvas>
          </div>
        </div>
      </div>

      <!-- Top Repositories -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('contributionDashboard.topRepositories.title') }}
        </h3>
        <div class="space-y-3">
          <div
            v-for="repo in contributionData.stats.topRepositories.slice(0, 10)"
            :key="repo.repository"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center">
              <svg class="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ repo.repository }}</span>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ repo.count }} {{ $t('contributionDashboard.topRepositories.contributions') }}</span>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {{ $t('contributionDashboard.stats.contributionStreak') }}
          </h4>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ contributionData.stats.contributionStreak }} {{ $t('contributionDashboard.stats.days') }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {{ $t('contributionDashboard.stats.firstContribution') }}
          </h4>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ contributionData.stats.firstContribution ? new Date(contributionData.stats.firstContribution).toLocaleDateString() : 'N/A' }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {{ $t('contributionDashboard.stats.mostActiveRepository') }}
          </h4>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ contributionData.stats.mostActiveRepository || 'N/A' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Chart from 'chart.js/auto'
import { ApiService } from '../services/api'
import type { ContributionHistory } from '../types'

// Using auto-registered Chart.js build

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const contributionData = ref<ContributionHistory | null>(null)
const monthlyActivityChart = ref<HTMLCanvasElement | null>(null)
const topLanguagesChart = ref<HTMLCanvasElement | null>(null)

let monthlyChart: Chart | null = null
let languagesChart: Chart | null = null

const loadContributionHistory = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await ApiService.getContributionHistorySummary()
    contributionData.value = response.data
  } catch (err: any) {
    console.error('Error loading contribution history:', err)
    error.value = err.response?.data?.error || t('contributionDashboard.error.loadFailed')
  } finally {
    loading.value = false
  // Ensure the dashboard DOM (v-else-if) is rendered before creating charts
  await nextTick()
  createCharts()
  }
}

const createCharts = () => {
  if (!contributionData.value) return

  // Destroy existing charts
  if (monthlyChart) {
    monthlyChart.destroy()
  }
  if (languagesChart) {
    languagesChart.destroy()
  }

  // Monthly Activity Chart
  if (monthlyActivityChart.value) {
    const ctx = monthlyActivityChart.value.getContext('2d')
    if (ctx) {
      monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: contributionData.value.stats.monthlyActivity.map(m => m.month),
          datasets: [
            {
              label: t('contributionDashboard.charts.pullRequests'),
              data: contributionData.value.stats.monthlyActivity.map(m => m.pullRequests),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true
            },
            {
              label: t('contributionDashboard.charts.issues'),
              data: contributionData.value.stats.monthlyActivity.map(m => m.issues),
              borderColor: 'rgb(245, 158, 11)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: true
            },
            {
              label: t('contributionDashboard.charts.commits'),
              data: contributionData.value.stats.monthlyActivity.map(m => m.commits),
              borderColor: 'rgb(168, 85, 247)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }

  // Top Languages Chart
  if (topLanguagesChart.value && contributionData.value.stats.topLanguages.length > 0) {
    const ctx = topLanguagesChart.value.getContext('2d')
    if (ctx) {
      languagesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: contributionData.value.stats.topLanguages.slice(0, 8).map(l => l.language),
          datasets: [{
            data: contributionData.value.stats.topLanguages.slice(0, 8).map(l => l.count),
            backgroundColor: [
              '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
              '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  }
}

onMounted(() => {
  loadContributionHistory()
})
</script>

<style scoped>
.contribution-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

canvas {
  max-height: 300px;
}
</style>
