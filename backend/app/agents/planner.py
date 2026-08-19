import uuid
from typing import List, Dict, Any
from app.models.schemas import PlanStep, StepStatus, AgentRole
from app.agents.llm_client import LLMClient


class PlannerAgent:
    """
    Planner Agent (🧠):
    Decomposes high-level natural language goals into an executable multi-step plan.
    """
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def create_plan(self, goal: str, template_id: str = "research") -> List[PlanStep]:
        system_prompt = (
            "You are BrowserMind's Master Planner Agent. Your job is to break down a high-level web research "
            "or automation goal into 4 to 6 concise, highly actionable sequential steps. "
            "Each step must specify a clear title, objective, and assigned agent (researcher, verifier, reporter)."
        )
        user_prompt = f"Goal: {goal}\nTemplate: {template_id}"

        # Heuristic fallback structure tailored to domain
        fallback_steps = self._generate_heuristic_plan(goal, template_id)

        try:
            schema_example = {"steps": [
                {"title": s.title, "objective": s.objective, "assigned_agent": s.assigned_agent.value}
                for s in fallback_steps
            ]}
            result = await self.llm.generate_json(system_prompt, user_prompt, schema_example)
            
            raw_steps = result.get("steps", [])
            if raw_steps and isinstance(raw_steps, list):
                plan = []
                for idx, step_data in enumerate(raw_steps):
                    role = AgentRole.RESEARCHER
                    agent_str = str(step_data.get("assigned_agent", "")).lower()
                    if "verifier" in agent_str:
                        role = AgentRole.VERIFIER
                    elif "reporter" in agent_str:
                        role = AgentRole.REPORTER
                    elif "planner" in agent_str:
                        role = AgentRole.PLANNER

                    plan.append(PlanStep(
                        id=f"step_{idx + 1}",
                        order=idx + 1,
                        title=step_data.get("title", f"Subtask {idx + 1}"),
                        objective=step_data.get("objective", ""),
                        status=StepStatus.PENDING,
                        assigned_agent=role
                    ))
                return plan
        except Exception:
            pass

        return fallback_steps

    def _generate_heuristic_plan(self, goal: str, template_id: str) -> List[PlanStep]:
        g_lower = goal.lower()
        
        if "shop" in template_id or "product" in g_lower or "price" in g_lower or "buy" in g_lower:
            return [
                PlanStep(id="step_1", order=1, title="Search Product Specifications", objective=f"Find top candidates and technical specifications for {goal}", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_2", order=2, title="Extract Pricing & Availability", objective="Gather current pricing, retailer options, and warranty terms", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_3", order=3, title="Aggregate User Reviews & Benchmarks", objective="Extract pros, cons, and performance scores from review portals", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_4", order=4, title="Cross-Check Pricing & Discrepancies", objective="Verify price match, discounts, and identify conflicting specs", status=StepStatus.PENDING, assigned_agent=AgentRole.VERIFIER),
                PlanStep(id="step_5", order=5, title="Generate Comparison Matrix & Verdict", objective="Synthesize product comparison table and purchase recommendations", status=StepStatus.PENDING, assigned_agent=AgentRole.REPORTER),
            ]
        
        elif "job" in template_id or "career" in g_lower or "resume" in g_lower:
            return [
                PlanStep(id="step_1", order=1, title="Identify Target Openings & Portals", objective=f"Search primary job boards and company careers pages for {goal}", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_2", order=2, title="Extract Requirements & Tech Stack", objective="Extract required skills, years of experience, and responsibilities", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_3", order=3, title="Analyze Compensation & Benefits", objective="Gather salary estimates, remote policies, and company culture reviews", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_4", order=4, title="Verify Company Credibility & Match", objective="Cross-reference Glassdoor/levels.fyi and check qualification match", status=StepStatus.PENDING, assigned_agent=AgentRole.VERIFIER),
                PlanStep(id="step_5", order=5, title="Compile Job Report & Tailoring Tips", objective="Produce structured candidate guide and application strategy", status=StepStatus.PENDING, assigned_agent=AgentRole.REPORTER),
            ]
            
        elif "github" in template_id or "repo" in g_lower or "code" in g_lower or "open-source" in g_lower:
            return [
                PlanStep(id="step_1", order=1, title="Discover Top Repositories & Alternatives", objective=f"Search GitHub and documentation for projects related to {goal}", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_2", order=2, title="Extract Architecture & Tech Stack", objective="Analyze READMEs, dependencies, and license classifications", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_3", order=3, title="Evaluate Health & Activity Metrics", objective="Extract star count, commit velocity, open issue ratio, and releases", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
                PlanStep(id="step_4", order=4, title="Cross-Validate Community & Maintenance", objective="Verify active maintainers, documentation quality, and security alerts", status=StepStatus.PENDING, assigned_agent=AgentRole.VERIFIER),
                PlanStep(id="step_5", order=5, title="Synthesize Architectural Evaluation", objective="Generate comprehensive matrix comparing pros, cons, and adoption readiness", status=StepStatus.PENDING, assigned_agent=AgentRole.REPORTER),
            ]

        # Standard Multi-Source Research Default
        return [
            PlanStep(id="step_1", order=1, title="Conduct Multi-Source Web Search", objective=f"Search for authoritative overview and leading sources on '{goal}'", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
            PlanStep(id="step_2", order=2, title="Extract In-Depth Documentation & Facts", objective="Visit top pages, parse article content, tables, and key technical data", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
            PlanStep(id="step_3", order=3, title="Explore Deep Links & Secondary Sources", objective="Follow high-signal links to uncover benchmarks, specs, and nuances", status=StepStatus.PENDING, assigned_agent=AgentRole.RESEARCHER),
            PlanStep(id="step_4", order=4, title="Cross-Verify Findings & Detect Conflicts", objective="Cross-check claims across independent sources and score evidence confidence", status=StepStatus.PENDING, assigned_agent=AgentRole.VERIFIER),
            PlanStep(id="step_5", order=5, title="Synthesize Executive Report & Citations", objective="Assemble structured comparison table, key takeaways, and cited references", status=StepStatus.PENDING, assigned_agent=AgentRole.REPORTER),
        ]
