"""
Celery application factory.

Broker & result backend: MongoDB (same cluster as the app — no extra service).
Celery's MongoDB transport creates two collections automatically:
  celery_broker.messages   — task queue
  celery_results.celery_taskmeta — task results
"""

from celery import Celery

from config.env import settings


def _mongo_transport_url(uri: str, db_name: str) -> str:
    """
    Convert a standard MongoDB URI to the format Celery's MongoDB transport expects.

    Standard:  mongodb+srv://user:pass@host/?appName=X
    Celery:    mongodb://user:pass@host/db_name   (no +srv, no query params)

    For Atlas SRV URIs we keep the host and credentials but switch to mongodb://
    and append the target database name.
    """
    # Strip scheme variants
    for scheme in ("mongodb+srv://", "mongodb://"):
        if uri.startswith(scheme):
            rest = uri[len(scheme):]
            break
    else:
        rest = uri

    # Drop query string (?appName=... etc.)
    rest = rest.split("?")[0].rstrip("/")

    return f"mongodb://{rest}/{db_name}"


_broker_url = _mongo_transport_url(settings.MONGODB_URI, "celery_broker")
_backend_url = _mongo_transport_url(settings.MONGODB_URI, "celery_results")

celery_app = Celery(
    "askbro",
    broker=_broker_url,
    backend=_backend_url,
    include=[
        "workers.ingestion_worker",
        "workers.cleanup_worker",
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
