import re
from typing import Dict, Any, List, Optional
from app.models.schemas import BrowserAction, ActionType, Observation, Fact
from app.agents.llm_client import LLMClient


class ResearcherAgent:
    """
    Researcher / Navigator Agent (🌐):
    Formulates targeted web searches, navigates DOM pages, inspects text/tables,
    and extracts structured facts and entities.
    """
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def decide_next_action(
        self,
        goal: str,
        current_step_title: str,
        current_step_objective: str,
        current_url: Optional[str],
        observation: Optional[Observation],
        visited_urls: List[str]
    ) -> BrowserAction:
        """
        Decide what browser action to take next based on step objective and page observation.
        """
        if not current_url or current_url in ("about:blank", "") or not observation:
            query = self._formulate_search_query(goal, current_step_title, current_step_objective)
            return BrowserAction(
                action_type=ActionType.SEARCH,
                query=query,
                explanation=f"Conducting targeted web search for '{query}'"
            )

        links = observation.links
        unvisited_links = [l for l in links if l["url"] not in visited_urls]

        if unvisited_links and len(visited_urls) < 5:
            target = unvisited_links[0]
            return BrowserAction(
                action_type=ActionType.NAVIGATE,
                url=target["url"],
                explanation=f"Navigating to relevant source '{target['text']}' ({target['url']})"
            )

        return BrowserAction(
            action_type=ActionType.EXTRACT,
            url=current_url,
            explanation=f"Extracting detailed content, metrics and tables from {current_url}"
        )

    def extract_facts_from_page(self, url: str, title: str, text: str, goal: str) -> List[Dict[str, str]]:
        """
        Parse page text and extract structured facts (entity, claim, value).
        Filters out error strings, network messages, or generic boilerplate.
        """
        facts = []
        # Exclude error phrases
        ignore_phrases = ["failed to retrieve", "nodename nor servname", "404 not found", "error", "bad gateway", "timeout", "enable javascript", "cookie policy"]
        
        lines = [
            l.strip() for l in text.splitlines()
            if len(l.strip()) > 15 and not any(ig in l.lower() for ig in ignore_phrases)
        ]
        
        clean_title = re.sub(r"^(Comprehensive Overview & Documentation:\s*|Technical Specifications\s*-\s*)", "", title, flags=re.I).strip()
        entity_base = clean_title.split("-")[0].split("|")[0].split(":")[0].strip() or goal[:25]

        # 1. Look for structured key-value lines
        for line in lines[:20]:
            if ":" in line and len(line) < 160:
                parts = line.split(":", 1)
                attr = parts[0].strip()
                val = parts[1].strip()
                if 2 < len(attr) < 35 and len(val) > 2 and not any(ig in val.lower() for ig in ignore_phrases):
                    facts.append({
                        "entity": f"{entity_base}: {attr}",
                        "claim": f"{entity_base} {attr}: {val}",
                        "value": val
                    })
            elif " - " in line and len(line) < 140:
                parts = line.split(" - ", 1)
                attr = parts[0].strip()
                val = parts[1].strip()
                if 2 < len(attr) < 30 and len(val) > 3 and not any(ig in val.lower() for ig in ignore_phrases):
                    facts.append({
                        "entity": f"{entity_base}: {attr}",
                        "claim": f"{attr}: {val}",
                        "value": val
                    })

        # 2. Extract high-signal feature sentences
        keywords = ["features", "includes", "supports", "pricing", "price", "powered by", "architecture", "built with", "released", "specifications", "display", "chip", "battery", "storage", "camera", "performance", "open source", "license"]
        for idx, line in enumerate(lines[:12]):
            if any(kw in line.lower() for kw in keywords):
                # Avoid duplicate claims
                if not any(f["claim"] == line[:150] for f in facts):
                    facts.append({
                        "entity": f"{entity_base}: Specification #{len(facts) + 1}",
                        "claim": line[:150],
                        "value": line[:110]
                    })

        # 3. If still empty, create high-level verified overview fact
        if not facts and lines:
            facts.append({
                "entity": f"{entity_base}: Architecture Overview",
                "claim": lines[0][:150],
                "value": lines[0][:100]
            })

        return facts[:8]

    def _formulate_search_query(self, goal: str, step_title: str, objective: str) -> str:
        clean_goal = re.sub(r"[^\w\s]", "", goal)
        words = clean_goal.split()
        if len(words) > 8:
            clean_goal = " ".join(words[:8])
            
        if "spec" in step_title.lower():
            return f"{clean_goal} specifications features"
        elif "price" in step_title.lower() or "cost" in step_title.lower():
            return f"{clean_goal} pricing models plans"
        elif "repo" in step_title.lower() or "github" in step_title.lower():
            return f"{clean_goal} github repository architecture"
        elif "job" in step_title.lower():
            return f"{clean_goal} job requirements salary"
        else:
            return f"{clean_goal} analysis overview"
