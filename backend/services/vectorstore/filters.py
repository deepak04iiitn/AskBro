"""
Qdrant filter builders.

Every search MUST go through build_workspace_filter (or a filter that wraps it)
so vectors from other workspaces are never returned.
"""

from qdrant_client.models import FieldCondition, Filter, MatchAny, MatchValue


def build_workspace_filter(workspace_id: str) -> Filter:
    return Filter(must=[FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id))])


def build_document_filter(workspace_id: str, document_ids: list[str]) -> Filter:
    return Filter(must=[
        FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
        FieldCondition(key="documentId",  match=MatchAny(any=document_ids)),
    ])


def build_repo_filter(workspace_id: str, repo_id: str) -> Filter:
    return Filter(must=[
        FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
        FieldCondition(key="repoId",      match=MatchValue(value=repo_id)),
    ])


def build_repos_filter(workspace_id: str, repo_ids: list[str]) -> Filter:
    """Narrow to specific repo IDs (tagged @repo in chat)."""
    return Filter(must=[
        FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
        FieldCondition(key="repoId",      match=MatchAny(any=repo_ids)),
    ])


def build_source_filter(workspace_id: str, source: str) -> Filter:
    """Filter by knowledge source: 'documents' (no GitHub) or 'github' only."""
    if source == "github":
        return Filter(must=[
            FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id)),
            FieldCondition(key="source",      match=MatchValue(value="github")),
        ])
    if source == "documents":
        # Documents don't have a 'source' field — exclude anything marked 'github'
        return Filter(
            must=[FieldCondition(key="workspaceId", match=MatchValue(value=workspace_id))],
            must_not=[FieldCondition(key="source", match=MatchValue(value="github"))],
        )
    # "all" — no source restriction
    return build_workspace_filter(workspace_id)
