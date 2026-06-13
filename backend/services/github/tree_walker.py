"""Filter a GitHub repo tree to the files we want to index."""

import fnmatch
from pathlib import PurePosixPath

from models.github_repo import RepoFileFilters


def filter_tree(tree: list[dict], filters: RepoFileFilters) -> list[str]:
    """
    From the flat list returned by get_repo_tree(), return the file paths
    that pass extension, directory, and size checks.
    """
    paths: list[str] = []

    for item in tree:
        if item.get("type") != "blob":
            continue

        path = item.get("path", "")
        size_bytes = item.get("size", 0) or 0

        # Size check
        if size_bytes > filters.max_file_size_kb * 1024:
            continue

        # Directory exclusion — any path segment matches
        parts = PurePosixPath(path).parts
        if any(part in filters.exclude_dirs for part in parts):
            continue

        # Extension check
        ext = PurePosixPath(path).suffix.lower()
        # Handle compound extensions like .env.example
        name = PurePosixPath(path).name.lower()
        has_ext = ext in filters.include_extensions or any(
            name.endswith(e.lstrip(".")) or name == e.lstrip(".")
            for e in filters.include_extensions
            if e.startswith(".")
        )
        if not has_ext:
            continue

        # Include paths filter (glob)
        if filters.include_paths:
            if not any(fnmatch.fnmatch(path, pat) for pat in filters.include_paths):
                continue

        paths.append(path)

    return paths
