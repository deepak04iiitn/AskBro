# Deploy AskBro Backend on Railway

> Railway Hobby plan ($5/month credit) gives **8 GB RAM** — enough to run BGE-large locally with no HF API needed.

---

## Before you start

| What you need | Where to get it |
|---------------|-----------------|
| MongoDB Atlas URI | https://cloud.mongodb.com → Connect → Drivers |
| Qdrant Cloud URL + API key | https://cloud.qdrant.io → your cluster → API Keys |
| LLM API key (Groq recommended) | https://console.groq.com |
| Resend API key | https://resend.com → API Keys |
| Two 64-char secrets | `python -c "import secrets; print(secrets.token_hex(32))"` (run twice) |

---

## Step 1 — Push your code to GitHub

```bash
cd "C:\PERSONAL PROJECTS\AskBro"
git add .
git commit -m "ready for railway deployment"
git push origin main
```

---

## Step 2 — Create a Railway project

1. Go to https://railway.app → **New Project**
2. Click **Deploy from GitHub repo**
3. Select your `askbro` repository
4. Railway auto-detects Python and starts building

---

## Step 3 — Set the Root Directory

By default Railway deploys from the repo root. Change it to `backend`:

1. Click on the service → **Settings** tab
2. **Source** section → **Root Directory** → type `backend`
3. Click **Save** → Railway rebuilds

---

## Step 4 — Set the Start Command

1. Still in **Settings** → **Deploy** section
2. **Start Command** → `bash start.sh`
3. Click **Save**

> `start.sh` runs Celery in the background then FastAPI in the foreground — both on the same instance, no extra service needed.

---

## Step 5 — Add Environment Variables

Go to your service → **Variables** tab → click **RAW Editor** and paste the entire block below. Replace every placeholder:

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

SECRET_KEY=your-64-char-hex
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
ADMIN_JWT_SECRET=your-another-64-char-hex

RESEND_API_KEY=re_your_resend_api_key
```

Click **Update Variables** → Railway redeploys automatically.

> **No `HF_TOKEN` needed on Railway** — 8 GB RAM is more than enough to load BGE-large locally.

---

## Step 6 — Get your public URL

1. Service → **Settings** → **Networking** → **Generate Domain**
2. Railway gives you a URL like `https://askbro-api-production.up.railway.app`
3. Copy it — you'll need it for the frontend

---

## Step 7 — Verify

```bash
curl https://your-app.up.railway.app/ping
# {"pong":true,"uptime_seconds":42}

curl https://your-app.up.railway.app/ready
# {"status":"ready","checks":{"mongodb":"ok","qdrant":"ok"}}
```

---

## Step 8 — Connect the Frontend

In **Vercel** → your project → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app/api/v1
```

Redeploy the frontend after saving.

Also update `CORS_ORIGINS` in your Railway variables to match the exact Vercel URL:

```
CORS_ORIGINS=["https://your-app.vercel.app"]
```

---

## Step 9 — Keep-alive

Railway Hobby services don't sleep, but a ping monitor is still good practice.

Set up a free monitor at https://uptimerobot.com:
- URL: `https://your-app.up.railway.app/ping`
- Interval: every **5 minutes**

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails with `No module named X` | Make sure `requirements.txt` is committed in `backend/` |
| `ValidationError` on startup | A required env var is missing — check `SECRET_KEY`, `MONGODB_URI`, `ADMIN_JWT_SECRET` |
| App starts but `/ready` shows `mongodb: error` | Check `MONGODB_URI` — URL-encode special chars in the password (`@` → `%40`) |
| BGE model download on every deploy | Set `HF_HOME` to a Railway Volume mount path (optional, saves time on restarts) |
| OOM crash | Unlikely on 8 GB — but if it happens, remove `BGE_RERANKER_MODEL` from env to disable the reranker |
| CORS error in browser | Add exact Vercel URL to `CORS_ORIGINS` — no trailing slash |

---

## Cost

| Item | Cost |
|------|------|
| Railway Hobby — FastAPI + Celery (8 GB RAM) | ~$5–10 / month (usage-based) |
| MongoDB Atlas M0 | Free |
| Qdrant Cloud free tier | Free |
| Resend free tier | Free |
| Vercel hobby | Free |
| **Total** | **~$5–10 / month** |

> Railway bills by actual usage (CPU + RAM × time). A lightly loaded app typically stays within the $5 free credit.
