// Localization utility for currency, dates, and regional formatting
// Uses user settings first, then falls back to browser detection

class LocalizationService {
  private locale: string
  private currency: string
  private userSettings: { locale?: string; currency?: string } | null = null
  private currencySymbols: Record<string, string> = {
    'en-US': 'USD',
    'en-GB': 'GBP', 
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'zh-HK': 'HKD',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-BR': 'BRL',
    'ru-RU': 'RUB',
    'hi-IN': 'INR',
    'th-TH': 'THB',
    'id-ID': 'IDR',
    'vi-VN': 'VND',
    'ph-PH': 'PHP',
    'my-MY': 'MYR',
    'sg-SG': 'SGD',
    'mx-MX': 'MXN',
    'ar-SA': 'SAR',
    'tr-TR': 'TRY',
    'pl-PL': 'PLN',
    'cz-CZ': 'CZK',
    'hu-HU': 'HUF',
    'ro-RO': 'RON',
    'bg-BG': 'BGN',
    'hr-HR': 'HRK',
    'sk-SK': 'EUR',
    'si-SI': 'EUR',
    'ee-EE': 'EUR',
    'lv-LV': 'EUR',
    'lt-LT': 'EUR',
    'dk-DK': 'DKK',
    'se-SE': 'SEK',
    'no-NO': 'NOK',
    'fi-FI': 'EUR',
    'is-IS': 'ISK',
    'ch-CH': 'CHF',
    'at-AT': 'EUR',
    'be-BE': 'EUR',
    'nl-NL': 'EUR',
    'lu-LU': 'EUR',
    'ie-IE': 'EUR',
    'mt-MT': 'EUR',
    'cy-CY': 'EUR',
    'gr-GR': 'EUR',
    'za-ZA': 'ZAR',
    'eg-EG': 'EGP',
    'il-IL': 'ILS',
    'ae-AE': 'AED',
    'nz-NZ': 'NZD'
  }

  constructor(userSettings: { locale?: string; currency?: string } | null = null) {
    this.userSettings = userSettings
    this.locale = this.getEffectiveLocale()
    this.currency = this.getEffectiveCurrency()
  }

  // Update user settings and refresh locale/currency
  updateSettings(settings: { locale?: string; currency?: string }) {
    this.userSettings = settings
    this.locale = this.getEffectiveLocale()
    this.currency = this.getEffectiveCurrency()
  }

  private getEffectiveLocale(): string {
    // Use user setting if available and not 'auto'
    if (this.userSettings?.locale && this.userSettings.locale !== 'auto') {
      return this.userSettings.locale
    }
    // Fall back to browser detection
    return this.detectUserLocale()
  }

  private getEffectiveCurrency(): string {
    // Use user setting if available and not 'auto'
    if (this.userSettings?.currency && this.userSettings.currency !== 'auto') {
      return this.userSettings.currency
    }
    // Fall back to locale-based detection
    return this.getCurrencyForLocale(this.locale)
  }

  private detectUserLocale(): string {
    // Try to detect from browser
    if (typeof window !== 'undefined') {
      // First try navigator.language (most specific)
      if (navigator.language) {
        return navigator.language
      }
      
      // Fallback to first language in languages array
      if (navigator.languages && navigator.languages.length > 0) {
        return navigator.languages[0]
      }
    }
    
    // Default fallback
    return 'en-US'
  }

  private getCurrencyForLocale(locale: string): string {
    // Try exact match first
    if (this.currencySymbols[locale]) {
      return this.currencySymbols[locale]
    }
    
    // Try language-only match (e.g., 'en' from 'en-US')
    const language = locale.split('-')[0]
    const matchingLocale = Object.keys(this.currencySymbols).find(
      key => key.startsWith(language + '-')
    )
    
    if (matchingLocale) {
      return this.currencySymbols[matchingLocale]
    }
    
    // Country-based fallback for common patterns
    const country = locale.split('-')[1]?.toUpperCase()
    if (country) {
      // European countries typically use EUR
      const eurCountries = ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'FI', 'IE', 'PT', 'GR', 'SI', 'SK', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY']
      if (eurCountries.includes(country)) {
        return 'EUR'
      }
    }
    
    // Default fallback
    return 'USD'
  }

  // Format currency based on user's locale
  formatCurrency(amount: number, options: { minimumFractionDigits?: number } = {}): string {
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: options.minimumFractionDigits ?? 0,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (error) {
      // Fallback to USD if currency is not supported
      console.warn(`Currency ${this.currency} not supported, falling back to USD`)
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: options.minimumFractionDigits ?? 0,
        maximumFractionDigits: 2
      }).format(amount)
    }
  }

  // Format date based on user's locale
  formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }
    
    try {
      return new Intl.DateTimeFormat(this.locale, defaultOptions).format(dateObj)
    } catch (error) {
      // Fallback to en-US if locale is not supported
      console.warn(`Locale ${this.locale} not supported for date formatting, falling back to en-US`)
      return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
    }
  }

  // Format short date (for compact displays)
  formatShortDate(date: Date | string): string {
    return this.formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format date with weekday (for plan dates)
  formatDateWithWeekday(date: Date | string): string {
    return this.formatDate(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format relative time (e.g., "2 days ago", "in 3 days")
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInMs = dateObj.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Tomorrow'
    if (diffInDays === -1) return 'Yesterday'
    if (diffInDays > 1) return `In ${diffInDays} days`
    if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`
    
    return this.formatShortDate(date)
  }

  // Format numbers based on locale
  formatNumber(number: number): string {
    try {
      return new Intl.NumberFormat(this.locale).format(number)
    } catch (error) {
      return new Intl.NumberFormat('en-US').format(number)
    }
  }

  // Get user's locale info
  getLocaleInfo() {
    return {
      locale: this.locale,
      currency: this.currency,
      language: this.locale.split('-')[0],
      country: this.locale.split('-')[1],
    }
  }

  // Format time based on locale
  formatTime(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      ...options
    }
    
    try {
      return new Intl.DateTimeFormat(this.locale, defaultOptions).format(dateObj)
    } catch (error) {
      return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
    }
  }

  // Format date and time together
  formatDateTime(date: Date | string): string {
    return this.formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }
}

// Create singleton instance
let localization = new LocalizationService()

// Function to update localization with user settings
export const updateLocalizationSettings = (settings: { locale?: string; currency?: string }) => {
  localization.updateSettings(settings)
}

// Export individual functions for easier use
export const formatCurrency = (amount: number, options?: { minimumFractionDigits?: number }) => 
  localization.formatCurrency(amount, options)

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => 
  localization.formatDate(date, options)

export const formatShortDate = (date: Date | string) => 
  localization.formatShortDate(date)

export const formatDateWithWeekday = (date: Date | string) => 
  localization.formatDateWithWeekday(date)

export const formatRelativeTime = (date: Date | string) => 
  localization.formatRelativeTime(date)

export const formatNumber = (number: number) => 
  localization.formatNumber(number)

export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => 
  localization.formatTime(date, options)

export const formatDateTime = (date: Date | string) => 
  localization.formatDateTime(date)

export const getLocaleInfo = () => 
  localization.getLocaleInfo()

// Export the class for direct use if needed
export { LocalizationService }