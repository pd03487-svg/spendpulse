import re
import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from urllib.parse import urlparse
from app.models.schemas import SourceRecord, Fact, ThoughtLog


class MemoryStore:
    """
    In-memory knowledge and state store for BrowserMind (India Edition).
    Maintains visited sources, extracted facts, query history,
    and a lightweight TF-IDF semantic vector index for fast document recall.
    """
    def __init__(self, task_id: str):
        self.task_id = task_id
        self.sources: Dict[str, SourceRecord] = {}
        self.facts: List[Fact] = []
        self.search_queries: List[str] = []
        self.action_history: List[Dict[str, Any]] = []
        self.raw_documents: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def record_source(self, url: str, title: str, content: str = "", status_code: int = 200) -> SourceRecord:
        parsed = urlparse(url)
        domain = parsed.netloc or "unknown"
        
        # Calculate domain trust score with Indian domain recognition
        trust_score = 0.85
        high_trust_domains = [
            "amazon.in", "flipkart.com", "croma.com", "reliancedigital.in",
            "gadgets360.com", "91mobiles.com", "digit.in", "smartprix.com",
            "gov.in", "nic.in", "iit.ac.in", "iisc.ac.in", "wikipedia.org", "github.com"
        ]
        if any(h in domain.lower() for h in high_trust_domains):
            trust_score = 0.96
        
        summary = content[:300] if content else ""
        now = datetime.utcnow().isoformat()
        
        if url in self.sources:
            rec = self.sources[url]
            rec.visit_count += 1
            rec.last_visited_at = now
            if not rec.content_summary and summary:
                rec.content_summary = summary
            if title and rec.title in ("Web Page", "about:blank", ""):
                rec.title = title
            return rec

        rec = SourceRecord(
            id=f"src_{len(self.sources) + 1}",
            url=url,
            title=title or domain,
            domain=domain,
            trust_score=trust_score,
            visit_count=1,
            content_summary=summary,
            extracted_facts_count=0,
            first_visited_at=now,
            last_visited_at=now
        )
        self.sources[url] = rec
        
        if content:
            self._index_document(url, title, content)
            
        return rec

    def add_fact(self, claim: str, entity: str, value: str, source_url: str, source_title: str, confidence: float = 0.85) -> Fact:
        fact_id = f"fact_{len(self.facts) + 1}"
        
        for existing in self.facts:
            if existing.entity.lower() == entity.lower() and self._is_similar_claim(existing.value, value):
                existing.corroboration_count += 1
                existing.confidence = min(0.99, existing.confidence + 0.05)
                if source_url in self.sources:
                    self.sources[source_url].extracted_facts_count += 1
                return existing

        fact = Fact(
            id=fact_id,
            claim=claim,
            entity=entity,
            value=value,
            source_url=source_url,
            source_title=source_title,
            corroboration_count=1,
            confidence=confidence,
            is_conflicting=False
        )
        self.facts.append(fact)
        
        if source_url in self.sources:
            self.sources[source_url].extracted_facts_count += 1
            
        return fact

    def record_query(self, query: str):
        if query not in self.search_queries:
            self.search_queries.append(query)

    def record_action(self, action: Dict[str, Any]):
        self.action_history.append({
            "timestamp": datetime.utcnow().isoformat(),
            **action
        })

    def get_sources_list(self) -> List[SourceRecord]:
        return list(self.sources.values())

    def get_facts_list(self) -> List[Fact]:
        return self.facts

    def _index_document(self, url: str, title: str, text: str):
        tokens = self._tokenize(text)
        if not tokens:
            return
        self.raw_documents.append({
            "url": url,
            "title": title,
            "text": text,
            "tokens": tokens
        })
        self._recompute_idf()

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9_\-\.₹]{2,}\b", text.lower())
        stopwords = {"the", "and", "for", "with", "this", "that", "from", "are", "was", "were", "been", "have", "has", "had"}
        return [w for w in words if w not in stopwords]

    def _recompute_idf(self):
        n_docs = len(self.raw_documents)
        if n_docs == 0:
            return
        df = {}
        for doc in self.raw_documents:
            for term in set(doc["tokens"]):
                df[term] = df.get(term, 0) + 1
        
        self.idf = {term: math.log((1 + n_docs) / (1 + count)) + 1.0 for term, count in df.items()}

    def search_semantic(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens or not self.raw_documents:
            return []

        q_tf = {}
        for t in query_tokens:
            q_tf[t] = q_tf.get(t, 0) + 1

        results = []
        for doc in self.raw_documents:
            doc_tokens = doc["tokens"]
            d_tf = {}
            for t in doc_tokens:
                d_tf[t] = d_tf.get(t, 0) + 1

            dot_product = 0.0
            q_norm = 0.0
            d_norm = 0.0

            all_terms = set(q_tf.keys()).union(set(d_tf.keys()))
            for term in all_terms:
                idf_val = self.idf.get(term, 1.0)
                qv = (q_tf.get(term, 0) / len(query_tokens)) * idf_val
                dv = (d_tf.get(term, 0) / len(doc_tokens)) * idf_val
                dot_product += qv * dv
                q_norm += qv ** 2
                d_norm += dv ** 2

            score = 0.0
            if q_norm > 0 and d_norm > 0:
                score = dot_product / (math.sqrt(q_norm) * math.sqrt(d_norm))

            if score > 0.01:
                snippet = doc["text"][:300]
                results.append({
                    "url": doc["url"],
                    "title": doc["title"],
                    "score": score,
                    "snippet": snippet
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def _is_similar_claim(self, val1: str, val2: str) -> bool:
        v1 = set(val1.lower().split())
        v2 = set(val2.lower().split())
        if not v1 or not v2:
            return False
        intersection = len(v1.intersection(v2))
        union = len(v1.union(v2))
        return (intersection / union) > 0.6
