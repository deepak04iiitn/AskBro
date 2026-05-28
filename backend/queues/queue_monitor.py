"""
Flower dashboard configuration.

Flower is a real-time web UI for monitoring Celery workers and tasks.
It is included in the project dependencies (flower>=2.0.0).

Run locally:
    uv run celery -A celery_app flower --port=5555

Then open: http://localhost:5555

Dashboard shows:
  - Active / reserved / scheduled tasks per worker
  - Task history: state, runtime, retries, arguments
  - Worker status and concurrency
  - Queue lengths

Production tip:
  Add basic auth with --basic_auth=user:password to protect the dashboard
  when exposing it publicly, or restrict access via a reverse proxy.
"""
