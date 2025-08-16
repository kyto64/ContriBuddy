import { ref, computed } from 'vue'

const COOKIE_CONSENT_KEY = 'kontri_cookie_consent'
const COOKIE_EXPIRY_DAYS = 365

export interface CookieConsent {
  essential: boolean
  analytics: boolean
  functional: boolean
  timestamp: number
}

// Global event system for consent changes
type ConsentChangeCallback = (consent: CookieConsent) => void
const consentChangeCallbacks: ConsentChangeCallback[] = []

export function onConsentChange(callback: ConsentChangeCallback) {
  consentChangeCallbacks.push(callback)

  // Return unsubscribe function
  return () => {
    const index = consentChangeCallbacks.indexOf(callback)
    if (index > -1) {
      consentChangeCallbacks.splice(index, 1)
    }
  }
}

function notifyConsentChange(consent: CookieConsent) {
  consentChangeCallbacks.forEach(callback => callback(consent))
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
 * Delete cookie by setting expiry date to past
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export function useCookieConsent() {
  const hasConsent = ref<boolean>(false)
  const showConsentBanner = ref<boolean>(false)
  const consent = ref<CookieConsent>({
    essential: true, // Always true, required for basic functionality
    analytics: false,
    functional: false,
    timestamp: 0
  })

  /**
   * Check if banner was temporarily dismissed in current session
   */
  function isDismissedInSession(): boolean {
    if (typeof sessionStorage === 'undefined') return false
    return sessionStorage.getItem('cookie_banner_dismissed') === 'true'
  }

  /**
   * Mark banner as dismissed for current session
   */
  function markDismissedInSession(): void {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem('cookie_banner_dismissed', 'true')
  }

  /**
   * Load consent from cookie
   */
  function loadConsent(): void {
    const cookieValue = getCookie(COOKIE_CONSENT_KEY)
    if (cookieValue) {
      try {
        const savedConsent = JSON.parse(decodeURIComponent(cookieValue)) as CookieConsent
        consent.value = {
          essential: true, // Always true
          analytics: savedConsent.analytics || false,
          functional: savedConsent.functional || false,
          timestamp: savedConsent.timestamp || Date.now()
        }
        hasConsent.value = true
        showConsentBanner.value = false
      } catch {
        // If parsing fails, show consent banner unless dismissed in session
        showConsentBanner.value = !isDismissedInSession()
        hasConsent.value = false
      }
    } else {
      // No consent cookie found, show banner unless dismissed in session
      showConsentBanner.value = !isDismissedInSession()
      hasConsent.value = false
    }
  }

  /**
   * Save consent to cookie
   */
  function saveConsent(): void {
    const consentData: CookieConsent = {
      ...consent.value,
      timestamp: Date.now()
    }

    setCookie(COOKIE_CONSENT_KEY, JSON.stringify(consentData), COOKIE_EXPIRY_DAYS)
    hasConsent.value = true
    showConsentBanner.value = false

    // Notify all listeners about consent change
    notifyConsentChange(consentData)
  }

  /**
   * Accept all cookies
   */
  function acceptAll(): void {
    consent.value = {
      essential: true,
      analytics: true,
      functional: true,
      timestamp: Date.now()
    }
    saveConsent()
  }

  /**
   * Accept only essential cookies
   */
  function acceptEssential(): void {
    consent.value = {
      essential: true,
      analytics: false,
      functional: false,
      timestamp: Date.now()
    }
    saveConsent()
  }

  /**
   * Update specific consent
   */
  function updateConsent(type: keyof Omit<CookieConsent, 'timestamp'>, value: boolean): void {
    if (type === 'essential') {
      // Essential cookies cannot be disabled
      return
    }
    consent.value[type] = value
  }

  /**
   * Save custom consent preferences
   */
  function saveCustomConsent(): void {
    saveConsent()
  }

  /**
   * Temporarily dismiss the banner without setting any cookies
   */
  function dismissBanner(): void {
    showConsentBanner.value = false
    markDismissedInSession()
    // Do not set hasConsent to true - user hasn't given explicit consent
  }

  /**
   * Revoke all consent and delete cookies
   */
  function revokeConsent(): void {
    deleteCookie(COOKIE_CONSENT_KEY)

    // Clear search history if functional cookies are revoked
    if (!consent.value.functional) {
  deleteCookie('kontri_search_history')
    }

    consent.value = {
      essential: true,
      analytics: false,
      functional: false,
      timestamp: 0
    }
    hasConsent.value = false
    showConsentBanner.value = true
  }

  /**
   * Check if specific cookie type is allowed
   */
  const canUseAnalytics = computed(() => hasConsent.value && consent.value.analytics)
  const canUseFunctional = computed(() => hasConsent.value && consent.value.functional)

  /**
   * Get consent status summary
   */
  const consentSummary = computed(() => {
    if (!hasConsent.value) return 'No consent given'

    const types = []
    if (consent.value.essential) types.push('Essential')
    if (consent.value.analytics) types.push('Analytics')
    if (consent.value.functional) types.push('Functional')

    return `Consent given for: ${types.join(', ')}`
  })

  // Initialize consent on composable creation
  loadConsent()

  return {
    hasConsent,
    showConsentBanner,
    consent,
    canUseAnalytics,
    canUseFunctional,
    consentSummary,
    loadConsent,
    acceptAll,
    acceptEssential,
    updateConsent,
    saveCustomConsent,
    dismissBanner,
    revokeConsent
  }
}
