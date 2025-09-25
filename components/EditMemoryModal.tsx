'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { dataService, type Memory } from '@/lib/data-service'
import { useAuth } from '@/lib/auth-context'

interface EditMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memory: Memory) => void
  memory: Memory | null
}

export default function EditMemoryModal({ isOpen, onClose, onSave, memory }: EditMemoryModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('special')
  const [rating, setRating] = useState(4)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (memory) {
      setTitle(memory.title)
      setDescription(memory.description || '')
      setCategory(memory.category || 'special')
      setRating(memory.rating || 4)
    }
  }, [memory])

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

    if (!memory) {
      setError('Memory data not found')
      return
    }

    setIsSubmitting(true)

    try {
      const updatedMemoryData = {
        ...memory,
        title: title.trim(),
        description: description.trim(),
        category,
        rating
      }

      const savedMemory = await dataService.updateMemory(user?.id || null, memory.id, updatedMemoryData)
      onSave(savedMemory)
      handleClose()
    } catch (error) {
      console.error('Error updating memory:', error)
      setError('Failed to update memory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Memory</h2>
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
            <label htmlFor="edit-memory-title">Title *</label>
            <input
              id="edit-memory-title"
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
            <label htmlFor="edit-memory-description">Description</label>
            <textarea
              id="edit-memory-description"
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
              <label htmlFor="edit-memory-category">Category</label>
              <select
                id="edit-memory-category"
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
              <label htmlFor="edit-memory-rating">Importance</label>
              <select
                id="edit-memory-rating"
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
              {isSubmitting ? 'Updating...' : 'Update Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}