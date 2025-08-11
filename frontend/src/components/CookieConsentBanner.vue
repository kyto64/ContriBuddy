<template>
  <Teleport to="body">
    <div
      v-if="showConsentBanner"
      class="fixed inset-x-0 bottom-0 z-50 p-4"
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div class="mx-auto max-w-4xl">
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-6 relative">
          <!-- Close Button (top-right corner) -->
          <button
            @click="dismissBanner"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            :title="$t('common.close', 'Close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <!-- Simple Banner (default) -->
          <div v-if="!showDetails" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <div class="flex-1">
              <h3 id="cookie-banner-title" class="text-lg font-semibold text-gray-900 mb-2">
                {{ $t('cookies.title', 'We use cookies') }}
              </h3>
              <p id="cookie-banner-description" class="text-sm text-gray-600 leading-relaxed">
                {{ $t('cookies.description', 'We use cookies to enhance your experience, remember your preferences, and analyze site usage. By continuing to use our site, you consent to our use of cookies.') }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 min-w-fit">
              <button
                @click="showDetails = true"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {{ $t('cookies.customize', 'Customize') }}
              </button>
              <button
                @click="acceptEssential"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {{ $t('cookies.essentialOnly', 'Essential Only') }}
              </button>
              <button
                @click="acceptAll"
                class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
              >
                {{ $t('cookies.acceptAll', 'Accept All') }}
              </button>
            </div>
          </div>

          <!-- Detailed Settings -->
          <div v-else class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ $t('cookies.preferences', 'Cookie Preferences') }}
              </h3>
              <button
                @click="showDetails = false"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                :title="$t('common.close', 'Close')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Cookie Categories -->
            <div class="space-y-4">
              <!-- Essential Cookies -->
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">
                    {{ $t('cookies.essential.title', 'Essential Cookies') }}
                  </h4>
                  <div class="flex items-center">
                    <span class="text-sm text-green-600 mr-2">{{ $t('cookies.required', 'Required') }}</span>
                    <div class="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end pr-1">
                      <div class="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-600">
                  {{ $t('cookies.essential.description', 'These cookies are necessary for the website to function and cannot be disabled. They are usually set in response to actions made by you such as setting your privacy preferences or filling in forms.') }}
                </p>
              </div>

              <!-- Functional Cookies -->
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">
                    {{ $t('cookies.functional.title', 'Functional Cookies') }}
                  </h4>
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="localConsent.functional"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div
                      class="w-10 h-6 rounded-full transition-colors duration-200"
                      :class="localConsent.functional ? 'bg-primary-500' : 'bg-gray-300'"
                    >
                      <div
                        class="w-4 h-4 bg-white rounded-full transition-transform duration-200 mt-1"
                        :class="localConsent.functional ? 'translate-x-5' : 'translate-x-1'"
                      ></div>
                    </div>
                  </label>
                </div>
                <p class="text-sm text-gray-600">
                  {{ $t('cookies.functional.description', 'These cookies remember your preferences and choices (like search history) to provide a more personalized experience.') }}
                </p>
              </div>

              <!-- Analytics Cookies -->
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">
                    {{ $t('cookies.analytics.title', 'Analytics Cookies') }}
                  </h4>
                  <label class="flex items-center cursor-pointer">
                    <input
                      v-model="localConsent.analytics"
                      type="checkbox"
                      class="sr-only"
                    />
                    <div
                      class="w-10 h-6 rounded-full transition-colors duration-200"
                      :class="localConsent.analytics ? 'bg-primary-500' : 'bg-gray-300'"
                    >
                      <div
                        class="w-4 h-4 bg-white rounded-full transition-transform duration-200 mt-1"
                        :class="localConsent.analytics ? 'translate-x-5' : 'translate-x-1'"
                      ></div>
                    </div>
                  </label>
                </div>
                <p class="text-sm text-gray-600">
                  {{ $t('cookies.analytics.description', 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.') }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                @click="acceptEssentialDetailed"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {{ $t('cookies.essentialOnly', 'Essential Only') }}
              </button>
              <button
                @click="saveCustomConsent"
                class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors flex-1 sm:flex-none"
              >
                {{ $t('cookies.savePreferences', 'Save Preferences') }}
              </button>
              <button
                @click="acceptAllDetailed"
                class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
              >
                {{ $t('cookies.acceptAll', 'Accept All') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useCookieConsent } from '@/composables/useCookieConsent'

const {
  showConsentBanner,
  consent,
  acceptAll,
  acceptEssential,
  updateConsent,
  saveCustomConsent: saveConsent,
  dismissBanner
} = useCookieConsent()

const showDetails = ref(false)
const localConsent = reactive({
  functional: consent.value.functional,
  analytics: consent.value.analytics
})

// Watch for changes in consent to update local state
watch(
  () => consent.value,
  (newConsent) => {
    localConsent.functional = newConsent.functional
    localConsent.analytics = newConsent.analytics
  },
  { deep: true }
)

// Watch local consent changes and update main consent
watch(
  localConsent,
  (newLocal) => {
    updateConsent('functional', newLocal.functional)
    updateConsent('analytics', newLocal.analytics)
  },
  { deep: true }
)

function acceptAllDetailed() {
  localConsent.functional = true
  localConsent.analytics = true
  acceptAll()
  showDetails.value = false
}

function acceptEssentialDetailed() {
  localConsent.functional = false
  localConsent.analytics = false
  acceptEssential()
  showDetails.value = false
}

function saveCustomConsent() {
  saveConsent()
  showDetails.value = false
}
</script>
