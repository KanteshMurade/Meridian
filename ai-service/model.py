import json
import re
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = "llama-3.3-70b-versatile"

def build_prompt(code: str, language: str) -> str:
    return f"""You are an expert code reviewer. Review this {language} code carefully.

Respond with ONLY a valid JSON object. No markdown, no backticks, no extra text whatsoever.

CRITICAL RULES:
- Every single suggestion MUST have a non-empty refactoredCode field
- refactoredCode must contain the actual corrected code for that specific issue
- Never leave refactoredCode empty, null, or as a placeholder
- overallScore must be your honest assessment based on actual code quality

JSON format:
{{
  "summary": "your honest assessment of this specific code",
  "overallScore": <number 0-100>,
  "suggestions": [
    {{
      "line": <line number where issue exists, or 0 if general>,
      "severity": "<high|medium|low>",
      "issue": "specific problem found in the code",
      "suggestion": "exactly how to fix this specific issue",
      "refactoredCode": "the corrected working code for this issue — REQUIRED, never empty"
    }}
  ]
}}

Scoring guide:
- 0-30: critical bugs or security vulnerabilities
- 31-50: multiple serious problems
- 51-70: several issues to address
- 71-85: minor improvements needed
- 86-100: excellent clean code

IMPORTANT: You MUST provide refactoredCode for every suggestion without exception.
If the fix is a one-liner write that line.
If it requires rewriting a function write the full function.
Never leave refactoredCode blank.

{language} code to review:
{code}"""


def clean_response(text: str) -> str:
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end+1]
    return text


def analyze_code(code: str, language: str) -> dict:
    prompt = build_prompt(code, language)

    try:
        print(f"Sending to Groq: {language} code ({len(code)} chars)...")

        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code reviewer. Always respond ONLY with valid JSON. No markdown, no backticks, no explanation. Every suggestion must have a non-empty refactoredCode field."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=4000,
        )

        raw_text = completion.choices[0].message.content
        print(f"Groq responded ({len(raw_text)} chars)")

        cleaned = clean_response(raw_text)
        result = json.loads(cleaned)

        # Validate structure
        if "summary" not in result or not result["summary"]:
            result["summary"] = "Code review completed."

        if "overallScore" not in result:
            result["overallScore"] = 50
        else:
            try:
                result["overallScore"] = max(0, min(100, int(result["overallScore"])))
            except:
                result["overallScore"] = 50

        if "suggestions" not in result or not isinstance(result["suggestions"], list):
            result["suggestions"] = []

        # Validate each suggestion
        for s in result["suggestions"]:
            if "severity" not in s or s["severity"].lower() not in ["high", "medium", "low"]:
                s["severity"] = "medium"
            else:
                s["severity"] = s["severity"].lower()
            if "line" not in s:
                s["line"] = 0
            if "issue" not in s:
                s["issue"] = "Issue found"
            if "suggestion" not in s:
                s["suggestion"] = "Please review this section"
            # Fallback if model still returns empty refactoredCode
            if "refactoredCode" not in s or not s["refactoredCode"] or not s["refactoredCode"].strip():
                s["refactoredCode"] = f"# Fix for: {s['issue']}\n# {s['suggestion']}"

        print(f"Analysis complete. Score: {result['overallScore']}, Issues: {len(result['suggestions'])}")
        return result

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Raw response: {raw_text[:300]}")
        return {
            "summary": "Code analyzed but response parsing failed. Please try again.",
            "overallScore": 50,
            "suggestions": [
                {
                    "line": 0,
                    "severity": "medium",
                    "issue": "Response parsing failed",
                    "suggestion": "Please try again",
                    "refactoredCode": "# Please resubmit your code for analysis"
                }
            ]
        }
    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")


def check_ollama_health() -> bool:
    return True


def get_available_models() -> list:
    return ["llama-3.3-70b-versatile (Groq)"]