interface GroqAIResponse {
  name: string;
  description: string;
  category: string;
  tags: string[];
  color: string;
  priceRange: {
    min: number;
    max: number;
    suggested: number;
  };
  confidence: number;
}

interface ProductAnalysisRequest {
  imageUrl?: string;
  imageFile?: File;
  brandContext?: string;
  existingData?: any;
}

class GroqAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  
  // BAKWAS brand context and tone
  private brandContext = `
    BAKWAS is a premium streetwear brand known for:
    - Bold, edgy designs with urban aesthetics
    - High-quality materials and construction
    - Neon colors, electric themes, and street culture
    - Target audience: Gen Z and millennials (16-35 years)
    - Price range: Mid to premium (₹1,500 - ₹8,000)
    - Tone: Confident, rebellious, trendy, authentic
    - Keywords: street, urban, neon, electric, bold, fresh, exclusive
    - Style: Contemporary streetwear with futuristic elements
  `;

  constructor() {
    console.log('🏗️ Debug - GroqAIService Constructor:');
    console.log('- import.meta.env exists:', !!import.meta.env);
    console.log('- VITE_GROQ_API_KEY exists:', !!import.meta.env.VITE_GROQ_API_KEY);
    console.log('- VITE_GROQ_API_KEY value length:', import.meta.env.VITE_GROQ_API_KEY?.length || 0);
    
    // Use Groq API key from environment variables
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    console.log('🔑 Debug - Service API Key Status:', this.apiKey ? 'Present (length: ' + this.apiKey.length + ')' : 'Missing');
  }

  async analyzeProductImage(request: ProductAnalysisRequest): Promise<GroqAIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Groq AI API key not configured. Please set VITE_GROQ_API_KEY in your environment variables.');
      }

      let imageDescription: string = '';
      
      // Since Groq doesn't directly support image analysis, we'll use text-based analysis
      // In a production environment, you might want to use a vision model first to describe the image
      if (request.imageFile || request.imageUrl) {
        imageDescription = 'Product image uploaded for analysis';
      }

      const prompt = this.createAnalysisPrompt(imageDescription, request.existingData);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Fast Groq model
          messages: [
            {
              role: 'system',
              content: this.brandContext
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq AI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      return this.parseAIResponse(aiResponse);
      
    } catch (error) {
      console.error('Groq AI analysis error:', error);
      return this.getFallbackSuggestions(request);
    }
  }

  private createAnalysisPrompt(imageDescription: string, existingData?: any): string {
    return `
      You are an AI assistant for BAKWAS, a premium streetwear brand. Analyze the provided information and generate product suggestions that match the brand's edgy, urban aesthetic.
      
      ${imageDescription ? `Image context: ${imageDescription}` : ''}
      
      ${existingData ? `Existing data: ${JSON.stringify(existingData)}` : ''}
      
      Generate a JSON response with the following structure:
      {
        "name": "Catchy product name that fits BAKWAS brand (3-6 words)",
        "description": "Compelling 2-3 sentence description highlighting style, fit, and appeal",
        "category": "One of: tshirts, hoodies, accessories, shoes, pants, jackets, caps, bags",
        "tags": ["relevant", "streetwear", "style", "tags"],
        "color": "Primary color as hex code (e.g., #FF5733)",
        "priceRange": {
          "min": 1500,
          "max": 8000,
          "suggested": 3500
        },
        "confidence": 0.85
      }
      
      Key requirements for BAKWAS brand:
      - Name should be catchy, street-appropriate, and edgy
      - Description should emphasize style, comfort, exclusivity, and urban appeal
      - Tags should include material, style, occasion, and vibe keywords
      - Price should reflect premium streetwear positioning (₹1,500 - ₹8,000)
      - Use confident, rebellious, trendy, authentic tone
      - Include keywords: street, urban, neon, electric, bold, fresh, exclusive
      
      Respond with valid JSON only.
    `;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private parseAIResponse(response: string): GroqAIResponse {
    try {
      // Clean up the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        name: parsed.name || 'BAKWAS Streetwear Piece',
        description: parsed.description || 'Premium streetwear designed for the bold and authentic.',
        category: this.validateCategory(parsed.category),
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['streetwear', 'urban', 'style'],
        color: this.validateColor(parsed.color),
        priceRange: {
          min: Math.max(parsed.priceRange?.min || 1500, 1000),
          max: Math.min(parsed.priceRange?.max || 8000, 15000),
          suggested: parsed.priceRange?.suggested || 3500
        },
        confidence: Math.min(Math.max(parsed.confidence || 0.7, 0), 1)
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackSuggestions();
    }
  }

  private validateCategory(category: string): string {
    const validCategories = ['tshirts', 'hoodies', 'accessories', 'shoes', 'pants', 'jackets', 'caps', 'bags'];
    return validCategories.includes(category) ? category : 'tshirts';
  }

  private validateColor(color: string): string {
    // Validate hex color format
    if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
      return color;
    }
    return '#000000'; // Default to black
  }

  private getFallbackSuggestions(request?: ProductAnalysisRequest): GroqAIResponse {
    // Provide intelligent fallback suggestions based on common streetwear patterns
    const fallbackNames = [
      'BAKWAS Urban Essential',
      'Street Rebellion Piece',
      'Neon Nights Collection',
      'Electric Streets Drop',
      'Bold Statement Wear',
      'Urban Edge Tee',
      'Neon Pulse Hoodie',
      'Street Thunder Jacket',
      'Electric Vibe Pants',
      'Rebel Core Cap'
    ];

    const fallbackDescriptions = [
      'Premium streetwear crafted for the bold and authentic. Features cutting-edge design with superior comfort and unmatched street style.',
      'Elevate your street game with this exclusive piece. Designed for those who dare to stand out from the crowd with confidence.',
      'Urban aesthetics meet premium quality. Perfect for expressing your unique style and establishing your street credibility.',
      'Bold design meets exceptional comfort. This piece embodies the rebellious spirit of modern streetwear culture.',
      'Street-ready style with premium construction. Crafted for the urban explorer who demands both form and function.'
    ];

    const fallbackTags = [
      ['streetwear', 'urban', 'premium', 'exclusive', 'style'],
      ['neon', 'electric', 'bold', 'trendy', 'fresh'],
      ['rebel', 'authentic', 'street', 'culture', 'modern'],
      ['edgy', 'contemporary', 'comfort', 'quality', 'design']
    ];

    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF5733'];

    return {
      name: fallbackNames[Math.floor(Math.random() * fallbackNames.length)],
      description: fallbackDescriptions[Math.floor(Math.random() * fallbackDescriptions.length)],
      category: 'tshirts',
      tags: fallbackTags[Math.floor(Math.random() * fallbackTags.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      priceRange: {
        min: 2000,
        max: 6000,
        suggested: Math.floor(Math.random() * (4500 - 2500)) + 2500
      },
      confidence: 0.6
    };
  }

  // Generate additional content suggestions
  async generateProductVariations(baseProduct: any): Promise<string[]> {
    try {
      const prompt = `
        Based on this BAKWAS streetwear product: "${baseProduct.name}"
        Description: "${baseProduct.description}"
        
        Generate 3 alternative product names that maintain the same vibe but offer variety.
        Keep BAKWAS brand tone: edgy, urban, confident, rebellious.
        
        Return as a JSON object with this structure:
        {
          "variations": ["name1", "name2", "name3"]
        }
      `;

      const response = await this.callGroqAPI(prompt);
      const parsed = JSON.parse(response);
      return parsed.variations || [];
    } catch (error) {
      console.error('Error generating variations:', error);
      return [
        `${baseProduct.name} Pro`,
        `${baseProduct.name} Elite`,
        `${baseProduct.name} Special Edition`
      ];
    }
  }

  async generateSEOKeywords(product: any): Promise<string[]> {
    try {
      const prompt = `
        Generate SEO keywords for this BAKWAS streetwear product:
        Name: "${product.name}"
        Category: "${product.category}"
        
        Provide 10 relevant SEO keywords for Indian streetwear market.
        Focus on: urban fashion, street style, premium clothing, trendy apparel.
        
        Return as a JSON object with this structure:
        {
          "keywords": ["keyword1", "keyword2", "keyword3", ...]
        }
      `;

      const response = await this.callGroqAPI(prompt);
      const parsed = JSON.parse(response);
      return parsed.keywords || [];
    } catch (error) {
      return ['streetwear', 'urban fashion', 'premium clothing', 'indian streetwear', 'trendy apparel', 'street style', 'contemporary fashion', 'youth clothing', 'casual wear', 'modern apparel'];
    }
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: this.brandContext
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

export const groqAI = new GroqAIService();
export type { GroqAIResponse, ProductAnalysisRequest }; 