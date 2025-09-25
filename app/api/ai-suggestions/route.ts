import { NextRequest, NextResponse } from 'next/server'
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

// Memory analysis helper function
function analyzeAllMemories(memories: Memory[]) {
  const emotionalKeywords = memories.flatMap(m => {
    const text = `${m.title} ${m.description}`.toLowerCase()
    const emotions = []
    if (text.includes('love') || text.includes('adore') || text.includes('favorite')) emotions.push('love')
    if (text.includes('happy') || text.includes('joy') || text.includes('excited')) emotions.push('happiness')
    if (text.includes('fun') || text.includes('laugh') || text.includes('enjoy')) emotions.push('fun')
    if (text.includes('romantic') || text.includes('intimate') || text.includes('special')) emotions.push('romance')
    if (text.includes('surprise') || text.includes('unexpected') || text.includes('amazed')) emotions.push('surprise')
    return emotions
  })

  const activityPatterns = memories.map(m => m.category).reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const temporalPatterns = memories.map(m => new Date(m.date).getMonth())
    .reduce((acc, month) => {
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]
      acc[monthName] = (acc[monthName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const highValueMemories = memories
    .filter(m => m.rating >= 4)
    .map(m => ({ title: m.title, description: m.description, category: m.category, rating: m.rating }))

  return {
    emotionalKeywords,
    activityPatterns,
    temporalPatterns,
    highValueMemories,
    totalMemories: memories.length,
    averageRating: memories.reduce((sum, m) => sum + m.rating, 0) / memories.length
  }
}

export async function POST(request: NextRequest) {
  try {
    const { memories, partnerProfile, userLocation } = await request.json()

    // CORE USP: Enforce 7+ memory minimum requirement
    if (!memories || memories.length < 7) {
      return NextResponse.json({
        error: `Insufficient memories for AI analysis. You have ${memories?.length || 0} memories, but need at least 7 to generate personalized suggestions.`
      }, { status: 400 })
    }

    // Initialize OpenAI client with server-side API key
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[AI API] Missing OpenAI API key')
      return NextResponse.json({
        error: 'OpenAI API key not configured'
      }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: apiKey
    })

    // Enhanced memory analysis - use ALL memories, not just recent ones
    const comprehensiveMemoryAnalysis = analyzeAllMemories(memories)

    // Enhanced prompt with comprehensive memory analysis
    const prompt = `You are an expert relationship advisor and date planner. Based on comprehensive analysis of ${memories.length} memories and partner preferences, generate 3 highly personalized date/activity suggestions.

PARTNER PROFILE:
- Name: ${partnerProfile.name}
- Love Languages: ${partnerProfile.loveLanguages?.join(', ') || 'Not specified'}
- Favorite Things: ${partnerProfile.favoriteThings || 'Not specified'}
- Dislikes: ${partnerProfile.dislikes || 'Not specified'}
- Hobbies: ${partnerProfile.favoriteHobbies?.join(', ') || 'Not specified'}

COMPREHENSIVE MEMORY ANALYSIS (${comprehensiveMemoryAnalysis.totalMemories} memories, avg rating: ${comprehensiveMemoryAnalysis.averageRating.toFixed(1)}/5):

HIGH-VALUE MEMORIES (Rating 4+):
${comprehensiveMemoryAnalysis.highValueMemories.map(m =>
  `• "${m.title}" (${m.category}, ${m.rating}/5): ${m.description}`
).join('\n')}

EMOTIONAL PATTERNS: ${comprehensiveMemoryAnalysis.emotionalKeywords.join(', ')}
ACTIVITY PREFERENCES: ${Object.entries(comprehensiveMemoryAnalysis.activityPatterns)
  .sort(([,a], [,b]) => b - a)
  .map(([cat, count]) => `${cat} (${count}x)`)
  .join(', ')}
SEASONAL PATTERNS: ${Object.entries(comprehensiveMemoryAnalysis.temporalPatterns)
  .sort(([,a], [,b]) => b - a)
  .map(([month, count]) => `${month} (${count}x)`)
  .join(', ')}

${userLocation ? `USER LOCATION: ${userLocation}` : ''}

Generate 3 unique, personalized suggestions that:
1. Draw insights from MULTIPLE high-value memories (not just one)
2. Align with partner's love languages and preferences
3. Consider seasonal/temporal patterns from memories
4. Include specific, actionable steps
5. Are creative but realistic
6. Have confidence scores 70%+ (based on memory alignment)

Return ONLY valid JSON array with this exact structure:
[
  {
    "title": "Specific plan title",
    "description": "Detailed description",
    "budgetMin": 50,
    "budgetMax": 150,
    "durationMinutes": 120,
    "difficulty": "Easy",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "tags": ["tag1", "tag2"],
    "reasoning": "Why this plan fits based on specific memories and patterns",
    "confidence": 85
  }
]`

    console.log('[AI API] Generating suggestions with OpenAI...')

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a relationship expert who creates personalized date suggestions based on memory analysis. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('Empty response from OpenAI')
    }

    console.log('[AI API] Raw OpenAI response:', responseText)

    // Parse the JSON response
    let suggestions: PlanSuggestion[]
    try {
      suggestions = JSON.parse(responseText)
    } catch (parseError) {
      console.error('[AI API] JSON parsing error:', parseError)
      console.error('[AI API] Response text:', responseText)

      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from OpenAI')
      }
    }

    // Validate suggestions
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('Invalid suggestions format')
    }

    // Filter out low-confidence suggestions (below 70%)
    const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 70)

    if (highConfidenceSuggestions.length === 0) {
      throw new Error('No high-confidence suggestions generated. Please add more diverse memories.')
    }

    console.log('[AI API] Generated', highConfidenceSuggestions.length, 'high-confidence suggestions')

    return NextResponse.json({
      success: true,
      suggestions: highConfidenceSuggestions,
      analysis: comprehensiveMemoryAnalysis
    })

  } catch (error) {
    console.error('[AI API] Error generating suggestions:', error)

    return NextResponse.json({
      error: 'Unable to generate AI suggestions at this time. Please try again later or check your OpenAI API key configuration.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}