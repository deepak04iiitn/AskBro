# AskBro — How It All Works

A plain-English walkthrough of what happens when you upload a document and ask a question.

---

## The Big Picture

AskBro lets your team upload documents (PDFs, Word files, Markdown, text files) and then ask questions about them in plain English. It reads the documents, understands them, and gives you answers with citations — like a smart search engine that actually reads and comprehends the content.

There are **two core workflows**:

1. **Upload a document** → the system reads, understands, and stores it
2. **Ask a question** → the system finds relevant parts and generates an answer

---

## Glossary — Terms You'll Encounter

**Chunk**
A document is too large to process all at once, so it gets broken into smaller pieces called chunks. Each chunk is roughly 800 words/tokens. There's a 150-word overlap between consecutive chunks so that sentences at the boundary of one chunk aren't lost.

> Example: A 20-page PDF becomes ~60 chunks. Chunk 1 is page 1 paragraphs 1–5. Chunk 2 starts from paragraph 4 (overlap) and goes to paragraph 9. And so on.

**Embedding**
An embedding is a list of 1024 numbers that represents the *meaning* of a piece of text. Two texts that mean similar things will have similar numbers. This is how the system can find relevant chunks for a question — it converts both the chunk and the question into these number lists and measures how close they are.

> Example: The chunk "Employees get 18 days of paid leave per year" and the question "How many leave days do I have?" will produce very similar number lists, so the system knows this chunk is relevant.

**Vector Database (Qdrant)**
A special database that stores embeddings (number lists) and can search them by similarity extremely fast. When you ask a question, the system searches this database to find the chunks most similar to your question.

**LLM (Large Language Model)**
The AI model that actually reads the retrieved chunks and writes the answer. AskBro uses Qwen3-32B — a powerful reasoning model. It only answers based on what's in the chunks; it does not make things up or use outside knowledge.

**RAG (Retrieval-Augmented Generation)**
The technique that combines everything: *Retrieve* relevant chunks → *Augment* the prompt with those chunks → *Generate* an answer. This is why the AI can answer questions about your specific documents rather than generic topics.

**BGE Model**
The embedding model used — `BAAI/bge-large-en-v1.5`. It converts text into embeddings. It's used both when storing a document (to embed chunks) and when answering a question (to embed the question).

**Celery Worker**
A background process that runs heavy tasks (like embedding all chunks of a document) separately from the main server. This way the server responds instantly and the slow work happens in the background.

**GridFS**
MongoDB's built-in file storage system. The raw uploaded file (the actual PDF bytes) is stored here. Think of it as a file system inside MongoDB.

**SSE (Server-Sent Events)**
A way for the server to stream data to the browser in real time. This is how you see the AI's answer appear word by word instead of waiting for the whole thing.

---

## Workflow 1 — Uploading a Document

```
You                     API Server              Background Worker
 |                          |                          |
 |-- Upload file ---------->|                          |
 |                          |-- Save metadata to DB    |
 |                          |-- Store file in GridFS   |
 |                          |-- Enqueue worker task -->|
 |<-- "Processing..." ------|                          |
 |                          |              Download file from GridFS
 |                          |              Read & parse the file
 |                          |              Split into chunks
 |                          |              Embed each chunk (BGE)
 |                          |              Store vectors in Qdrant
 |                          |              Save chunk records to MongoDB
 |                          |              Mark document as "completed"
 |-- Poll status ---------->|                          |
 |<-- "Ready" -------------|                          |
```

### Step-by-Step

**Step 1 — You select a file**
You pick a PDF, DOCX, MD, or TXT file on the upload page. Max size is 50 MB.

**Step 2 — File lands at the server**
The browser sends the file to `POST /api/v1/documents/upload`. The server:
- Checks the file type is allowed
- Checks the file isn't too large
- Creates a record in MongoDB saying "this document exists, status: pending"

**Step 3 — File is stored in GridFS**
The raw file bytes are saved into GridFS (MongoDB's file storage). The MongoDB record is updated with the GridFS file ID so we can find the file later.

**Step 4 — Background worker is triggered**
The server hands off a task to a Celery background worker: "go process document with this ID." The server then immediately responds to you with the document ID and status "Processing…" — it doesn't wait for the slow work to finish.

**Step 5 — Worker downloads the file**
The Celery worker picks up the task, connects to MongoDB, and downloads the raw file bytes from GridFS into a temporary file on disk.

**Step 6 — File is parsed into text**
The appropriate parser reads the file:
- **PDF** → `PyPDFLoader` extracts text page by page, preserving page numbers
- **DOCX** → `Docx2txtLoader` extracts all text
- **MD / TXT** → plain text reader

The result is a list of text blocks, each knowing which page it came from.

**Step 7 — Text is split into chunks**
A splitter cuts the text into chunks of ~800 tokens (roughly 600 words) with 150-token overlap between consecutive chunks. It tries to split at paragraph breaks first, then sentences, then words — so chunks don't cut off mid-sentence.

> A 10-page PDF might produce 30 chunks.

**Step 8 — Chunks are enriched for BGE**
BGE performs better when text is prefixed with a specific instruction. Each chunk becomes:
```
"Represent this document for retrieval: <actual chunk text>"
```
This was how BGE was trained, and skipping it measurably reduces search quality.

**Step 9 — Each chunk is embedded**
The BGE model converts each enriched chunk into a list of 1024 numbers (an embedding). All chunks are processed in batches of 32 for efficiency.

> After this step, every chunk has a "meaning fingerprint" — a unique number list representing what that piece of text is about.

**Step 10 — Embeddings are stored in Qdrant**
Each chunk's embedding plus its metadata is stored as a "point" in Qdrant:
```
{
  vector: [0.23, -0.11, 0.87, ... (1024 numbers)],
  payload: {
    workspaceId: "...",
    documentId: "...",
    fileName: "leave_policy.pdf",
    pageNumber: 3,
    chunkIndex: 7,
    chunkText: "Employees are entitled to 18 days of paid leave..."
  }
}
```
Note: the actual chunk text is stored alongside the vector so we can retrieve it at query time without a second database call.

**Step 11 — Chunk records saved to MongoDB**
A lightweight record is saved in MongoDB for each chunk, linking the document to its Qdrant point IDs. This is used for things like deleting all a document's vectors when the document is deleted.

**Step 12 — Document marked as completed**
The MongoDB document record is updated: status → "completed", chunk_count → 30 (or however many). The frontend polls the status endpoint and shows "Ready".

---

## Workflow 2 — Asking a Question

```
You                     API Server              Qdrant          LLM (Qwen3)
 |                          |                     |                 |
 |-- Ask question --------->|                     |                 |
 |                          |-- Embed question --> BGE model        |
 |                          |-- Search for similar chunks -------->|
 |                          |<-- Top matching chunks --------------|
 |                          |-- Build prompt (question + chunks)   |
 |                          |-- Send to LLM ---------------------->|
 |<-- token by token -------|<-- streaming tokens -----------------|
 |<-- (citations at end) ---|                     |                 |
```

### Step-by-Step

**Step 1 — You type a question**
You type your question in the chat interface, e.g. "What is the work from home policy?"

**Step 2 — Question is enriched for BGE**
Just like chunks were enriched during upload, the question gets its own BGE prefix:
```
"Represent this question for searching relevant passages: What is the work from home policy?"
```
Using a different prefix for questions vs documents is what makes BGE's asymmetric retrieval work well.

**Step 3 — Question is embedded**
The BGE model converts the enriched question into 1024 numbers. This question embedding will be compared against all the chunk embeddings stored in Qdrant.

**Step 4 — Semantic search in Qdrant**
Qdrant searches for the 20 chunks whose embeddings are closest (most similar) to the question embedding. Crucially, the search is **filtered to your workspace only** — you will never see results from another team's documents.

> If you're asking about a specific document, an additional filter narrows the search to just that document's chunks.

**Step 5 — Top chunks are selected for context**
From the top 20 hits, the system selects the most relevant ones (up to 5) to send to the LLM. A chunk is included only if its similarity score is at least 80% of the best score. This avoids feeding the LLM loosely-related chunks that would confuse the answer.

Each selected chunk is formatted like:
```
[Source: leave_policy.pdf, Page 3]
Employees are entitled to 18 days of paid annual leave...

[Source: hr_handbook.pdf, Page 12]
Work from home is permitted up to 3 days per week...
```

**Step 6 — LLM prompt is assembled**
The system builds a prompt for the LLM:

```
System: You are an internal knowledge assistant.
        Answer ONLY from the document context provided.
        If the context is insufficient, say you don't have enough information.
        Always cite the source document and page.
        Do not speculate beyond what is explicitly stated.

User:   Context:
        [Source: leave_policy.pdf, Page 3]
        Employees are entitled to 18 days...

        [Source: hr_handbook.pdf, Page 12]
        Work from home is permitted...

        Question: What is the work from home policy?
```

**Step 7 — LLM streams the answer**
The prompt is sent to Qwen3-32B (via Groq API). The model streams its response token by token (word by word). Each token is immediately forwarded to your browser via SSE so you see the answer being typed out in real time.

Qwen3 is a "reasoning model" — it first thinks through the problem internally in a `<think>...</think>` block. AskBro strips these internal thinking tokens before they reach you; you only see the final polished answer.

**Step 8 — Citations are sent**
After the last token, the system sends a final event listing which documents were cited. Only documents where a chunk scored above 92% of the best score are shown as citations — so the citations you see are the ones that actually drove the answer, not every document that was vaguely related.

**Step 9 — Everything is saved**
- Your question is saved to MongoDB as a "user" message
- The AI's full answer is saved as an "assistant" message with the citations
- An audit log entry is created (who asked, what, which documents were retrieved)

The chat history persists so you can come back to it later.

---

## How the Two Workflows Connect

```
UPLOAD TIME                          QUERY TIME
-----------                          ----------
Document                             Question
   ↓                                    ↓
Parse into text                      Embed question
   ↓                                    ↓
Split into chunks              →→→  Search Qdrant for similar chunks
   ↓                           ↑        ↓
Embed each chunk (BGE)         |    Inject top chunks into LLM prompt
   ↓                           |        ↓
Store embeddings in Qdrant ————┘    Stream answer to user
```

Everything at upload time is preparation so that query time is fast. The embeddings stored in Qdrant are the bridge — they're created once during upload and searched many times during querying.

---

## Why Each Technology Is Used

| Technology | Job in AskBro | Why This One |
|---|---|---|
| **MongoDB** | Stores all metadata: documents, chats, users, messages | Flexible document store; GridFS built-in for files |
| **GridFS** | Stores the raw uploaded files (PDFs, etc.) | No need for a separate file server like S3 |
| **Qdrant** | Stores embeddings, searches them by similarity | Supports filtering by workspace ID so teams stay isolated |
| **BGE-large** | Converts text → 1024-number embeddings | Top open-source retrieval model; supports asymmetric query/document prefixes |
| **Celery** | Runs embedding/ingestion in the background | Embedding is slow (30–60s for large files); keeps the API fast |
| **Qwen3-32B** | Reads chunks + writes the answer | Powerful reasoning model; served via OpenAI-compatible API (Groq) |
| **FastAPI** | The backend API server | Async Python, excellent for streaming responses |
| **Next.js** | The frontend UI | React-based, handles SSE streaming well |
