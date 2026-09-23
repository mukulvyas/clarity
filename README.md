# 📄 Clarity AI — Plain English Legal Companion

> **Empowering everyday people and professionals to understand, negotiate, and safely sign complex legal contracts.**

[![Live Web App](https://img.shields.io/badge/Live_App-clarity--dusky--eight.vercel.app-000000?style=for-the-badge&logo=vercel)](https://clarity-dusky-eight.vercel.app)
[![API Status](https://img.shields.io/badge/API_Status-Online-brightgreen?style=for-the-badge&logo=fastapi)](https://clarity-6k7g.onrender.com/health)
[![Google Gemini](https://img.shields.io/badge/Powered_by-Google_Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![pgvector](https://img.shields.io/badge/Vector_DB-Supabase_pgvector-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 🌐 Live Deployments

- **Frontend Web Application:** [https://clarity-dusky-eight.vercel.app](https://clarity-dusky-eight.vercel.app)
- **Backend API:** [https://clarity-6k7g.onrender.com](https://clarity-6k7g.onrender.com)
- **API Health Check:** [https://clarity-6k7g.onrender.com/health](https://clarity-6k7g.onrender.com/health)
- **Interactive Chat Demo:** [https://clarity-dusky-eight.vercel.app/documents/oakwood-lease-4b/chat](https://clarity-dusky-eight.vercel.app/documents/oakwood-lease-4b/chat)

---

## 🎯 Problem Statement & Solution

### The Problem
Millions of individuals, freelancers, and small business owners sign leases, NDAs, contractor agreements, and SaaS terms without truly understanding the fine print. Traditional legal consultation is expensive ($300+/hr), slow, and intimidating, while generic LLMs often hallucinate terms or fail to cite the specific governing clauses.

### The Clarity AI Solution
Clarity AI is a grounded, multi-turn GenAI legal copilot that:
1. **Translates Dense Legalese into Plain English**: Demystifies obligations, liabilities, and tricky penalty clauses.
2. **Grounded Citations (Zero Hallucination)**: Every answer strictly cites the relevant section and page (e.g., *Section 18.2, Page 4*).
3. **Multi-Turn Contextual Memory**: Remembers prior conversation turns for natural back-and-forth contract negotiation questions.
4. **Risk Scoring & Redlines**: Classifies risks (**Low**, **Medium**, **High**, **Critical**) and visualizes redline differences between agreement versions.
5. **Actionable Mitigation Plans**: Produces concrete, step-by-step negotiation checklists with deadlines and required actions.

---

## 🏗️ Architecture & Gen AI Pipeline

```mermaid
flowchart TD
    User([User / Browser]) <-->|Next.js 15 UI| Frontend[Vercel Frontend]
    Frontend <-->|REST API / CORS| Backend[FastAPI Backend on Render]
    
    subgraph GenAI Pipeline
        Backend -->|Chunk & Extract| Chunker[Document Processing]
        Chunker -->|Dense Vector Embeddings| Embedder[Google text-embedding-004]
        Embedder -->|768-dim Vectors| DB[(Supabase PostgreSQL + pgvector)]
        
        Backend -->|Query + Memory Buffer| IntentRouter[Intent Classifier & Re-ranker]
        IntentRouter -->|Semantic Cosine Search| DB
        DB -->|Top-k Grounded Clauses| ContextBuilder[Context Assembler]
        ContextBuilder -->|Prompt + Clauses + History| LLM[Google Gemini 2.5 Flash]
        LLM -->|Grounded Answer + Citations| Backend
    end
```

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **💬 Conversational RAG Chat** | Multi-turn conversational memory (last 6 turns) powered by **Google Gemini 2.5 Flash** with verified citations. |
| **🔍 Semantic Vector Search** | Sub-second clause retrieval powered by **Google text-embedding-004** (768 dimensions) and Supabase **pgvector** HNSW indexing. |
| **⚖️ Contract Redlining** | Side-by-side comparison of agreement drafts, highlighting new obligations, modified penalties, and risk shifts. |
| **📋 Action Plan Generator** | Generates prioritized negotiation action plans with clear owner assignments, risk levels, and mitigation steps. |
| **🛡️ Honest Scope Boundary** | Transparently refuses out-of-scope or unmentioned contract questions to eliminate false assumptions. |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (Turbopack, App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI (Python 3.11), Uvicorn, Pydantic v2, Google GenAI SDK
- **GenAI Models:** 
  - **Google Gemini 2.5 Flash** (`gemini-2.5-flash`) for reasoning, summary, and plain-English translation
  - **Google text-embedding-004** (`text-embedding-004`) for 768-dimensional semantic embeddings
- **Database & Storage:** Supabase PostgreSQL with `pgvector` extension for cosine distance similarity
- **Hosting & Infrastructure:** 
  - Vercel (Frontend edge deployment)
  - Render (Containerized Docker FastAPI service)

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.11+
- Google Gemini API key
- Supabase account with `pgvector` enabled

### 1. Clone the Repository
```bash
git clone https://github.com/mukulvyas/clarity.git
cd clarity
```

### 2. Backend Setup
```bash
cd server
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create `server/.env` based on `env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Start the FastAPI backend:
```bash
uvicorn server.main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000`. Health check: `http://localhost:8000/health`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Validation

Run the automated backend test suite:
```bash
python test_stage2.py
```
Validates:
- Embedding dimension compatibility (768-dim assert)
- RAG intent classification & overview detection
- Conversational multi-turn history propagation
- Grounded citation generation & fallback handling

---

## 🔒 Security & Privacy

- **Zero Credentials in Git:** All secrets are strictly managed through environment variables (`.env*` excluded via `.gitignore`).
- **Sanitized CORS:** Production CORS middleware restricted to verified application domains and preview URLs.
- **Input Sanitization:** Structured Pydantic validation on all incoming chat and comparison requests.

---

## 🏆 Hackathon Evaluation Criteria Alignment

| Evaluation Parameter | How Clarity AI Delivers |
| :--- | :--- |
| **Code Quality** | Strict modular structure, fully-typed TypeScript API client, clean separation of concerns (`services/`, `routers/`, `lib/`). |
| **Security** | Zero leaked credentials, environment-isolated configurations, validated database connections. |
| **Efficiency** | Lightweight repository (< 5 MB), fast Docker build, sub-second vector search via pgvector indexing. |
| **Testing** | Automated verification scripts confirming vector dimensions and conversational memory. |
| **Accessibility** | Modern, responsive interface with high-contrast typography, clear hierarchy, and jargon-free language. |
| **Problem Alignment** | Directly tackles the complexity of legal contracts with cited, actionable, and trustworthy guidance. |

---

## 📄 License
MIT License. Built for the Hack2skill AI Challenge.
