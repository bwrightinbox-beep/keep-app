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
        <Navigation />
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
        <Navigation />
        <div className="container">
          <div className="dashboard-header">
            <h1>Welcome Back!</h1>
            <p>You've already set up a profile for <strong>{formData.name}</strong>.</p>
          </div>

          <div className="dashboard-section">
            <div className="ai-suggestions">
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                  👥
                </div>
                <div className="ai-placeholder-content">
                  <h4>Profile Already Exists</h4>
                  <p>Would you like to edit the existing information or start fresh?</p>
                  <div className="welcome-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      className="nav-framer-button nav-framer-button-solid"
                      onClick={startEdit}
                    >
                      Edit {formData.name}'s Info
                    </button>
                    <button
                      className="nav-framer-button nav-framer-button-outline"
                      onClick={startFresh}
                    >
                      Start Over
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>{isEditMode ? 'Edit Profile' : 'Setup Your Person'}</h1>
          <p>Step {step} of 4 • {Math.round((step / 4) * 100)}% Complete</p>
        </div>

        {/* Step Progress Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Progress</h2>
          </div>
          <div className="stats-grid">
            {[
              { label: 'Basic Info', step: 1 },
              { label: 'Hobbies', step: 2 },
              { label: 'Dates', step: 3 },
              { label: 'Notes', step: 4 }
            ].map(({ label, step: stepNum }) => (
              <div key={stepNum} className={`stat-card ${stepNum <= step ? 'completed' : ''}`}>
                <div className="stat-icon" style={{
                  background: stepNum < step ? '#10b981' : stepNum === step ? 'black' : '#e5e7eb',
                  color: stepNum <= step ? 'white' : '#9ca3af'
                }}>
                  {stepNum < step ? '✓' : stepNum}
                </div>
                <div className="stat-content">
                  <div className="stat-label">{label}</div>
                  <div className="stat-number" style={{ fontSize: '0.875rem' }}>
                    {stepNum < step ? 'Complete' : stepNum === step ? 'Current' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Section */}
        <div className="dashboard-section">
          {step === 1 && (
            <>
              <div className="section-header">
                <h2>{isEditMode ? `Edit ${formData.name}'s Profile` : 'Tell Us About Your Person'}</h2>
                <p>{isEditMode
                  ? 'Update your partner\'s information below.'
                  : 'Let\'s create a profile so we can help you remember what matters most to them.'
                }</p>
              </div>
            
              <div className="form-group">
                <label htmlFor="person-name">What's your person's name? <span style={{color: 'red'}}>*</span></label>
                <input
                  id="person-name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter their name"
                  required
                />
                {!formData.name && (
                  <div className="error-message">
                    Name is required to continue
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="favorite-color">Favorite Color</label>
                  <input
                    id="favorite-color"
                    type="text"
                    className="form-input"
                    value={formData.favoriteColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, favoriteColor: e.target.value }))}
                    placeholder="e.g., Ocean Blue, Forest Green"
                  />
                  <p className="form-hint">💡 Great for gift ideas and decorating</p>
                </div>

                <div className="form-group">
                  <label htmlFor="favorite-food">Favorite Food</label>
                  <input
                    id="favorite-food"
                    type="text"
                    className="form-input"
                    value={formData.favoriteFood}
                    onChange={(e) => setFormData(prev => ({ ...prev, favoriteFood: e.target.value }))}
                    placeholder="e.g., Italian Pasta, Thai Curry"
                  />
                  <p className="form-hint">🍽️ Perfect for planning date nights</p>
                </div>
              </div>

              <div className="ai-suggestions" style={{marginTop: '20px'}}>
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    💡
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>Pro Tip</h4>
                    <p>The more details you add, the better we can help you plan thoughtful surprises and remember what makes them happy!</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="section-header">
                <h2>Favorite Hobbies & Interests</h2>
                <p>What does your person love doing in their free time? Select all that apply.</p>
              </div>
            
              <div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
                {FAVORITE_HOBBIES.map((hobby) => (
                  <label
                    key={hobby}
                    className={`stat-card ${formData.favoriteHobbies.includes(hobby) ? 'selected' : ''}`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: formData.favoriteHobbies.includes(hobby) ? '#f0f9ff' : 'white',
                      borderColor: formData.favoriteHobbies.includes(hobby) ? '#0066cc' : '#e5e7eb'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.favoriteHobbies.includes(hobby)}
                      onChange={() => handleHobbyToggle(hobby)}
                      style={{ display: 'none' }}
                    />
                    <div className="stat-content">
                      <div className="stat-label">{hobby}</div>
                      {formData.favoriteHobbies.includes(hobby) && (
                        <div className="stat-number" style={{ fontSize: '1.2rem' }}>✓</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <div className="ai-suggestions" style={{marginTop: '20px'}}>
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    💚
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>Great Choice!</h4>
                    <p>Selected {formData.favoriteHobbies.length} hobbies • Perfect for activity planning!</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="section-header">
                <h2>Important Dates</h2>
                <p>Add birthdays, anniversaries, and other special occasions so you never miss celebrating!</p>
              </div>

              {formData.importantDates.map((dateInfo, index) => (
                <div key={index} className="memory-card" style={{marginBottom: '16px'}}>
                  <div className="memory-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`date-${index}`}>Date</label>
                        <input
                          id={`date-${index}`}
                          type="date"
                          className="form-input"
                          value={dateInfo.date}
                          onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`occasion-${index}`}>What's the occasion?</label>
                        <input
                          id={`occasion-${index}`}
                          type="text"
                          className="form-input"
                          value={dateInfo.description}
                          onChange={(e) => handleDateChange(index, 'description', e.target.value)}
                          placeholder="e.g., Birthday, Anniversary, First Date"
                        />
                      </div>
                    </div>
                    <div style={{marginTop: '12px', display: 'flex', justifyContent: 'flex-end'}}>
                      <button
                        type="button"
                        onClick={() => removeDateField(index)}
                        className="nav-framer-button nav-framer-button-outline"
                        style={{background: '#fee2e2', color: '#dc2626', fontSize: '0.875rem'}}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <button
                  type="button"
                  onClick={addDateField}
                  className="nav-framer-button nav-framer-button-outline"
                >
                  ➕ Add Important Date
                </button>
              </div>

              <div className="ai-suggestions">
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    {formData.importantDates.length > 0 ? '🎉' : '💡'}
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>{formData.importantDates.length > 0 ? 'Great!' : 'Pro Tip'}</h4>
                    <p>{formData.importantDates.length > 0
                      ? "We'll remind you about these special dates"
                      : "Adding dates helps you never miss important celebrations"
                    }</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="section-header">
                <h2>Additional Notes</h2>
                <p>Add any other special details that help make your person feel truly understood.</p>
              </div>

              <div className="form-group">
                <label htmlFor="special-notes">Special Notes & Details</label>
                <textarea
                  id="special-notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., loves handwritten notes, prefers experiences over gifts, has a sweet tooth, allergic to seafood, enjoys surprise dates..."
                  rows={5}
                />
                <p className="form-hint">💡 Think about preferences, dislikes, allergies, or special details that make them unique</p>
              </div>

              <div className="ai-suggestions">
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: '#10b981' }}>
                    🎉
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>You're All Set!</h4>
                    <p>We'll use this information to help you remember what matters most and suggest thoughtful ways to show you care. You can always update these details anytime in settings.</p>
                  </div>
                </div>
              </div>

              <div className="ai-suggestions" style={{marginTop: '20px'}}>
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    ✨
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>Ready to Go!</h4>
                    <p>Ready to start building stronger relationships with Keeps!</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="dashboard-section">
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={step === 1 ? 'nav-framer-button nav-framer-button-outline' : 'nav-framer-button nav-framer-button-outline'}
              style={{ opacity: step === 1 ? 0.5 : 1 }}
            >
              {step !== 1 && '← Previous'}
            </button>

            {step < 4 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !formData.name.trim()}
                className="nav-framer-button nav-framer-button-solid"
                style={{ opacity: (step === 1 && !formData.name.trim()) ? 0.5 : 1 }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="nav-framer-button nav-framer-button-solid"
                style={{ background: '#10b981' }}
              >
                🎉 Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}