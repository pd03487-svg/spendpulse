import uuid
import asyncio
from typing import Optional, Dict, Any, Tuple
from app.models.schemas import (
    ActionType,
    BrowserAction,
    ApprovalRequest,
    ApprovalStatus,
    SafetyLevel
)


class SafetyGuard:
    """
    Safety & Human-in-the-Loop Approval Layer.
    Inspects proposed agent actions and intercepts sensitive / high-risk operations
    (form submissions, purchases, messages, external mutations) according to safety policy.
    """
    
    # Sensitive keyword triggers in button text, URL, or input selectors
    SENSITIVE_PATTERNS = [
        "submit", "pay", "checkout", "buy", "purchase", "credit_card",
        "card_number", "cvv", "password", "delete", "destroy",
        "send_message", "post_comment", "subscribe", "order", "login", "sign_in"
    ]
    
    BLOCKED_DOMAINS = [
        "darkweb", "torrent", "malware", "phishing"
    ]

    def __init__(self, safety_level: SafetyLevel = SafetyLevel.BALANCED):
        self.safety_level = safety_level
        self.pending_approvals: Dict[str, ApprovalRequest] = {}
        self._approval_events: Dict[str, asyncio.Event] = {}
        self._approval_results: Dict[str, ApprovalStatus] = {}
        self._user_feedback: Dict[str, str] = {}

    def assess_action(self, action: BrowserAction, current_url: str = "") -> Tuple[bool, str, str]:
        """
        Evaluate if an action requires human authorization.
        Returns: (requires_approval: bool, risk_level: str, reason: str)
        """
        # Always safe: purely observational
        if action.action_type in (ActionType.SEARCH, ActionType.SCROLL, ActionType.EXTRACT, ActionType.SCREENSHOT, ActionType.VERIFY, ActionType.FINISH):
            return False, "low", "Read-only inspection action"

        # Navigation checks
        if action.action_type == ActionType.NAVIGATE:
            target = (action.url or "").lower()
            if any(b in target for b in self.BLOCKED_DOMAINS):
                return True, "critical", f"Attempting navigation to prohibited domain pattern: {target}"
            return False, "low", "Standard navigation"

        # Type / Form fill checks
        if action.action_type == ActionType.TYPE:
            selector = (action.selector or "").lower()
            text = (action.text or "").lower()
            if any(p in selector for p in ["pass", "pwd", "secret", "cvv", "card", "ssn", "token"]):
                return True, "high", f"Typing credential or payment information into '{action.selector}'"
            if self.safety_level == SafetyLevel.STRICT:
                return True, "medium", f"Form input modification in strict safety mode: '{action.selector}'"

        # Click / Submit checks
        if action.action_type == ActionType.CLICK:
            selector = (action.selector or "").lower()
            if any(p in selector for p in self.SENSITIVE_PATTERNS):
                risk = "high" if any(k in selector for k in ["pay", "buy", "delete", "purchase"]) else "medium"
                return True, risk, f"Potentially sensitive button or form trigger: '{action.selector}'"
            if self.safety_level == SafetyLevel.STRICT:
                return True, "medium", f"Interactive element click in strict mode: '{action.selector}'"

        # Autonomous mode bypasses standard medium risks unless critical
        if self.safety_level == SafetyLevel.AUTONOMOUS:
            return False, "low", "Autonomous mode active"

        return False, "low", "Safe operation"

    def create_approval_request(self, task_id: str, action: BrowserAction, reason: str, risk_level: str) -> ApprovalRequest:
        request_id = f"appr_{uuid.uuid4().hex[:8]}"
        req = ApprovalRequest(
            id=request_id,
            task_id=task_id,
            action_type=action.action_type,
            target_url=action.url,
            description=reason,
            risk_level=risk_level,
            payload={
                "selector": action.selector,
                "text": action.text,
                "query": action.query,
                "url": action.url,
                "explanation": action.explanation
            },
            status=ApprovalStatus.PENDING
        )
        self.pending_approvals[request_id] = req
        self._approval_events[request_id] = asyncio.Event()
        return req

    async def wait_for_user_approval(self, request_id: str, timeout_seconds: float = 300.0) -> Tuple[ApprovalStatus, Optional[str]]:
        """Wait for user decision on the pending approval."""
        if request_id not in self._approval_events:
            return ApprovalStatus.REJECTED, "Approval request not found"
        
        event = self._approval_events[request_id]
        try:
            await asyncio.wait_for(event.wait(), timeout=timeout_seconds)
            status = self._approval_results.get(request_id, ApprovalStatus.REJECTED)
            feedback = self._user_feedback.get(request_id)
            return status, feedback
        except asyncio.TimeoutError:
            if request_id in self.pending_approvals:
                self.pending_approvals[request_id].status = ApprovalStatus.REJECTED
            return ApprovalStatus.REJECTED, "Timed out waiting for human approval (5 min)"

    def resolve_request(self, request_id: str, approved: bool, user_feedback: Optional[str] = None) -> bool:
        """Called when user clicks Approve or Reject on the frontend."""
        if request_id not in self.pending_approvals:
            return False
        
        req = self.pending_approvals[request_id]
        req.status = ApprovalStatus.APPROVED if approved else ApprovalStatus.REJECTED
        req.user_feedback = user_feedback
        
        self._approval_results[request_id] = req.status
        self._user_feedback[request_id] = user_feedback or ""
        
        if request_id in self._approval_events:
            self._approval_events[request_id].set()
            
        return True
