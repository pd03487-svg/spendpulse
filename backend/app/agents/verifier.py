from typing import Dict, Any, List
from app.models.schemas import Fact, SourceRecord
from app.verification.engine import verification_engine
from app.agents.llm_client import LLMClient


class VerifierAgent:
    """
    Verification & Fact-Checking Agent (⚖️):
    Cross-checks statements across independent sources, detects conflicts,
    and calculates statistical evidence confidence scores.
    """
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    async def verify_evidence(self, facts: List[Fact], sources: List[SourceRecord]) -> Dict[str, Any]:
        """
        Cross-checks collected data using the verification engine.
        """
        verification_result = verification_engine.verify_facts(facts, sources)
        return verification_result
