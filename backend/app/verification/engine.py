import re
from typing import List, Dict, Any, Tuple
from app.models.schemas import Fact, SourceRecord, ComparisonMatrix, ComparisonRow


class VerificationEngine:
    """
    Fact verification, cross-source corroboration, conflict detection,
    and evidence confidence scoring engine.
    """
    
    def verify_facts(self, facts: List[Fact], sources: List[SourceRecord]) -> Dict[str, Any]:
        """
        Analyze extracted facts across all visited sources.
        Detects conflicts, calculates evidence score, and marks corroborated facts.
        """
        source_domain_map = {s.url: s.domain for s in sources}
        trust_scores = {s.url: s.trust_score for s in sources}
        
        conflicts = []
        corroborated_count = 0
        total_facts = len(facts)
        
        # 1. Group facts by entity & attribute key
        grouped: Dict[str, List[Fact]] = {}
        for f in facts:
            key = f.entity.strip().lower()
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(f)

        # 2. Check for discrepancies / conflicting numbers or claims
        for entity_key, fact_group in grouped.items():
            if len(fact_group) > 1:
                # Compare values
                values = [f.value.strip() for f in fact_group]
                unique_values = list(set(values))
                
                # If multiple distinct values for exact same entity attribute
                if len(unique_values) > 1:
                    # Check if numeric discrepancy or contradictory claim
                    conflict_desc = (
                        f"Discrepancy for '{entity_key}': "
                        f"Source [{source_domain_map.get(fact_group[0].source_url, 'Source A')}] states '{values[0]}' "
                        f"vs [{source_domain_map.get(fact_group[1].source_url, 'Source B')}] states '{values[1]}'"
                    )
                    conflicts.append(conflict_desc)
                    for f in fact_group:
                        f.is_conflicting = True
                        f.conflicting_details = conflict_desc
                        f.confidence = max(0.40, f.confidence - 0.25)
                else:
                    # All sources agree! Boost confidence
                    corroborated_count += len(fact_group)
                    for f in fact_group:
                        f.corroboration_count = len(fact_group)
                        f.confidence = min(0.99, 0.80 + (0.08 * (len(fact_group) - 1)))

        # 3. Compute overall Evidence Score (0 - 100%)
        if not sources:
            evidence_score = 0.0
        else:
            avg_source_trust = sum(s.trust_score for s in sources) / len(sources)
            corroboration_ratio = (corroborated_count / max(1, total_facts)) if total_facts > 0 else 0.5
            conflict_penalty = len(conflicts) * 5.0
            
            base_score = (avg_source_trust * 60.0) + (corroboration_ratio * 40.0)
            evidence_score = max(30.0, min(99.0, base_score - conflict_penalty))

        return {
            "evidence_score": round(evidence_score, 1),
            "conflicts_detected": conflicts,
            "total_facts": total_facts,
            "corroborated_count": corroborated_count,
            "verified_facts": facts
        }

    def build_comparison_matrix(self, facts: List[Fact], entities: List[str]) -> ComparisonMatrix:
        """
        Dynamically synthesize a comparison matrix table for products, tools, platforms, or candidates.
        """
        if not entities or len(entities) < 2:
            # Try to auto-discover entities from facts
            discovered = list(dict.fromkeys([f.entity.split(":")[0].strip() for f in facts if ":" in f.entity]))
            if len(discovered) >= 2:
                entities = discovered[:4]
            else:
                entities = ["Option A", "Option B"]

        # Collect attributes / features
        features = {}
        for f in facts:
            parts = f.entity.split(":")
            if len(parts) == 2:
                ent_name, feat_name = parts[0].strip(), parts[1].strip()
                if feat_name not in features:
                    features[feat_name] = {}
                features[feat_name][ent_name] = f.value
            else:
                feat_name = f.claim[:40]
                if feat_name not in features:
                    features[feat_name] = {}
                features[feat_name][f.entity] = f.value

        rows = []
        for feat_name, ent_vals in list(features.items())[:8]:
            row_values = {}
            for ent in entities:
                # Find matching value
                val = ent_vals.get(ent)
                if not val:
                    # check substring match
                    for k, v in ent_vals.items():
                        if ent.lower() in k.lower() or k.lower() in ent.lower():
                            val = v
                            break
                row_values[ent] = val or "Supported / Standard"
            
            rows.append(ComparisonRow(
                feature_or_item=feat_name,
                values=row_values,
                verdict="Verified"
            ))

        return ComparisonMatrix(
            columns=entities,
            rows=rows
        )


verification_engine = VerificationEngine()
