from fastapi import APIRouter
from app.models.schemas import AgentSettings
from app.config import settings

router = APIRouter(prefix="/api/settings", tags=["settings"])

_current_settings = AgentSettings(
    openai_api_key=settings.openai_api_key,
    gemini_api_key=settings.gemini_api_key,
    anthropic_api_key=settings.anthropic_api_key,
    default_provider="heuristic",
    default_model="auto",
    headless_browser=settings.headless,
    max_search_results=5,
    enable_screenshots=True
)


@router.get("", response_model=AgentSettings)
async def get_settings():
    """Retrieve active system and LLM settings."""
    # Mask secret keys for UI safety
    masked = _current_settings.model_copy()
    if masked.openai_api_key:
        masked.openai_api_key = f"sk-...{masked.openai_api_key[-4:]}" if len(masked.openai_api_key) > 6 else "******"
    if masked.gemini_api_key:
        masked.gemini_api_key = f"...{masked.gemini_api_key[-4:]}" if len(masked.gemini_api_key) > 6 else "******"
    if masked.anthropic_api_key:
        masked.anthropic_api_key = f"sk-ant-...{masked.anthropic_api_key[-4:]}" if len(masked.anthropic_api_key) > 6 else "******"
    return masked


@router.post("", response_model=AgentSettings)
async def update_settings(new_settings: AgentSettings):
    """Update system and LLM configuration."""
    global _current_settings
    # Only update API keys if not a masked string
    if new_settings.openai_api_key and not new_settings.openai_api_key.startswith("sk-..."):
        _current_settings.openai_api_key = new_settings.openai_api_key
        settings.openai_api_key = new_settings.openai_api_key

    if new_settings.gemini_api_key and not new_settings.gemini_api_key.startswith("..."):
        _current_settings.gemini_api_key = new_settings.gemini_api_key
        settings.gemini_api_key = new_settings.gemini_api_key

    if new_settings.anthropic_api_key and not new_settings.anthropic_api_key.startswith("sk-ant-..."):
        _current_settings.anthropic_api_key = new_settings.anthropic_api_key
        settings.anthropic_api_key = new_settings.anthropic_api_key

    _current_settings.default_provider = new_settings.default_provider
    _current_settings.default_model = new_settings.default_model
    _current_settings.safety_level = new_settings.safety_level
    _current_settings.headless_browser = new_settings.headless_browser
    settings.headless = new_settings.headless_browser

    return await get_settings()
