import asyncio
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from app.models.schemas import (
    TaskState,
    TaskStatus,
    StepStatus,
    AgentRole,
    ActionType,
    ThoughtLog,
    Observation,
    BrowserAction,
    ApprovalStatus,
    FinalReport
)
from app.agents.llm_client import LLMClient
from app.agents.planner import PlannerAgent
from app.agents.researcher import ResearcherAgent
from app.agents.verifier import VerifierAgent
from app.agents.reporter import ReporterAgent
from app.browser.controller import BrowserController
from app.memory.store import MemoryStore
from app.safety.guard import SafetyGuard
from app.config import settings

logger = logging.getLogger("browsermind.orchestrator")


class AgentOrchestrator:
    """
    Master Orchestration Engine for BrowserMind.
    Coordinates Planner, Researcher, Verifier, Reporter agents,
    Browser Automation, Safety Guard, and real-time streaming state.
    """
    def __init__(self, task_state: TaskState):
        self.state = task_state
        self.task_id = task_state.id
        self.llm = LLMClient(
            provider=task_state.llm_provider,
            model=task_state.llm_model,
            api_key=None
        )
        self.planner = PlannerAgent(self.llm)
        self.researcher = ResearcherAgent(self.llm)
        self.verifier = VerifierAgent(self.llm)
        self.reporter = ReporterAgent(self.llm)
        self.browser = BrowserController(headless=settings.headless)
        self.memory = MemoryStore(self.task_id)
        self.safety = SafetyGuard(safety_level=task_state.safety_level)
        
        self.listeners: List[Callable[[Dict[str, Any]], Any]] = []
        self._stop_requested = False
        self._start_time = datetime.utcnow()

    def add_listener(self, callback: Callable[[Dict[str, Any]], Any]):
        self.listeners.append(callback)

    def remove_listener(self, callback: Callable[[Dict[str, Any]], Any]):
        if callback in self.listeners:
            self.listeners.remove(callback)

    async def emit_event(self, event_type: str, data: Dict[str, Any]):
        """Emit real-time WebSocket event to all connected UI clients."""
        payload = {
            "event": event_type,
            "task_id": self.task_id,
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        for cb in self.listeners:
            try:
                res = cb(payload)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                logger.debug(f"Event broadcast error: {e}")

    def log_thought(self, role: AgentRole, thought: str, action_type: Optional[ActionType] = None, action_target: Optional[str] = None, observation_snippet: Optional[str] = None):
        entry = ThoughtLog(
            id=f"th_{len(self.state.thought_logs) + 1}",
            role=role,
            thought=thought,
            action_type=action_type,
            action_target=action_target,
            observation_snippet=observation_snippet
        )
        self.state.thought_logs.append(entry)
        asyncio.create_task(self.emit_event("thought_log", entry.model_dump()))

    async def run(self):
        """Execute the full autonomous decision loop."""
        try:
            # 1. Initialize Browser
            await self.browser.initialize()
            
            # 2. Planning Phase
            self.state.status = TaskStatus.PLANNING
            await self.emit_event("task_status", {"status": self.state.status.value})
            self.log_thought(
                role=AgentRole.PLANNER,
                thought=f"Analyzing goal: '{self.state.goal}'. Decomposing into executable subtasks with verification criteria."
            )
            
            plan = await self.planner.create_plan(self.state.goal, self.state.template_id)
            self.state.plan = plan
            await self.emit_event("plan_update", {"plan": [p.model_dump() for p in self.state.plan]})
            self.log_thought(
                role=AgentRole.PLANNER,
                thought=f"Plan generated with {len(plan)} subtasks. Beginning research phase."
            )
            
            # 3. Execution Loop
            self.state.status = TaskStatus.RUNNING
            await self.emit_event("task_status", {"status": self.state.status.value})

            visited_urls = []
            
            for step_idx, step in enumerate(self.state.plan):
                if self._stop_requested:
                    self.state.status = TaskStatus.PAUSED
                    await self.emit_event("task_status", {"status": self.state.status.value})
                    return

                self.state.current_step_index = step_idx
                step.status = StepStatus.IN_PROGRESS
                step.started_at = datetime.utcnow().isoformat()
                await self.emit_event("plan_update", {"plan": [p.model_dump() for p in self.state.plan]})

                self.log_thought(
                    role=step.assigned_agent,
                    thought=f"Starting Step {step.order}: {step.title} — Objective: {step.objective}"
                )

                # Step execution sub-loop
                step_done = False
                step_actions_count = 0
                max_step_actions = 3

                while not step_done and step_actions_count < max_step_actions and not self._stop_requested:
                    step_actions_count += 1
                    
                    # Researcher decides next action
                    action = await self.researcher.decide_next_action(
                        goal=self.state.goal,
                        current_step_title=step.title,
                        current_step_objective=step.objective,
                        current_url=self.state.current_url,
                        observation=None,
                        visited_urls=visited_urls
                    )

                    # Safety check
                    requires_approval, risk_level, reason = self.safety.assess_action(action, current_url=self.state.current_url or "")
                    if requires_approval:
                        self.log_thought(
                            role=AgentRole.SAFETY,
                            thought=f"Safety Guard intercepted {action.action_type.value}: {reason}. Requesting human approval.",
                            action_type=action.action_type
                        )
                        appr_req = self.safety.create_approval_request(self.task_id, action, reason, risk_level)
                        self.state.pending_approval = appr_req
                        self.state.status = TaskStatus.AWAITING_APPROVAL
                        await self.emit_event("approval_required", appr_req.model_dump())
                        await self.emit_event("task_status", {"status": self.state.status.value})
                        
                        # Wait for human response
                        decision, feedback = await self.safety.wait_for_user_approval(appr_req.id)
                        self.state.pending_approval = None
                        self.state.status = TaskStatus.RUNNING
                        await self.emit_event("task_status", {"status": self.state.status.value})

                        if decision != ApprovalStatus.APPROVED:
                            self.log_thought(
                                role=AgentRole.SAFETY,
                                thought=f"Action rejected by user. Adjusting path and proceeding with alternative search."
                            )
                            step_done = True
                            break

                    # Execute Action in Browser Layer
                    if action.action_type == ActionType.SEARCH:
                        query = action.query or self.state.goal
                        self.log_thought(
                            role=AgentRole.RESEARCHER,
                            thought=f"Searching web engine for: '{query}'",
                            action_type=ActionType.SEARCH,
                            action_target=query
                        )
                        self.memory.record_query(query)
                        self.state.stats["searches_conducted"] += 1
                        
                        search_results = await self.browser.search(query, max_results=4)
                        if search_results:
                            top_url = search_results[0]["url"]
                            self.log_thought(
                                role=AgentRole.RESEARCHER,
                                thought=f"Discovered {len(search_results)} relevant sources. Navigating to top result: {search_results[0]['title']}",
                                observation_snippet=search_results[0]["snippet"]
                            )
                            # Record all discovered sources
                            for res in search_results:
                                src_rec = self.memory.record_source(res["url"], res["title"], res["snippet"])
                                await self.emit_event("source_visited", src_rec.model_dump())
                                
                            # Navigate to top result
                            page_data = await self.browser.navigate(top_url)
                            visited_urls.append(top_url)
                            self._handle_page_data(top_url, page_data)
                        step_done = True

                    elif action.action_type == ActionType.NAVIGATE:
                        url = action.url or ""
                        self.log_thought(
                            role=AgentRole.RESEARCHER,
                            thought=f"Navigating to URL: {url}",
                            action_type=ActionType.NAVIGATE,
                            action_target=url
                        )
                        page_data = await self.browser.navigate(url)
                        visited_urls.append(url)
                        self._handle_page_data(url, page_data)
                        step_done = True

                    elif action.action_type == ActionType.EXTRACT:
                        self.log_thought(
                            role=AgentRole.RESEARCHER,
                            thought=f"Extracted comprehensive DOM tables and entities from current view.",
                            action_type=ActionType.EXTRACT
                        )
                        step_done = True

                    self.state.stats["actions_executed"] += 1
                    await asyncio.sleep(0.8)

                step.status = StepStatus.COMPLETED
                step.completed_at = datetime.utcnow().isoformat()
                step.result_summary = f"Gathered {len(self.state.facts)} verified facts from {len(self.memory.sources)} sources."
                await self.emit_event("plan_update", {"plan": [p.model_dump() for p in self.state.plan]})

            # 4. Verification Phase
            self.state.status = TaskStatus.VERIFYING
            await self.emit_event("task_status", {"status": self.state.status.value})
            self.log_thought(
                role=AgentRole.VERIFIER,
                thought=f"Initiating cross-source corroboration and conflict analysis across {len(self.state.facts)} extracted claims."
            )
            verification_data = await self.verifier.verify_evidence(
                self.memory.get_facts_list(),
                self.memory.get_sources_list()
            )
            self.log_thought(
                role=AgentRole.VERIFIER,
                thought=f"Verification complete: Evidence Score is {verification_data['evidence_score']}%. "
                        f"{len(verification_data['conflicts_detected'])} conflicts detected."
            )

            # 5. Synthesis & Report Generation Phase
            self.state.status = TaskStatus.SYNTHESIZING
            await self.emit_event("task_status", {"status": self.state.status.value})
            self.log_thought(
                role=AgentRole.REPORTER,
                thought="Synthesizing final executive summary, comparison matrix, and citation bibliography."
            )
            final_report = await self.reporter.generate_report(
                task_id=self.task_id,
                goal=self.state.goal,
                facts=self.memory.get_facts_list(),
                sources=self.memory.get_sources_list(),
                verification_data=verification_data
            )
            self.state.final_report = final_report
            self.state.status = TaskStatus.COMPLETED
            
            duration = (datetime.utcnow() - self._start_time).total_seconds()
            self.state.stats["duration_seconds"] = round(duration, 1)
            self.state.stats["pages_visited"] = len(self.memory.sources)
            self.state.stats["facts_extracted"] = len(self.state.facts)
            
            await self.emit_event("report_ready", final_report.model_dump())
            await self.emit_event("task_status", {"status": self.state.status.value, "stats": self.state.stats})
            
            self.log_thought(
                role=AgentRole.REPORTER,
                thought="Final report ready for download and interactive review. Autonomous research concluded."
            )

        except Exception as e:
            logger.exception(f"Error executing task {self.task_id}: {e}")
            self.state.status = TaskStatus.FAILED
            self.state.error_message = str(e)
            await self.emit_event("task_status", {"status": self.state.status.value, "error": str(e)})
            self.log_thought(
                role=AgentRole.SYSTEM,
                thought=f"Task encountered an error: {str(e)}"
            )
        finally:
            await self.browser.close()
            await self.llm.close()

    def _handle_page_data(self, url: str, page_data: Dict[str, Any]):
        title = page_data.get("title", url)
        text = page_data.get("text", "")
        screenshot = page_data.get("screenshot_b64")
        
        self.state.current_url = url
        self.state.current_screenshot = screenshot
        
        # Stream browser viewport update to frontend
        asyncio.create_task(self.emit_event("browser_viewport", {
            "url": url,
            "title": title,
            "screenshot_b64": screenshot
        }))

        # Record in memory
        src_rec = self.memory.record_source(url, title, text, status_code=page_data.get("status_code", 200))
        asyncio.create_task(self.emit_event("source_visited", src_rec.model_dump()))

        # Extract facts
        extracted_facts = self.researcher.extract_facts_from_page(url, title, text, self.state.goal)
        for f_data in extracted_facts:
            fact = self.memory.add_fact(
                claim=f_data["claim"],
                entity=f_data["entity"],
                value=f_data["value"],
                source_url=url,
                source_title=title
            )
            if fact not in self.state.facts:
                self.state.facts.append(fact)
                asyncio.create_task(self.emit_event("fact_discovered", fact.model_dump()))

    def stop(self):
        self._stop_requested = True
