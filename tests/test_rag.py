"""
Unit and Integration tests for Clarity AI RAG Chatbot.
Run with: pytest tests/
"""
import pytest
import os
import sys

# Ensure root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.services.rag_chat import (
    _is_overview_query,
    _check_off_topic_guardrail,
    _apply_citation_guardrail,
    _apply_safety_guardrail,
    DEMO_LEASE_CLAUSES,
    DEMO_FREELANCE_CLAUSES,
    answer_question,
)


class TestRAGIntentAndGuardrails:
    """Test query intent routing, off-topic interception, and citation guardrails."""

    def test_overview_intent_detection_positive(self):
        """Queries asking for document summary or overview must be flagged as overview."""
        overview_queries = [
            "can you tell me about this doc",
            "summarize this contract",
            "what is this agreement about",
            "give me an overview of the document",
            "what does this document say",
            "tell me about all the doc",
        ]
        for q in overview_queries:
            assert _is_overview_query(q) is True, f"Failed to detect overview intent for: '{q}'"

    def test_overview_intent_detection_negative(self):
        """Specific clause queries must not be classified as overview."""
        specific_queries = [
            "what is the penalty under section 18.2",
            "when is rent due each month",
            "can I keep a dog in apartment 4B",
            "what are the late fee terms",
        ]
        for q in specific_queries:
            assert _is_overview_query(q) is False, f"Incorrectly flagged as overview: '{q}'"

    def test_off_topic_guardrail_triggered(self):
        """Off-topic non-legal queries must be intercepted politely."""
        off_topic = [
            "how do I bake a chocolate cake?",
            "write a python script to scrape twitter",
            "what is the weather in Tokyo tomorrow?",
        ]
        for q in off_topic:
            res = _check_off_topic_guardrail(q)
            assert res is not None, f"Expected off-topic interception for '{q}'"
            assert "Clarity AI" in res["answer"]
            assert res["cited_clauses"] == []

    def test_off_topic_guardrail_pass_legal_queries(self):
        """Legal queries must pass the off-topic filter (return None)."""
        valid_queries = [
            "What happens if I terminate early?",
            "What are the payment deadlines?",
            "Who owns the intellectual property?",
        ]
        for q in valid_queries:
            res = _check_off_topic_guardrail(q)
            assert res is None, f"Legal query '{q}' should not be blocked by off-topic guardrail"

    def test_safety_guardrail_non_attorney_disclaimer(self):
        """Verify that claims of being a licensed lawyer are rewritten."""
        raw_result = {"answer": "I am your attorney and this is legal advice.", "cited_clauses": []}
        safe_result = _apply_safety_guardrail(raw_result)
        assert "I am your attorney" not in safe_result["answer"]
        assert "educational legal companion" in safe_result["answer"]

    def test_citation_guardrail_filters_hallucinations(self):
        """Verify that citations not present in context clauses are stripped."""
        context = [
            {"clause_id": "c1", "section_ref": "Section 1.1"},
            {"clause_id": "c2", "section_ref": "Section 2.2"},
        ]
        raw_result = {
            "answer": "Here is the result",
            "cited_clauses": [
                {"clause_id": "c1", "section_ref": "Section 1.1"},
                {"clause_id": "hallucinated_id", "section_ref": "Section 99.9"},
            ]
        }
        filtered = _apply_citation_guardrail(raw_result, context)
        assert len(filtered["cited_clauses"]) == 1
        assert filtered["cited_clauses"][0]["clause_id"] == "c1"


class TestDemoClausesIntegrity:
    """Verify demo contract fixtures are structurally sound with required legal metadata."""

    def test_lease_clauses_structure(self):
        assert len(DEMO_LEASE_CLAUSES) >= 3
        for clause in DEMO_LEASE_CLAUSES:
            assert "clause_id" in clause
            assert "section_ref" in clause
            assert "title" in clause
            assert "original_text" in clause
            assert len(clause["original_text"]) > 20

    def test_freelance_clauses_structure(self):
        assert len(DEMO_FREELANCE_CLAUSES) >= 3
        for clause in DEMO_FREELANCE_CLAUSES:
            assert "clause_id" in clause
            assert "section_ref" in clause
            assert "title" in clause
            assert "original_text" in clause
