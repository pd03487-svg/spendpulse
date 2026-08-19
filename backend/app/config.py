import os
from pathlib import Path
from pydantic import BaseModel
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)
REPORTS_DIR = DATA_DIR / "reports"
REPORTS_DIR.mkdir(exist_ok=True, parents=True)
SCREENSHOTS_DIR = DATA_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True, parents=True)


class Settings(BaseModel):
    app_name: str = "BrowserMind AI"
    app_version: str = "2.0.0"
    debug: bool = True
    
    # Universal Search & Browser Config
    user_agent: str = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36 BrowserMind/2.0"
    )
    accept_language: str = "en-US,en;q=0.9"
    
    # LLM configurations
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    anthropic_api_key: Optional[str] = os.getenv("ANTHROPIC_API_KEY", "")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Browser automation config
    headless: bool = os.getenv("HEADLESS", "true").lower() == "true"
    browser_timeout_ms: int = 30000
    viewport_width: int = 1280
    viewport_height: int = 800
    
    # Safety & Subtasks
    default_safety_level: str = "balanced"
    max_steps_default: int = 15


settings = Settings()
