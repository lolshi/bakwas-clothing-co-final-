from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
import json
import os
from dotenv import load_dotenv
import logging

try:
    load_dotenv()
except UnicodeDecodeError:
    logging.warning("Failed to load .env file due to UnicodeDecodeError. Continuing without .env.")
except Exception as e:
    logging.warning(f"An unexpected error occurred while loading .env: {e}. Continuing without .env.")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8082"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Grok AI API configuration
GROK_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROK_API_KEY = os.getenv("GROK_API_KEY")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    response: str
    usage: dict

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "grok_configured": bool(GROK_API_KEY)
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not GROK_API_KEY:
        raise HTTPException(status_code=500, detail="GROK_API_KEY not configured")
    
    try:
        # Format messages for Grok API
        payload = {
            "model": "mixtral-8x7b-32768",
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
        }

        # Call Grok API
        response = requests.post(
            GROK_API_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {GROK_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
            
        response_data = response.json()
        
        return ChatResponse(
            response=response_data["choices"][0]["message"]["content"],
            usage=response_data.get("usage", {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            })
        )
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Grok API"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: Don't run the server here, let uvicorn handle it 