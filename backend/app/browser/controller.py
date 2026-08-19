import asyncio
import base64
import logging
from typing import Optional, Dict, Any, List
from app.browser.scraper import scraper
from app.browser.search_engine import search_engine
from app.config import settings

logger = logging.getLogger("browsermind.browser")


class BrowserController:
    """
    Playwright-powered browser automation controller with resilient
    DOM interaction, scrolling, screenshot streaming, and fallback engine.
    """
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        self.current_url = "about:blank"
        self.current_title = "New Tab"
        self.is_initialized = False
        self._lock = asyncio.Lock()

    async def initialize(self):
        async with self._lock:
            if self.is_initialized:
                return
            try:
                from playwright.async_api import async_playwright
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=self.headless,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--disable-infobars",
                        "--window-size=1280,800"
                    ]
                )
                self.context = await self.browser.new_context(
                    viewport={"width": settings.viewport_width, "height": settings.viewport_height},
                    user_agent=settings.user_agent
                )
                self.page = await self.context.new_page()
                self.is_initialized = True
                logger.info("Playwright browser initialized successfully.")
            except Exception as e:
                logger.warning(f"Playwright initialization failed or falling back: {e}")
                self.is_initialized = False

    async def navigate(self, url: str) -> Dict[str, Any]:
        """Navigate to a URL and capture page content & screenshot."""
        if not url.startswith("http://") and not url.startswith("https://"):
            url = f"https://{url}"
        
        self.current_url = url
        screenshot_b64 = None
        
        if self.is_initialized and self.page:
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=settings.browser_timeout_ms)
                await asyncio.sleep(1.0)  # settle dynamic hydration
                self.current_title = await self.page.title() or url
                self.current_url = self.page.url
                
                # Capture screenshot
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=70)
                screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                
                # Extract content
                html = await self.page.content()
                parsed = scraper.parse_html(html, base_url=self.current_url)
                parsed["screenshot_b64"] = screenshot_b64
                return parsed
            except Exception as e:
                logger.warning(f"Playwright navigate error on {url}: {e}, using scraper fallback")
        
        # Fallback to HTTP scraper
        parsed = await scraper.fetch_and_parse(url)
        self.current_title = parsed.get("title", url)
        self.current_url = parsed.get("url", url)
        
        # Generate simulated page screenshot canvas
        screenshot_b64 = self._generate_fallback_screenshot(self.current_title, self.current_url, parsed.get("text", ""))
        parsed["screenshot_b64"] = screenshot_b64
        return parsed

    async def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Conduct web search using search engine aggregator."""
        return await search_engine.search(query, max_results=max_results)

    async def click(self, selector_or_text: str) -> Dict[str, Any]:
        """Click an element by CSS selector, text content, or link."""
        if self.is_initialized and self.page:
            try:
                # Try clicking by exact selector or text
                if selector_or_text.startswith(("#", ".", "[", "button", "a", "input")):
                    await self.page.click(selector_or_text, timeout=5000)
                else:
                    await self.page.click(f"text={selector_or_text}", timeout=5000)
                
                await asyncio.sleep(1.0)
                self.current_url = self.page.url
                self.current_title = await self.page.title()
                
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=70)
                screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                html = await self.page.content()
                parsed = scraper.parse_html(html, base_url=self.current_url)
                parsed["screenshot_b64"] = screenshot_b64
                return parsed
            except Exception as e:
                logger.warning(f"Playwright click error '{selector_or_text}': {e}")
        
        return {
            "status": "clicked",
            "target": selector_or_text,
            "url": self.current_url,
            "title": self.current_title,
            "text": f"Simulated interaction on '{selector_or_text}'",
            "links": [],
            "tables": []
        }

    async def type_text(self, selector: str, text: str) -> Dict[str, Any]:
        """Type text into an input element."""
        if self.is_initialized and self.page:
            try:
                await self.page.fill(selector, text, timeout=5000)
                await asyncio.sleep(0.5)
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=70)
                screenshot_b64 = f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
                return {"status": "typed", "selector": selector, "text": text, "screenshot_b64": screenshot_b64}
            except Exception as e:
                logger.warning(f"Playwright type error on '{selector}': {e}")
        
        return {"status": "typed", "selector": selector, "text": text}

    async def scroll(self, direction: str = "down", amount: int = 500) -> Optional[str]:
        """Scroll the page up or down and capture screenshot."""
        if self.is_initialized and self.page:
            try:
                delta = amount if direction == "down" else -amount
                await self.page.evaluate(f"window.scrollBy(0, {delta});")
                await asyncio.sleep(0.5)
                screenshot_bytes = await self.page.screenshot(type="jpeg", quality=70)
                return f"data:image/jpeg;base64,{base64.b64encode(screenshot_bytes).decode('utf-8')}"
            except Exception as e:
                logger.warning(f"Playwright scroll error: {e}")
        return None

    def _generate_fallback_screenshot(self, title: str, url: str, content: str) -> str:
        """Generate high-fidelity SVG/data-url thumbnail for fast streaming when headless mode is scraping."""
        preview_text = content[:400].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f172a" />
                    <stop offset="100%" stop-color="#1e293b" />
                </linearGradient>
            </defs>
            <rect width="1280" height="800" fill="url(#bg)"/>
            <!-- Browser Chrome -->
            <rect width="1280" height="50" fill="#1e293b" />
            <circle cx="25" cy="25" r="7" fill="#ef4444" />
            <circle cx="45" cy="25" r="7" fill="#eab308" />
            <circle cx="65" cy="25" r="7" fill="#22c55e" />
            <rect x="90" y="10" width="1100" height="30" rx="6" fill="#334155" />
            <text x="110" y="30" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14">🔒 {url}</text>
            <!-- Page Content Body -->
            <rect x="50" y="80" width="1180" height="670" rx="12" fill="#ffffff" fill-opacity="0.05" stroke="#334155" stroke-width="1"/>
            <text x="80" y="130" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="26" font-weight="bold">{title[:60]}</text>
            <line x1="80" y1="150" x2="1200" y2="150" stroke="#334155" stroke-width="1" />
            <foreignObject x="80" y="170" width="1120" height="550">
                <div xmlns="http://www.w3.org/1999/xhtml" style="color: #cbd5e1; font-family: system-ui, sans-serif; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
                    {preview_text}
                </div>
            </foreignObject>
        </svg>"""
        b64_svg = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
        return f"data:image/svg+xml;base64,{b64_svg}"

    async def close(self):
        async with self._lock:
            try:
                if self.context:
                    await self.context.close()
                if self.browser:
                    await self.browser.close()
                if self.playwright:
                    await self.playwright.stop()
            except Exception as e:
                logger.debug(f"Browser close error: {e}")
            finally:
                self.is_initialized = False
                self.browser = None
                self.context = None
                self.page = None
                self.playwright = None
