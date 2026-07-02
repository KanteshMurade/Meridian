from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
import uvicorn

from model import AIServiceError, analyze_code, check_ai_health, get_available_models

MAX_CODE_LINES = 500

app = FastAPI(
    title="Meridian.ai API",
    description="AI-powered code review service using Groq LPU and Meridian review rules",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CodeReviewRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: str = Field(default="unknown", max_length=40)

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Code cannot be empty.")

        normalized = value.replace("\r\n", "\n").replace("\r", "\n")
        line_count = len(normalized.split("\n"))

        if line_count > MAX_CODE_LINES:
            raise ValueError(f"Only code up to {MAX_CODE_LINES} lines is allowed.")

        return value

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        if not isinstance(value, str) or not value.strip():
            return "unknown"

        return value.strip().lower()[:40]


class SuggestionResponse(BaseModel):
    line: int
    severity: str
    category: str = "code_quality"
    issue: str
    suggestion: str
    refactoredCode: str


class CodeReviewResponse(BaseModel):
    summary: str
    overallScore: int
    suggestions: list[SuggestionResponse]
    model_used: str
    rules_used: list[str] = []


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.get("/")
def root():
    return {
        "message": "Meridian.ai API is running",
        "status": "online",
        "version": "1.1.0",
    }


@app.get("/health")
def health_check():
    ai_ready = check_ai_health()

    return {
        "api_status": "online",
        "ai_engine": "Groq LPU",
        "ai_ready": ai_ready,
        "model": get_available_models()[0],
        "available_models": get_available_models(),
        "rules_enabled": ["owasp", "gigw_accessibility", "code_quality", "review_output"],
    }


@app.post("/analyze", response_model=CodeReviewResponse)
async def analyze(request: CodeReviewRequest):
    if not check_ai_health():
        raise HTTPException(
            status_code=503,
            detail="AI service is missing GROQ_API_KEY. Please configure the AI service .env file.",
        )

    try:
        print(f"Analyzing {request.language} code ({len(request.code)} chars)...")
        result = analyze_code(request.code, request.language)
        print(f"Analysis complete. Score: {result['overallScore']}")
        return result

    except AIServiceError as exc:
        print(f"AI service error: {str(exc)}")
        raise HTTPException(status_code=exc.status_code, detail=str(exc))
    except Exception as exc:
        print(f"Unexpected analysis error: {str(exc)}")
        raise HTTPException(status_code=500, detail="Unexpected AI service error. Please try again.")


@app.get("/models")
def list_models():
    return {"models": get_available_models()}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
