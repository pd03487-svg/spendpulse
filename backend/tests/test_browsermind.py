import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import TaskState, TaskStatus, SafetyLevel
from app.browser.scraper import scraper
from app.browser.search_engine import search_engine
from app.memory.store import MemoryStore
from app.verification.engine import verification_engine
from app.safety.guard import SafetyGuard
from app.agents.orchestrator import AgentOrchestrator


async def test_backend_components():
    print("🚀 Testing BrowserMind Backend Components...")
    
    # 1. Test Web Scraper HTML parsing
    sample_html = """
    <html>
      <head><title>Test IoT Platform Specs</title></head>
      <body>
        <h1>Home Assistant vs OpenHAB</h1>
        <table>
          <tr><th>Feature</th><th>Home Assistant</th><th>OpenHAB</th></tr>
          <tr><td>Language</td><td>Python</td><td>Java</td></tr>
          <tr><td>Architecture</td><td>Event-driven</td><td>OSGi Modular</td></tr>
        </table>
        <p>Home Assistant provides over 2000 smart home integrations.</p>
        <p>OpenHAB supports multi-protocol rule engines with Eclipse Smarthome.</p>
      </body>
    </html>
    """
    parsed = scraper.parse_html(sample_html, base_url="https://example.com/iot-comparison")
    assert parsed["title"] == "Test IoT Platform Specs"
    assert len(parsed["tables"]) == 1
    assert len(parsed["tables"][0]) == 3
    print("✅ Web Scraper HTML parsing passed.")

    # 2. Test Memory Store & Semantic Search
    mem = MemoryStore("task_test_1")
    src = mem.record_source("https://example.com/iot-comparison", "Test IoT Platform Specs", parsed["text"])
    assert src.domain == "example.com"
    
    f1 = mem.add_fact("Home Assistant uses Python", "Home Assistant", "Python", "https://example.com/iot-comparison", "Specs")
    f2 = mem.add_fact("OpenHAB uses Java", "OpenHAB", "Java", "https://example.com/iot-comparison", "Specs")
    assert len(mem.get_facts_list()) == 2
    
    sim_docs = mem.search_semantic("smart home integrations")
    assert len(sim_docs) > 0
    print("✅ Memory Store & Semantic Search passed.")

    # 3. Test Verification Engine
    v_res = verification_engine.verify_facts(mem.get_facts_list(), mem.get_sources_list())
    assert "evidence_score" in v_res
    assert v_res["evidence_score"] > 50.0
    print(f"✅ Verification Engine passed (Score: {v_res['evidence_score']}%).")

    # 4. Test Safety Guard
    safety = SafetyGuard(safety_level=SafetyLevel.BALANCED)
    from app.models.schemas import BrowserAction, ActionType
    safe_action = BrowserAction(action_type=ActionType.SEARCH, query="IoT platforms")
    req_appr, risk, reason = safety.assess_action(safe_action)
    assert not req_appr
    
    dangerous_action = BrowserAction(action_type=ActionType.CLICK, selector="#checkout-pay-button-submit")
    req_appr2, risk2, reason2 = safety.assess_action(dangerous_action)
    assert req_appr2
    assert risk2 == "high"
    print("✅ Safety Guard & Action Interception passed.")

    print("🎉 All backend component tests passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_backend_components())
