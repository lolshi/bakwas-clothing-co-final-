# BAKWAS AI Service

This service integrates DeepSeek V3, a powerful open-source language model, into the BAKWAS e-commerce platform for generating product descriptions, tags, and SEO content.

## Requirements

- Python 3.8+
- CUDA-compatible GPU with at least 24GB VRAM (or 2 GPUs with 12GB+ each)
- CUDA 11.7 or later

## Setup

1. Create and activate a Python virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the AI server:
```bash
python server.py
```

The server will run on http://localhost:3000.

## GPU Configuration

The service is configured to use tensor parallelism across 2 GPUs by default. If you have:
- Single GPU with 24GB+ VRAM: Set `tp_size=1` in server.py
- Two GPUs with 12GB+ VRAM each: Keep `tp_size=2` (default)
- More GPUs: Adjust `tp_size` accordingly

## API Endpoints

### POST /v1/chat/completions

Generate AI completions for various tasks.

Request body:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ],
  "max_tokens": 1024,
  "temperature": 0.7
}
```

Response:
```json
{
  "response": "Generated text",
  "usage": {
    "prompt_tokens": 123,
    "completion_tokens": 456,
    "total_tokens": 579
  }
}
```

## Integration with React App

The AI service is integrated into the React application through the `aiService.ts` module, which provides methods for:
- Generating product descriptions
- Suggesting product tags
- Creating SEO descriptions

Example usage:
```typescript
import { AIService } from '../services/aiService';

// Generate product description
const description = await AIService.generateProductDescription(
  "Urban Night Hoodie",
  "Hoodies",
  ["Glow-in-dark print", "Premium cotton blend", "Oversized fit"]
);

// Get product tags
const tags = await AIService.suggestProductTags(
  "Urban Night Hoodie",
  description
);

// Generate SEO description
const seoDesc = await AIService.generateSEODescription(
  "Urban Night Hoodie",
  description
);
```
