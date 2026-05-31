# Notion Integration — Design & Implementation Plan

## Overview

Users can connect their Notion workspace to AskBro and import any Notion page directly as a document. The page content is fetched via the Notion API, converted to Markdown, and fed through the existing document ingestion pipeline — same embeddings, same RAG, same citations.

---

## How Notion API Access Works

Notion does **not** give public API access to pages even if they are shared publicly via a link. Every API call requires an **Integration Token**. There are two types:

| Type | How it works | Best for |
|------|-------------|---------|
| **Internal Integration** (API Key) | User creates a token at notion.so/my-integrations, manually shares each page with it | Personal use, small teams |
| **OAuth** | User authorises through Notion's OAuth flow, all pages automatically accessible | Larger products, SaaS |

**We implement Internal Integration only.** OAuth requires registering AskBro as a public Notion app, which adds unnecessary complexity. The Internal Integration approach works for all use cases — public pages, private pages, databases — as long as the page is shared with the integration.

---

## User-Facing Connection Flow

### Step 1 — Sidebar entry point

Add an **Integrations** button to the sidebar (between Documents and Upload). Clicking it opens a modal.

### Step 2 — Integrations modal

Shows two cards:

```
┌────────────────────────────────┐  ┌────────────────────────────────┐
│  [Notion icon]                 │  │  [GitHub icon]                 │
│  Notion                        │  │  GitHub                        │
│  Import pages from your        │  │  Sync repositories as          │
│  Notion workspace              │  │  searchable documents          │
│  [ Connect ]                   │  │  [ Coming soon ]               │
└────────────────────────────────┘  └────────────────────────────────┘
```

### Step 3 — Notion connect panel (slides in or modal)

Shows a two-step form:

**Step A — Create the integration in Notion (instructions)**

```
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it anything (e.g. "AskBro")
4. Select your workspace
5. Under Capabilities → check "Read content" only
6. Click Save → copy the Internal Integration Secret (starts with secret_...)
```

**Step B — Paste the token**

```
Notion Integration Token
┌──────────────────────────────────────────────────────┐
│  secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
└──────────────────────────────────────────────────────┘
[ Connect Notion ]
```

**What we validate on "Connect":**
- Call `GET https://api.notion.com/v1/users/me` with the token
- If it returns 200 → valid token → save it → show "Connected" state
- If it returns 401 → show "Invalid token. Check you copied it correctly."

**After connection — Connected state:**

```
✓ Connected to Notion
  Workspace: Deepak's Workspace
  [ Disconnect ]

Note: To import a page, you must first share it with your AskBro integration.
How to share: Open the page in Notion → click ⋯ → Add connections → select "AskBro"
```

---

## How to Share a Page with the Integration

This is the most common point of confusion. The user MUST share each page with the integration before it can be fetched.

**Steps (shown in the UI as a collapsible guide):**

1. Open the Notion page you want to import
2. Click the `•••` (three dots) menu in the top-right
3. Click **Add connections** (or **Connect to** on older Notion)
4. Search for and select your integration name (e.g. "AskBro")
5. The page is now accessible via API

Private sub-pages inherit the parent's connection, so sharing a parent page makes all its children accessible too.

---

## Upload Zone — Notion Tab

Add a third tab to the UploadZone alongside "Upload files" and "Paste text":

```
[ Upload files ]  [ Paste text ]  [ Notion ]
```

**Notion tab UI:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Notion Page URL                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  https://www.notion.so/My-Page-abc123def456                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  File name  (we auto-fill from the Notion page title)               │
│  ┌─────────────────────────────────────┐  .md                       │
│  │  My-Page                            │                            │
│  └─────────────────────────────────────┘                            │
│                                                                      │
│  [ Import from Notion → ]                                           │
│                                                                      │
│  ⓘ Make sure you've shared this page with your AskBro integration  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

If Notion is not connected: show a prompt instead:
```
Connect your Notion workspace first to import pages.
[ Connect Notion → ]
```

---

## Notion URL → Page ID Extraction

Notion URLs can look like any of these:

```
https://www.notion.so/My-Page-Title-abc123def456abc1
https://www.notion.so/workspace-name/abc123def456abc1
https://notion.so/abc123def456abc1
https://www.notion.so/abc123def456abc1?pvs=4
```

The page ID is always the last 32-character hex string (optionally with hyphens).

**Extraction logic:**

```python
import re

def extract_notion_page_id(url: str) -> str | None:
    # Remove query params and fragments
    clean = url.split("?")[0].split("#")[0]
    # Find the last 32-hex-char segment (with or without hyphens)
    match = re.search(r"([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$", clean, re.IGNORECASE)
    if match:
        return match.group(1).replace("-", "")
    return None
```

---

## Content Fetching — Backend Logic

### Notion API calls needed

1. **Verify page exists + get title:**
   ```
   GET https://api.notion.com/v1/pages/{page_id}
   Headers:
     Authorization: Bearer {token}
     Notion-Version: 2022-06-28
   ```
   Response includes `properties.title` (for page title).

2. **Get page content blocks:**
   ```
   GET https://api.notion.com/v1/blocks/{page_id}/children?page_size=100
   ```
   Returns an array of blocks. If `has_more: true`, paginate using `start_cursor`.

3. **Get nested blocks (recursively):**
   For blocks with `has_children: true` (toggles, bullet points with sub-items, etc.):
   ```
   GET https://api.notion.com/v1/blocks/{block_id}/children
   ```

### Block types to convert to Markdown

| Notion block type | Markdown output |
|-------------------|-----------------|
| `paragraph` | Plain text + `\n\n` |
| `heading_1` | `# text` |
| `heading_2` | `## text` |
| `heading_3` | `### text` |
| `bulleted_list_item` | `- text` |
| `numbered_list_item` | `1. text` |
| `to_do` | `- [ ] text` or `- [x] text` |
| `toggle` | `**text**` (heading) + recurse children |
| `code` | ` ```language\ncode\n``` ` |
| `quote` | `> text` |
| `callout` | `> **emoji** text` |
| `divider` | `---` |
| `table` + `table_row` | Markdown table |
| `image` | `![caption](url)` |
| `child_page` | `[Page title](notion url)` (link, not recursed) |
| `unsupported` | *(skip)* |

### Text extraction from rich_text

Notion text is stored as `rich_text` array (to handle bold, italic, links, etc.):

```python
def extract_text(rich_text_arr: list) -> str:
    result = ""
    for chunk in rich_text_arr:
        text = chunk.get("plain_text", "")
        annotations = chunk.get("annotations", {})
        if annotations.get("bold"):
            text = f"**{text}**"
        if annotations.get("italic"):
            text = f"*{text}*"
        if annotations.get("code"):
            text = f"`{text}`"
        href = chunk.get("href")
        if href:
            text = f"[{text}]({href})"
        result += text
    return result
```

---

## Data Storage

### New model: `NotionIntegration`

```python
class NotionIntegration(Document):
    workspace_id: PydanticObjectId
    notion_token: str          # store encrypted
    bot_id: str                # from /users/me response
    workspace_name: str        # display name
    connected_at: datetime

    class Settings:
        name = "notion_integrations"
        indexes = [IndexModel("workspace_id", unique=True)]
```

One integration per AskBro workspace (shared among all members).

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/integrations/notion/connect` | User | Validate token + save |
| `GET` | `/api/v1/integrations/notion/status` | User | Check if connected + workspace name |
| `DELETE` | `/api/v1/integrations/notion/disconnect` | Owner | Remove token |
| `POST` | `/api/v1/integrations/notion/import` | User | Fetch page → return markdown content + title |

### `POST /integrations/notion/import` — request body

```json
{
  "page_url": "https://www.notion.so/My-Page-abc123",
  "file_name": "my-page"
}
```

### Response

```json
{
  "file_name": "my-page.md",
  "content": "# My Page\n\nThis is the page content...",
  "page_title": "My Page",
  "char_count": 1420
}
```

The frontend then creates a `File` blob from `content`, sets name to `file_name`, and passes it to the existing `startUpload()` function — **no changes to the ingestion pipeline needed**.

---

## Frontend Components

### New files to create

```
frontend/src/
├── components/
│   ├── integrations/
│   │   ├── IntegrationsModal.jsx      # modal with Notion + GitHub cards
│   │   ├── NotionConnectPanel.jsx     # step-by-step connect flow
│   │   └── NotionImportForm.jsx       # URL + filename form in UploadZone
│   └── layout/
│       └── Sidebar.jsx                # add Integrations button
│
└── lib/
    └── integrationsApi.js             # API calls for integrations
```

### Sidebar addition

Add between the chats section and documents section:

```jsx
<Link href="#" onClick={() => setShowIntegrations(true)}>
  <Puzzle icon />  Integrations
</Link>
```

---

## Security Considerations

1. **Token storage**: The Notion token gives read access to shared pages. Store it encrypted in MongoDB (use bcrypt or AES-256). Never expose it in API responses.

2. **Scope creep**: The token only allows access to pages the user explicitly shared with the integration. Notion enforces this server-side — we cannot access un-shared pages even with a valid token.

3. **Owner-only disconnect**: Only the workspace owner can disconnect the integration (same `require_owner` dependency used elsewhere).

4. **Rate limiting**: Notion API allows 3 requests/second. For large pages with many nested blocks, add small delays between recursive calls.

---

## Dependency to add

```
# backend/requirements.txt — add:
notion-client>=2.2.1
```

Or use plain `httpx` (already installed) to call the Notion REST API directly — no SDK needed.

---

## Implementation Order

1. Backend: `NotionIntegration` model + register in `db/base.py`
2. Backend: Notion API client service (`services/notion/client.py`)
3. Backend: Controller + routes (`/integrations/notion/*`)
4. Frontend: `integrationsApi.js`
5. Frontend: `IntegrationsModal.jsx` + `NotionConnectPanel.jsx`
6. Frontend: Sidebar Integrations button
7. Frontend: `NotionImportForm.jsx` + third tab in UploadZone

---

*Approved? Say "implement" and I'll build it.*
