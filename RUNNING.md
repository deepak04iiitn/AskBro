# Running AskBro Locally

---

## Prerequisites (install once)

| Tool | Min version | Download |
|---|---|---|
| Python | 3.11 | https://python.org/downloads |
| uv | latest | `pip install uv` |
| Node.js | 18 | https://nodejs.org |
| MongoDB Community | 7 | https://www.mongodb.com/try/download/community |
| Qdrant | latest | https://github.com/qdrant/qdrant/releases |

> **Using cloud services?**
> MongoDB Atlas and/or Qdrant Cloud work fine — skip those local installs
> and just put the connection strings in `backend/.env`.

---

## One-time setup

### Step 1 — Set MongoDB to auto-start on Windows boot (run once as Admin)

```powershell
Set-Service -Name MongoDB -StartupType Automatic
Start-Service -Name MongoDB
```

After this you never need to think about MongoDB again — it starts with Windows.

### Step 2 — Configure the backend environment

```powershell
cd "c:\PERSONAL PROJECTS\AskBro\backend"
Copy-Item .env.example .env
```

Open `backend/.env` and fill in the required values:

```env
MONGODB_URI=mongodb://localhost:27017/askbro   # or your Atlas URI
MONGODB_DB_NAME=askbro
GRIDFS_BUCKET_NAME=uploads

QDRANT_URL=http://localhost:6333               # or your Qdrant Cloud URL
QDRANT_API_KEY=                                # leave blank for local Qdrant

LLM_BASE_URL=https://api.groq.com/openai/v1   # or Together / local vLLM
LLM_API_KEY=your-llm-api-key
LLM_MODEL_NAME=Qwen/Qwen3-32B

# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=paste-64-char-hex-here
```

### Step 3 — Install backend dependencies

```powershell
cd "c:\PERSONAL PROJECTS\AskBro\backend"
uv sync
```

Takes a few minutes the first time (PyTorch + BGE models are large).

### Step 4 — Install frontend dependencies

```powershell
cd "c:\PERSONAL PROJECTS\AskBro\frontend"
npm install
```

---

## Every day — start the project (2 terminals)

### Terminal 1 — Everything backend

```powershell
cd "c:\PERSONAL PROJECTS\AskBro\backend"
.\start.ps1
```

One script handles all of this automatically:
- Starts the **MongoDB** Windows service if it is not already running
- Starts **Qdrant** if `qdrant.exe` is present in `backend/` (or skips if using Qdrant Cloud)
- Opens a **new window** for the Celery worker
- Starts **FastAPI** in the current terminal on `http://localhost:8000`

> **Qdrant tip:** Download `qdrant.exe` from https://github.com/qdrant/qdrant/releases
> and place it inside the `backend/` folder. The script will find and start it automatically.

### Terminal 2 — Frontend

```powershell
cd "c:\PERSONAL PROJECTS\AskBro\frontend"
.\start.ps1
```

Starts Next.js on `http://localhost:3000`.

---

## Verify everything is healthy

```powershell
# Should return {"status":"ok"}
Invoke-RestMethod http://localhost:8000/health

# Should return {"status":"ok","mongodb":"connected","qdrant":"connected"}
Invoke-RestMethod http://localhost:8000/ready
```

---

## First-time flow

1. Open `http://localhost:3000/create`
2. Enter workspace name, your email, and a password → **Create workspace**
3. Note the workspace code shown (e.g. `WSP-A3F9`)
4. Go to `/login` → enter workspace code, email, password → **Sign in**
5. Click **Upload Document** → drag in a PDF, DOCX, MD, or TXT file
6. Wait for status to turn **Done** (Celery worker ingests and indexes it)
7. Ask a question on the dashboard

---

## Stopping

```
Ctrl+C  in the FastAPI terminal  — stops FastAPI
Ctrl+C  in the Celery terminal   — stops Celery
Ctrl+C  in the frontend terminal — stops Next.js
```

MongoDB keeps running as a Windows service (which is fine — it uses no resources when idle).
To stop it manually: `net stop MongoDB`

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `.\start.ps1` says "cannot be loaded because running scripts is disabled" | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once |
| `/ready` returns 503 | MongoDB or Qdrant not running — check the script output |
| Celery worker crashes immediately | Check `MONGODB_URI` in `.env` — must start with `mongodb://` or `mongodb+srv://` |
| BGE model download is slow | Normal on first run — ~1.3 GB download, cached afterwards |
| Upload stuck at "Processing" forever | Celery window closed — rerun `.\start.ps1` |
| 401 errors in browser | JWT expired — log out and log back in |
