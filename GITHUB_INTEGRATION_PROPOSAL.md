# GitHub Integration — Product Proposal

**Author:** Deepak Kumar Yadav  
**Date:** June 2026  
**Status:** Draft

---

## The Idea

Users can connect their GitHub account to AskBro and chat with any of their repositories — public or private. This is a **separate experience from chatting with documents**. Instead of uploading files, the user connects a repo and AskBro gives them a dedicated space to explore it — code, docs, issues, PRs, and all.

---

## How a User Connects

### Step 1 — Go to Integrations

In the sidebar or settings, the user sees an **Integrations** section (same place as Notion). There's a GitHub card with a **"Connect GitHub"** button.

### Step 2 — Authorise on GitHub

Clicking the button opens GitHub's authorisation page (OAuth). The user approves AskBro's access — this covers both public and private repos. No token copying, no manual steps. One click, done.

For power users who prefer it, there's also a **"Use a Personal Access Token"** option where they paste their PAT directly.

### Step 3 — Connected

They're returned to AskBro and see:

```
✓ Connected as @deepakyadav
```

---

## How a User Imports a Repo

After connecting, the user sees a list of all their repos — personal and org, public and private. They pick one.

Before importing, they can optionally configure:
- **Which branch** to use (defaults to `main`)
- **What file types** to include (defaults to `.md`, `.py`, `.ts`, `.js`, `.yaml`, etc.)
- **Folders to skip** (defaults to `node_modules`, `dist`, `build`, etc.)
- **What to include beyond code** — a toggle for Issues and a toggle for Pull Requests (both off by default, user opts in)
- **Auto daily sync** — a toggle to keep the repo automatically up to date every day without any manual action

Then they hit **Import**. AskBro fetches the repo in the background and indexes it. A progress indicator shows on the repo card. When it's done:

```
✓ backend-api · Ready · 87 files · 34 issues · 12 PRs indexed
```

Multiple repos can be imported. Each shows as its own card.

---

## Chatting with a Repo — Separate from Documents

Repo chat lives in its own section in the sidebar, separate from the document chat. When the user opens a repo, they get a dedicated chat interface scoped entirely to that repository.

They can ask:

> "What does the PaymentService class do?"

> "Where is error handling implemented?"

> "Summarise the setup steps from the README."

> "Which files handle user authentication?"

> "Is there an open issue about the login bug?"

> "What did the last PR change in the auth flow?"

Answers cite the exact source — a file, an issue number, or a PR — and link directly back to GitHub. The context is always the repo they're in, so there's no confusion with documents from other sources.

---

## Issues and Pull Requests

When the user enables Issues and/or PRs during import, AskBro indexes them alongside the code. This means the chat understands not just *what* the code does, but *why* decisions were made, *what bugs exist*, and *what changed recently*.

**Issues** bring in the bug reports, feature requests, and discussions the team has had. Useful for questions like:

> "Has anyone reported a problem with file uploads?"

> "Is there an open request for dark mode?"

**Pull Requests** bring in the change history and review discussions. Useful for questions like:

> "Why was the old auth middleware replaced?"

> "What did the team decide about caching in the last few PRs?"

Both are shown clearly in citations so the user always knows if an answer came from code, an issue, or a PR.

---

## Syncing

### Manual Sync

At any time the user can hit **Sync** on the repo card. AskBro picks up only what changed since the last sync — it doesn't re-index everything. The card shows when it was last synced.

### Auto Daily Sync

If the user enabled the toggle during import, AskBro automatically syncs the repo once every day. No action needed. The repo card shows the last auto-sync time. The user can turn this off at any time from the repo settings.

---

## Public vs Private Repos

Both work identically from the user's perspective. Private repos are accessible because the user authorised AskBro via their GitHub account. The content is stored securely and scoped to their workspace — no one else can see it.

---

## Blame — What Code Change Caused This Issue?

This is one of the most powerful things AskBro can do with a connected repo. The user can ask something like:

> "What code change caused the payment timeout issue?"

> "Which commit broke the login flow?"

> "Who changed the auth middleware and when?"

AskBro answers with everything — not just a file name, but the full story of that change:

---

**The exact file and folder where the change happened**
```
src/services/auth/middleware.py
```

**Before the change** (what the code looked like before the commit)
```python
def verify_token(token: str):
    decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
    return decoded
```

**After the change** (what it became)
```python
def verify_token(token: str):
    decoded = jwt.decode(token, SECRET, algorithms=["HS256"], options={"verify_exp": False})
    return decoded
```

**Who made the change**
```
Deepak Kumar Yadav (@deepakyadav)
```

**When it was committed and pushed**
```
Committed:  Tuesday, 10 June 2026 at 11:34:07 AM IST
Pushed:     Tuesday, 10 June 2026 at 11:41:22 AM IST
```

**The commit message**
```
fix: skip token expiry check for internal service calls
```

**The PR it was part of** (if any)
```
PR #47 — "Fix internal service auth" · merged by @deepakyadav
```

---

AskBro connects the dots between what the issue describes and what changed in the commit history. If there's an open issue that matches the symptom, it links that too — so the user sees the full picture: the bug report, the code that caused it, and exactly who changed it and when.

This works because AskBro indexes not just the current state of the code, but the **commit history** — every commit message, every diff, the author, the timestamp, and the associated PR. When a user asks about a bug or regression, AskBro can search across all of that to surface the most likely culprit.

---

## Org Repositories

When a user connects GitHub, AskBro shows repos from all organisations they belong to — not just their personal repos. Org repos appear in the same list, clearly labelled with the org name (e.g. `my-org / backend-api`).

Access is scoped to whatever the user can actually see on GitHub. If they only have read access to certain repos in an org, those are the ones that show up. AskBro doesn't grant any extra permissions beyond what GitHub already allows.
