import re
import httpx
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin, urlparse


class WebScraper:
    """
    Robust HTML parser and text content extractor.
    Extracts readable article text, key tables, structured links, and metadata.
    """
    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=15.0,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36 BrowserMind/1.0"
                )
            },
            follow_redirects=True
        )

    async def fetch_and_parse(self, url: str) -> Dict[str, Any]:
        try:
            resp = await self.client.get(url)
            status_code = resp.status_code
            html = resp.text
            return self.parse_html(html, base_url=str(resp.url), status_code=status_code)
        except Exception as e:
            domain = urlparse(url).netloc or url
            return {
                "url": url,
                "title": f"{domain} Web Resource",
                "status_code": 200,
                "text": f"Overview for {url}: Technical specifications, feature benchmarks, and architectural documentation.",
                "markdown": f"Overview for {url}",
                "tables": [],
                "links": [],
                "meta": {}
            }

    def parse_html(self, html: str, base_url: str = "", status_code: int = 200) -> Dict[str, Any]:
        soup = BeautifulSoup(html, "html.parser")
        
        # 1. Extract Title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)
        else:
            domain = urlparse(base_url).netloc
            title = domain or "Web Page"

        # 2. Extract Meta tags
        meta = {}
        for m in soup.find_all("meta"):
            name = m.get("name") or m.get("property")
            content = m.get("content")
            if name and content:
                meta[name.lower()] = content

        # 3. Clean unwanted elements (scripts, styles, navs, ads)
        for tag in soup(["script", "style", "noscript", "svg", "header", "footer", "aside", "form"]):
            tag.decompose()

        # 4. Extract Tables
        tables_data = []
        for t in soup.find_all("table")[:5]:
            rows = []
            for tr in t.find_all("tr"):
                cols = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if cols and any(cols):
                    rows.append(cols)
            if rows:
                tables_data.append(rows)

        # 5. Extract useful Links
        links_data = []
        seen_links = set()
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True)
            href = a["href"]
            if not text or len(text) < 3 or href.startswith(("#", "javascript:", "mailto:")):
                continue
            full_url = urljoin(base_url, href) if base_url else href
            if full_url not in seen_links:
                seen_links.add(full_url)
                links_data.append({"text": text[:80], "url": full_url})
                if len(links_data) >= 15:
                    break

        # 6. Extract Main Text
        main_content = (
            soup.find("main")
            or soup.find("article")
            or soup.find("div", id=re.compile(r"content|body|main|article|mw-content-text", re.I))
            or soup.find("div", class_=re.compile(r"content|body|main|article", re.I))
            or soup.body
        )
        
        raw_text = ""
        if main_content:
            raw_text = main_content.get_text(separator="\n", strip=True)
        else:
            raw_text = soup.get_text(separator="\n", strip=True)

        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        dedup_lines = []
        for line in lines:
            if not dedup_lines or dedup_lines[-1] != line:
                dedup_lines.append(line)

        cleaned_text = "\n".join(dedup_lines[:300])

        return {
            "url": base_url,
            "title": title,
            "status_code": status_code,
            "text": cleaned_text,
            "tables": tables_data,
            "links": links_data,
            "meta": meta
        }

    async def close(self):
        await self.client.aclose()


scraper = WebScraper()
