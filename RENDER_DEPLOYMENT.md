# Deploying AskBro Backend on Render

> **Complete step-by-step guide** — from a fresh Render account to a running production backend.

---

## Table of Contents

1. [Prerequisites & Accounts](#1-prerequisites--accounts)
2. [Prepare MongoDB Atlas](#2-prepare-mongodb-atlas)
3. [Prepare Qdrant Cloud](#3-prepare-qdrant-cloud)
4. [Generate a Resend API Key](#4-generate-a-resend-api-key)
5. [Choose an LLM Provider](#5-choose-an-llm-provider)
6. [Prepare the Repository](#6-prepare-the-repository)
7. [Deploy the FastAPI Web Service](#7-deploy-the-fastapi-web-service)
8. [Deploy the Celery Worker](#8-deploy-the-celery-worker)
9. [Set Environment Variables](#9-set-environment-variables)
10. [Configure Persistent Disk (Model Cache)](#10-configure-persistent-disk-model-cache)
11. [Verify the Deployment](#11-verify-the-deployment)
12. [Set Up the Keep-Alive Cron](#12-set-up-the-keep-alive-cron)
13. [Deploy the Frontend on Vercel](#13-deploy-the-frontend-on-vercel)
14. [Troubleshooting](#14-troubleshooting)
15. [render.yaml (Infrastructure as Code)](#15-renderyaml-infrastructure-as-code)

---

## 1. Prerequisites & Accounts

Create free accounts on these services before you start:

| Service | URL | Purpose |
|---------|-----|---------|
| **Render** | https://render.com | Hosting backend + worker |
| **MongoDB Atlas** | https://cloud.mongodb.com | Cloud database |
| **Qdrant Cloud** | https://cloud.qdrant.io | Vector store |
| **Resend** | https://resend.com | Transactional email (OTP) |
| **GitHub / GitLab** | — | Source code hosting |
| **Groq** *(or any LLM provider)* | https://console.groq.com | LLM API |

> **Render plan requirement:** The BGE-large embedding model requires **≥ 4 GB RAM**.
> Use at least the **Standard plan** (`$25/month`) for the API service.  
> The Celery worker needs at least **2 GB RAM** (`Starter` at `$7/month`).
> Free tier (512 MB) is **not sufficient** for running embedding models.

---

## 2. Prepare MongoDB Atlas

### 2.1 Create a cluster

1. Sign in → **Database** → **Build a Database**
2. Choose **Free (M0)** → select a region close to your Render deployment
3. Set **Cluster Name**: `askbro`
4. Click **Create**

### 2.2 Create a database user

1. **Database Access** → **Add New Database User**
2. Username: `askbro`
3. Password: generate a strong one and copy it
4. Role: **Atlas admin** (or `readWriteAnyDatabase`)
5. Click **Add User**

### 2.3 Whitelist all IPs (Render uses dynamic IPs)

1. **Network Access** → **Add IP Address**
2. Click **Allow Access From Anywhere** → `0.0.0.0/0`
3. Click **Confirm**

> For production, use Render's static outbound IPs (paid feature) and restrict to those.

### 2.4 Get the connection string

1. **Database** → **Connect** → **Drivers**
2. Copy the connection string, e.g.:
   ```
   mongodb+srv://askbro:<password>@askbro.yimauea.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password

Save this as `MONGODB_URI`.

---

## 3. Prepare Qdrant Cloud

### 3.1 Create a cluster

1. Sign in → **Create cluster**
2. Select **Free tier** (1 GB, 1 node) — enough for development
3. Choose a region → click **Create**

### 3.2 Get credentials

1. Click the cluster → **API Keys** tab → **Create API Key**
2. Copy the key — this is `QDRANT_API_KEY`
3. Copy the cluster URL, e.g.:
   ```
   https://abc123-xyz.us-west-2-0.aws.cloud.qdrant.io
   ```
   This is `QDRANT_URL`

> **Do not include a trailing slash** in `QDRANT_URL`.

---

## 4. Generate a Resend API Key

1. Sign in to https://resend.com
2. **API Keys** → **Create API Key**
3. Name: `AskBro Production`
4. Permission: **Sending access**
5. Copy the key — this is `RESEND_API_KEY`

> Resend free tier allows **100 emails/day** and **3,000/month**, which is more than enough.

---

## 5. Choose an LLM Provider

AskBro works with any OpenAI-compatible API. Recommended options:

| Provider | URL | Free tier |
|----------|-----|-----------|
| **Groq** | https://api.groq.com/openai/v1 | Yes — fast, generous limits |
| **Together AI** | https://api.together.xyz/v1 | Yes |
| **OpenAI** | https://api.openai.com/v1 | Pay-as-you-go |
| **Local vLLM** | `http://your-gpu-server/v1` | Self-hosted |

Set `LLM_BASE_URL` and `LLM_API_KEY` accordingly.

Recommended free model on Groq: `llama-3.3-70b-versatile` or `Qwen/Qwen3-32B` (if available).

---

## 6. Prepare the Repository

Render needs to pull code from a Git repository.

### 6.1 Generate requirements.txt

Render uses `pip` by default. Generate a flat requirements file from `pyproject.toml`:

```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
```

This creates a pinned `requirements.txt`. **Commit this file.**

```bash
git add requirements.txt
git commit -m "add: pinned requirements.txt for Render deployment"
```

### 6.2 Create a .gitignore (if you don't have one)

Make sure `.env` is ignored:

```bash
echo ".env" >> .gitignore
echo ".venv/" >> .gitignore
echo "__pycache__/" >> .gitignore
git add .gitignore
git commit -m "chore: update .gitignore"
```

### 6.3 Push to GitHub

```bash
git remote add origin https://github.com/your-username/askbro.git
git branch -M main
git push -u origin main
```

---

## 7. Deploy the FastAPI Web Service

### 7.1 Create the service

1. Log in to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub account → select the `askbro` repository
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `askbro-api` |
| **Region** | Same region as your MongoDB Atlas and Qdrant |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | `Standard` ($25/mo) — minimum for BGE models |

4. Click **Create Web Service** — do **not** add env vars yet (do it in step 9)

### 7.2 Wait for the first (likely failing) deploy

The first deploy will fail because env vars aren't set yet. That's expected. Continue to step 9.

---

## 8. Deploy the Celery Worker

Celery must run as a separate Background Worker service (not a web service).

### 8.1 Create the worker

1. Render Dashboard → **New +** → **Background Worker**
2. Select the same repository
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `askbro-worker` |
| **Region** | Same as the API service |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python -m celery -A celery_app worker --loglevel=info -Q ingestion,cleanup --pool=solo` |
| **Plan** | `Starter` ($7/mo) — 2 GB RAM |

4. Click **Create Background Worker**

> **Why `--pool=solo`?** Render workers run in a single process. The `solo` pool avoids multiprocessing issues on Linux containers.

---

## 9. Set Environment Variables

Set these on **both** the API service and the Worker service. The easiest way is to use a Render Environment Group.

### 9.1 Create an Environment Group (recommended)

1. Render Dashboard → **Environment Groups** → **New Environment Group**
2. Name: `askbro-shared`
3. Add every variable from the table below
4. **Link** the group to both `askbro-api` and `askbro-worker`

### 9.2 Variables to set

```
# ── App ───────────────────────────────────────────────────────────────────────
APP_ENV=production
CORS_ORIGINS=["https://your-frontend.vercel.app","http://localhost:3000"]

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://askbro:YOUR_PASSWORD@askbro.CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=askbro
GRIDFS_BUCKET_NAME=uploads

# ── Qdrant ────────────────────────────────────────────────────────────────────
QDRANT_URL=https://YOUR-CLUSTER-ID.REGION.aws.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=knowledge_base

# ── Embeddings (downloaded at first startup — see step 10) ────────────────────
BGE_MODEL_NAME=BAAI/bge-large-en-v1.5
BGE_RERANKER_MODEL=BAAI/bge-reranker-large
EMBEDDING_BATCH_SIZE=32
EMBEDDING_DEVICE=cpu

# Cache directory on the persistent disk (configured in step 10)
HF_HOME=/data/hf_cache
TRANSFORMERS_CACHE=/data/hf_cache
TORCH_HOME=/data/torch_cache

# ── LLM ───────────────────────────────────────────────────────────────────────
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL_NAME=llama-3.3-70b-versatile
LLM_API_KEY=your-groq-api-key
LLM_TIMEOUT_SECONDS=60
LLM_MAX_TOKENS=2048
LLM_TEMPERATURE=0.1

# ── JWT ───────────────────────────────────────────────────────────────────────
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-64-char-hex-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# ── Celery (use your MongoDB Atlas URI) ───────────────────────────────────────
CELERY_BROKER_URL=mongodb+srv://askbro:YOUR_PASSWORD@askbro.CLUSTER.mongodb.net/celery_broker?retryWrites=true&w=majority
CELERY_RESULT_BACKEND=mongodb+srv://askbro:YOUR_PASSWORD@askbro.CLUSTER.mongodb.net/celery_results?retryWrites=true&w=majority

# ── Rate limiting ─────────────────────────────────────────────────────────────
RATE_LIMIT_AUTH=30/minute
RATE_LIMIT_ADMIN=15/minute
RATE_LIMIT_API=120/minute

# ── File upload ───────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE_MB=50

# ── Admin ─────────────────────────────────────────────────────────────────────
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-strong-admin-password
# Generate: python -c "import secrets; print(secrets.token_hex(32))"
ADMIN_JWT_SECRET=your-admin-64-char-hex-string

# ── Email ─────────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_your_resend_api_key
```

> **Important:** Generate fresh `SECRET_KEY` and `ADMIN_JWT_SECRET` values — **never reuse development keys in production.**

---

## 10. Configure Persistent Disk (Model Cache)

The BGE models (~1.3 GB each) are downloaded from HuggingFace on first startup. Without a persistent disk they re-download on every deploy (slow + may hit rate limits).

### 10.1 Add a disk to the API service

1. `askbro-api` → **Disks** tab → **Add Disk**

| Field | Value |
|-------|-------|
| **Name** | `model-cache` |
| **Mount Path** | `/data` |
| **Size** | `10 GB` (covers both BGE models with room to spare) |

2. Click **Save**

The env vars `HF_HOME=/data/hf_cache` and `TRANSFORMERS_CACHE=/data/hf_cache` already set in step 9 will make HuggingFace write to this disk.

### 10.2 Add a disk to the Worker service

Repeat the exact same steps for `askbro-worker` — it also loads the embedding model.

> Disks are billed at **$0.25 / GB / month**. A 10 GB disk = $2.50/month.

---

## 11. Verify the Deployment

Once both services show **Live** (green) in the Render dashboard:

### 11.1 Check the keep-alive endpoint

```bash
curl https://askbro-api.onrender.com/ping
# Expected: {"pong":true,"uptime_seconds":42}
```

### 11.2 Check readiness (verifies DB + Qdrant)

```bash
curl https://askbro-api.onrender.com/ready
# Expected: {"status":"ready","checks":{"mongodb":"ok","qdrant":"ok"}}
```

### 11.3 Check the Swagger docs

Open in your browser:
```
https://askbro-api.onrender.com/docs
```

> The `/docs` page is disabled in production (`APP_ENV=production`). Set `APP_ENV=development` temporarily if you need it.

### 11.4 Test a login request

```bash
curl -X POST https://askbro-api.onrender.com/api/v1/workspaces/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","owner_email":"you@test.com","password":"test1234"}'
# Expected: {"workspace_code":"WSP-XXXX","message":"Workspace..."}
```

### 11.5 Check Render logs

In the Render dashboard → `askbro-api` → **Logs** tab — look for:

```
MongoDB connected  db=askbro
File storage: MongoDB GridFS  bucket=uploads
Qdrant collection ready  collection=knowledge_base
Application startup complete.
```

If you see embedding model download messages on first boot, that's expected:

```
Downloading bge-large-en-v1.5:  100%|████| 1.34G/1.34G
```

Subsequent deploys will use the cached models from `/data/hf_cache`.

---

## 12. Set Up the Keep-Alive Cron

Render free-tier services sleep after 15 minutes. Even on paid plans, a periodic ping is good practice.

### Option A — cron-job.org (free, 1-minute resolution)

1. Go to https://cron-job.org → sign up free
2. **Create cronjob**:
   - Title: `AskBro keep-alive`
   - URL: `https://askbro-api.onrender.com/ping`
   - Schedule: Every **10 minutes**
   - Request method: `GET`
3. Save

### Option B — UptimeRobot (free, 5-minute resolution)

1. Go to https://uptimerobot.com → sign up free
2. **Add New Monitor**:
   - Monitor type: `HTTP(s)`
   - URL: `https://askbro-api.onrender.com/ping`
   - Monitoring interval: `5 minutes`
3. Save

> UptimeRobot also sends alerts if the service goes down.

---

## 13. Deploy the Frontend on Vercel

### 13.1 Import the project

1. Go to https://vercel.com → **New Project**
2. Import the `askbro` GitHub repository
3. Set **Root Directory** to `frontend`
4. Framework: `Next.js` (auto-detected)

### 13.2 Set environment variables

In Vercel project settings → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://askbro-api.onrender.com/api/v1
```

### 13.3 Update CORS on Render

Add your Vercel URL to `CORS_ORIGINS` in the Render environment group:

```
CORS_ORIGINS=["https://your-app.vercel.app","http://localhost:3000"]
```

> The value must be a **JSON array string** — keep the square brackets and double quotes.

---

## 14. Troubleshooting

### Service fails to start

**Symptom:** Deploy fails with `ModuleNotFoundError`  
**Fix:** Ensure `requirements.txt` exists in `backend/` and is committed.

```bash
cd backend
uv pip compile pyproject.toml -o requirements.txt
git add requirements.txt && git commit -m "fix: add requirements.txt" && git push
```

---

### Models keep re-downloading on every deploy

**Symptom:** `Downloading bge-large-en-v1.5: 0%...` in logs every deploy  
**Fix:** Persistent disk not mounted or `HF_HOME` not set correctly. Verify:
1. `/data` disk is attached to the service in Render → Disks
2. Env vars `HF_HOME=/data/hf_cache` and `TRANSFORMERS_CACHE=/data/hf_cache` are set

---

### `Connection refused` to MongoDB

**Symptom:** `ServerSelectionTimeoutError` in logs  
**Fix:** Check:
1. `MONGODB_URI` is correctly set (password has no special chars that need URL-encoding — if your password contains `@`, `/`, `+` etc., URL-encode them)
2. Atlas Network Access allows `0.0.0.0/0`
3. The database user has the correct permissions

---

### Celery tasks stuck / not processing

**Symptom:** Files upload but never complete processing  
**Fix:**
1. Check `askbro-worker` logs in Render — look for connection errors
2. Verify `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` are set on the **worker** service (not just the API)
3. Make sure the worker service is **Live** (not crashed/sleeping)

---

### Rate limit errors (429) hitting your own frontend

**Symptom:** Users get `429 Too Many Requests`  
**Fix:** Increase the relevant limit in Render env vars:
```
RATE_LIMIT_AUTH=60/minute
RATE_LIMIT_API=300/minute
```
Then redeploy.

---

### CORS errors in browser

**Symptom:** `Access-Control-Allow-Origin` error in browser console  
**Fix:** Add the frontend URL to `CORS_ORIGINS` on Render:
```
CORS_ORIGINS=["https://your-exact-vercel-url.vercel.app"]
```
Note: no trailing slash, exact origin string.

---

### Out of memory crash

**Symptom:** Service restarts with `OOM Killed`  
**Fix:** Upgrade the Render plan. Minimum requirements:
- API service: **Standard** (4 GB RAM)
- Worker: **Starter** (2 GB RAM)

---

## 15. render.yaml (Infrastructure as Code)

Instead of clicking through the UI, you can use a `render.yaml` file in the repo root to define both services declaratively.

Create `render.yaml` in the **project root** (not inside `backend/`):

```yaml
services:
  # ── FastAPI Web Service ─────────────────────────────────────────────────────
  - type: web
    name: askbro-api
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    plan: standard          # 4 GB RAM — required for BGE models
    healthCheckPath: /ping
    disk:
      name: model-cache
      mountPath: /data
      sizeGB: 10
    envVars:
      - fromGroup: askbro-shared   # link to the env group you created

  # ── Celery Background Worker ────────────────────────────────────────────────
  - type: worker
    name: askbro-worker
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: >
      python -m celery -A celery_app worker
      --loglevel=info -Q ingestion,cleanup --pool=solo
    plan: starter           # 2 GB RAM
    disk:
      name: worker-model-cache
      mountPath: /data
      sizeGB: 10
    envVars:
      - fromGroup: askbro-shared
```

Commit and push this file. Render will detect it and auto-configure both services.

```bash
git add render.yaml
git commit -m "feat: add render.yaml for IaC deployment"
git push
```

Then in Render → **New** → **Blueprint** → select the repo → Render reads `render.yaml` and creates everything automatically.

---

## Cost Summary (approximate)

| Service | Plan | Monthly cost |
|---------|------|-------------|
| `askbro-api` Web Service | Standard (4 GB) | $25 |
| `askbro-worker` Background Worker | Starter (2 GB) | $7 |
| API persistent disk (10 GB) | — | $2.50 |
| Worker persistent disk (10 GB) | — | $2.50 |
| MongoDB Atlas | Free M0 | $0 |
| Qdrant Cloud | Free tier | $0 |
| Resend | Free (100/day) | $0 |
| Vercel (frontend) | Hobby | $0 |
| **Total** | | **~$37/month** |

> To reduce cost: share one disk between services (not possible — Render disks are per-service). Alternatively, use a smaller reranker model or disable reranking in `rag_chain.py`.

---

*Last updated: May 2026*
