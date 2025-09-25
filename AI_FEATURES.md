# AI-Powered Plan Suggestions

The Keeps app features an advanced AI algorithm that requires **7+ memories** to generate deeply personalized plan suggestions using OpenAI's GPT-4o-mini model!

## 🧠 Core Algorithm - The 7+ Memory Requirement

**Why 7 memories?** Our AI needs substantial data to understand your partner's unique personality, preferences, and patterns. With fewer memories, suggestions would be generic. With 7+ memories, the AI can:

- **Identify deep patterns** across all your memories, not just recent ones
- **Extract emotional keywords** and relationship insights
- **Understand seasonal and temporal preferences**
- **Create highly personalized suggestions** with 70%+ confidence scores

## 🚀 Enhanced Analysis Process

The AI performs comprehensive analysis of ALL your memories to identify:

- **Memory patterns** - Recurring themes, preferences, and interests
- **Emotional insights** - How your partner responds to different experiences
- **Activity preferences** - Specific types of activities they enjoy
- **Temporal patterns** - Seasonal preferences and timing insights
- **Local opportunities** - Nearby businesses and venues that match their interests
- **Relationship dynamics** - Communication style and attention to detail

## 🛠️ Setup

1. **Get an OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy the key (starts with `sk-`)

2. **Configure Environment**:
   - Copy `.env.example` to `.env.local`
   - Add your API keys:
     ```
     NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
     NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
     ```

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

## 💡 Usage

1. **Set up your partner's profile** in "My Person"
2. **Add at least 7 memories** about what they like, enjoy, and experiences you've shared
3. **Build your memory collection** - the more detailed memories you add, the better the AI gets!
4. **Go to Plans page** and click "AI Suggestions" (unlocked at 7+ memories)
5. **Review deeply personalized suggestions** with high confidence scores (70%+)
6. **Get local recommendations** based on your location and their preferences
7. **Save the ones you love** to your plan library

## ✨ Advanced Features

- **7+ Memory Requirement**: Ensures high-quality, personalized suggestions
- **Comprehensive Analysis**: Uses ALL memories, not just recent ones
- **Deep Pattern Recognition**: Identifies emotional, activity, and temporal patterns
- **Local Business Integration**: Google Places API for venue recommendations
- **High Confidence Scoring**: 70%+ confidence scores based on memory matches
- **Detailed Reasoning**: Explains connections to specific memories and patterns
- **Location-Aware**: Incorporates nearby restaurants, activities, and venues
- **Memory-Driven**: Each suggestion references specific memories and preferences

## 🎯 Example

If your memories mention:
- "Loves Italian food"
- "Enjoys cozy atmospheres" 
- "Favorite wine is Chianti"

The AI might suggest:
- **"Authentic Italian Cooking Date"** (85% confidence)
- **"Wine & Paint Night with Italian Theme"** (78% confidence)
- **"Surprise Picnic with Homemade Pasta"** (82% confidence)

## 🔒 Privacy

- Your data stays secure - memories are only sent to OpenAI for analysis
- No personal information is stored by OpenAI
- You can delete suggestions anytime

## 💰 Cost

OpenAI charges per API request. Typical costs:
- ~$0.01-0.03 per suggestion generation
- Most users spend less than $1/month

## 🚨 Troubleshooting

**"OpenAI API key is not configured"**
- Check your `.env.local` file exists
- Ensure the key starts with `sk-`
- Restart the development server

**"Insufficient memories for AI analysis"**
- You need at least 7 memories to unlock AI suggestions
- Add more detailed memories about your partner's preferences, experiences, and interests
- The more memories you add, the better the AI suggestions become

**API key errors**
- Verify the key is correct
- Check you have API credits in your OpenAI account
- Try regenerating the key