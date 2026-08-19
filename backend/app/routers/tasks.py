import asyncio
import uuid
import json
import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, Response
from pydantic import BaseModel

from app.models.schemas import (
    TaskCreateRequest,
    TaskState,
    TaskStatus,
    ApprovalStatus
)
from app.agents.orchestrator import AgentOrchestrator
from app.config import settings

logger = logging.getLogger("browsermind.tasks_api")

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# In-memory storage for active tasks and orchestrators
tasks_db: Dict[str, TaskState] = {}
orchestrators_db: Dict[str, AgentOrchestrator] = {}
active_connections: Dict[str, List[WebSocket]] = {}


class ApprovalDecisionPayload(BaseModel):
    request_id: str
    approved: bool
    feedback: Optional[str] = None


@router.post("", response_model=TaskState)
async def create_task(req: TaskCreateRequest, bg: BackgroundTasks):
    """Create and launch a new autonomous browser agent task."""
    task_id = f"task_{uuid.uuid4().hex[:10]}"
    
    state = TaskState(
        id=task_id,
        goal=req.goal,
        template_id=req.template_id or "research",
        safety_level=req.safety_level,
        max_steps=req.max_steps,
        multi_agent_mode=req.multi_agent_mode,
        llm_provider=req.llm_provider or "heuristic",
        llm_model=req.llm_model or "default"
    )
    
    tasks_db[task_id] = state
    orchestrator = AgentOrchestrator(state)
    orchestrators_db[task_id] = orchestrator

    # Attach WebSocket broadcaster
    async def _ws_broadcaster(event_payload: Dict[str, Any]):
        if task_id in active_connections:
            dead_conns = []
            for ws in active_connections[task_id]:
                try:
                    await ws.send_json(event_payload)
                except Exception:
                    dead_conns.append(ws)
            for d in dead_conns:
                active_connections[task_id].remove(d)

    orchestrator.add_listener(_ws_broadcaster)

    # Run orchestrator in asyncio background task
    asyncio.create_task(orchestrator.run())

    return state


@router.get("", response_model=List[TaskState])
async def list_tasks():
    """List all created tasks ordered newest first."""
    all_tasks = list(tasks_db.values())
    all_tasks.sort(key=lambda t: t.created_at, reverse=True)
    return all_tasks


@router.get("/{task_id}", response_model=TaskState)
async def get_task(task_id: str):
    """Get full state, steps, thoughts, sources, and report for a task."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks_db[task_id]


@router.post("/{task_id}/stop")
async def stop_task(task_id: str):
    """Stop/pause an active agent task."""
    if task_id not in orchestrators_db:
        raise HTTPException(status_code=404, detail="Task orchestrator not found")
    orchestrators_db[task_id].stop()
    tasks_db[task_id].status = TaskStatus.PAUSED
    return {"status": "stopped", "task_id": task_id}


@router.post("/{task_id}/approve")
async def approve_task_action(task_id: str, payload: ApprovalDecisionPayload):
    """Resolve a human-in-the-loop approval request."""
    if task_id not in orchestrators_db:
        raise HTTPException(status_code=404, detail="Task not found")
    
    orch = orchestrators_db[task_id]
    success = orch.safety.resolve_request(payload.request_id, payload.approved, payload.feedback)
    if not success:
        raise HTTPException(status_code=400, detail="Could not resolve approval request (invalid or expired ID)")
    
    return {"status": "resolved", "approved": payload.approved, "request_id": payload.request_id}


@router.get("/{task_id}/export/{export_format}")
async def export_report(task_id: str, export_format: str):
    """Export final report as markdown (.md) or JSON."""
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks_db[task_id]
    report = task.final_report
    if not report:
        raise HTTPException(status_code=400, detail="Report not generated yet")

    if export_format.lower() in ("md", "markdown"):
        return Response(
            content=report.markdown_content,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename=browsermind_report_{task_id}.md"}
        )
    elif export_format.lower() == "json":
        return Response(
            content=report.model_dump_json(indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=browsermind_report_{task_id}.json"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format (use 'md' or 'json')")


@router.websocket("/{task_id}/ws")
async def websocket_task_stream(websocket: WebSocket, task_id: str):
    """
    WebSocket endpoint for real-time thought stream, live browser screenshots,
    plan status changes, human approval requests, and final report.
    """
    await websocket.accept()
    if task_id not in active_connections:
        active_connections[task_id] = []
    active_connections[task_id].append(websocket)

    # Send initial state snapshot immediately upon connection
    if task_id in tasks_db:
        task_state = tasks_db[task_id]
        await websocket.send_json({
            "event": "initial_snapshot",
            "task_id": task_id,
            "data": task_state.model_dump()
        })

    try:
        while True:
            # Listen for client actions (e.g. human approval decision or stop command)
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                
                if action == "approve":
                    req_id = msg.get("request_id")
                    approved = msg.get("approved", True)
                    feedback = msg.get("feedback")
                    if task_id in orchestrators_db and req_id:
                        orchestrators_db[task_id].safety.resolve_request(req_id, approved, feedback)

                elif action == "stop":
                    if task_id in orchestrators_db:
                        orchestrators_db[task_id].stop()
            except Exception as e:
                logger.debug(f"WS client message error: {e}")

    except WebSocketDisconnect:
        if task_id in active_connections and websocket in active_connections[task_id]:
            active_connections[task_id].remove(websocket)
