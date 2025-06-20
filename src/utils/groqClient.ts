// Use Vite proxy instead of direct API calls
const API_BASE = '/api/groq';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Debug logging for environment
console.log('🔍 Debug - Environment Check:');
console.log('- import.meta.env exists:', !!import.meta.env);
console.log('- VITE_GROQ_API_KEY exists:', !!import.meta.env.VITE_GROQ_API_KEY);
console.log('- VITE_GROQ_API_KEY length:', import.meta.env.VITE_GROQ_API_KEY?.length || 0);

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    console.log('🚀 Debug - Making chat request via proxy');
    
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are bakwAIs, the AI assistant for Bakwas Clothing Co., a neon streetwear brand. 

PERSONALITY: Confident, casual-cool, intelligent streetwear stylist. Think of yourself as that friend who always knows what's fresh and can help with both style and practical stuff.

CAPABILITIES:
- Fashion styling advice (colors, fits, trends, occasions)
- Streetwear culture and trend insights  
- Care instructions for clothing
- Size guidance and fit recommendations
- Order support (checking status, tracking, returns)
- Product recommendations from Bakwas collection
- General customer support

TONE: Keep it real but helpful. Use streetwear slang naturally but stay professional. Be enthusiastic about fashion and confident in your advice.

SPECIAL COMMANDS: Respond to @bakwAIs mentions with extra enthusiasm. Handle order/support queries by being helpful but mention contacting support@bakwasclothing.com for account-specific issues.

BRAND FOCUS: Emphasize Bakwas Clothing Co.'s neon streetwear aesthetic, quality, and style-forward approach.`
    };

    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 Groq API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Debug - Chat response received:', data.choices?.[0]?.message?.content?.substring(0, 100) + '...');
    
    return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    return 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
  }
}

export async function getContextualSuggestions(messages: ChatMessage[]): Promise<string[]> {
  try {
    console.log('🚀 Debug - Making suggestions request via proxy');
    
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `Based on the conversation history, generate exactly 3 short follow-up questions about fashion and styling.

IMPORTANT FORMATTING RULES:
- Each question must be 4-8 words maximum
- Return ONLY the 3 questions
- One question per line
- No numbers, bullets, or extra text
- No explanations or introductions

Examples of good questions:
What shoes match this outfit?
How to style oversized hoodies?
Best colors for summer looks?

Focus on: colors, styling, fits, care instructions, streetwear trends.`
    };

    const response = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.6,
      max_tokens: 60,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 Groq API error for suggestions:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    
    console.log('✅ Debug - Suggestions response received:', responseText);
    
    // Better parsing - handle various response formats
    let suggestions = responseText
      .split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .filter((s: string) => !s.toLowerCase().includes('happy to help'))
      .filter((s: string) => !s.toLowerCase().includes('conversation history'))
      .filter((s: string) => !s.toLowerCase().includes('general fashion'))
      .filter((s: string) => s.includes('?') || s.length > 10) // Must be a question or substantial text
      .map((s: string) => s.replace(/^\d+\.?\s*/, '')) // Remove numbers
      .map((s: string) => s.replace(/^[-•]\s*/, '')) // Remove bullets
      .slice(0, 3);
    
    // Ensure we have exactly 3 suggestions
    if (suggestions.length < 3) {
      const fallbacks = [
        "What colors go with neon pink?",
        "How to style streetwear outfits?",
        "Best care tips for printed tees?",
        "What shoes match baggy jeans?",
        "How to layer winter streetwear?",
        "Best accessories for minimalist looks?"
      ];
      
      // Mix parsed suggestions with fallbacks
      while (suggestions.length < 3) {
        const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        if (!suggestions.includes(randomFallback)) {
          suggestions.push(randomFallback);
        }
      }
    }
    
    return suggestions.slice(0, 3);
  } catch (error) {
    console.error('❌ Suggestions API Error:', error);
    // Fallback suggestions
    return [
      "What colors go with neon pink?",
      "How to style streetwear outfits?",
      "Best care tips for printed tees?"
    ];
  }
} 