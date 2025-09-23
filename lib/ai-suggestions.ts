import OpenAI from 'openai'

interface Memory {
  id: number
  title: string
  body: string
  tags: string[]
  importance: 'low' | 'medium' | 'high'
  sensitivity: 'normal' | 'private'
  createdAt: string
}

interface PartnerProfile {
  name: string
  loveLanguages: string[]
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
    // Initialize OpenAI client with API key check
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('Missing OpenAI API key. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.')
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    })
    // Analyze recent memories (last 30 days or latest 10)
    const recentMemories = memories
      .filter(memory => {
        const memoryDate = new Date(memory.createdAt)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return memoryDate > thirtyDaysAgo
      })
      .slice(0, 10)

    if (recentMemories.length === 0) {
      return []
    }

    // Create analysis prompt
    const prompt = `
You are an AI assistant that helps create thoughtful, personalized date and gesture ideas based on memories about someone's partner.

PARTNER PROFILE:
- Name: ${partnerProfile.name}
- Love Languages: ${partnerProfile.loveLanguages.join(', ')}
${partnerProfile.favoriteThings ? `- Favorite Things: ${partnerProfile.favoriteThings}` : ''}
${partnerProfile.dislikes ? `- Dislikes/Avoid: ${partnerProfile.dislikes}` : ''}

RECENT MEMORIES TO ANALYZE:
${recentMemories.map(memory => `
- ${memory.title}${memory.body ? `: ${memory.body}` : ''}
  Tags: ${memory.tags.join(', ')}
  Priority: ${memory.importance}
`).join('\n')}

${userLocation ? `USER LOCATION: ${userLocation}` : ''}

Based on these memories and preferences, suggest 3-4 thoughtful, personalized plans/gestures. Focus on:
1. Patterns you notice in their preferences
2. Things they've mentioned liking or enjoying
3. Their love languages
4. ${userLocation ? 'Local options near the user location' : 'Various budget ranges'}

For each suggestion, provide:
- A creative, specific title
- A detailed description (2-3 sentences)
- Realistic budget range in USD
- Estimated duration in minutes
- Difficulty level (Easy/Medium/Hard)
- 4-6 specific step-by-step instructions
- Relevant tags
- Brief reasoning for why this matches their preferences
- Confidence score (1-100) based on how well it matches the memories

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Plan Title",
    "description": "Detailed description of the plan",
    "budgetMin": 15,
    "budgetMax": 50,
    "durationMinutes": 90,
    "difficulty": "Medium",
    "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "tags": ["tag1", "tag2", "tag3"],
    "reasoning": "Why this matches their preferences based on memories",
    "confidence": 85
  }
]
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful relationship assistant. Respond only with valid JSON, no additional text or formatting.'
        },
        {
          role: 'user', 
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    console.log('OpenAI response:', content)
    
    if (!content) {
      console.error('No response from OpenAI')
      return []
    }

    // Parse JSON response
    try {
      const suggestions = JSON.parse(content)
      console.log('Parsed suggestions:', suggestions)
      return Array.isArray(suggestions) ? suggestions : []
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.log('Raw response:', content)
      return []
    }

  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return []
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

// Analyze memory patterns for insights
export function analyzeMemoryPatterns(memories: Memory[]): {
  topCategories: string[]
  preferences: string[]
  recentTrends: string[]
} {
  const allTags = memories.flatMap(memory => memory.tags)
  const tagCounts = allTags.reduce((counts, tag) => {
    counts[tag] = (counts[tag] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  const topCategories = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag)

  // Extract preferences from memory titles and bodies
  const allText = memories.map(m => `${m.title} ${m.body}`).join(' ').toLowerCase()
  const preferenceKeywords = [
    'loves', 'likes', 'enjoys', 'favorite', 'prefers', 'adores', 'obsessed with'
  ]
  
  const preferences: string[] = []
  preferenceKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}\\s+([^.!?]+)`, 'gi')
    const matches = allText.match(regex)
    if (matches) {
      preferences.push(...matches.map(match => match.replace(keyword, '').trim()))
    }
  })

  // Recent trends (last 7 days)
  const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentMemories = memories.filter(memory => 
    new Date(memory.createdAt) > recentDate
  )
  const recentTags = recentMemories.flatMap(memory => memory.tags)
  const uniqueRecentTags = [...new Set(recentTags)]

  return {
    topCategories,
    preferences: [...new Set(preferences)].slice(0, 5),
    recentTrends: uniqueRecentTags.slice(0, 3)
  }
}