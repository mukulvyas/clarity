# 🛡️ Security Policy & Threat Model — Clarity AI

## Security Principles & Commitments

Clarity AI handles sensitive legal documents. As such, security, privacy, and zero credential leakage are core architectural requirements.

### 1. Zero Credential Leakage in Source Control
- All API secrets (`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are strictly managed through secure environment variables.
- All `.env*` files are strictly excluded from git tracking using `.gitignore`.
- Production credentials are injected exclusively at runtime via Render and Vercel encrypted environment secret managers.

### 2. Threat Model & Safeguards

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Prompt Injection / Jailbreaks** | Multi-layer input guardrails detect instruction overrides and refuse prompt extraction attempts before LLM dispatch. |
| **Cross-Origin Attacks (CORS)** | Strict FastAPI `CORSMiddleware` restricted to explicitly verified production origins and preview domain regex. |
| **Clickjacking / MIME Sniffing** | Automated HTTP security headers attached to all API responses (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`). |
| **Data Poisoning** | Contract vector embeddings are chunked, validated, and mapped directly to user-authenticated document IDs in Supabase. |
| **Transport Layer Security** | Enforced HTTPS / TLS 1.3 across both Vercel frontend and Render backend endpoints. |

### 3. Reporting a Vulnerability

If you discover a security vulnerability within Clarity AI:
1. Please do not open a public GitHub issue.
2. Email security details directly to: `mukulvyas19@gmail.com`.
3. Valid reports will be acknowledged within 24 hours with an actionable remediation patch.
