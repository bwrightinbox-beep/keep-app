'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, User, Bell, Globe, Clock, Mail, Shield } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/data-service'
import { updateLocalizationSettings, formatCurrency } from '@/lib/localization'
import type { AppSettings, PartnerProfile } from '@/lib/data-service'


const TIMEZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
]

const LOCALES = [
  { value: 'auto', label: 'Auto-detect from browser' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'en-CA', label: 'English (Canada)' },
  { value: 'en-AU', label: 'English (Australia)' },
  { value: 'zh-CN', label: '中文 (简体)' },
  { value: 'zh-TW', label: '中文 (繁體)' },
  { value: 'ja-JP', label: '日本語' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'es-ES', label: 'Español' },
  { value: 'it-IT', label: 'Italiano' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'hi-IN', label: 'हिन्दी' },
]

const CURRENCIES = [
  { value: 'auto', label: 'Auto-detect from locale' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'CNY', label: 'Chinese Yuan (¥)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'KRW', label: 'Korean Won (₩)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'BRL', label: 'Brazilian Real (R$)' },
  { value: 'RUB', label: 'Russian Ruble (₽)' },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    privacy: 'private',
    userName: ''
  })
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)

  const [activeSection, setActiveSection] = useState<'profile' | 'myperson' | 'notifications' | 'preferences' | 'privacy'>('profile')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load settings from Supabase
  useEffect(() => {
    if (!mounted) return
    
    const loadSettings = async () => {
      try {
        // Load data regardless of authentication status (uses localStorage fallback)
        const userId = user?.id || null

        // Load app settings
        const appSettings = await dataService.getAppSettings(userId)
        if (appSettings) {
          setSettings(appSettings)
          // Apply localization settings
          updateLocalizationSettings({
            locale: appSettings.locale,
            currency: appSettings.currency
          })
        }
        
        // Load partner profile
        const profile = await dataService.getPartnerProfile(userId)
        console.log('[Settings] Loaded partner profile:', profile)
        // Ensure we always have a valid profile object
        setPartnerProfile(profile || {
          name: '',
          favoriteColor: '',
          favoriteFood: '',
          favoriteHobbies: [],
          importantDates: [],
          notes: '',
          birthday: '',
          anniversary: ''
        })
        
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user, mounted])

  // Save settings to Supabase
  const saveSettings = async () => {
    try {
      const userId = user?.id || null
      console.log('[Settings] Saving settings for user:', userId)
      console.log('[Settings] Current settings:', settings)
      console.log('[Settings] Current partner profile:', partnerProfile)
      
      await dataService.saveAppSettings(userId, settings)
      
      // Always try to save partner profile if it has any data
      if (partnerProfile && (partnerProfile.name || partnerProfile.favoriteColor || partnerProfile.favoriteFood || partnerProfile.birthday || partnerProfile.anniversary)) {
        console.log('[Settings] Saving partner profile:', partnerProfile)
        const savedProfile = await dataService.savePartnerProfile(userId, partnerProfile)
        console.log('[Settings] Partner profile saved result:', savedProfile)
      } else {
        console.log('[Settings] No partner profile data to save')
      }
      
      setHasUnsavedChanges(false)
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    }
  }

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
    
    // Update localization immediately
    if (key === 'locale' || key === 'currency') {
      const newSettings = { ...settings, [key]: value }
      updateLocalizationSettings({
        locale: newSettings.locale,
        currency: newSettings.currency
      })
    }
  }

  const updatePartnerProfile = (key: keyof PartnerProfile, value: any) => {
    console.log('[Settings] Updating partner profile:', key, '=', value)
    setPartnerProfile(prev => {
      // Always ensure we have a valid profile object
      const baseProfile = {
        name: '',
        favoriteColor: '',
        favoriteFood: '',
        favoriteHobbies: [],
        importantDates: [],
        notes: '',
        birthday: '',
        anniversary: ''
      }
      const newProfile = prev ? ({ ...prev, [key]: value }) : ({ ...baseProfile, [key]: value })
      console.log('[Settings] New partner profile state:', newProfile)
      return newProfile
    })
    setHasUnsavedChanges(true)
  }

  const exportData = async () => {
    if (!user) return
    
    try {
      const memories = await dataService.getMemories(user.id)
      const plans = await dataService.getPlans(user.id)
      const appSettings = await dataService.getAppSettings(user.id)
      
      const exportData = {
        exportDate: new Date().toISOString(),
        memories,
        partnerProfile,
        plans,
        settings: appSettings
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `little-things-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error exporting data. Please try again.')
    }
  }

  const clearAllData = async () => {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.') && user) {
      try {
        // This would need additional database functions to clear all user data
        alert('Data clearing functionality coming soon. For now, please contact support.')
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('Error clearing data. Please try again.')
      }
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="card">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      {/* Navigation */}
      <div>
        <Navigation />
      </div>
      
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-content">
            <h1>
              Settings
            </h1>
            <p>
              Customize your Little Things experience
            </p>
          </div>
        </div>

        <div className="settings-main">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'myperson', label: 'My Person', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'preferences', label: 'Preferences', icon: Globe },
                { id: 'privacy', label: 'Privacy & Data', icon: Shield }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`settings-nav-button ${activeSection === id ? 'active' : ''}`}
                  onClick={() => setActiveSection(id as any)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="settings-content">

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <User size={24} />
                  <h2>Profile Information</h2>
                </div>
                
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={settings.userName || ''}
                      onChange={(e) => updateSetting('userName', e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Account Email
                    </label>
                    <input
                      type="text"
                      value={user?.email || 'Not signed in'}
                      disabled
                      readOnly
                    />
                    <p className="settings-field-description">
                      Your account email address
                    </p>
                  </div>

                  <div className="settings-field">
                    <label>
                      Plan Type
                    </label>
                    <input
                      type="text"
                      value="Free Plan"
                      disabled
                      readOnly
                    />
                    <p className="settings-field-description">
                      AI planning features will be available with paid plans
                    </p>
                  </div>

                  <div className="settings-info-box">
                    <p>
                      <strong>Tip:</strong> Your person's information can be managed in the "My Person" section, and important dates are handled in the onboarding flow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* My Person Section */}
            {activeSection === 'myperson' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <User size={24} />
                  <h2>My Person</h2>
                </div>
                
                <div className="settings-section-content">
                  <div className="settings-field">
                    <label>
                      Their Name
                    </label>
                    <input
                      type="text"
                      value={partnerProfile?.name || ''}
                      onChange={(e) => updatePartnerProfile('name', e.target.value)}
                      placeholder="Enter their name"
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={partnerProfile?.birthday || ''}
                      onChange={(e) => updatePartnerProfile('birthday', e.target.value)}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Anniversary
                    </label>
                    <input
                      type="date"
                      value={partnerProfile?.anniversary || ''}
                      onChange={(e) => updatePartnerProfile('anniversary', e.target.value)}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Favorite Color
                    </label>
                    <input
                      type="text"
                      value={partnerProfile?.favoriteColor || ''}
                      onChange={(e) => updatePartnerProfile('favoriteColor', e.target.value)}
                      placeholder="Their favorite color"
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Favorite Food
                    </label>
                    <input
                      type="text"
                      value={partnerProfile?.favoriteFood || ''}
                      onChange={(e) => updatePartnerProfile('favoriteFood', e.target.value)}
                      placeholder="Their favorite food or restaurant"
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Hobbies & Interests
                    </label>
                    <textarea
                      value={partnerProfile?.favoriteHobbies?.join(', ') || ''}
                      onChange={(e) => updatePartnerProfile('favoriteHobbies', e.target.value.split(', ').filter(h => h.trim()))}
                      placeholder="Their hobbies and interests (comma-separated)"
                      rows={3}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Special Notes
                    </label>
                    <textarea
                      value={partnerProfile?.notes || ''}
                      onChange={(e) => updatePartnerProfile('notes', e.target.value)}
                      placeholder="Any other important details, preferences, or notes about your person..."
                      rows={4}
                    />
                  </div>

                  <div className="settings-info-box">
                    <p>
                      <strong>Tip:</strong> The more details you add here, the better Little Things can help you plan personalized experiences and remember what matters most to your person.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <Bell size={24} />
                  <h2>Notification Preferences</h2>
                </div>

                <div className="settings-section-content">
                  <div className="settings-field">
                    <label>
                      General Notifications
                    </label>
                    <div className="settings-toggle">
                      <div className="settings-toggle-content">
                        <p>
                          Enable or disable all app notifications
                        </p>
                      </div>
                      <label className="settings-toggle-switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications}
                          onChange={(e) => updateSetting('notifications', e.target.checked)}
                        />
                        <span className="settings-toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-info-box">
                    <p>
                      <strong>Coming Soon:</strong> Advanced notification features like daily prompts, weekly check-ins, and date reminders will be available in future updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <Globe size={24} />
                  <h2>App Preferences</h2>
                </div>

                <div className="settings-section-content">

                  <div className="settings-field">
                    <label>
                      Language & Region
                    </label>
                    <select
                      value={settings.locale || 'auto'}
                      onChange={(e) => updateSetting('locale', e.target.value)}
                    >
                      {LOCALES.map(locale => (
                        <option key={locale.value} value={locale.value}>
                          {locale.label}
                        </option>
                      ))}
                    </select>
                    <p className="settings-field-description">
                      Choose your preferred language and date format
                    </p>
                  </div>

                  <div className="settings-field">
                    <label>
                      Currency
                    </label>
                    <select
                      value={settings.currency || 'auto'}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                    >
                      {CURRENCIES.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                    <p className="settings-field-description">
                      Choose your preferred currency for budgets and costs
                    </p>
                  </div>

                  <div className="settings-currency-preview">
                    <h4>
                      Preview
                    </h4>
                    <p>
                      Sample budget: {formatCurrency(50)} - {formatCurrency(100)}
                    </p>
                  </div>
                  
                  <div className="settings-info-box">
                    <p>
                      <strong>Coming Soon:</strong> Timezone settings and quiet hours will be added in future updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="settings-section">
                <div className="settings-section-header">
                  <Shield size={24} />
                  <h2>Privacy & Data</h2>
                </div>

                <div className="settings-section-content">
                  <div className="settings-field">
                    <label>
                      Privacy Setting
                    </label>
                    <select
                      value={settings.privacy}
                      onChange={(e) => updateSetting('privacy', e.target.value as 'public' | 'private')}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                    <p className="settings-field-description">
                      Control who can see your data
                    </p>
                  </div>

                  <div className="settings-field">
                    <label>
                      Data Storage
                    </label>
                    <p className="settings-field-description">
                      Your data is currently stored locally in your browser. This means it's private to you, but won't sync across devices.
                      When database authentication is enabled, you'll be able to sync your data securely.
                    </p>
                    <div className="settings-actions">
                      <button
                        className="settings-button settings-button-secondary"
                        onClick={exportData}
                      >
                        Export My Data
                      </button>
                      <button
                        className="settings-button settings-button-danger"
                        onClick={clearAllData}
                      >
                        Clear All Data
                      </button>
                    </div>
                  </div>

                  <div className="settings-info-box">
                    <p>
                      <strong>Your Privacy Matters:</strong> Little Things is designed to keep your relationship data private and secure. 
                      We never sell or share your personal information with third parties.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <button
          className="settings-floating-save"
          onClick={saveSettings}
        >
          Save Changes
        </button>
      )}
    </div>
  )
}