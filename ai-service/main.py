from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from model import analyze_code, check_ollama_health, get_available_models

# Initialize FastAPI app
app = FastAPI(
    title="Meridian.ai API",
    description="Your own AI-powered code review service using CodeLLaMA",
    version="1.0.0"
)

# Allow requests from your Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== REQUEST/RESPONSE MODELS =====

class CodeReviewRequest(BaseModel):
    code: str
    language: str = "unknown"
    
class SuggestionResponse(BaseModel):
    line: int
    severity: str
    issue: str
    suggestion: str
    refactoredCode: str

class CodeReviewResponse(BaseModel):
    summary: str
    overallScore: int
    suggestions: list
    model_used: str
    

# ===== ROUTES =====

@app.get("/")
def root():
    return {
        "message": "Meridian.ai API is running",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    models = get_available_models()
    return {
        "api_status": "online",
        "ai_engine": "Groq LPU",
        "model": "llama-3.3-70b-versatile",
        "available_models": models
    }


@app.post("/analyze")
async def analyze(request: CodeReviewRequest):
    # Check if code is provided
    if not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty"
        )
    
    # Check if Ollama is running
    if not check_ollama_health():
        raise HTTPException(
            status_code=503,
            detail="AI model is not running. Please start Ollama first."
        )
    
    try:
        print(f"Analyzing {request.language} code ({len(request.code)} chars)...")
        
        result = analyze_code(request.code, request.language)
        result["model_used"] = "codellama:7b"
        
        print(f"Analysis complete. Score: {result['overallScore']}")
        return result
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
def list_models():
    models = get_available_models()
    return {"models": models}


# ===== RUN SERVER =====
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # Auto-restart on file changes
    )