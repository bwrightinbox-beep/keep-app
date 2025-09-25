import OpenAI from 'openai'

interface Memory {
  id: string
  title: string
  description: string
  date: string
  category: string
  rating: number
  created_at?: string
  updated_at?: string
}

interface PartnerProfile {
  name: string
  favoriteColor: string
  favoriteFood: string
  favoriteHobbies: string[]
  importantDates: Array<{ date: string; description: string }>
  notes: string
  loveLanguages?: string[]
  favoriteThings?: string
  dislikes?: string
}

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

export async function generateAISuggestions(
  memories: Memory[],
  partnerProfile: PartnerProfile,
  userLocation?: string
): Promise<PlanSuggestion[]> {
  try {
    // CORE USP: Enforce 7+ memory minimum requirement
    if (memories.length < 7) {
      throw new Error(`Insufficient memories for AI analysis. You have ${memories.length} memories, but need at least 7 to generate personalized suggestions. Add ${7 - memories.length} more memories to unlock AI suggestions.`)
    }

    console.log('[AI] Calling server-side API for suggestions...')

    // Call server-side API endpoint
    const response = await fetch('/api/ai-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memories,
        partnerProfile,
        userLocation
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || result.details || 'Failed to generate suggestions')
    }

    console.log('[AI] Received', result.suggestions?.length || 0, 'suggestions from API')
    return result.suggestions || []

  } catch (error) {
    console.error('[AI] Error generating suggestions:', error)
    throw error
  }
}

// Get user's current location
export async function getCurrentLocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get city/area name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          )
          const data = await response.json()
          const location = `${data.city || data.locality}, ${data.principalSubdivision || data.countryName}`
          resolve(location)
        } catch (error) {
          console.error('Error getting location name:', error)
          resolve(null)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        resolve(null)
      },
      { timeout: 10000, maximumAge: 300000 } // 10s timeout, 5min cache
    )
  })
}