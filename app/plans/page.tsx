'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, MapPin, Brain, RefreshCw, Plus, Calendar } from 'lucide-react'
import Navigation from '@/components/Navigation'
import CustomPlanModal from '@/components/CustomPlanModal'
import ModernLoading from '@/components/ui/ModernLoading'
import { useAuth } from '@/lib/auth-context'
import { dataService } from '@/lib/data-service'
import { formatCurrency, formatShortDate } from '@/lib/localization'
import type { Plan, Memory, PartnerProfile } from '@/lib/data-service'


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


export default function PlansPage() {
  const [savedPlans, setSavedPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCustomPlanModalOpen, setIsCustomPlanModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  
  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<PlanSuggestion[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [userLocation, setUserLocation] = useState<string | null>(null)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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

  // Load saved plans and memories from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data regardless of authentication status (uses localStorage fallback)
        const userId = user?.id || null

        // Load plans
        const plansData = await dataService.getPlans(userId)
        setSavedPlans(plansData)
        
        // Load memories for AI suggestions
        const memoriesData = await dataService.getMemories(userId)
        setMemories(memoriesData)
        
        // Load partner profile
        const profileData = await dataService.getPartnerProfile(userId)
        setPartnerProfile(profileData)
        
      } catch (error) {
        console.error('Error loading plans data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])


  const handleCustomPlanSave = (updatedPlan: Plan) => {
    if (editingPlan) {
      // Update existing plan
      setSavedPlans(savedPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      ))
    } else {
      // Add new plan
      setSavedPlans([updatedPlan, ...savedPlans])
    }
    setEditingPlan(null)
  }

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setIsCustomPlanModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsCustomPlanModalOpen(false)
    setEditingPlan(null)
  }

  const schedulePlan = async (planId: string, scheduledDate: string) => {
    const updatedPlan = await dataService.updatePlan(user?.id || null, planId, { date: scheduledDate })
    if (updatedPlan) {
      setSavedPlans(savedPlans.map(plan => 
        plan.id === planId ? updatedPlan : plan
      ))
    }
  }

  const deletePlan = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      const success = await dataService.deletePlan(user?.id || null, id)
      if (success) {
        setSavedPlans(savedPlans.filter(plan => plan.id !== id))
      }
    }
  }

  // AI Suggestion functions
  const generateAIPlans = async () => {
    if (!partnerProfile || memories.length === 0) {
      alert('You need memories and a partner profile to generate AI suggestions! Visit the "My Person" page to set up a profile and add some memories first.')
      return
    }

    alert('AI suggestions feature coming soon! For now, try the template plans below.')
  }

  const saveAISuggestion = async (suggestion: PlanSuggestion) => {
    const newPlanData = {
      title: suggestion.title,
      description: suggestion.description,
      date: new Date().toISOString(),
      category: suggestion.tags[0] || 'ai-suggested',
      priority: suggestion.difficulty === 'Easy' ? 'low' : suggestion.difficulty === 'Hard' ? 'high' : 'medium' as 'low' | 'medium' | 'high',
      completed: false
    }
    
    const savedPlan = await dataService.savePlan(user?.id || null, newPlanData)
    if (savedPlan) {
      setSavedPlans([savedPlan, ...savedPlans])
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <ModernLoading text="Loading your plans" size="md" />
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Thoughtful Plans</h1>
          <p>Create meaningful gestures and memorable experiences that strengthen your relationships</p>
        </div>

        {/* Action Buttons */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="stats-grid">
            <button 
              onClick={generateAIPlans}
              disabled={isGeneratingAI || memories.length === 0}
              className="stat-card"
              style={{ cursor: isGeneratingAI || memories.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              <div className="stat-icon" style={{ background: 'black' }}>
                {isGeneratingAI ? <RefreshCw size={20} /> : <Sparkles size={20} />}
              </div>
              <div className="stat-content">
                <div className="stat-label">{isGeneratingAI ? 'Generating...' : 'AI Suggestions'}</div>
                <div className="stat-number" style={{ fontSize: '0.875rem' }}>
                  {memories.length === 0 ? 'Add memories first' : 'Get personalized ideas'}
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setIsCustomPlanModalOpen(true)}
              className="stat-card"
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon" style={{ background: 'black' }}>
                <Plus size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Create Custom Plan</div>
                <div className="stat-number" style={{ fontSize: '0.875rem' }}>
                  Design your own plan
                </div>
              </div>
            </button>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'black' }}>
                <Calendar size={20} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{savedPlans.length}</div>
                <div className="stat-label">Saved Plans</div>
              </div>
            </div>
          </div>
        </div>



        {/* AI Suggestions Section */}
        {showAISuggestions && aiSuggestions.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <Sparkles size={20} />
                AI-Powered Suggestions
              </h2>
              <div className="section-header-actions">
                <span className="results-count">
                  <Brain size={14} />
                  Based on {memories.length} memories
                  {userLocation && (
                    <>
                      <MapPin size={12} />
                      {userLocation}
                    </>
                  )}
                </span>
                <button
                  onClick={() => setShowAISuggestions(false)}
                  className="btn btn-secondary"
                >
                  Hide AI Suggestions
                </button>
              </div>
            </div>
            
            <div className="memories-preview">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="memory-card">
                  <div className="memory-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4>{suggestion.title}</h4>
                      <span className="memory-rating">{suggestion.confidence}% Match</span>
                    </div>
                    
                    <p>{suggestion.description}</p>
                    
                    <div className="memory-meta">
                      <span className="memory-category">💰 {formatCurrency(suggestion.budgetMin)}-{formatCurrency(suggestion.budgetMax)}</span>
                      <span className="memory-category">⏱️ {suggestion.durationMinutes}min</span>
                      <span className="memory-category">{suggestion.difficulty}</span>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Why this works:</h5>
                      <p style={{ fontSize: '0.875rem' }}>{suggestion.reasoning}</p>
                    </div>

                    <div style={{ marginTop: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Steps:</h5>
                      <ol style={{ fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
                        {suggestion.steps.slice(0, 3).map((step, stepIndex) => (
                          <li key={stepIndex} style={{ marginBottom: '0.25rem' }}>{step}</li>
                        ))}
                        {suggestion.steps.length > 3 && (
                          <li style={{ fontStyle: 'italic', opacity: 0.7 }}>
                            ...and {suggestion.steps.length - 3} more steps
                          </li>
                        )}
                      </ol>
                    </div>

                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {suggestion.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="memory-category" style={{ fontSize: '0.75rem' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => saveAISuggestion(suggestion)}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      <Plus size={16} />
                      Save This AI Suggestion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Saved Plans */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Saved Plans</h2>
          </div>
          
          {savedPlans.length === 0 ? (
            <div className="ai-suggestions">
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                  <Calendar size={20} />
                </div>
                <div className="ai-placeholder-content">
                  <h4>No saved plans yet</h4>
                  <p>Create your own custom plan or use AI suggestions to get started!</p>
                  <div className="welcome-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsCustomPlanModalOpen(true)}
                      className="nav-framer-button nav-framer-button-solid"
                    >
                      <Plus size={16} />
                      Create Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="memories-preview">
              {savedPlans.map((plan) => (
                <div key={plan.id} className="memory-card">
                  <div className="memory-content">
                    <h4>{plan.title}</h4>
                    {plan.description && <p>{plan.description}</p>}
                    
                    <div className="memory-meta">
                      <span className="memory-category">{plan.category}</span>
                      <span className="memory-category">{plan.priority} priority</span>
                      <span className="memory-date">{formatShortDate(plan.date)}</span>
                      {plan.completed && (
                        <span className="memory-rating">✅ Completed</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.375rem', flexWrap: 'nowrap' }}>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="btn btn-secondary"
                      style={{ 
                        flex: '1', 
                        minWidth: '0', 
                        padding: '0.375rem 0.5rem', 
                        fontSize: '0.875rem' 
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="btn btn-secondary"
                      style={{ 
                        flex: '1', 
                        minWidth: '0', 
                        padding: '0.375rem 0.5rem', 
                        fontSize: '0.875rem',
                        background: '#fee2e2', 
                        color: '#dc2626' 
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Plan Modal */}
        <CustomPlanModal
          isOpen={isCustomPlanModalOpen}
          onClose={handleCloseModal}
          onSave={handleCustomPlanSave}
          editPlan={editingPlan}
        />
      </div>
    </div>
  )
}