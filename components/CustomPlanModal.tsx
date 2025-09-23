'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { dataService, type Plan } from '@/lib/data-service'
import { useAuth } from '@/lib/auth-context'

interface CustomPlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: Plan) => void
  editPlan?: Plan | null
}

export default function CustomPlanModal({ isOpen, onClose, onSave, editPlan }: CustomPlanModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [scheduledFor, setScheduledFor] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  // Populate form when editing a plan
  React.useEffect(() => {
    if (editPlan) {
      setTitle(editPlan.title || '')
      setDescription(editPlan.description || '')
      setCategory(editPlan.category || 'general')
      setPriority(editPlan.priority || 'medium')
      setScheduledFor(editPlan.date ? new Date(editPlan.date).toISOString().slice(0, 16) : '')
    }
  }, [editPlan])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('general')
    setPriority('medium')
    setScheduledFor('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title for your plan')
      return
    }

    setIsSubmitting(true)

    try {
      const planData = {
        title: title.trim(),
        description: description.trim(),
        category: category || 'general',
        priority,
        date: scheduledFor || new Date().toISOString(),
        completed: editPlan?.completed || false
      }

      let savedPlan
      if (editPlan) {
        // Update existing plan
        savedPlan = await dataService.updatePlan(user?.id || null, editPlan.id, planData)
      } else {
        // Create new plan
        savedPlan = await dataService.savePlan(user?.id || null, planData)
      }
      
      if (savedPlan) {
        onSave(savedPlan)
        handleClose()
      } else {
        setError('Failed to save plan. Please try again.')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      setError('Failed to save plan. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editPlan ? 'Edit Plan' : 'Create Custom Plan'}</h2>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="plan-title">Plan Title *</label>
            <input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 'Surprise Movie Night Under the Stars'"
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="plan-description">Description</label>
            <textarea
              id="plan-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your plan..."
              className="form-textarea"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: '1' }}>
              <label htmlFor="plan-category">Category</label>
              <select
                id="plan-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                <option value="general">General</option>
                <option value="date">Date Night</option>
                <option value="surprise">Surprise</option>
                <option value="gift">Gift Ideas</option>
                <option value="activity">Activity</option>
                <option value="romantic">Romantic</option>
                <option value="adventure">Adventure</option>
                <option value="relaxation">Relaxation</option>
                <option value="food">Food & Dining</option>
                <option value="travel">Travel</option>
                <option value="celebration">Celebration</option>
                <option value="thoughtful">Thoughtful Gesture</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: '1' }}>
              <label htmlFor="plan-priority">Priority Level</label>
              <select
                id="plan-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="form-select"
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                <option value="low">Low - When you have time</option>
                <option value="medium">Medium - Soon</option>
                <option value="high">High - ASAP</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="plan-schedule">Schedule For (Optional)</label>
            <input
              id="plan-schedule"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editPlan ? 'Update Plan' : 'Save Plan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}