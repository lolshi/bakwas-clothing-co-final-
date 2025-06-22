from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
import json
import os
from dotenv import load_dotenv
import logging
import razorpay
from fastapi.responses import JSONResponse
import time

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
try:
    load_dotenv()
    logger.info("Environment variables loaded successfully")
    
    # Get Razorpay credentials
    razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
    razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    if not razorpay_key_id or not razorpay_key_secret:
        logger.error("Razorpay credentials not found in environment variables")
        logger.error("Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env file")
        raise ValueError("Razorpay credentials not found")
        
    logger.info("Razorpay credentials loaded successfully")
except Exception as e:
    logger.error(f"Error loading environment: {str(e)}")
    raise

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Razorpay client
try:
    razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
    logger.info("Razorpay client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Razorpay client: {str(e)}")
    raise

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

class RazorpayOrderRequest(BaseModel):
    amount: int
    currency: str
    receipt: str

class RazorpayVerificationRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "razorpay_configured": bool(razorpay_client),
        "razorpay_key_id_present": bool(razorpay_key_id),
        "razorpay_key_secret_present": bool(razorpay_key_secret)
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

@app.post("/api/create-razorpay-order")
async def create_razorpay_order(request: RazorpayOrderRequest):
    logger.info(f"Received order request: {request}")
    
    try:
        # Log the Razorpay client state
        logger.debug(f"Razorpay client auth check: {bool(razorpay_client.auth)}")
        
        order_data = {
            "amount": request.amount,
            "currency": request.currency,
            "receipt": request.receipt,
            "payment_capture": 1
        }
        logger.debug(f"Creating Razorpay order with data: {order_data}")
        
        # Create the order
        order = razorpay_client.order.create(data=order_data)
        logger.info(f"Razorpay order created successfully: {order}")
        
        # Create the response
        response_data = {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "receipt": order["receipt"],
            "status": order["status"]
        }
        logger.debug(f"Sending response: {response_data}")
        
        # Return the response
        return JSONResponse(
            status_code=200,
            content=response_data
        )
    except razorpay.errors.BadRequestError as e:
        error_msg = f"Razorpay BadRequestError: {str(e)}"
        logger.error(error_msg)
        return JSONResponse(
            status_code=400,
            content={"error": error_msg}
        )
    except Exception as e:
        error_msg = f"Error creating Razorpay order: {str(e)}"
        logger.error(error_msg)
        return JSONResponse(
            status_code=500,
            content={"error": error_msg}
        )

@app.post("/api/verify-payment")
async def verify_payment(request: RazorpayVerificationRequest):
    logger.info(f"Received payment verification request: {request}")
    try:
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        
        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # If verification is successful, the above line does not raise an exception.
        logger.info(f"Payment verification successful for order_id: {request.razorpay_order_id}")
        return JSONResponse(
            status_code=200,
            content={"status": "success", "order_id": request.razorpay_order_id}
        )
    except razorpay.errors.SignatureVerificationError as e:
        logger.error(f"Signature verification failed: {str(e)}")
        return JSONResponse(
            status_code=400,
            content={"status": "failure", "error": "Invalid payment signature"}
        )
    except Exception as e:
        error_msg = f"Error verifying payment: {str(e)}"
        logger.error(error_msg)
        return JSONResponse(
            status_code=500,
            content={"status": "failure", "error": error_msg}
        )

@app.get("/test-env")
async def test_environment():
    """Test endpoint to verify environment setup"""
    return {
        "status": "ok",
        "razorpay_key_present": bool(razorpay_key_id),
        "razorpay_secret_present": bool(razorpay_key_secret),
        "client_initialized": bool(razorpay_client),
        "key_id_preview": razorpay_key_id[:5] + "..." if razorpay_key_id else None
    }

@app.get("/test-razorpay")
async def test_razorpay():
    """Test endpoint to create a Razorpay order with fixed values"""
    logger.info("Testing Razorpay order creation with fixed values")
    try:
        test_order_data = {
            "amount": 50000,  # ₹500 in paise
            "currency": "INR",
            "receipt": f"test_receipt_{int(time.time())}",  # Unique receipt ID
            "payment_capture": 1
        }
        logger.debug(f"Creating test order with data: {test_order_data}")
        
        order = razorpay_client.order.create(data=test_order_data)
        logger.info(f"Test order created successfully: {order}")
        
        return {
            "success": True,
            "message": "Razorpay test order created successfully",
            "order": order
        }
    except Exception as e:
        error_msg = f"Failed to create test order: {str(e)}"
        logger.error(error_msg)
        return {
            "success": False,
            "message": error_msg,
            "error": str(e)
        }

# Note: Don't run the server here, let uvicorn handle it 