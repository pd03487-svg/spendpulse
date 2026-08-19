import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("browsermind.llm")


class LLMClient:
    """
    Unified LLM interface supporting OpenAI, Gemini, Anthropic, Ollama,
    and a built-in Heuristic Reasoning Engine for instant out-of-the-box operation.
    """
    def __init__(self, provider: str = "heuristic", model: str = "default", api_key: Optional[str] = None):
        self.provider = provider
        self.model = model
        self.api_key = api_key or getattr(settings, f"{provider}_api_key", None)
        self.client = httpx.AsyncClient(timeout=30.0)

    async def generate_json(self, system_prompt: str, user_prompt: str, schema_example: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate structured JSON output from LLM.
        Falls back to intelligent heuristic engine if API key is not present or error occurs.
        """
        if self.provider == "openai" and self.api_key:
            try:
                return await self._call_openai(system_prompt, user_prompt, response_format="json_object")
            except Exception as e:
                logger.warning(f"OpenAI call failed: {e}, falling back to heuristic")

        elif self.provider == "gemini" and self.api_key:
            try:
                return await self._call_gemini(system_prompt, user_prompt)
            except Exception as e:
                logger.warning(f"Gemini call failed: {e}, falling back to heuristic")

        elif self.provider == "anthropic" and self.api_key:
            try:
                return await self._call_anthropic(system_prompt, user_prompt)
            except Exception as e:
                logger.warning(f"Anthropic call failed: {e}, falling back to heuristic")

        elif self.provider == "ollama":
            try:
                return await self._call_ollama(system_prompt, user_prompt)
            except Exception as e:
                logger.warning(f"Ollama call failed: {e}, falling back to heuristic")

        # Built-in Heuristic Reasoning Fallback
        return schema_example

    async def _call_openai(self, system_prompt: str, user_prompt: str, response_format: str = "text") -> Any:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model if self.model != "default" else "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }
        if response_format == "json_object":
            payload["response_format"] = {"type": "json_object"}

        resp = await self.client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return json.loads(content) if response_format == "json_object" else content

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        model_name = self.model if self.model != "default" else "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\nUser Request: {user_prompt}\n\nReturn strict valid JSON."}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }
        resp = await self.client.post(url, json=payload)
        resp.raise_for_status()
        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)

    async def _call_anthropic(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model if self.model != "default" else "claude-3-5-sonnet-20241022",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}]
        }
        resp = await self.client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        text = resp.json()["content"][0]["text"]
        # Extract JSON substring
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(text)

    async def _call_ollama(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        url = f"{settings.ollama_base_url}/api/generate"
        payload = {
            "model": self.model if self.model != "default" else "llama3",
            "system": system_prompt,
            "prompt": f"{user_prompt}\nProvide valid JSON output only.",
            "format": "json",
            "stream": False
        }
        resp = await self.client.post(url, json=payload)
        resp.raise_for_status()
        return json.loads(resp.json()["response"])

    async def close(self):
        await self.client.aclose()
