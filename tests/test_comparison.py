"""
Contract Redline Comparison Test Suite for Clarity AI.
Tests side-by-side contract diffing, fairness evaluation, and risk classification.
"""
import pytest
from unittest.mock import patch, AsyncMock
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server.services.compare_service import run_comparison


class TestContractComparison:
    """Test agreement comparison and diff classification logic."""

    @pytest.mark.asyncio
    @patch("server.services.compare_service.generate", new_callable=AsyncMock)
    @patch("server.services.compare_service.get_supabase")
    async def test_compare_demo_indian_leases(self, mock_supabase, mock_generate):
        """Comparing original lease vs revised draft should highlight penalty reduction."""
        mock_generate.return_value = json.dumps({
            "verdict": "Document B is significantly better for the tenant.",
            "confidence": 95,
            "favorable_changes": 3,
            "unresolved_cautions": 1,
            "new_risks": 0,
            "clause_diffs": [
                {
                    "section_ref": "Section 18.2",
                    "title": "Lock-in Breach & Termination Penalty",
                    "classification": "better_for_you",
                    "explanation": "Early exit penalty reduced from 2 months (₹70,000) to 1 month (₹35,000)."
                },
                {
                    "section_ref": "Section 14.1",
                    "title": "Pet Policy & Deposit",
                    "classification": "better_for_you",
                    "explanation": "Monthly pet charge waived and deposit converted to refundable."
                }
            ]
        })

        diff_report = await run_comparison(
            document_a_id="oakwood-lease-4b",
            document_b_id="oakwood-lease-4b-revised"
        )
        assert diff_report is not None
        assert "clause_diffs" in diff_report
        diffs = diff_report["clause_diffs"]
        assert len(diffs) == 2

        # Check that classification flags beneficial changes
        classifications = [d.get("classification") for d in diffs]
        assert "better_for_you" in classifications
        assert diffs[0]["section_ref"] == "Section 18.2"

    @pytest.mark.asyncio
    @patch("server.services.compare_service.generate", new_callable=AsyncMock)
    @patch("server.services.compare_service.get_supabase")
    async def test_comparison_preserves_section_references(self, mock_supabase, mock_generate):
        """Comparison diffs must accurately retain section numbering."""
        mock_generate.return_value = json.dumps({
            "verdict": "Balanced terms.",
            "confidence": 90,
            "favorable_changes": 1,
            "unresolved_cautions": 0,
            "new_risks": 0,
            "clause_diffs": [
                {
                    "section_ref": "Section 4.1",
                    "title": "Monthly Rent & Grace Period",
                    "classification": "same",
                    "explanation": "Grace period of 5 days and ₹1,500 late fee retained."
                }
            ]
        })

        diff_report = await run_comparison(
            document_a_id="oakwood-lease-4b",
            document_b_id="oakwood-lease-4b-revised"
        )
        for diff in diff_report.get("clause_diffs", []):
            assert "section_ref" in diff
            assert "Section" in diff["section_ref"]
