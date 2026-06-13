"""
Qdrant filter builders.

Every search MUST go through build_workspace_filter (or a filter that wraps it)
so vectors from other workspaces are never returned. This is the primary
workspace-isolation mechanism.
"""

from qdrant_client.models import FieldCondition, Filter, MatchAny, MatchValue


def build_workspace_filter(workspace_id: str) -> Filter:
    """Base filter — isolates all queries to a single workspace."""
    return Filter(
        must=[
            FieldCondition(
                key="workspaceId",
                match=MatchValue(value=workspace_id),
            )
        ]
    )


def build_repo_filter(workspace_id: str, repo_id: str) -> Filter:
    """Narrow search to a specific GitHub repository within a workspace."""
    return Filter(
        must=[
            FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
            FieldCondition(key="repoId", match=MatchValue(value=repo_id)),
        ]
    )


def build_document_filter(workspace_id: str, document_ids: list[str]) -> Filter:
    """Narrow a workspace search to specific document IDs (optional doc filter in chat)."""
    return Filter(
        must=[
            FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
            FieldCondition(key="documentId", match=MatchAny(any=document_ids)),
        ]
    )
