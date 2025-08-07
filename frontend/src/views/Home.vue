<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Hero Section -->
    <section class="pt-16 pb-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Next
            <span class="text-primary-600">OSS Contribution</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover open-source projects that match your skills and interests.
            Get personalized recommendations and find meaningful ways to contribute to the community.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/skills" class="btn-primary px-8 py-3 text-lg">
              Start Finding Projects
            </RouterLink>
            <a href="#how-it-works" class="btn-secondary px-8 py-3 text-lg">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p class="text-lg text-gray-600">Simple steps to find your perfect OSS contribution</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">1. Input Your Skills</h3>
            <p class="text-gray-600">Tell us about your programming languages, frameworks, and interests</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">2. Get Recommendations</h3>
            <p class="text-gray-600">Our algorithm matches you with relevant open-source projects</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">3. Start Contributing</h3>
            <p class="text-gray-600">Find beginner-friendly issues and make your first contribution</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Why ContribHub?</h2>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">🎯 Personalized Matching</h3>
            <p class="text-gray-600">Get project recommendations tailored to your specific skills and experience level</p>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">🚀 Beginner Friendly</h3>
            <p class="text-gray-600">Find issues marked as "good first issue" and projects welcoming to newcomers</p>
          </div>

          <div class="card">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">📊 Real-time Data</h3>
            <p class="text-gray-600">Access up-to-date project information directly from GitHub's API</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
