"""
FastAPI Endpoints Test Suite for Clarity API.
"""
import pytest
from unittest.mock import patch, AsyncMock
from starlette.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Health check endpoint must return HTTP 200 with status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"
    assert data.get("service") == "clarity-api"


def test_security_headers_present():
    """Verify production security headers are attached to responses."""
    response = client.get("/health")
    headers = response.headers
    # Check standard security headers
    assert "x-content-type-options" in headers or "X-Content-Type-Options" in headers


def test_chat_endpoint_validation():
    """Chat endpoint should reject invalid empty payloads."""
    response = client.post("/api/documents/oakwood-lease-4b/chat", json={})
    # FastAPI pydantic validation error for missing 'message' field
    assert response.status_code == 422


@patch("server.services.rag_chat.answer_question", new_callable=AsyncMock)
def test_chat_endpoint_valid_request(mock_answer):
    """Chat endpoint should successfully process a valid chat message with citations."""
    mock_answer.return_value = {
        "answer": "This agreement covers the residential lease for Apartment 4B.",
        "cited_clauses": [
            {
                "clause_id": "clause-18-2-termination",
                "section_ref": "Section 18.2",
                "excerpt": "Early Termination Fee equal to two (2) months Base Rent",
                "page_ref": "Page 9, Line 14"
            }
        ],
        "next_action": "Review the early termination penalty."
    }

    response = client.post(
        "/api/documents/oakwood-lease-4b/chat",
        json={"message": "what is this contract about", "history": []},
    )
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "cited_clauses" in data
    assert len(data["cited_clauses"]) == 1
    assert data["cited_clauses"][0]["section_ref"] == "Section 18.2"
