'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import QuickMemoryModal from '@/components/QuickMemoryModal'
import EditMemoryModal from '@/components/EditMemoryModal'
import ModernLoading from '@/components/ui/ModernLoading'
import { useAuth } from '@/lib/auth-context'
import { dataService, type Memory } from '@/lib/data-service'
import { formatShortDate } from '@/lib/localization'
import { Plus, Search, Filter, ArrowUpDown, Edit, Trash2 } from 'lucide-react'

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('date')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isQuickMemoryModalOpen, setIsQuickMemoryModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const memoriesData = await dataService.getMemories(user?.id || null)
        setMemories(memoriesData)
      } catch (error) {
        console.error('Error loading memories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemories()
  }, [user])

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(memories.map(m => m.category).filter(Boolean))]
    return uniqueCategories.sort()
  }, [memories])

  // Filter and sort memories
  const filteredAndSortedMemories = useMemo(() => {
    let filtered = memories

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(memory => 
        memory.title.toLowerCase().includes(query) ||
        (memory.description && memory.description.toLowerCase().includes(query)) ||
        (memory.category && memory.category.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(memory => memory.category === filterCategory)
    }

    // Apply rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating)
      filtered = filtered.filter(memory => (memory.rating || 3) >= rating)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date || b.created_at || 0).getTime() - new Date(a.date || a.created_at || 0).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'rating':
          return (b.rating || 3) - (a.rating || 3)
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        default:
          return 0
      }
    })
  }, [memories, searchQuery, filterCategory, filterRating, sortBy])

  const handleQuickMemoryClose = () => {
    setIsQuickMemoryModalOpen(false)
  }

  const handleQuickMemorySave = (newMemory: Memory) => {
    setMemories([newMemory, ...memories])
  }

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory)
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
    setEditingMemory(null)
  }

  const handleEditMemorySave = (updatedMemory: Memory) => {
    setMemories(memories.map(m => m.id === updatedMemory.id ? updatedMemory : m))
  }

  const handleDeleteMemory = async (memoryId: string) => {
    if (confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      try {
        const success = await dataService.deleteMemory(user?.id || null, memoryId)
        if (success) {
          setMemories(memories.filter(m => m.id !== memoryId))
        } else {
          alert('Failed to delete memory. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting memory:', error)
        alert('Failed to delete memory. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navigation />
        <ModernLoading text="Loading your memories" size="md" />
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="container">
        <div className="dashboard-header">
          <h1>Your Memories</h1>
          <p>Capture and organize meaningful moments with your partner</p>
        </div>


        {/* Search, Sort and Filter Controls */}
        {memories.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Search, Sort & Filter</h2>
            </div>
            
            {/* Search Bar */}
            <div className="search-bar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search memories by title, description, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="search-clear"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="sort-by" className="form-label">
                  <ArrowUpDown size={16} />
                  Sort by
                </label>
                <select 
                  id="sort-by"
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date (newest first)</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="rating">Rating (highest first)</option>
                  <option value="category">Category (A-Z)</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="filter-category" className="form-label">
                  <Filter size={16} />
                  Category
                </label>
                <select 
                  id="filter-category"
                  className="form-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="filter-rating" className="form-label">
                  Rating
                </label>
                <select 
                  id="filter-rating"
                  className="form-select"
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* All Memories */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Memories</h2>
            {memories.length > 0 && (
              <div className="section-header-actions">
                <span className="results-count">
                  {filteredAndSortedMemories.length} of {memories.length} memories
                </span>
                <button 
                  onClick={() => setIsQuickMemoryModalOpen(true)} 
                  className="nav-framer-button nav-framer-button-solid"
                >
                  <Plus size={16} />
                  Add Memory
                </button>
              </div>
            )}
          </div>
          
          {memories.length === 0 ? (
            <div className="ai-suggestions">
              <div className="ai-placeholder">
                <div className="ai-placeholder-icon" style={{ background: 'black' }}>
                  <Plus size={20} />
                </div>
                <div className="ai-placeholder-content">
                  <h4>Start Building Your Memory Collection</h4>
                  <p>Capture and organize meaningful moments with your partner. Every memory helps you understand and appreciate them better.</p>
                  <div className="welcome-actions" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsQuickMemoryModalOpen(true)}
                      className="nav-framer-button nav-framer-button-solid"
                    >
                      <Plus size={16} />
                      Add First Memory
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredAndSortedMemories.length === 0 ? (
            <div className="no-results-card">
              <h3>No memories match your filters</h3>
              <p>Try adjusting your category or rating filters to see more memories.</p>
              <div className="welcome-actions">
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setFilterCategory('all')
                    setFilterRating('all')
                  }}
                  className="btn btn-secondary"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="memories-preview">
              {filteredAndSortedMemories.map((memory) => (
                <div key={memory.id} className="memory-card">
                  <div className="memory-content">
                    <div className="memory-header">
                      <h4>{memory.title}</h4>
                      <div className="memory-actions">
                        <button
                          onClick={() => handleEditMemory(memory)}
                          className="memory-action-btn edit-btn"
                          title="Edit memory"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMemory(memory.id)}
                          className="memory-action-btn delete-btn"
                          title="Delete memory"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {memory.description && (
                      <p>{memory.description.length > 150 ? `${memory.description.substring(0, 150)}...` : memory.description}</p>
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
          )}
        </div>

        {/* Quick Memory Modal */}
        <QuickMemoryModal
          isOpen={isQuickMemoryModalOpen}
          onClose={handleQuickMemoryClose}
          onSave={handleQuickMemorySave}
        />

        {/* Edit Memory Modal */}
        <EditMemoryModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSave={handleEditMemorySave}
          memory={editingMemory}
        />
      </div>
    </div>
  )
}