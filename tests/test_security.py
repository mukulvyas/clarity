"""
Security and Defensive Controls Test Suite for Clarity AI.
Tests CORS compliance, HTTP security headers, prompt injection defenses,
and input payload validation.
"""
import pytest
from unittest.mock import patch, AsyncMock
from starlette.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.main import app

client = TestClient(app)


class TestSecurityHeadersAndCORS:
    """Validate HTTP security headers and CORS policy."""

    def test_security_headers_enforced(self):
        """All responses must include standard defense-in-depth headers."""
        response = client.get("/health")
        assert response.status_code == 200
        headers = response.headers
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert "1; mode=block" in headers.get("X-XSS-Protection", "")
        assert "strict-origin-when-cross-origin" in headers.get("Referrer-Policy", "")

    def test_cors_options_preflight(self):
        """CORS preflight requests should allow trusted domains."""
        response = client.options(
            "/health",
            headers={
                "Origin": "https://clarity-dusky-eight.vercel.app",
                "Access-Control-Request-Method": "GET",
            }
        )
        assert response.status_code in (200, 204)
        origin_header = response.headers.get("access-control-allow-origin")
        assert origin_header in ("https://clarity-dusky-eight.vercel.app", "*")


class TestInputValidationAndSanitization:
    """Validate input boundaries, payload schema enforcement, and sanitization."""

    @patch("server.services.rag_chat.answer_question", new_callable=AsyncMock)
    def test_reject_oversized_payload(self, mock_answer):
        """Extremely oversized messages (> 100KB) should be handled safely without memory crash."""
        mock_answer.return_value = {"answer": "Input processed safely.", "cited_clauses": []}
        massive_message = "A" * 100_000
        response = client.post(
            "/api/documents/oakwood-lease-4b/chat",
            json={"message": massive_message}
        )
        assert response.status_code in (200, 413, 422)

    def test_reject_malformed_json(self):
        """Malformed JSON payloads must return HTTP 422 or 400."""
        response = client.post(
            "/api/documents/oakwood-lease-4b/chat",
            content="NOT_JSON",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in (400, 422)

    def test_unauthenticated_access_to_private_document(self):
        """Accessing arbitrary non-demo documents without user session must be rejected with 401."""
        response = client.post(
            "/api/documents/private-confidential-doc-999/chat",
            json={"message": "tell me confidential secrets"}
        )
        assert response.status_code == 401
