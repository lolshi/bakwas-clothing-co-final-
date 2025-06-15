# 🧠 AI-Powered Product Suggestions Setup

## Groq AI Integration for BAKWAS E-Commerce

This guide will help you set up AI-powered product suggestions using Groq AI for automatic content generation based on product information.

## Features

- **Intelligent Analysis**: Generate product names, descriptions, and categories using advanced AI
- **Brand-Aware Content**: All suggestions follow BAKWAS streetwear brand tone and style
- **Smart Pricing**: AI suggests appropriate pricing based on product analysis
- **Color Suggestions**: Generates appropriate colors for streetwear products
- **SEO Keywords**: Generates relevant keywords for better search visibility
- **Multiple Variations**: Provides alternative product names and descriptions
- **Lightning Fast**: Powered by Groq's ultra-fast inference

## Setup Instructions

### 1. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/) 
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key for your project
5. Copy the API key securely

### 2. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Groq AI Configuration
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**Your API Key**: `VITE_GROQ_API_KEY=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`

### 3. Usage

1. **Create New Product**: Upload product images in the Create Product modal
2. **Click "Analyze with AI"**: The AI will analyze your product information
3. **Review Suggestions**: Check the generated name, description, category, color, and pricing
4. **Apply Suggestions**: Use individual suggestions or apply all at once
5. **Edit as Needed**: Customize the AI suggestions to match your exact needs

## AI Capabilities

### Content Analysis
- Recognizes clothing types (t-shirts, hoodies, accessories, etc.)
- Suggests appropriate colors and styles
- Identifies target categories
- Generates brand-appropriate content

### Brand-Aware Content Generation
- **BAKWAS Brand Tone**: Confident, rebellious, trendy, authentic
- **Target Audience**: Gen Z and millennials (16-35 years)
- **Price Range**: Mid to premium (₹1,500 - ₹8,000)
- **Keywords**: Street, urban, neon, electric, bold, fresh, exclusive
- **Style**: Contemporary streetwear with futuristic elements

### Content Types Generated
- **Product Names**: Catchy, street-appropriate 3-6 word names
- **Descriptions**: 2-3 sentences highlighting style, fit, and appeal
- **Categories**: Automatically categorized into appropriate sections
- **Colors**: Appropriate hex color codes for streetwear
- **Pricing**: Smart pricing based on market positioning
- **Tags**: Relevant style, material, and vibe keywords

## Model Information

**Groq Model Used**: `llama3-8b-8192`
- Ultra-fast inference (up to 750 tokens/second)
- High-quality content generation
- JSON-formatted responses
- Cost-effective API calls

## Troubleshooting

### API Key Issues
- Ensure your Groq API key is valid and active
- Check if you have sufficient API credits
- Verify the environment variable is properly set: `VITE_GROQ_API_KEY`

### Network Issues
- Check your internet connection
- Verify firewall settings allow API calls to `api.groq.com`
- Try again if rate limits are hit

### Fallback Mode
If AI analysis fails, the system provides intelligent fallback suggestions based on:
- Common streetwear patterns
- BAKWAS brand guidelines
- Industry best practices
- Random variations for diversity

## Security Notes

- Never commit your API key to version control
- Use environment variables for sensitive data
- Rotate API keys regularly for security
- Monitor API usage to prevent overuse

## Cost Management

- Groq offers competitive pricing with fast inference
- Each analysis uses approximately 500-1000 tokens
- Monitor usage in your Groq dashboard
- Set up billing alerts to track costs
- Much more cost-effective than other AI providers

## Performance Benefits

- **Ultra-Fast**: Groq's LPU™ technology provides lightning-fast responses
- **Reliable**: High uptime and consistent performance
- **Scalable**: Handles multiple concurrent requests efficiently
- **Quality**: Llama 3 model provides high-quality content generation

## Support

For technical issues:
1. Check the browser console for error messages
2. Verify API key configuration
3. Test with different product information
4. Contact Groq support for API-related issues
5. Check Groq status page for service updates

---

**Note**: This AI integration is designed specifically for BAKWAS streetwear brand. The AI has been trained to understand and generate content that matches your brand's voice, style, and target market using Groq's lightning-fast inference engine. 