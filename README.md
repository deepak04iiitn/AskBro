# AskBro — AI-Powered Knowledge Base

> **Ask questions. Get cited answers. From your team's own documents.**

AskBro is a private, self-hosted document intelligence platform for teams. Upload PDFs, Word documents, Markdown files and plain text — then ask anything in natural language. Every answer is grounded in and traceable back to a specific page of a specific file.

---

## Table of Contents

1. [What it does](#1-what-it-does)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Features](#4-features)
5. [Project Structure](#5-project-structure)
6. [Local Setup](#6-local-setup)
7. [Environment Variables](#7-environment-variables)
8. [Running the App](#8-running-the-app)
9. [Deployment](#9-deployment)
10. [Admin Dashboard](#10-admin-dashboard)
11. [API Reference](#11-api-reference)

---

## 1. What it does

| Problem | How AskBro helps |
|---------|-----------------|
| Repeated support questions | Engineers query the bot instead of interrupting colleagues |
| Slow onboarding | New hires get instant answers from docs instead of waiting |
| Documentation scattered everywhere | One searchable interface across all uploaded files |
| Tribal knowledge | Institutional knowledge captured, cited, and queryable |
| Senior engineer dependency | Documented answers are surfaced automatically |

---

## 2. Tech Stack

### Backend

| Layer | Technology |
|-------|-----------|
| API server | **FastAPI** (Python 3.11+) |
| Background workers | **Celery** + MongoDB broker |
| File storage | **MongoDB GridFS** (no external storage service) |
| Vector database | **Qdrant** (cloud or self-hosted) |
| Embedding model | **BGE-large-en-v1.5** (1024-dim, via HuggingFace) |
| Reranker | **BGE-reranker-large** (cross-encoder) |
| LLM | **Qwen3-32B** via any OpenAI-compatible endpoint (Groq / Together / vLLM) |
| ODM | **Beanie** (async MongoDB) |
| Auth | **JWT** (python-jose) |
| Rate limiting | **slowapi** (in-memory sliding window) |
| Email (OTP / notifications) | **Resend** REST API via httpx |
| Password hashing | **bcrypt** |

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (App Router) |
| Styling | **Tailwind CSS v4** |
| Animations | **Framer Motion** |
| Charts | **Recharts** |
| Icons | **Lucide React** |
| Font | **Plus Jakarta Sans** |
| State | **Zustand** |
| Markdown rendering | **react-markdown** + remark-gfm |

---

## 3. Architecture Overview

```
Browser (Next.js)
      │  REST + SSE
      ▼
FastAPI  ──────────────►  Celery Worker
  │                            │
  │  JWT auth                  │  1. Load from GridFS
  │  Rate limiting             │  2. Extract text (LangChain loaders)
  │                            │  3. Chunk (RecursiveCharacterTextSplitter)
  ├──► MongoDB                 │  4. BGE-large embed
  │    └── GridFS (files)      │  5. Upsert → Qdrant
  │    └── Documents
  │    └── Users / Workspaces
  │    └── Chats / Messages
  │
  └──► Qdrant  ──►  BGE-reranker  ──►  Qwen3-32B (LLM)  ──►  SSE stream
```

**RAG pipeline (query time):**

1. Enrich query with BGE instruction prefix
2. Embed with BGE-large (1024-dim)
3. Qdrant semantic search — top 20 hits, filtered by workspace
4. Relative score threshold (≥ 80 % of top hit) — drops irrelevant results
5. Top-5 chunks → context block
6. Qwen3-32B generates a cited streamed answer

---

## 4. Features

### Core

- **Multi-format upload** — PDF, DOCX, Markdown, TXT (up to 50 MB each, multiple at once)
- **Paste text directly** — name a `.md` or `.txt` snippet and index it without a file
- **Semantic search** — BGE-large embeddings + relevance filtering
- **Cited answers** — every response links to the exact source document
- **Streaming responses** — SSE token-by-token output
- **@-mention tagging** — type `@filename` in chat to restrict search to that file
- **Chat history** — all conversations persisted; navigate via sidebar
- **Unique chat URLs** — every chat at `/dashboard/[chatId]`

### Workspaces

- Private, isolated multi-tenant environments
- Workspace code + email sign-in (no per-user password)
- Workspace password for creation and code-retrieval verification
- Owner can add / remove members at any time
- Members can leave; owners can delete the entire workspace (cascade delete)
- "Forgot workspace code" flow — notifies admin via Resend email

### Admin

- OTP-based admin login (email + password → 6-digit OTP via Resend)
- Full platform dashboard: users, workspaces, documents, activity
- Recharts visualisations: area charts, bar charts, donut charts
- Active user tracking (last 15 min)
- Rate limits configurable via env

### Security

- Per-endpoint rate limiting (slowapi, IP-based)
- Separate JWT secrets for users and admin
- Upload never rate-limited
- Workspace data fully isolated at query level (Qdrant filter)

### UX

- 3-step onboarding flow (shown once per device)
- Warm neutral design system — Plus Jakarta Sans, Framer Motion transitions
- Collapsible sidebar with recent chats and documents
- Multi-step upload progress (user-friendly labels)
- Admin panel with collapsible sidebar, dark-on-light

---

## 5. Project Structure

```
AskBro/
├── backend/
│   ├── config/
│   │   ├── env.py              # Pydantic Settings — all config from .env
│   │   ├── qdrant.py           # Qdrant client init + collection setup
│   │   └── storage.py          # GridFS bucket helper
│   ├── controllers/
│   │   ├── admin_controller.py # Admin auth + metrics aggregation
│   │   ├── chat_controller.py  # RAG stream + chat CRUD
│   │   └── workspace_controller.py
│   ├── db/
│   │   ├── base.py             # Beanie DOCUMENT_MODELS registry
│   │   └── session.py          # Motor client lifecycle
│   ├── middleware/
│   │   ├── admin_auth.py       # OTP store, admin JWT, active user tracker
│   │   ├── auth.py             # User JWT validation
│   │   ├── rate_limit.py       # slowapi limiter + limit constants
│   │   └── rbac.py             # require_owner dependency
│   ├── models/                 # Beanie documents
│   │   ├── audit_log.py
│   │   ├── chat.py
│   │   ├── chunk.py
│   │   ├── document.py
│   │   ├── message.py
│   │   ├── user.py
│   │   └── workspace.py
│   ├── routes/
│   │   ├── admin.py
│   │   ├── chat.py
│   │   ├── documents.py
│   │   ├── health.py           # /ping  /health  /ready
│   │   └── workspaces.py
│   ├── schemas/                # Pydantic request/response models
│   ├── services/
│   │   ├── chunking/           # RecursiveCharacterTextSplitter + BGE prefix
│   │   ├── embeddings/         # HuggingFace BGE wrapper, batched inference
│   │   ├── email/              # Resend client (OTP + forgot-code email)
│   │   ├── llm/                # Qwen client, system prompt
│   │   ├── loaders/            # PDF / DOCX / MD / TXT LangChain loaders
│   │   ├── rag/                # Context builder, RAG chain
│   │   └── vectorstore/        # Qdrant search, upsert, filters
│   ├── workers/
│   │   └── ingestion_worker.py # Celery task: extract → chunk → embed → upsert
│   ├── .env                    # ← your secrets (never commit)
│   ├── .env.example            # ← template to copy
│   ├── celery_app.py
│   ├── main.py
│   └── start.ps1               # Windows launcher (MongoDB + Celery + FastAPI)
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/login/   # Sign-in page
        │   ├── (auth)/create/  # Create workspace
        │   ├── admin/          # Admin login + dashboard (5 tabs)
        │   ├── dashboard/      # Chat interface + [chatId] routes
        │   ├── onboarding/     # 3-step first-run flow
        │   └── upload/         # Knowledge Library (upload + doc list)
        ├── components/
        │   ├── auth/           # LoginForm, CreateWorkspaceForm
        │   ├── chat/           # ChatWindow, ChatInput, MessageBubble, CitationCard
        │   ├── documents/      # DocumentList, DocumentCard, UploadZone, StatusBadge
        │   ├── layout/         # Sidebar (collapsible)
        │   ├── onboarding/     # OnboardingFlow
        │   └── workspace/      # MembersPanel
        ├── lib/
        │   ├── api.js          # All REST calls
        │   ├── adminApi.js     # Admin-specific calls
        │   ├── auth.js         # JWT helpers (localStorage)
        │   └── stream.js       # SSE streaming generator
        └── store/
            ├── useAuthStore.js
            ├── useChatStore.js
            ├── useChatsStore.js
            └── useDocumentStore.js
```

---

## 6. Local Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| uv (Python package manager) | latest |
| MongoDB | 7+ (local or Atlas) |
| Qdrant | local binary or cloud |

### 1. Clone

```bash
git clone https://github.com/your-org/askbro.git
cd AskBro
```

### 2. Backend

```bash
cd backend

# Copy and fill in your secrets
cp .env.example .env
# Edit .env — see Environment Variables section below

# Install dependencies (uv is recommended)
uv sync

# Or with pip:
pip install -r requirements.txt
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create manually:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

### 4. Qdrant (local)

Download the binary for your OS from https://qdrant.tech/documentation/quick-start/ and place `qdrant.exe` (Windows) or `qdrant` (Linux/Mac) inside `backend/`. The `start.ps1` script starts it automatically.

---

## 7. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in every value.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | Full connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB_NAME` | ✅ | Database name, e.g. `askbro` |
| `QDRANT_URL` | ✅ | `http://localhost:6333` (local) or cloud URL |
| `QDRANT_API_KEY` | Cloud only | Qdrant cloud API key |
| `LLM_BASE_URL` | ✅ | OpenAI-compatible endpoint, e.g. `https://api.groq.com/openai/v1` |
| `LLM_MODEL_NAME` | ✅ | e.g. `Qwen/Qwen3-32B` |
| `LLM_API_KEY` | ✅ | API key for the LLM provider |
| `SECRET_KEY` | ✅ | 64-char hex: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ADMIN_EMAIL` | ✅ | Admin's email address (receives OTPs and code-retrieval notifications) |
| `ADMIN_PASSWORD` | ✅ | Admin login password |
| `ADMIN_JWT_SECRET` | ✅ | Separate 64-char hex for admin JWTs |
| `RESEND_API_KEY` | ✅ | From https://resend.com — for OTP and notification emails |
| `RATE_LIMIT_AUTH` | optional | Default `30/minute` |
| `RATE_LIMIT_ADMIN` | optional | Default `15/minute` |
| `RATE_LIMIT_API` | optional | Default `120/minute` |
| `MAX_UPLOAD_SIZE_MB` | optional | Default `50` |
| `EMBEDDING_DEVICE` | optional | `cpu` / `cuda` / `mps` |

---

## 8. Running the App

### Windows (recommended)

The `start.ps1` script handles everything:

```powershell
cd backend
.\start.ps1
```

It will:
1. Start (or check) MongoDB
2. Start (or check) Qdrant
3. Open a new window with the Celery worker
4. Start the FastAPI server with hot-reload

### Manual (any OS)

**Terminal 1 — FastAPI**
```bash
cd backend
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
  --reload-dir . --reload-exclude ".venv" --reload-exclude "__pycache__"
```

**Terminal 2 — Celery worker**
```bash
cd backend
uv run python -m celery -A celery_app worker \
  --loglevel=info -Q ingestion,cleanup --pool=solo
```

**Terminal 3 — Next.js dev server**
```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**.

---

## 9. Deployment

### Recommended split

| Component | Platform |
|-----------|----------|
| Next.js frontend | **Vercel** |
| FastAPI + Celery | **Render** (free tier or paid) |
| MongoDB | **MongoDB Atlas** (free M0 cluster) |
| Qdrant | **Qdrant Cloud** (free tier) |
| Embedding model | Same Render instance (CPU mode) |

### Keep-alive (Render free tier)

Render spins down free services after 15 minutes of inactivity. Prevent cold starts by pinging the keep-alive endpoint every 10 minutes:

```
GET  https://<your-render-app>.onrender.com/ping
```

Set up a free cron at [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com).

### Frontend env (`frontend/.env.production`)

```
NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com/api/v1
```

---

## 10. Admin Dashboard

Access at `/admin/login`.

**Login flow:**
1. Enter admin email + password
2. Click "Send OTP" — a 6-digit code is emailed to `ADMIN_EMAIL`
3. Enter OTP → issued an 8-hour admin JWT

**Dashboard tabs:**

| Tab | Contents |
|-----|----------|
| Overview | 8 metric cards, trends charts (area / bar), active users table |
| Users | Members-per-workspace bar chart, role donut, sortable/paginated user table |
| Workspaces | Docs and members per workspace bar charts, full workspace table |
| Documents | File-type donut, docs per workspace, storage per workspace |
| Activity | Full-width area/line charts for chats, users, docs over 14 days |

**Admin email notifications:**
- OTP delivery on login
- Workspace code retrieval requests from owners

---

## 11. API Reference

Base URL: `http://localhost:8000/api/v1`

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/workspaces/create` | Create a new workspace |
| `POST` | `/workspaces/auth/login` | Sign in (workspace code + email) |
| `POST` | `/workspaces/forgot-code` | Request workspace code via admin |

### Workspace

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/workspaces/members` | User | List workspace members |
| `POST` | `/workspaces/members/add` | Owner | Add a member |
| `DELETE` | `/workspaces/members/{email}` | Owner | Remove a member |
| `PUT` | `/workspaces/password` | Owner | Change workspace password |
| `DELETE` | `/workspaces/leave` | User | Leave (member) or delete workspace (owner) |

### Documents

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/documents/upload` | User | Upload a file (multipart) |
| `GET` | `/documents` | User | List documents |
| `GET` | `/documents/{id}/status` | User | Poll processing status |
| `DELETE` | `/documents/{id}` | User | Delete a document |

### Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/chat/chats` | User | Create a new chat session |
| `GET` | `/chat/chats` | User | List all chats |
| `GET` | `/chat/chats/{id}/messages` | User | Get messages for a chat |
| `DELETE` | `/chat/chats/{id}` | User | Delete a chat |
| `POST` | `/chat` | User | Stream an answer (SSE) |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/admin/auth/login` | — | Send admin OTP |
| `POST` | `/admin/auth/verify-otp` | — | Verify OTP → admin JWT |
| `GET` | `/admin/metrics` | Admin | All platform metrics |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ping` | Keep-alive — returns `{ pong: true, uptime_seconds }` |
| `GET` | `/health` | Liveness probe |
| `GET` | `/ready` | Readiness probe (checks MongoDB + Qdrant) |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push and open a PR

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built with FastAPI · LangChain · Qdrant · BGE · Qwen3 · Next.js*
