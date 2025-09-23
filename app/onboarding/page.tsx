'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/data-service'
import type { PartnerProfile } from '@/lib/data-service'

const FAVORITE_HOBBIES = [
  'Reading',
  'Movies/TV',
  'Music',
  'Cooking',
  'Sports',
  'Gaming',
  'Art/Crafts',
  'Travel',
  'Outdoor Activities',
  'Photography'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showEditPrompt, setShowEditPrompt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    favoriteColor: '',
    favoriteFood: '',
    favoriteHobbies: [] as string[],
    importantDates: [] as Array<{ date: string; description: string }>,
    notes: ''
  })
  const [isMobile, setIsMobile] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Check if profile already exists when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const existingProfile = await dataService.getPartnerProfile(user.id)
        if (existingProfile && existingProfile.name && existingProfile.name.trim()) {
          setShowEditPrompt(true)
          setFormData({
            name: existingProfile.name || '',
            favoriteColor: existingProfile.favoriteColor || '',
            favoriteFood: existingProfile.favoriteFood || '',
            favoriteHobbies: existingProfile.favoriteHobbies || [] as string[],
            importantDates: existingProfile.importantDates || [] as Array<{ date: string; description: string }>,
            notes: existingProfile.notes || ''
          })
        }
      } catch (error) {
        console.error('Error loading partner profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleHobbyToggle = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteHobbies: prev.favoriteHobbies.includes(hobby)
        ? prev.favoriteHobbies.filter(h => h !== hobby)
        : [...prev.favoriteHobbies, hobby]
    }))
  }

  const handleDateChange = (index: number, field: 'date' | 'description', value: string) => {
    const newDates = [...formData.importantDates]
    if (!newDates[index]) {
      newDates[index] = { date: '', description: '' }
    }
    newDates[index][field] = value
    setFormData(prev => ({ ...prev, importantDates: newDates }))
  }

  const addDateField = () => {
    setFormData(prev => ({
      ...prev,
      importantDates: [...prev.importantDates, { date: '', description: '' }]
    }))
  }

  const removeDateField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      importantDates: prev.importantDates.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    try {
      await dataService.savePartnerProfile(user?.id || null, formData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving partner profile:', error)
      alert('Error saving profile. Please try again.')
    }
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const startEdit = () => {
    setIsEditMode(true)
    setShowEditPrompt(false)
  }

  const startFresh = () => {
    setFormData({
      name: '',
      favoriteColor: '',
      favoriteFood: '',
      favoriteHobbies: [],
      importantDates: [],
      notes: ''
    })
    setStep(1)
    setIsEditMode(false)
    setShowEditPrompt(false)
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show edit prompt if profile already exists
  if (showEditPrompt) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <h1>
              Welcome Back!
            </h1>
            <p>
              You've already set up a profile for <strong>{formData.name}</strong>.
              Would you like to edit the existing information or start fresh?
            </p>
          
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
              <button
                className="btn btn-primary"
                onClick={startEdit}
              >
                Edit {formData.name}'s Info
              </button>
              <button
                className="btn btn-secondary"
                onClick={startFresh}
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      
      <div>
        <div>
          <div>
            <h2>
              {isEditMode ? 'Edit Profile' : 'Setup Your Person'}
            </h2>
            <p>
              Step {step} of 4 • {Math.round((step / 4) * 100)}% Complete
            </p>
          </div>
          <Link href="/dashboard">
            <button
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}>
              ← Dashboard
            </button>
          </Link>
        </div>

        <div>
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber}>
              <div>
                {stepNumber < step ? '✓' : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div />
              )}
            </div>
          ))}
        </div>

        <div>
          {[
            { label: 'Basic Info', step: 1 },
            { label: 'Hobbies', step: 2 },
            { label: 'Dates', step: 3 },
            { label: 'Notes', step: 4 }
          ].map(({ label, step: stepNum }) => (
            <div key={stepNum}>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div>
        
        {step === 1 && (
          <div>
            <div>
              <div>👥</div>
              <h1>
                {isEditMode ? `Edit ${formData.name}'s Profile` : 'Tell Us About Your Person'}
              </h1>
              <p>
                {isEditMode 
                  ? 'Update your partner\'s information below.'
                  : 'Let\'s create a profile so we can help you remember what matters most to them.'
                }
              </p>
            </div>
            
            <div>
              <label>
                What's your person's name? <span>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter their name"
                onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                onBlur={(e) => e.target.style.borderColor = formData.name ? '#10b981' : '#d1d5db'}
              />
              {!formData.name && (
                <p>
                  Name is required to continue
                </p>
              )}
            </div>

            <div>
              <div>
                <label>
                  Favorite Color
                </label>
                <input
                  type="text"
                  value={formData.favoriteColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteColor: e.target.value }))}
                  placeholder="e.g., Ocean Blue, Forest Green"
                  onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <p>
                  💡 Great for gift ideas and decorating
                </p>
              </div>
              
              <div>
                <label>
                  Favorite Food
                </label>
                <input
                  type="text"
                  value={formData.favoriteFood}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteFood: e.target.value }))}
                  placeholder="e.g., Italian Pasta, Thai Curry"
                  onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <p>
                  🍽️ Perfect for planning date nights
                </p>
              </div>
            </div>

            <div>
              <h4>
                💡 Pro Tip
              </h4>
              <p>
                The more details you add, the better we can help you plan thoughtful surprises and remember what makes them happy!
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div>
              <div>🎯</div>
              <h2>
                Favorite Hobbies & Interests
              </h2>
              <p>
                What does your person love doing in their free time? Select all that apply.
              </p>
            </div>
            
            <div>
              {FAVORITE_HOBBIES.map((hobby) => (
                <label 
                  key={hobby}
                  onMouseEnter={(e) => {
                    if (!formData.favoriteHobbies.includes(hobby)) {
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                      e.currentTarget.style.borderColor = '#9ca3af'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!formData.favoriteHobbies.includes(hobby)) {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.favoriteHobbies.includes(hobby)}
                    onChange={() => handleHobbyToggle(hobby)}
                  />
                  <span>
                    {hobby}
                  </span>
                  {formData.favoriteHobbies.includes(hobby) && (
                    <span>
                      ✓
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div>
              <p>
                💚 Selected {formData.favoriteHobbies.length} hobbies • Perfect for activity planning!
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div>
              <div>📅</div>
              <h2>
                Important Dates
              </h2>
              <p>
                Add birthdays, anniversaries, and other special occasions so you never miss celebrating!
              </p>
            </div>
            
            <div>
              {formData.importantDates.map((dateInfo, index) => (
                <div key={index}>
                  <div>
                    <div>
                      <label>
                        Date
                      </label>
                      <input
                        type="date"
                        value={dateInfo.date}
                        onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>
                        What's the occasion?
                      </label>
                      <input
                        type="text"
                        value={dateInfo.description}
                        onChange={(e) => handleDateChange(index, 'description', e.target.value)}
                        placeholder="e.g., Birthday, Anniversary, First Date"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDateField(index)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addDateField}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff'
                  e.currentTarget.style.borderColor = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#0066cc'
                }}
              >
                ➕ Add Important Date
              </button>
            </div>

            {formData.importantDates.length > 0 ? (
              <div>
                <p>
                  🎉 Great! We'll remind you about these special dates
                </p>
              </div>
            ) : (
              <div>
                <p>
                  💡 Adding dates helps you never miss important celebrations
                </p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <div>
              <div>📝</div>
              <h2>
                Additional Notes
              </h2>
              <p>
                Add any other special details that help make your person feel truly understood.
              </p>
            </div>
            
            <div>
              <label>
                Special Notes & Details
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="e.g., loves handwritten notes, prefers experiences over gifts, has a sweet tooth, allergic to seafood, enjoys surprise dates..."
                rows={5}
                onFocus={(e) => e.target.style.borderColor = '#0066cc'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <p>
                💡 Think about preferences, dislikes, allergies, or special details that make them unique
              </p>
            </div>

            <div>
              <div>🎉</div>
              <h3>
                You're All Set!
              </h3>
              <p>
                We'll use this information to help you remember what matters most and suggest thoughtful ways to show you care. 
                You can always update these details anytime in settings.
              </p>
            </div>

            <div>
              <p>
                ✨ Ready to start building stronger relationships with Little Things!
              </p>
            </div>
          </div>
        )}

        <div>
          <button
            onClick={prevStep}
            disabled={step === 1}
            onMouseEnter={(e) => {
              if (step !== 1) {
                e.currentTarget.style.backgroundColor = '#f9fafb'
                e.currentTarget.style.borderColor = '#9ca3af'
              }
            }}
            onMouseLeave={(e) => {
              if (step !== 1) {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }
            }}
          >
            {step !== 1 && (
              <>
                ← Previous
              </>
            )}
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={step === 1 && !formData.name.trim()}
              onMouseEnter={(e) => {
                if (!(step === 1 && !formData.name.trim())) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!(step === 1 && !formData.name.trim())) {
                  e.currentTarget.style.backgroundColor = '#0066cc'
                  e.currentTarget.style.transform = 'translateY(0px)'
                }
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              🎉 Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}