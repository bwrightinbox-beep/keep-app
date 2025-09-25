'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import QuickMemoryModal from '@/components/QuickMemoryModal'
import ModernLoading from '@/components/ui/ModernLoading'
import { useAuth } from '@/lib/auth-context'
import { dataService, type Memory, type PartnerProfile } from '@/lib/data-service'
import { formatShortDate } from '@/lib/localization'
import { generateAISuggestions, getCurrentLocation } from '@/lib/ai-suggestions'
import { Plus, Calendar, Heart, Star, TrendingUp, Sparkles, RefreshCw, Brain } from 'lucide-react'

interface PlanSuggestion {
  title: string
  description: string
  budgetMin: number
  budgetMax: number
  durationMinutes: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  steps: string[]
  tags: string[]
  reasoning: string
  confidence: number
}

export default function DashboardPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isQuickMemoryModalOpen, setIsQuickMemoryModalOpen] = useState(false)
  const [totalMemoriesCount, setTotalMemoriesCount] = useState(0)
  const [totalPlansCount, setTotalPlansCount] = useState(0)

  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<PlanSuggestion[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [allMemories, setAllMemories] = useState<Memory[]>([])

  const { user } = useAuth()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [memoriesData, plansData, profileData] = await Promise.all([
          dataService.getMemories(user?.id || null),
          dataService.getPlans(user?.id || null),
          dataService.getPartnerProfile(user?.id || null)
        ])

        // Set total counts for "At a Glance" section
        setTotalMemoriesCount(memoriesData?.length || 0)
        setTotalPlansCount(plansData?.length || 0)

        // Set limited data for Recent sections
        setMemories(memoriesData?.slice(0, 3) || [])
        setPlans(plansData?.slice(0, 3) || [])
        setProfile(profileData)

        // Store all memories for AI functionality
        setAllMemories(memoriesData || [])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const getUpcomingDates = () => {
    if (!profile?.importantDates) return []
    
    const today = new Date()
    const currentYear = today.getFullYear()
    
    return profile.importantDates
      .map(dateInfo => {
        const date = new Date(dateInfo.date)
        const thisYear = new Date(currentYear, date.getMonth(), date.getDate())
        const nextYear = new Date(currentYear + 1, date.getMonth(), date.getDate())
        
        const targetDate = thisYear >= today ? thisYear : nextYear
        const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        return {
          ...dateInfo,
          targetDate,
          daysUntil
        }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3)
  }

  const upcomingDates = getUpcomingDates()

  const handleQuickMemoryOpen = () => {
    setIsQuickMemoryModalOpen(true)
  }

  const handleQuickMemoryClose = () => {
    setIsQuickMemoryModalOpen(false)
  }

  const handleQuickMemorySave = (newMemory: Memory) => {
    setMemories(prevMemories => [newMemory, ...prevMemories.slice(0, 1)])
    setTotalMemoriesCount(prevCount => prevCount + 1)
    // Update all memories for AI functionality
    setAllMemories(prevMemories => [newMemory, ...prevMemories])
  }

  // AI Suggestion functions
  const generateAIPlans = async () => {
    if (!profile) {
      alert('Please set up your partner\'s profile first! Visit the "My Person" page to complete the profile setup.')
      return
    }

    if (allMemories.length < 7) {
      alert(`You need at least 7 memories to generate AI suggestions. You currently have ${allMemories.length} memories. Add ${7 - allMemories.length} more memories to unlock this feature!`)
      return
    }

    setIsGeneratingAI(true)

    try {
      // Get user location for local suggestions
      const location = await getCurrentLocation()

      // Generate AI suggestions using enhanced algorithm
      const suggestions = await generateAISuggestions(allMemories, profile, location || undefined)

      if (suggestions.length > 0) {
        setAiSuggestions(suggestions)
      } else {
        alert('Unable to generate AI suggestions at this time. Please try again later or check your OpenAI API key configuration.')
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate AI suggestions. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <ModernLoading text="Loading your dashboard" size="md" />
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your relationships.</p>
        </div>

        {/* Welcome Message for New Users */}
        {memories.length === 0 && plans.length === 0 && !profile && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Welcome to Keeps!</h2>
            </div>
            <div className="ai-suggestions">
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                  <Heart size={20} />
                </div>
                <div className="ai-placeholder-content">
                  <h4>Get Started</h4>
                  <p>Get started by setting up your person's profile and adding your first memory or plan.</p>
                  <div className="welcome-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <Link href="/onboarding" className="nav-framer-button nav-framer-button-solid">
                      Set Up Profile
                    </Link>
                    <Link href="/memories" className="nav-framer-button nav-framer-button-outline">
                      Add First Memory
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Side by Side: At a Glance and Quick Memory */}
        <div className="dashboard-grid">
          {/* Stats Overview */}
          <div className="dashboard-section">
            <h2>At a Glance</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'black' }}>
                  <Heart size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{totalMemoriesCount}</div>
                  <div className="stat-label">Total Memories</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'black' }}>
                  <Calendar size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{totalPlansCount}</div>
                  <div className="stat-label">Total Plans</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'black' }}>
                  <Star size={20} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{upcomingDates.length}</div>
                  <div className="stat-label">Upcoming Dates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Memory */}
          <div className="dashboard-section">
            <h2>Quick Memory</h2>
            <div className="quick-memory-section">
              <button className="quick-memory-button" onClick={handleQuickMemoryOpen}>
                <div className="quick-memory-icon" style={{ background: 'black' }}>
                  <Plus size={24} />
                </div>
                <div className="quick-memory-content">
                  <h3>Add Memory</h3>
                  <p>Quickly capture a special moment</p>
                </div>
              </button>
            </div>
          </div>
        </div>


        {/* Side by Side: Recent Memories and Recent Plans */}
        <div className="dashboard-grid">
          {/* Recent Memories */}
          {memories.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Memories</h2>
                <Link href="/memories" className="nav-framer-button nav-framer-button-solid">
                  View All
                </Link>
              </div>
              <div className="memories-preview-half">
                {memories.map((memory) => (
                  <div key={memory.id} className="memory-card">
                    <div className="memory-content">
                      <h4>{memory.title}</h4>
                      {memory.description && (
                        <p>{memory.description.substring(0, 100)}{memory.description.length > 100 ? '...' : ''}</p>
                      )}
                      <div className="memory-meta">
                        {memory.category && (
                          <span className="memory-category">{memory.category}</span>
                        )}
                        <span className="memory-rating">
                          {'⭐'.repeat(memory.rating || 3)}
                        </span>
                        <span className="memory-date">
                          {formatShortDate(memory.date || memory.created_at || new Date())}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Plans */}
          {plans.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Plans</h2>
                <Link href="/plans" className="nav-framer-button nav-framer-button-solid">
                  View All
                </Link>
              </div>
              <div className="plans-preview-half">
                {plans.map((plan) => (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-content">
                      <h4>{plan.title}</h4>
                      {plan.description && (
                        <p>{plan.description.substring(0, 100)}{plan.description.length > 100 ? '...' : ''}</p>
                      )}
                      <div className="plan-meta">
                        {plan.category && (
                          <span className="plan-category">{plan.category}</span>
                        )}
                        {plan.date && (
                          <span className="plan-date">
                            {formatShortDate(plan.date)}
                          </span>
                        )}
                        <span className={`plan-status status-${plan.status || 'planned'}`}>
                          {plan.status || 'planned'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side by Side: AI Suggestions and Important Dates */}
        <div className="dashboard-grid">
          {/* AI Suggestions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>AI Suggestions</h2>
              <button
                className="nav-framer-button nav-framer-button-solid"
                onClick={generateAIPlans}
                disabled={isGeneratingAI || allMemories.length < 7}
                style={{
                  opacity: allMemories.length < 7 ? 0.7 : 1,
                  cursor: allMemories.length < 7 || isGeneratingAI ? 'not-allowed' : 'pointer'
                }}
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" style={{ marginRight: '8px' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} style={{ marginRight: '8px' }} />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>

            <div className="ai-suggestions">
              {aiSuggestions.length > 0 ? (
                <div className="suggestions-list">
                  {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="suggestion-card">
                      <div className="suggestion-header">
                        <h4>{suggestion.title}</h4>
                        <div className="suggestion-confidence">
                          {suggestion.confidence}% match
                        </div>
                      </div>
                      <p className="suggestion-description">
                        {suggestion.description.substring(0, 120)}
                        {suggestion.description.length > 120 ? '...' : ''}
                      </p>
                      <div className="suggestion-meta">
                        <span className="suggestion-difficulty">{suggestion.difficulty}</span>
                        <span className="suggestion-duration">{Math.round(suggestion.durationMinutes / 60)}h</span>
                        <span className="suggestion-budget">${suggestion.budgetMin}-${suggestion.budgetMax}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link href="/plans" className="nav-framer-button nav-framer-button-outline">
                      View All Suggestions
                    </Link>
                  </div>
                </div>
              ) : allMemories.length < 7 ? (
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    <Brain size={20} />
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>Build Your Memory Collection</h4>
                    <p>Add at least 7 memories to unlock AI-powered plan suggestions. Progress: {allMemories.length}/7 memories</p>
                    <div className="memory-progress" style={{ margin: '12px 0', width: '100%' }}>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: '#f3f4f6',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min((allMemories.length / 7) * 100, 100)}%`,
                          height: '100%',
                          background: 'black',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                    <button
                      onClick={handleQuickMemoryOpen}
                      className="nav-framer-button nav-framer-button-outline"
                      style={{ marginTop: '12px' }}
                    >
                      Add Memory
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                    <Sparkles size={20} />
                  </div>
                  <div className="ai-placeholder-content">
                    <h4>Ready for AI Suggestions!</h4>
                    <p>You have {allMemories.length} memories. Click "Generate Ideas" to create personalized plan suggestions based on your memories.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Dates */}
          {upcomingDates.length > 0 && (
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Important Dates</h2>
                <Link href="/settings?tab=person" className="btn btn-secondary">
                  Manage Dates
                </Link>
              </div>
              <div className="upcoming-dates">
                {upcomingDates.map((dateInfo, index) => (
                  <div key={index} className="date-card">
                    <div className="date-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                    <div className="date-content">
                      <h4>{dateInfo.description}</h4>
                      <p>{formatShortDate(dateInfo.date)}</p>
                      <span className="days-until">
                        {dateInfo.daysUntil === 0 ? 'Today!' : 
                         dateInfo.daysUntil === 1 ? 'Tomorrow' : 
                         `${dateInfo.daysUntil} days away`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Memory Modal */}
        <QuickMemoryModal
          isOpen={isQuickMemoryModalOpen}
          onClose={handleQuickMemoryClose}
          onSave={handleQuickMemorySave}
        />
      </div>
    </div>
  )
}