'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { dataService, type Memory } from '@/lib/data-service'
import { useAuth } from '@/lib/auth-context'

interface QuickMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memory: Memory) => void
}

export default function QuickMemoryModal({ isOpen, onClose, onSave }: QuickMemoryModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('special')
  const [rating, setRating] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('special')
    setRating(4)
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
      setError('Please enter a title for your memory')
      return
    }

    setIsSubmitting(true)

    try {
      const memoryData = {
        title: title.trim(),
        description: description.trim(),
        category,
        rating,
        date: new Date().toISOString()
      }

      const savedMemory = await dataService.saveMemory(user?.id || null, memoryData)
      onSave(savedMemory)
      handleClose()
    } catch (error) {
      console.error('Error saving memory:', error)
      setError('Failed to save memory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Quick Memory</h2>
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
            <label htmlFor="memory-title">Title *</label>
            <input
              id="memory-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What happened?"
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="memory-description">Description</label>
            <textarea
              id="memory-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell me more about this memory..."
              className="form-textarea"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="memory-category">Category</label>
              <select
                id="memory-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="special">Special Moment</option>
                <option value="date">Date Night</option>
                <option value="gift">Gift Ideas</option>
                <option value="conversation">Conversation</option>
                <option value="preference">Preference</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="memory-rating">Importance</label>
              <select
                id="memory-rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="form-select"
                disabled={isSubmitting}
              >
                <option value={5}>⭐⭐⭐⭐⭐ Very Important</option>
                <option value={4}>⭐⭐⭐⭐ Important</option>
                <option value={3}>⭐⭐⭐ Moderate</option>
                <option value={2}>⭐⭐ Minor</option>
                <option value={1}>⭐ Just a Note</option>
              </select>
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}