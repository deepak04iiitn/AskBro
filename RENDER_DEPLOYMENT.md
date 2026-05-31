# Deploy AskBro Backend on Render

> FastAPI + Celery run together on **one service** — no separate worker needed.

---

## Before you start — get these values ready

| What you need | Where to get it |
|---------------|-----------------|
| MongoDB Atlas connection string | https://cloud.mongodb.com → Connect → Drivers |
| Qdrant Cloud URL + API key | https://cloud.qdrant.io → your cluster → API Keys |
| LLM API key (Groq recommended) | https://console.groq.com |
| Resend API key | https://resend.com → API Keys |
| Two 64-char secrets | Run: `python -c "import secrets; print(secrets.token_hex(32))"` twice |

---

## Step 1 — Push the repo to GitHub

```bash
cd "C:\PERSONAL PROJECTS\AskBro"
git add .
git commit -m "ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/askbro.git
git push -u origin main
```

---

## Step 2 — Create the Web Service on Render

1. Go to https://render.com → **New +** → **Web Service**
2. Connect GitHub → select your `askbro` repo
3. Fill in **exactly** these settings:

| Field | Value |
|-------|-------|
| **Name** | `askbro-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `bash start.sh` |
| **Plan** | Standard (4 GB RAM) — needed for the embedding model |

> The `start.sh` script starts Celery in the background then FastAPI in the foreground — both run on the same instance.

---

## Step 3 — Add Environment Variables

In the service → **Environment** tab → **Add Environment Variable** (or click **Bulk add** and paste the block below).

Replace every placeholder with your real values:

```
APP_ENV=production
CORS_ORIGINS=["https://your-frontend.vercel.app"]

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=askbro
GRIDFS_BUCKET_NAME=uploads

QDRANT_URL=https://YOUR-CLUSTER-ID.REGION.aws.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION_NAME=knowledge_base

BGE_MODEL_NAME=BAAI/bge-large-en-v1.5
BGE_RERANKER_MODEL=BAAI/bge-reranker-large
EMBEDDING_BATCH_SIZE=32
EMBEDDING_DEVICE=cpu

LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL_NAME=llama-3.3-70b-versatile
LLM_API_KEY=your-groq-api-key
LLM_TIMEOUT_SECONDS=60
LLM_MAX_TOKENS=2048
LLM_TEMPERATURE=0.1

SECRET_KEY=generate-64-char-hex
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

CELERY_BROKER_URL=mongodb+srv://user:password@cluster.mongodb.net/celery_broker?retryWrites=true&w=majority
CELERY_RESULT_BACKEND=mongodb+srv://user:password@cluster.mongodb.net/celery_results?retryWrites=true&w=majority

RATE_LIMIT_AUTH=30/minute
RATE_LIMIT_ADMIN=15/minute
RATE_LIMIT_API=120/minute
MAX_UPLOAD_SIZE_MB=50

ADMIN_EMAIL=dky422003@gmail.com
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_JWT_SECRET=generate-another-64-char-hex

RESEND_API_KEY=re_your_resend_api_key
```

Click **Save** — Render triggers a deploy automatically.

---

## Step 4 — Verify

Once the deploy shows **Live** (green), hit:

```bash
curl https://askbro-api.onrender.com/ping
# {"pong":true,"uptime_seconds":12}

curl https://askbro-api.onrender.com/ready
# {"status":"ready","checks":{"mongodb":"ok","qdrant":"ok"}}
```

If `ready` shows `error` for mongodb or qdrant, double-check those env vars.

---

## Step 5 — Connect the Frontend

In your Vercel project → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://askbro-api.onrender.com/api/v1
```

Redeploy the frontend after saving.

---

## Step 6 — Keep-alive (prevents cold starts)

Set up a free monitor at https://uptimerobot.com:
- URL: `https://askbro-api.onrender.com/ping`
- Interval: every **5 minutes**

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Exited with status 1` before port binds | Check logs for the actual error — almost always a missing env var |
| `ValidationError` on startup | A required env var is missing — `SECRET_KEY`, `MONGODB_URI`, `ADMIN_JWT_SECRET`, etc. |
| `ServerSelectionTimeoutError` | MongoDB URI wrong or Atlas Network Access not set to `0.0.0.0/0` |
| Files upload but never finish processing | Celery failed to start — look for its error before uvicorn in the logs |
| `OOM Killed` | Upgrade to Standard plan (4 GB RAM) — the BGE model needs it |
| CORS error in browser | Add your exact Vercel URL to `CORS_ORIGINS` env var and redeploy |

---

## Cost

| Item | Cost |
|------|------|
| Render Web Service (Standard, 4 GB) | $25 / month |
| MongoDB Atlas M0 | Free |
| Qdrant Cloud free tier | Free |
| Resend free tier | Free |
| Vercel hobby | Free |
| **Total** | **$25 / month** |
