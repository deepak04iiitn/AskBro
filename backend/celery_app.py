"""
Celery application factory.

Broker & result backend: local MongoDB on localhost:27017.
Atlas SRV URIs (mongodb+srv://) are not supported by Celery's MongoDB transport,
so a separate local URI is used regardless of the main MONGODB_URI.
"""

import sys
from pathlib import Path

# Ensure the backend/ directory is on sys.path regardless of where Celery
# is invoked from, so all local modules (db, config, models, …) resolve.
_backend_dir = str(Path(__file__).resolve().parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from celery import Celery

from config.env import settings

celery_app = Celery(
    "askbro",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "workers.ingestion_worker",
        "workers.cleanup_worker",
        "workers.github_ingestion_worker",
        "workers.cleanup_github_worker",
    ],
)

from queues.ingestion_queue import configure_queues
configure_queues(celery_app)

celery_app.conf.update(
    # Serialisation
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],

    # Reliability
    task_acks_late=True,           # only ack after the task completes
    worker_prefetch_multiplier=1,  # fetch one task at a time per worker slot
    task_track_started=True,       # report STARTED state so we can detect stalls

    # Retry defaults (overridden per-task where needed)
    task_max_retries=5,

    # Timezone
    timezone="UTC",
    enable_utc=True,
)
