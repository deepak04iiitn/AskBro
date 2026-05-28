"""
Queue definitions for AskBro's Celery workers.

Queues:
  ingestion  — full document ingestion pipeline (load → chunk → embed → upsert)
  cleanup    — async deletion of Qdrant vectors and GridFS files on doc removal

To route a task to a specific queue, use the `queue` argument:
    some_task.apply_async(args=[...], queue="ingestion")

Or declare it in the task decorator:
    @celery_app.task(queue="ingestion")
"""

from celery import Celery
from kombu import Exchange, Queue

# Exchange shared by both queues
_default_exchange = Exchange("askbro", type="direct")

QUEUES = [
    Queue("ingestion", _default_exchange, routing_key="ingestion"),
    Queue("cleanup",   _default_exchange, routing_key="cleanup"),
]


def configure_queues(app: Celery) -> None:
    """Apply queue configuration to the Celery app instance."""
    app.conf.task_queues = QUEUES
    app.conf.task_default_queue = "ingestion"
    app.conf.task_default_exchange = "askbro"
    app.conf.task_default_routing_key = "ingestion"
    app.conf.task_routes = {
        "workers.ingestion_worker.ingest_document": {"queue": "ingestion"},
        "workers.cleanup_worker.cleanup_document":  {"queue": "cleanup"},
    }
