from __future__ import annotations
from enum import Enum
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class TaskStatus(str, Enum):
    IDLE = "idle"
    PLANNING = "planning"
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    VERIFYING = "verifying"
    SYNTHESIZING = "synthesizing"
    COMPLETED = "completed"
    PAUSED = "paused"
    FAILED = "failed"


class AgentRole(str, Enum):
    PLANNER = "planner"
    RESEARCHER = "researcher"
    VERIFIER = "verifier"
    REPORTER = "reporter"
    SAFETY = "safety"
    SYSTEM = "system"


class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class ActionType(str, Enum):
    NAVIGATE = "navigate"
    SEARCH = "search"
    CLICK = "click"
    TYPE = "type"
    SCROLL = "scroll"
    EXTRACT = "extract"
    SCREENSHOT = "screenshot"
    VERIFY = "verify"
    FINISH = "finish"
    ASK_USER = "ask_user"


class SafetyLevel(str, Enum):
    STRICT = "strict"
    BALANCED = "balanced"
    AUTONOMOUS = "autonomous"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PlanStep(BaseModel):
    id: str
    order: int
    title: str
    objective: str
    status: StepStatus = StepStatus.PENDING
    assigned_agent: AgentRole = AgentRole.RESEARCHER
    result_summary: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None


class BrowserAction(BaseModel):
    action_type: ActionType
    url: Optional[str] = None
    query: Optional[str] = None
    selector: Optional[str] = None
    text: Optional[str] = None
    direction: Optional[str] = "down"
    is_sensitive: bool = False
    explanation: Optional[str] = None
    requires_approval: bool = False


class Observation(BaseModel):
    timestamp: str
    url: str
    title: str
    status_code: int = 200
    text_snippet: str = ""
    links: List[Dict[str, str]] = Field(default_factory=list)
    tables: List[List[List[str]]] = Field(default_factory=list)
    screenshot_b64: Optional[str] = None
    extracted_items_count: int = 0


class Fact(BaseModel):
    id: str
    claim: str
    entity: str
    value: str
    source_url: str
    source_title: str
    corroboration_count: int = 1
    confidence: float = 0.85
    is_conflicting: bool = False
    conflicting_details: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ProductDeal(BaseModel):
    retailer: str
    price: str
    original_price: Optional[str] = None
    discount: Optional[str] = None
    buy_url: str
    availability: str = "In Stock"
    deal_tag: Optional[str] = "Best Offer"
    shipping: Optional[str] = "Free Shipping"
    coupon_code: Optional[str] = None


class ProductSpec(BaseModel):
    category: str
    name: str
    value: str


class ProductVerdict(BaseModel):
    score: float = 9.2
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)
    verdict_summary: str = ""
    best_for: str = ""


class ComparedProduct(BaseModel):
    id: str
    name: str
    price_inr: str
    original_price_inr: Optional[str] = None
    discount: Optional[str] = None
    badge: Optional[str] = "Top Contender"
    rating: float = 4.6
    best_store: str = "Amazon"
    best_buy_url: str = ""
    specs: Dict[str, str] = Field(default_factory=dict)
    pros: List[str] = Field(default_factory=list)
    cons: List[str] = Field(default_factory=list)


class SourceRecord(BaseModel):
    id: str
    url: str
    title: str
    domain: str
    trust_score: float = 0.9
    visit_count: int = 1
    content_summary: str = ""
    extracted_facts_count: int = 0
    first_visited_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    last_visited_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ApprovalRequest(BaseModel):
    id: str
    task_id: str
    action_type: ActionType
    target_url: Optional[str] = None
    description: str
    risk_level: str = "medium"
    payload: Dict[str, Any] = Field(default_factory=dict)
    status: ApprovalStatus = ApprovalStatus.PENDING
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    resolved_at: Optional[str] = None
    user_feedback: Optional[str] = None


class ThoughtLog(BaseModel):
    id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    role: AgentRole
    thought: str
    action_type: Optional[ActionType] = None
    action_target: Optional[str] = None
    observation_snippet: Optional[str] = None


class ComparisonRow(BaseModel):
    feature_or_item: str
    values: Dict[str, str] = Field(default_factory=dict)
    verdict: Optional[str] = None


class ComparisonMatrix(BaseModel):
    columns: List[str] = Field(default_factory=list)
    rows: List[ComparisonRow] = Field(default_factory=list)


class FinalReport(BaseModel):
    task_id: str
    goal: str
    is_single_product_query: bool = False
    product_name: Optional[str] = None
    lowest_price: Optional[str] = None
    msrp_price: Optional[str] = None
    
    executive_summary: str
    key_findings: List[str] = Field(default_factory=list)
    comparison_matrix: Optional[ComparisonMatrix] = None
    
    # Side-by-Side Multi-Product Comparison (for comparison queries)
    compared_products: List[ComparedProduct] = Field(default_factory=list)
    
    # Single Product Specs & Multi-Platform Pricing (for specific product queries)
    specifications: List[ProductSpec] = Field(default_factory=list)
    best_buy_deals: List[ProductDeal] = Field(default_factory=list)
    active_offers: List[str] = Field(default_factory=list)
    verdict: Optional[ProductVerdict] = None

    conflicts_detected: List[str] = Field(default_factory=list)
    verified_sources: List[SourceRecord] = Field(default_factory=list)
    evidence_score: float = 90.0
    actionable_recommendations: List[str] = Field(default_factory=list)
    markdown_content: str = ""
    generated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class TaskCreateRequest(BaseModel):
    goal: str
    template_id: Optional[str] = "research"
    safety_level: SafetyLevel = SafetyLevel.BALANCED
    max_steps: int = 15
    llm_provider: Optional[str] = "heuristic"
    llm_model: Optional[str] = "default"
    api_key: Optional[str] = None
    multi_agent_mode: bool = True


class TaskState(BaseModel):
    id: str
    goal: str
    template_id: str = "research"
    status: TaskStatus = TaskStatus.IDLE
    safety_level: SafetyLevel = SafetyLevel.BALANCED
    max_steps: int = 15
    multi_agent_mode: bool = True
    llm_provider: str = "heuristic"
    llm_model: str = "default"
    
    plan: List[PlanStep] = Field(default_factory=list)
    current_step_index: int = 0
    current_url: Optional[str] = None
    current_screenshot: Optional[str] = None
    
    sources: List[SourceRecord] = Field(default_factory=list)
    facts: List[Fact] = Field(default_factory=list)
    thought_logs: List[ThoughtLog] = Field(default_factory=list)
    pending_approval: Optional[ApprovalRequest] = None
    final_report: Optional[FinalReport] = None
    
    stats: Dict[str, Any] = Field(default_factory=lambda: {
        "pages_visited": 0,
        "searches_conducted": 0,
        "facts_extracted": 0,
        "actions_executed": 0,
        "duration_seconds": 0
    })
    
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    error_message: Optional[str] = None


class AgentSettings(BaseModel):
    openai_api_key: Optional[str] = ""
    gemini_api_key: Optional[str] = ""
    anthropic_api_key: Optional[str] = ""
    default_provider: str = "heuristic"
    default_model: str = "auto"
    safety_level: SafetyLevel = SafetyLevel.BALANCED
    headless_browser: bool = True
    max_search_results: int = 5
    enable_screenshots: bool = True
    auto_download_reports: bool = False
