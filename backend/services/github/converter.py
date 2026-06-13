"""
Convert raw GitHub content (files, commits, issues, PRs) into
LangChain Document objects ready for chunking and embedding.
"""

from pathlib import PurePosixPath

from langchain_core.documents import Document

# Map file extension → markdown code fence language
_EXT_LANG: dict[str, str] = {
    ".py": "python", ".ts": "typescript", ".tsx": "typescript",
    ".js": "javascript", ".jsx": "javascript", ".go": "go",
    ".rs": "rust", ".java": "java", ".rb": "ruby", ".sh": "bash",
    ".yml": "yaml", ".yaml": "yaml", ".toml": "toml",
    ".json": "json", ".sql": "sql", ".graphql": "graphql",
    ".html": "html", ".css": "css", ".scss": "scss",
    ".md": "", ".txt": "", ".rst": "",
}


def _code_lang(path: str) -> str:
    ext = PurePosixPath(path).suffix.lower()
    return _EXT_LANG.get(ext, "")


def files_to_documents(
    files: list[tuple[str, str]],          # (path, content)
    owner: str,
    repo: str,
    branch: str,
    commit_sha: str,
    repo_id: str,
    workspace_id: str,
) -> list[Document]:
    docs: list[Document] = []
    full_name = f"{owner}/{repo}"

    for path, content in files:
        if not content.strip():
            continue

        lang = _code_lang(path)
        if lang:
            text = f"# {path}\n\n```{lang}\n{content}\n```"
        else:
            # Markdown / plain text — include as-is with a header
            text = f"# {path}\n\n{content}"

        docs.append(Document(
            page_content=text,
            metadata={
                "source": "github",
                "sourceType": "file",
                "repoFullName": full_name,
                "repoId": repo_id,
                "workspaceId": workspace_id,
                "filePath": path,
                "fileExt": PurePosixPath(path).suffix.lower(),
                "branch": branch,
                "commitSha": commit_sha,
                "githubUrl": f"https://github.com/{full_name}/blob/{branch}/{path}",
            },
        ))

    return docs


def commit_to_document(
    commit: dict,
    changed_files: list[dict],
    owner: str,
    repo: str,
    branch: str,
    repo_id: str,
    workspace_id: str,
) -> Document | None:
    """
    One Document per commit, containing message + per-file before/after diffs.
    """
    full_name = f"{owner}/{repo}"
    sha = commit["sha"]
    c = commit.get("commit", {})
    author = c.get("author", {})
    committer = c.get("committer", {})

    author_name = author.get("name", "Unknown")
    author_email = author.get("email", "")
    committed_at = committer.get("date", "")
    message = c.get("message", "").strip()

    # Find any PR reference in the message (e.g. "Merge pull request #47")
    import re
    pr_ref = ""
    m = re.search(r"#(\d+)", message)
    if m:
        pr_ref = f"#{m.group(1)}"

    # Build diff sections
    diff_sections: list[str] = []
    for f in changed_files:
        file_path = f.get("filename", "")
        status = f.get("status", "")       # added, removed, modified, renamed
        patch = f.get("patch", "")         # unified diff

        if not patch:
            diff_sections.append(f"File {status}: {file_path}")
            continue

        # Extract before/after from the unified diff patch
        before_lines, after_lines = _split_patch(patch)
        lang = _code_lang(file_path)

        section = f"**{status.upper()}**: `{file_path}`\n"
        if before_lines:
            section += f"\nBefore:\n```{lang}\n{before_lines}\n```"
        if after_lines:
            section += f"\nAfter:\n```{lang}\n{after_lines}\n```"
        diff_sections.append(section)

    if not diff_sections:
        return None

    text = (
        f"# Commit: {message}\n\n"
        f"**Author:** {author_name} ({author_email})\n"
        f"**Committed at:** {committed_at}\n"
        f"**Commit SHA:** {sha}\n"
        f"**Repo:** {full_name} · branch `{branch}`\n"
        + (f"**PR reference:** {pr_ref}\n" if pr_ref else "")
        + f"\n## Files changed ({len(changed_files)})\n\n"
        + "\n\n---\n\n".join(diff_sections)
    )

    return Document(
        page_content=text,
        metadata={
            "source": "github",
            "sourceType": "commit",
            "repoFullName": full_name,
            "repoId": repo_id,
            "workspaceId": workspace_id,
            "branch": branch,
            "commitSha": sha,
            "authorName": author_name,
            "authorEmail": author_email,
            "committedAt": committed_at,
            "commitMessage": message,
            "prReference": pr_ref,
            "githubUrl": f"https://github.com/{full_name}/commit/{sha}",
        },
    )


def issue_to_document(
    issue: dict,
    comments: list[dict],
    owner: str,
    repo: str,
    repo_id: str,
    workspace_id: str,
) -> Document:
    full_name = f"{owner}/{repo}"
    number = issue["number"]
    title = issue.get("title", "")
    body = issue.get("body") or ""
    state = issue.get("state", "open")
    labels = [l["name"] for l in issue.get("labels", [])]
    user = issue.get("user", {}).get("login", "unknown")
    created_at = issue.get("created_at", "")
    closed_at = issue.get("closed_at") or ""

    comment_texts = []
    for c in comments[:20]:                   # cap at 20 comments per issue
        c_user = c.get("user", {}).get("login", "unknown")
        c_body = (c.get("body") or "").strip()
        if c_body:
            comment_texts.append(f"**{c_user}:** {c_body}")

    text = (
        f"# Issue #{number}: {title}\n\n"
        f"**State:** {state}  \n"
        f"**Opened by:** {user} on {created_at}\n"
        + (f"**Closed at:** {closed_at}\n" if closed_at else "")
        + (f"**Labels:** {', '.join(labels)}\n" if labels else "")
        + f"\n## Description\n\n{body}\n"
        + ("\n## Discussion\n\n" + "\n\n".join(comment_texts) if comment_texts else "")
    )

    return Document(
        page_content=text,
        metadata={
            "source": "github",
            "sourceType": "issue",
            "repoFullName": full_name,
            "repoId": repo_id,
            "workspaceId": workspace_id,
            "issueNumber": number,
            "issueTitle": title,
            "issueState": state,
            "githubUrl": f"https://github.com/{full_name}/issues/{number}",
        },
    )


def pr_to_document(
    pr: dict,
    reviews: list[dict],
    owner: str,
    repo: str,
    repo_id: str,
    workspace_id: str,
) -> Document:
    full_name = f"{owner}/{repo}"
    number = pr["number"]
    title = pr.get("title", "")
    body = pr.get("body") or ""
    state = pr.get("state", "open")
    merged = pr.get("merged_at") is not None
    user = pr.get("user", {}).get("login", "unknown")
    created_at = pr.get("created_at", "")
    merged_at = pr.get("merged_at") or ""
    base_branch = pr.get("base", {}).get("ref", "")
    head_branch = pr.get("head", {}).get("ref", "")
    labels = [l["name"] for l in pr.get("labels", [])]

    review_texts = []
    for r in reviews[:10]:
        r_user = r.get("user", {}).get("login", "unknown")
        r_body = (r.get("body") or "").strip()
        r_state = r.get("state", "")
        if r_body:
            review_texts.append(f"**{r_user}** ({r_state}): {r_body}")

    text = (
        f"# Pull Request #{number}: {title}\n\n"
        f"**State:** {'merged' if merged else state}  \n"
        f"**Author:** {user} · opened {created_at}\n"
        + (f"**Merged at:** {merged_at}\n" if merged_at else "")
        + f"**Branch:** `{head_branch}` → `{base_branch}`\n"
        + (f"**Labels:** {', '.join(labels)}\n" if labels else "")
        + f"\n## Description\n\n{body}\n"
        + ("\n## Reviews\n\n" + "\n\n".join(review_texts) if review_texts else "")
    )

    return Document(
        page_content=text,
        metadata={
            "source": "github",
            "sourceType": "pull_request",
            "repoFullName": full_name,
            "repoId": repo_id,
            "workspaceId": workspace_id,
            "prNumber": number,
            "prTitle": title,
            "prState": "merged" if merged else state,
            "githubUrl": f"https://github.com/{full_name}/pull/{number}",
        },
    )


def _split_patch(patch: str) -> tuple[str, str]:
    """Extract removed lines (before) and added lines (after) from a unified diff patch."""
    before, after = [], []
    for line in patch.splitlines():
        if line.startswith("-") and not line.startswith("---"):
            before.append(line[1:])
        elif line.startswith("+") and not line.startswith("+++"):
            after.append(line[1:])
    return "\n".join(before[:60]), "\n".join(after[:60])   # cap to avoid huge chunks
