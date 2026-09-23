# 🤝 Contributing to Clarity AI

Thank you for your interest in contributing to **Clarity AI** — your AI-powered companion for demystifying legal contracts in India!

## Code Quality Standards

1. **Python Backend (FastAPI):**
   - Python 3.11+
   - Strict typing hints (`typing.Optional`, `list[dict]`, Pydantic models).
   - All endpoints must include descriptive docstrings and follow REST conventions.
   - Run tests before pushing: `pytest`

2. **Frontend (Next.js 15):**
   - React 19, TypeScript, Tailwind CSS.
   - WCAG 2.1 AA Accessibility: all interactive elements must have `aria-label`, visible focus states, and semantic HTML tags.
   - Run tests before pushing: `npm test`

3. **Security Standards:**
   - Zero hardcoded credentials or API keys.
   - All secrets must be stored in `.env` and injected via secure environment variables.
   - Guardrails must prevent prompt injection and hallucinations.

## Development Workflow

1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes with conventional commit messages: `git commit -m "feat: add clause comparison exporter"`.
4. Ensure all unit and integration tests pass: `pytest` and `cd client && npm test`.
5. Open a Pull Request against `main`.
