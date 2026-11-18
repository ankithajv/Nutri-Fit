from __future__ import annotations

import json
import logging
import re
from typing import Any
from config import settings

logger = logging.getLogger("nutrifit.llm")

def clean_json_string(text: str) -> str:
    """Strip markdown code fences and whitespace from LLM JSON response."""
    if not text:
        return ""
    text = text.strip()
    # Match ```json ... ``` or ``` ... ```
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fence_match:
        return fence_match.group(1).strip()
    return text

def call_gemini(
    prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.2
) -> str | None:
    """Call Google Gemini Flash model with robust fallback."""
    if not settings.GEMINI_API_KEY:
        logger.warning("Gemini API key is not configured.")
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        models_to_try = [
            settings.GEMINI_MODEL,
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.8-flash"
        ]
        # Deduplicate while preserving order
        candidate_models = list(dict.fromkeys([m for m in models_to_try if m]))

        last_error = None
        for model_name in candidate_models:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens,
                    },
                    system_instruction=system_prompt if system_prompt else None
                )
                response = model.generate_content(prompt, request_options={"timeout": 15})
                if response and response.text:
                    return response.text
            except Exception as ex:
                last_error = ex
                logger.warning(f"Gemini call to {model_name} failed: {ex}. Trying next model...")

        if last_error:
            logger.error(f"All Gemini Flash models failed. Last error: {last_error}")
        return None
    except Exception as e:
        logger.error(f"Gemini API initialization failed: {e}")
        return None

def call_groq(prompt: str, system_prompt: str | None = None, max_tokens: int = 1024) -> str | None:
    if not settings.GROQ_API_KEY:
        logger.warning("Groq API key is not configured.")
        return None
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.2,
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return None

def call_ollama(prompt: str, system_prompt: str | None = None, max_tokens: int = 1024) -> str | None:
    try:
        import httpx
        url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": f"{system_prompt}\n\n{prompt}" if system_prompt else prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "num_predict": max_tokens
            }
        }
        resp = httpx.post(url, json=payload, timeout=15.0)
        if resp.status_code == 200:
            return resp.json().get("response")
    except Exception as e:
        logger.warning(f"Ollama API call failed: {e}")
    return None

def call_llm(
    prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.2
) -> str | None:
    """Route LLM call to configured provider (defaults to Gemini Flash)."""
    provider = settings.LLM_PROVIDER
    if provider == "gemini":
        return call_gemini(prompt, system_prompt, max_tokens=max_tokens, temperature=temperature)
    elif provider == "groq":
        return call_groq(prompt, system_prompt, max_tokens=max_tokens)
    elif provider == "ollama":
        return call_ollama(prompt, system_prompt, max_tokens=max_tokens)
    elif provider == "none":
        return None
    else:
        logger.warning(f"Unknown LLM_PROVIDER '{provider}', falling back to Gemini Flash.")
        return call_gemini(prompt, system_prompt, max_tokens=max_tokens, temperature=temperature)

def call_llm_json(
    prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 1024
) -> Any | None:
    """Call LLM and parse the result into structured JSON object/array."""
    raw = call_llm(prompt, system_prompt=system_prompt, max_tokens=max_tokens, temperature=0.1)
    if not raw:
        return None

    cleaned = clean_json_string(raw)
    try:
        return json.loads(cleaned)
    except Exception as e:
        # Fallback regex search for json object or array
        obj_match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
        if obj_match:
            try:
                return json.loads(obj_match.group(1))
            except Exception:
                pass
        logger.warning(f"Failed to parse LLM JSON: {e}\nRaw response:\n{raw[:300]}")
        return None
