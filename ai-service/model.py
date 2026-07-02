import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MAX_SUGGESTIONS = 12

SEVERITIES = {"high", "medium", "low"}
CATEGORIES = {
    "security",
    "accessibility",
    "performance",
    "code_quality",
    "ui_ux",
    "best_practice",
    "bug",
}

RULE_FILES = [
    "owasp_rules.txt",
    "gigw_accessibility_rules.txt",
    "code_quality_rules.txt",
    "review_output_rules.txt",
]

client = Groq(api_key=GROQ_API_KEY, timeout=60.0) if GROQ_API_KEY else None


class AIServiceError(Exception):
    """Raised when the AI provider or AI response cannot be used safely."""

    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


def load_rule_context() -> str:
    rules_dir = Path(__file__).resolve().parent / "rules"
    sections = []

    for file_name in RULE_FILES:
        file_path = rules_dir / file_name
        try:
            content = file_path.read_text(encoding="utf-8").strip()
            if content:
                sections.append(f"### {file_name}\n{content}")
        except FileNotFoundError:
            sections.append(f"### {file_name}\nRule file missing. Continue with general secure code review best practices.")

    return "\n\n".join(sections)


def build_prompt(code: str, language: str) -> str:
    rule_context = load_rule_context()

    return f"""You are Meridian.ai, an expert AI code reviewer.
Review the submitted {language} code using the rule context below.

RULE CONTEXT:
{rule_context}

Return ONLY one valid JSON object. Do not use markdown, code fences, comments, or extra text outside JSON.

Required JSON format:
{{
  "summary": "brief honest summary of the code quality and main risks",
  "overallScore": 0,
  "suggestions": [
    {{
      "line": 0,
      "severity": "high|medium|low",
      "category": "security|accessibility|performance|code_quality|ui_ux|best_practice|bug",
      "issue": "specific problem found in the submitted code",
      "suggestion": "specific practical fix",
      "refactoredCode": "corrected code for this issue; never empty"
    }}
  ]
}}

Review requirements:
- Check security using OWASP-style risks.
- Check GIGW-aligned accessibility/usability for frontend/UI code.
- Check validation, error handling, maintainability, performance, and best practices.
- Prefer fewer high-quality suggestions over many generic suggestions.
- Use line 0 only for file-level/general issues.
- Every suggestion must have non-empty refactoredCode.
- Do not invent issues that are not supported by the code.
- Do not include more than {MAX_SUGGESTIONS} suggestions.

Submitted {language} code:
{code}"""


def clean_response(text: str) -> str:
    if not isinstance(text, str):
        return ""

    text = re.sub(r"```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]

    return text


def clamp_number(value: Any, default: int = 0, minimum: int = 0, maximum: int = 100) -> int:
    try:
        number = int(round(float(value)))
    except (TypeError, ValueError):
        number = default

    return max(minimum, min(maximum, number))


def clean_text(value: Any, fallback: str) -> str:
    if not isinstance(value, str):
        return fallback

    value = value.strip()
    return value or fallback


def normalize_category(value: Any) -> str:
    if not isinstance(value, str):
        return "code_quality"

    normalized = value.strip().lower().replace(" ", "_").replace("-", "_")
    return normalized if normalized in CATEGORIES else "code_quality"


def normalize_severity(value: Any) -> str:
    if not isinstance(value, str):
        return "medium"

    normalized = value.strip().lower()
    return normalized if normalized in SEVERITIES else "medium"


def build_refactored_fallback(issue: str, suggestion: str, language: str) -> str:
    prefix = "#" if language.lower() in {"python", "ruby", "shell", "bash"} else "//"
    return f"{prefix} Fix for: {issue}\n{prefix} {suggestion}"


def normalize_suggestions(raw_suggestions: Any, language: str) -> List[Dict[str, Any]]:
    if not isinstance(raw_suggestions, list):
        return []

    normalized_suggestions = []

    for item in raw_suggestions[:MAX_SUGGESTIONS]:
        if not isinstance(item, dict):
            continue

        issue = clean_text(item.get("issue"), "Issue detected.")
        suggestion = clean_text(item.get("suggestion"), "Please review and improve this section.")
        refactored_code = clean_text(
            item.get("refactoredCode"),
            build_refactored_fallback(issue, suggestion, language),
        )

        normalized_suggestions.append(
            {
                "line": clamp_number(item.get("line"), default=0, minimum=0, maximum=100000),
                "severity": normalize_severity(item.get("severity")),
                "category": normalize_category(item.get("category")),
                "issue": issue,
                "suggestion": suggestion,
                "refactoredCode": refactored_code,
            }
        )

    return normalized_suggestions


def calculate_score(suggestions: List[Dict[str, Any]], ai_score: Any = None) -> int:
    """Use a deterministic score so Good/Fair/Poor is consistent and explainable."""

    if not suggestions:
        return 92

    score = 100

    severity_penalty = {
        "high": 16,
        "medium": 8,
        "low": 3,
    }

    category_extra_penalty = {
        "security": 5,
        "bug": 4,
        "accessibility": 2,
        "performance": 2,
        "code_quality": 0,
        "ui_ux": 1,
        "best_practice": 0,
    }

    for suggestion in suggestions:
        score -= severity_penalty.get(suggestion.get("severity"), 6)
        score -= category_extra_penalty.get(suggestion.get("category"), 0)

    high_count = sum(1 for item in suggestions if item.get("severity") == "high")
    medium_count = sum(1 for item in suggestions if item.get("severity") == "medium")

    if high_count >= 3:
        score -= 10
    elif high_count >= 1:
        score -= 5

    if medium_count >= 5:
        score -= 5

    deterministic_score = max(0, min(100, score))

    # AI score is only used as a weak signal, not the source of truth.
    if ai_score is not None:
        ai_score = clamp_number(ai_score, default=deterministic_score)
        deterministic_score = round((deterministic_score * 0.75) + (ai_score * 0.25))

    return max(0, min(100, deterministic_score))


def normalize_result(result: Dict[str, Any], language: str) -> Dict[str, Any]:
    suggestions = normalize_suggestions(result.get("suggestions"), language)
    score = calculate_score(suggestions, result.get("overallScore"))

    summary = clean_text(result.get("summary"), "Code review completed.")

    return {
        "summary": summary,
        "overallScore": score,
        "suggestions": suggestions,
        "model_used": MODEL_NAME,
        "rules_used": ["owasp", "gigw_accessibility", "code_quality", "review_output"],
    }


def parse_ai_json(raw_text: str, language: str) -> Dict[str, Any]:
    cleaned = clean_response(raw_text)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        print(f"JSON parse error: {exc}")
        print(f"Raw AI response preview: {raw_text[:400] if isinstance(raw_text, str) else raw_text}")
        raise AIServiceError("AI returned an invalid JSON response. Please try again.", status_code=502)

    if not isinstance(parsed, dict):
        raise AIServiceError("AI returned an invalid response format. Please try again.", status_code=502)

    return normalize_result(parsed, language)


def analyze_code(code: str, language: str) -> dict:
    if not client:
        raise AIServiceError("AI service is missing GROQ_API_KEY. Please configure the AI service .env file.", status_code=503)

    prompt = build_prompt(code, language)

    try:
        print(f"Sending to Groq: {language} code ({len(code)} chars)...")

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Meridian.ai, a secure code review assistant. "
                        "Always respond with exactly one valid JSON object and no markdown. "
                        "Every suggestion must include line, severity, category, issue, suggestion, and non-empty refactoredCode."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.15,
            max_tokens=4500,
        )

        raw_text = completion.choices[0].message.content if completion.choices else ""

        if not raw_text or not raw_text.strip():
            raise AIServiceError("AI returned an empty response. Please try again.", status_code=502)

        print(f"Groq responded ({len(raw_text)} chars)")
        result = parse_ai_json(raw_text, language)
        print(f"Analysis complete. Score: {result['overallScore']}, Issues: {len(result['suggestions'])}")
        return result

    except AIServiceError:
        raise
    except Exception as exc:
        status_code = getattr(exc, "status_code", None) or getattr(getattr(exc, "response", None), "status_code", None)
        message = str(exc)
        message_lower = message.lower()

        if status_code in {401, 403} or "invalid api key" in message_lower or "unauthorized" in message_lower:
            raise AIServiceError("AI provider authentication failed. Please check GROQ_API_KEY.", status_code=503)

        if status_code == 429 or "rate limit" in message_lower or "quota" in message_lower or "credit" in message_lower:
            raise AIServiceError("AI provider quota or rate limit was reached. Please try again later.", status_code=429)

        if "timeout" in message_lower or "timed out" in message_lower:
            raise AIServiceError("AI provider timed out. Please try again with shorter code.", status_code=504)

        print(f"AI analysis failed: {message}")
        raise AIServiceError("AI analysis failed. Please try again later.", status_code=500)


def check_ai_health() -> bool:
    return bool(client and GROQ_API_KEY)


def check_ollama_health() -> bool:
    # Backward-compatible name for older imports. This service now uses Groq, not Ollama.
    return check_ai_health()


def get_available_models() -> list:
    return [f"{MODEL_NAME} (Groq)"]
