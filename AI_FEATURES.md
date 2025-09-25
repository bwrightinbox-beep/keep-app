# AI-Powered Plan Suggestions

The Keeps app now includes intelligent plan suggestions powered by OpenAI's GPT-4o-mini model!

## 🚀 How It Works

The AI analyzes your memories about your partner to suggest personalized date ideas and thoughtful gestures. It considers:

- **Memory patterns** - What they like, love, and enjoy
- **Love languages** - How they prefer to give and receive affection  
- **Recent trends** - What you've noticed about them lately
- **Location** - Local suggestions based on your current location
- **Budget and time** - Realistic options that fit your lifestyle

## 🛠️ Setup

1. **Get an OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy the key (starts with `sk-`)

2. **Configure Environment**:
   - Copy `.env.example` to `.env.local`
   - Add your API key:
     ```
     NEXT_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
     ```

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

## 💡 Usage

1. **Set up your partner's profile** in "My Person" 
2. **Add memories** about what they like and enjoy
3. **Go to Plans page** and click "AI Suggestions"
4. **Review personalized suggestions** with confidence scores
5. **Save the ones you like** to your plan library

## ✨ Features

- **Smart Analysis**: Identifies patterns in your memories
- **Confidence Scoring**: Shows how well each suggestion matches
- **Location Awareness**: Includes local options when available
- **Detailed Steps**: Complete instructions for each suggestion
- **Reasoning**: Explains why each plan was suggested
- **Easy Saving**: One-click to add to your saved plans

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

**"No AI suggestions were generated"**
- Add more memories (need at least 2-3)
- Complete your partner's profile
- Check your internet connection

**API key errors**
- Verify the key is correct
- Check you have API credits in your OpenAI account
- Try regenerating the key