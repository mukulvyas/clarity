"""
Evaluation Suite for RAG Chat, Gemini LLM Prompts, Context Injection, and Guardrails.
Run with: python server/evals/test_rag_chat_evals.py
"""
import asyncio
import os
import sys

# Ensure server package is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import dotenv
dotenv.load_dotenv("server/.env")

from server.services.rag_chat import (
    answer_question,
    _check_input_scope_guardrail,
    _apply_citation_guardrail,
    _apply_safety_guardrail,
    DEMO_LEASE_CLAUSES,
    DEMO_FREELANCE_CLAUSES,
)


async def run_evals():
    print("=========================================================")
    print("  CLARITY RAG CHAT, PROMPT & GUARDRAILS EVALUATION SUITE ")
    print("=========================================================\n")

    passed = 0
    total = 0

    # --- EVAL 1: Meta / Capability Query ("what you can do") ---
    total += 1
    print("EVAL 1: Meta Capability Query ('what you can do')")
    res1 = await answer_question("freelance-design-contract", "what you can do")
    print("Response 1:", res1)
    if "Clarity AI" in res1["answer"] and res1["cited_clauses"] == []:
        print("  PASSED: Dynamic meta capability response with NO fake clause citation\n")
        passed += 1
    else:
        print("  FAILED: Expected meta response without clause citations\n")

    # --- EVAL 2: Grounded Lease Query ("Early Termination") ---
    total += 1
    print("EVAL 2: Grounded Lease Query ('What happens if I break the lease early?')")
    res2 = await answer_question("oakwood-lease-4b", "What happens if I break the lease early?")
    print("Response 2:", res2)
    has_termination_cite = any(c.get("clause_id") == "clause-18-2-termination" for c in res2.get("cited_clauses", []))
    if ("4,200" in res2["answer"] or "two (2) months" in res2["answer"] or "security deposit" in res2["answer"]) and has_termination_cite:
        print("  PASSED: Correctly cited Section 18.2 with accurate penalty details\n")
        passed += 1
    else:
        print("  FAILED: Grounded lease Q&A check failed\n")

    # --- EVAL 3: Grounded Freelance Query ("Payment & Late Fees") ---
    total += 1
    print("EVAL 3: Grounded Freelance Query ('When do I get paid and what are late fees?')")
    res3 = await answer_question("freelance-design-contract", "When do I get paid and what are late fees?")
    print("Response 3:", res3)
    has_payment_cite = any(c.get("clause_id") == "clause-3-2-payment" for c in res3.get("cited_clauses", []))
    if ("30" in res3["answer"] or "Net 30" in res3["answer"] or "1.5%" in res3["answer"]) and has_payment_cite:
        print("  PASSED: Correctly cited Section 3.2 for payment & late fees\n")
        passed += 1
    else:
        print("  FAILED: Grounded freelance Q&A check failed\n")

    # --- EVAL 4: Input Scope Guardrail (Off-Topic Query) ---
    total += 1
    print("EVAL 4: Input Scope Guardrail ('How do I bake a chocolate cake?')")
    res4 = await answer_question("oakwood-lease-4b", "How do I bake a chocolate cake?")
    print("Response 4:", res4)
    if "personal legal companion" in res4["answer"] and res4["cited_clauses"] == []:
        print("  PASSED: Off-topic query caught by input guardrail and politely redirected\n")
        passed += 1
    else:
        print("  FAILED: Off-topic input guardrail check failed\n")

    # --- EVAL 5: Anti-Hallucination Citation Guardrail ---
    total += 1
    print("EVAL 5: Anti-Hallucination Citation Guardrail (Fake Clause ID Filtering)")
    fake_llm_output = {
        "answer": "Landlord must fix HVAC.",
        "cited_clauses": [
            {"clause_id": "clause-999-fake-hallucinated", "section_ref": "Section 99.9", "excerpt": "Fake text"}
        ]
    }
    clean_res = _apply_citation_guardrail(fake_llm_output, DEMO_LEASE_CLAUSES)
    print("Cleaned Response:", clean_res)
    if len(clean_res["cited_clauses"]) == 0:
        print("  PASSED: Fake hallucinated clause ID successfully stripped by guardrail\n")
        passed += 1
    else:
        print("  FAILED: Anti-hallucination guardrail failed to strip fake clause\n")

    # --- EVAL 6: Safety & Legal Persona Guardrail ---
    total += 1
    print("EVAL 6: Safety & Legal Persona Guardrail (Attorney Claims Sanitization)")
    unsafe_llm_output = {
        "answer": "As your legal counsel, I advise you to sign.",
        "cited_clauses": []
    }
    safe_res = _apply_safety_guardrail(unsafe_llm_output)
    print("Sanitized Response:", safe_res)
    if "legal counsel" not in safe_res["answer"].lower() and "Clarity AI" in safe_res["answer"]:
        print("  PASSED: Attorney persona claim sanitized by safety guardrail\n")
        passed += 1
    else:
        print("  FAILED: Safety guardrail check failed\n")

    # --- SUMMARY ---
    print("=========================================================")
    print(f"  EVALUATION RESULTS: {passed}/{total} PASSED ({int(passed/total*100)}%)")
    print("=========================================================")

    if passed == total:
        print("\nALL EVALUATIONS PASSED SUCCESSFULLY! RAG Chat, Prompts, Context, and Guardrails are production-ready.")
        return 0
    else:
        print("\nSOME EVALUATIONS FAILED.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(run_evals())
    sys.exit(exit_code)
