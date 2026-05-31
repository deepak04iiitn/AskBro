#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# AskBro unified start script — runs Celery + FastAPI on a single Render instance
#
# Render monitors the foreground process (uvicorn) for health.
# Celery is launched as a background process (&) on the same container.
#
# Render start command:
#   bash start.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e  # exit immediately if any command fails

echo "==> Starting Celery worker in background..."
python -m celery -A celery_app worker \
  --loglevel=info \
  -Q ingestion,cleanup \
  --pool=solo \
  --concurrency=1 &

CELERY_PID=$!
echo "    Celery PID: $CELERY_PID"

# Give Celery a moment to connect before FastAPI starts taking requests
sleep 2

echo "==> Starting FastAPI (uvicorn) on port ${PORT:-8000}..."
exec uvicorn main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 1
