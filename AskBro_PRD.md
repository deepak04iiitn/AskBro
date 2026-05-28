# AI Knowledge Base for Team Docs
## System Architecture & Implementation Plan

> **Classification:** Internal Use Only
> **Version:** 1.0 | **Status:** Production Ready
> **Stack:** LangChain (Python) · Qdrant · Qwen3-32B · BGE-large · FastAPI · Celery · Next.js

---

## Table of Contents

1. [Core Product Vision](#1-core-product-vision)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Why LangChain (Python)](#4-why-langchain-python)
5. [Document Processing Pipeline](#5-document-processing-pipeline)
6. [Chunking Strategy](#6-chunking-strategy)
7. [Embedding Model](#7-embedding-model)
8. [Vector Database Design](#8-vector-database-design)
9. [Query & Retrieval Flow](#9-query--retrieval-flow)
10. [Retrieval Quality & Reranking](#10-retrieval-quality--reranking)
11. [Hybrid Search](#11-hybrid-search)
12. [Backend Folder Structure](#12-backend-folder-structure)
13. [Authentication Architecture](#13-authentication-architecture)
14. [Security & Access Control](#14-security--access-control)
15. [Deployment Architecture](#15-deployment-architecture)
16. [MVP Scope](#16-mvp-scope)
17. [Future Roadmap](#17-future-roadmap)

---

## 1. Core Product Vision

An internal AI-powered document intelligence platform. Team members upload documents and anyone in the organisation can ask natural language questions and get cited answers drawn directly from those documents.

**This is not a general chatbot.** Every answer is grounded in and traceable to a specific uploaded document.

### Problems It Solves

| Problem | How the System Helps |
|---------|----------------------|
| Repeated support questions | Engineers query the bot instead of interrupting colleagues |
| Slow onboarding | New hires get instant answers from docs instead of waiting |
| Documentation scattered everywhere | Single searchable interface across all uploaded docs |
| Tribal knowledge | Institutional knowledge captured and queryable |
| Senior engineer dependency | Documented answers are surfaced automatically |

### Primary Capabilities

- Multi-user document uploads (PDF, Markdown, DOCX, TXT)
- Semantic search across all uploaded documents
- AI-powered question answering with source citations
- Team and workspace scoping (access control per team)
- Metadata filtering by document, date, and tags

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (Next.js)                 │
│   Upload UI · Chat Interface · Citation Panel   │
└───────────────────────┬─────────────────────────┘
                        │ REST / SSE
                        ▼
┌─────────────────────────────────────────────────┐
│            BACKEND (FastAPI + Python)           │
│   Routes · Auth · File Handling · RAG Chain     │
└──────────┬──────────────────────────┬───────────┘
           │                          │
           ▼                          ▼
┌─────────────────┐        ┌──────────────────────┐
│  Cloud Storage  │        │   Celery + Redis      │
│  (S3/Supabase)  │        │   Async Job Queue     │
└─────────────────┘        └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │   Background Worker  │
                           │  LangChain Loaders   │
                           │  → Text Extraction   │
                           │  RecursiveCharSplit  │
                           │  → 800-token chunks  │
                           │  BGE-large Embed     │
                           │  → Qdrant Upsert     │
                           └──────────┬───────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────┐
│                    QDRANT                       │
│       Vector Store · Payload Filtering          │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│          LANGCHAIN RAG PIPELINE                 │
│  Retriever → Reranker → Context → Prompt        │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              QWEN3-32B (LLM)                    │
│       Grounded answer + inline citations        │
└─────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js | React framework — SSR, routing, streaming |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |

### Backend

| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Primary language |
| FastAPI | Async REST API, WebSocket, auto OpenAPI docs |
| LangChain (Python) | RAG orchestration — loaders, splitter, retriever, chains |
| Celery | Distributed background workers |
| Redis | Celery broker + session cache |

### AI Layer

| Technology | Purpose |
|------------|---------|
| Qwen3-32B | Primary LLM for answer generation |
| BGE-large-en-v1.5 | Embedding model (1024-dim) |
| BGE-reranker-large | Cross-encoder reranker for retrieval precision |
| Qdrant | Vector database with payload filtering |

### Storage

| Technology | Purpose |
|------------|---------|
| S3 / Supabase Storage | Original uploaded files |
| Qdrant | Vector index |
| PostgreSQL / MongoDB | Document metadata, users, sessions |

---

## 4. Why LangChain (Python)

LangChain handles the AI orchestration layer so you don't have to wire everything together manually.

| LangChain Handles | Without LangChain |
|-------------------|-------------------|
| `PyPDFLoader`, `Docx2txtLoader`, `TextLoader` | Custom loader per file type |
| `RecursiveCharacterTextSplitter` | Custom chunking logic |
| `HuggingFaceBgeEmbeddings` | Direct model calls + batching |
| `QdrantVectorStore` | Raw Qdrant client + serialisation |
| `RetrievalQAChain` | Manual prompt building + LLM calls |

**What stays in FastAPI (not LangChain):** authentication, file uploads, team/workspace management, API routing, Celery job creation.

---

## 5. Document Processing Pipeline

Processing is fully asynchronous. The API returns `202 Accepted` immediately; a Celery worker handles everything in the background.

### Supported Formats

| Format | LangChain Loader |
|--------|-----------------|
| PDF | `PyPDFLoader` |
| DOCX | `Docx2txtLoader` |
| Markdown | `TextLoader` |
| TXT | `TextLoader` |

### Workflow

```
User uploads file
      │
      ▼
POST /api/documents/upload
  - Validate file type + size
  - Store file → Cloud Storage
  - Create DB record { status: "pending" }
  - Enqueue Celery job
  - Return 202 { documentId, status: "processing" }
      │
      ▼ (Celery Worker)

1. Download file from storage
2. LangChain loader extracts text
3. RecursiveCharacterTextSplitter → chunks
4. Prepend BGE document prefix to each chunk
5. BGE-large embeds chunks (batched, size 32)
6. Upsert vectors + payload into Qdrant
7. Update DB record { status: "completed" }
```

### Error Handling

| Failure | Behaviour |
|---------|-----------|
| Loader throws | Mark failed; store error message |
| Embedding model unavailable | Retry 5× with 30s delay |
| Qdrant upsert fails | Retry 3×; track partial success |
| Worker crash | Celery auto-requeues stalled job |

---

## 6. Chunking Strategy

Chunking is the highest-impact decision in the RAG pipeline. The chunk is the atomic unit of retrieval — what gets embedded, stored, and injected into the LLM.

### Configuration

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken

def num_tokens(text: str) -> int:
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    length_function=num_tokens,
)
```

### Why These Values

- **800 tokens** — large enough for a complete concept or procedure; small enough for a focused embedding
- **150 token overlap** — prevents information loss at chunk boundaries
- **RecursiveCharacterTextSplitter** — splits on `\n\n` → `\n` → `.` → ` ` in order, preserving paragraph and sentence integrity

---

## 7. Embedding Model

**Model:** `BAAI/bge-large-en-v1.5`

| Property | Value |
|----------|-------|
| Dimensions | 1024 |
| Max tokens | 512 |
| Licence | Apache 2.0 |
| LangChain class | `HuggingFaceBgeEmbeddings` |

### Instruction Prefix — Required

BGE performs better with task-specific prefixes. Skipping these measurably degrades recall.

```python
# Indexing documents
DOCUMENT_PREFIX = "Represent this document for retrieval: "
enriched_chunk = DOCUMENT_PREFIX + chunk_text

# Querying
QUERY_PREFIX = "Represent this question for searching relevant passages: "
enriched_query = QUERY_PREFIX + user_query
```

### Batched Inference

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

embedding_model = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-large-en-v1.5",
    model_kwargs={"device": "cuda"},
    encode_kwargs={"normalize_embeddings": True},
)

def embed_batch(chunks: list[str]) -> list[list[float]]:
    results = []
    for i in range(0, len(chunks), 32):
        results.extend(embedding_model.embed_documents(chunks[i:i+32]))
    return results
```

---

## 8. Vector Database Design

**Database:** Qdrant

### Why Qdrant

| Criterion | Qdrant | Pinecone | Chroma |
|-----------|--------|----------|--------|
| Self-hostable | ✓ | ✗ | ✓ |
| Payload filtering at query time | ✓ native | ✓ | Limited |
| Open source | ✓ | ✗ | ✓ |
| LangChain support | ✓ | ✓ | ✓ |
| gRPC support | ✓ | ✗ | ✗ |

### Collection Setup

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, HnswConfigDiff

client = QdrantClient(url="http://localhost:6333")
client.create_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1024, distance=Distance.COSINE),
    hnsw_config=HnswConfigDiff(m=16, ef_construct=100),
)
```

### Payload per Vector

```json
{
  "documentId": "uuid-v4",
  "fileName": "deployment-guide.pdf",
  "uploadedBy": "alice@company.com",
  "team": "platform-engineering",
  "workspace": "infrastructure",
  "createdAt": "2025-01-15T10:23:00Z",
  "tags": ["deployment", "kubernetes"],
  "pageNumber": 3,
  "chunkIndex": 12
}
```

### Filtering Examples

```python
from qdrant_client.models import Filter, FieldCondition, MatchValue, MatchAny

# By team
Filter(must=[FieldCondition(key="team", match=MatchValue(value="platform-engineering"))])

# By team + tags
Filter(must=[
    FieldCondition(key="team", match=MatchValue(value="platform-engineering")),
    FieldCondition(key="tags", match=MatchAny(any=["deployment", "kubernetes"])),
])
```

---

## 9. Query & Retrieval Flow

```
User: "How do I deploy a hotfix to production?"
      │
      ▼
FastAPI validates JWT → extracts team, workspaces
      │
      ▼
Prepend query prefix → BGE-large → 1024-dim vector
      │
      ├──▶ Qdrant semantic search (filter: user's teams)  → top-20
      ├──▶ BM25 keyword search   (same filter)           → top-20
      │
      ▼
Reciprocal Rank Fusion → unified top-20
      │
      ▼
BGE-reranker-large → score each (query, chunk) pair → top-5
      │
      ▼
Context builder → format chunks with file citations
      │
      ▼
Qwen3-32B → streamed answer with inline citations
```

### System Prompt

```
You are an internal knowledge assistant.
Answer ONLY from the document context provided below.
If the context is insufficient, say: "I don't have enough information in the uploaded documents."
Always cite the source document and page using: [Source: filename, Page X].
Do not speculate beyond what is explicitly stated.
```

---

## 10. Retrieval Quality & Reranking

### Reranking Pipeline

After the initial vector + BM25 search returns 20 candidates, the BGE cross-encoder reranker scores each `(query, chunk)` pair jointly — producing significantly more precise relevance scores than the bi-encoder similarity alone.

```
top-20 from fusion
      │
      ▼
BGE-reranker-large (cross-encoder)
  → 20 relevance scores
      │
      ▼
top-5 chunks → injected into LLM context
```

Reranker latency is ~80–150ms on GPU for 20 pairs — a worthwhile cost for the quality improvement.

### Quality Metrics to Track

| Metric | Target |
|--------|--------|
| Answer relevance (sampled, human-rated) | > 4.0 / 5.0 |
| Citation accuracy | > 90% |
| Retrieval recall@5 | > 85% |
| P95 end-to-end latency | < 4s |

---

## 11. Hybrid Search

Pure semantic search struggles with exact technical terms — variable names, error codes, command names, file names. BM25 keyword search handles these natively. Combining both covers all query types.

```python
import asyncio
from services.retrieval.bm25_retriever import BM25Retriever
from services.retrieval.fusion import reciprocal_rank_fusion

async def hybrid_retrieve(query: str, qdrant_filter, top_k: int = 20) -> list:
    semantic_task = asyncio.to_thread(
        vector_store.similarity_search_with_score, query, top_k, qdrant_filter
    )
    keyword_task = asyncio.to_thread(
        bm25_retriever.retrieve, query, top_k, qdrant_filter
    )
    semantic_results, keyword_results = await asyncio.gather(semantic_task, keyword_task)
    return reciprocal_rank_fusion(semantic_results, keyword_results, k=60)[:top_k]
```

The BM25 index lives in Redis and is rebuilt from the metadata DB on worker restart. It stays in sync with Qdrant — chunks added/removed from both together.

---

## 12. Backend Folder Structure

```
backend/
│
├── routes/
│   ├── documents.py          # POST /upload, GET /documents, DELETE /:id
│   ├── chat.py               # POST /chat (streaming SSE)
│   ├── workspaces.py         # Team/workspace management
│   └── health.py             # GET /health, /ready
│
├── controllers/
│   ├── document_controller.py
│   ├── chat_controller.py
│   └── workspace_controller.py
│
├── services/
│   ├── loaders/
│   │   ├── pdf_loader.py           # PyPDFLoader wrapper
│   │   ├── docx_loader.py          # Docx2txtLoader wrapper
│   │   └── text_loader.py          # TextLoader wrapper
│   │
│   ├── chunking/
│   │   ├── splitter.py             # RecursiveCharacterTextSplitter config
│   │   └── enricher.py             # BGE prefix injection
│   │
│   ├── embeddings/
│   │   ├── bge_model.py            # HuggingFaceBgeEmbeddings wrapper
│   │   └── batch_processor.py      # Batched embedding (size 32)
│   │
│   ├── vectorstore/
│   │   ├── qdrant_client.py        # Qdrant Python client setup
│   │   ├── upsert.py               # Batch vector upsert
│   │   └── search.py               # Filtered similarity search
│   │
│   ├── retrieval/
│   │   ├── hybrid_retriever.py     # Semantic + BM25 + RRF
│   │   ├── bm25_retriever.py       # BM25 index search
│   │   └── fusion.py               # Reciprocal Rank Fusion
│   │
│   ├── reranking/
│   │   └── reranker.py             # BGE-reranker-large cross-encoder
│   │
│   ├── rag/
│   │   ├── context_builder.py      # Format chunks for LLM injection
│   │   └── rag_chain.py            # LangChain RetrievalQAChain
│   │
│   └── llm/
│       ├── qwen_client.py          # Qwen3-32B API wrapper
│       └── prompts.py              # System prompt templates
│
├── workers/
│   ├── ingestion_worker.py         # Celery: full ingestion pipeline
│   └── cleanup_worker.py           # Celery: orphan chunk cleanup
│
├── queues/
│   ├── ingestion_queue.py          # Celery queue definition
│   └── queue_monitor.py            # Flower dashboard setup
│
├── middleware/
│   ├── auth.py                     # JWT validation (FastAPI dependency)
│   ├── rbac.py                     # Team/workspace access control
│   └── rate_limit.py               # Per-user rate limiting via Redis
│
├── config/
│   ├── qdrant.py
│   ├── redis.py
│   ├── storage.py
│   └── env.py                      # Pydantic Settings validation
│
├── utils/
│   ├── token_counter.py
│   ├── file_validator.py
│   └── logger.py                   # structlog structured logging
│
└── main.py                         # FastAPI application entry point
```

---

## 13. Authentication Architecture

**Entry screen presents two options:**

#### Create a New Workspace
- Workspace name
- Workspace password
- Add member emails (comma-separated or one by one)
- A **unique Workspace ID** is auto-assigned on creation

#### Log In to an Existing Workspace
- Enter Workspace ID
- Enter your email (must match an email the workspace owner added)
- Enter workspace password
- Both email existence in that workspace **and** password must match for login to succeed

**Workspace Owner Controls:**
- Can **add or remove members** at any point in time
- Can **change the workspace password** at any time

**Workspace Isolation:**
- Every workspace and all its documents, data, and information are fully isolated from other workspaces
- No cross-workspace data access is permitted at any layer (API, DB, vector store)

---

## 14. Security & Access Control

### Authentication

Every API request requires a valid JWT. Token claims carry the user's team and workspace memberships:

```json
{
  "sub": "user_id",
  "email": "alice@company.com",
  "teams": ["platform-engineering"],
  "workspaces": ["infrastructure"],
  "role": "member",
  "exp": 1737000000
}
```

### Authorisation (RBAC)

Access control is enforced at the Qdrant query level — not in application code after retrieval. Unauthorised vectors never leave the database.

```python
from qdrant_client.models import Filter, FieldCondition, MatchAny

def build_access_filter(current_user) -> Filter:
    return Filter(must=[
        FieldCondition(key="team", match=MatchAny(any=current_user.teams)),
        FieldCondition(key="workspace", match=MatchAny(any=current_user.workspaces)),
    ])
```

### Other Security Measures

- **Secret scanning** — files are scanned with `detect-secrets` before indexing; secrets replaced with placeholders
- **Prompt injection mitigation** — context wrapped in clear delimiters; system prompt instructs model to ignore instructions found in document content
- **Audit logging** — every query, retrieved chunk set, and response logged with user identity
- **Rate limiting** — per-user limits enforced via Redis middleware

---

## 15. Deployment Architecture

> ⚠️ The Python backend **cannot be deployed on Vercel**. Vercel is serverless-only and has no GPU support, no persistent processes, and a 60s request timeout. Use the split below.

### Recommended Split

| Component | Platform |
|-----------|----------|
| Next.js frontend | Vercel |
| FastAPI backend | Railway / Render / Fly.io |
| Celery workers | Railway / Render / Fly.io |
| Redis | Redis Cloud / Railway |
| Qdrant | Qdrant Cloud / self-hosted |
| File storage | S3 / Supabase Storage |
| BGE embedding model | Dedicated GPU worker (Modal / Replicate / self-hosted) |
| Qwen3-32B | vLLM on GPU server (Hetzner / AWS / GCP) |

### Resource Requirements

| Component | CPU | RAM | GPU |
|-----------|-----|-----|-----|
| FastAPI (API pods) | 0.5–2 cores | 512MB–2GB | — |
| Celery workers (CPU) | 1–4 cores | 1–4GB | — |
| BGE embedding worker | 4 cores | 8GB | 1× A10G |
| BGE reranker | 2 cores | 4GB | 1× A10G (shared) |
| Qwen3-32B (vLLM) | 8 cores | 32GB | 4× A100 80GB |
| Qdrant | 2–8 cores | 8–32GB | — |

---

## 16. MVP Scope

Build only this first. Validate retrieval quality before adding anything else.

### Include in MVP

| Feature | Priority |
|---------|----------|
| Document upload (PDF, MD, TXT, DOCX) | P0 |
| Async Celery processing | P0 |
| BGE-large embeddings + Qdrant | P0 |
| Semantic search (dense only) | P0 |
| Qwen3-32B answer generation | P0 |
| Source citations in responses | P0 |
| JWT authentication | P0 |
| Basic team scoping | P0 |
| Processing status polling | P1 |
| Document listing + deletion | P1 |

### Exclude from MVP

- Hybrid search / BM25 (Phase 2)
- Reranking (Phase 2)
- Slack / GitHub / Notion integrations (Phase 3)
- Analytics dashboard (Phase 4)
- Document versioning (Phase 4)

---

## 17. Future Roadmap

| Phase | Features |
|-------|---------|
| **Phase 1 — MVP** | Upload, async processing, semantic search, Q&A with citations, JWT auth |
| **Phase 2 — Retrieval Quality** | BM25 + RRF hybrid search, BGE reranker, metadata filtering UI, document versioning |
| **Phase 3 — Integrations** | Slack bot, GitHub repo indexing, Notion sync, streaming WebSocket responses |
| **Phase 4 — Analytics** | Usage dashboard, answer feedback (thumbs up/down), auto re-indexing on doc change, advanced RBAC |


---

> *Internal use only. Contact the Platform Engineering team for architecture review requests.*

*v1.0 · AI Knowledge Base · Confidential*