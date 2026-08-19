import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import TaskCreateRequest, SafetyLevel
from app.routers.tasks import create_task, get_task, export_report
from fastapi import BackgroundTasks


async def test_e2e_agent_workflow():
    print("🚀 Starting End-to-End BrowserMind Agent Execution Test...")
    
    bg = BackgroundTasks()
    req = TaskCreateRequest(
        goal="Research and compare open-source IoT platforms: Home Assistant vs OpenHAB",
        template_id="research",
        safety_level=SafetyLevel.BALANCED,
        max_steps=5,
        llm_provider="heuristic",
        multi_agent_mode=True
    )
    
    # 1. Create task
    task_state = await create_task(req, bg)
    task_id = task_state.id
    print(f"✅ Created Agent Task ID: {task_id}")
    
    # 2. Monitor task progress until completion
    max_wait_seconds = 45
    waited = 0
    while waited < max_wait_seconds:
        await asyncio.sleep(2)
        waited += 2
        updated_state = await get_task(task_id)
        print(f"⏱️ [{waited}s] Status: {updated_state.status.value} | Plan Steps: {len(updated_state.plan)} | Facts: {len(updated_state.facts)} | Sources: {len(updated_state.sources)}")
        
        if updated_state.status.value == "completed":
            print("🎉 Task completed autonomously!")
            assert updated_state.final_report is not None
            print(f"📊 Final Evidence Confidence Score: {updated_state.final_report.evidence_score}%")
            print(f"📋 Executive Summary: {updated_state.final_report.executive_summary[:120]}...")
            print(f"📚 Verified Sources: {len(updated_state.final_report.verified_sources)}")
            break
        elif updated_state.status.value == "failed":
            raise RuntimeError(f"Task failed: {updated_state.error_message}")

    # 3. Test Export
    export_resp = await export_report(task_id, "md")
    assert export_resp.status_code == 200
    assert len(export_resp.body) > 100
    print("✅ Markdown export validated.")
    print("🌟 All End-to-End Agent tests passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_e2e_agent_workflow())
