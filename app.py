from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sglang as sgl
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8083"],  # Your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DeepSeek V3 model
model = sgl.Runtime(
    model="deepseek-ai/DeepSeek-V3",
    tp_size=2,  # Tensor parallelism size, adjust based on your GPU setup
    max_tokens=2048,
)

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

@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    try:
        # Format conversation history
        conversation = ""
        for msg in request.messages:
            if msg.role == "user":
                conversation += f"User: {msg.content}\n"
            elif msg.role == "assistant":
                conversation += f"Assistant: {msg.content}\n"
        
        # Add final prompt
        conversation += "Assistant:"
        
        # Generate response
        response = model.generate(
            prompt=conversation,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )
        
        return ChatResponse(
            response=response.text.strip(),
            usage={
                "prompt_tokens": len(conversation.split()),
                "completion_tokens": len(response.text.split()),
                "total_tokens": len(conversation.split()) + len(response.text.split())
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=3000, reload=True) 