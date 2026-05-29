# AskBro — Sidebar & Chat Interface Redesign Proposal

> **Scope:** Sidebar, Chat window, Message bubbles, Chat input, Citation cards, Empty state, Source panel
> **Constraints:** Light mode · No gradients · No decorative animation · Consistent with the auth warm-neutral system

---

## 1. Design Philosophy

The same principles that guide the auth pages apply here — but the chat interface has an extra constraint: it must be **frictionless during use**. The user is in the middle of a task. Every element that competes for attention is a distraction.

**Three principles:**

**1. Disappear when not needed.** The sidebar, the top bar, the input area — these are infrastructure. When the user is reading an answer, they shouldn't notice them. Good UI at this level is invisible.

**2. The answer is the product.** The AI response — its text, its citation chips — is what the user came for. The visual hierarchy drives the eye directly there. Everything else is subordinate.

**3. Consistent material.** Same warm neutrals, same accent, same border language as the auth pages. The app should feel like one thing, not a patchwork.

---

## 2. Color System

Inherits the warm neutral system from auth pages. No new tokens needed.

| Element | Value |
|---------|-------|
| Sidebar background | `#F7F5F2` |
| Sidebar border-right | `#E3E1DC` |
| Chat area background | `#FFFFFF` |
| Top bar / input area | `#FFFFFF` |
| Borders everywhere | `#E3E1DC` |
| Hover state (sidebar rows, buttons) | `#EEECEA` |
| User message bubble bg | `#F0EFEC` |
| Citation chip bg | `#F4F3F0` |
| Citation chip active bg | `#EEF1FD` |
| Send button (active) | `#4361EE` flat |
| Send button (inactive) | `#E3E1DC` |

**Removed:** `gradient-brand` from the send button, avatar, and anywhere else it appears.

---

## 3. Sidebar

### Current problems
- White background is cold, inconsistent with the warm auth system
- Workspace pill uses a blue-tint badge — feels like a UI widget, not a brand element
- Colored document type badges (red PDF, blue DOC) are noisy
- "New chat" is a hollow bordered button — indistinct
- User avatar uses `gradient-brand`

### New structure

```
w-[240px]  |  bg: #F7F5F2  |  border-right: 1px #E3E1DC  |  flex-col h-full
│
├── TOP SECTION  (px-4 pt-6 pb-4, border-bottom: 1px #E3E1DC)
│   │
│   ├── Workspace row
│   │     ·  dot (w-2 h-2, bg: #4361EE, rounded-full)
│   │     ·  workspace code  (13px, 600, fg)
│   │     ·  "workspace" label  (11px, fg-4)
│   │
│   └── New chat button
│         bg: #4361EE (flat)  |  color: white
│         h-9  |  radius: 8px  |  13px 500  |  w-full  |  mt-3
│         icon: pencil/plus  (left-aligned with text)
│         hover: #3451D6
│
├── DOCUMENTS SECTION  (flex-1 overflow-y-auto py-4)
│   │
│   ├── Section label  "Documents"
│   │     10px  |  600  |  tracking-widest  |  uppercase  |  fg-4  |  px-4 mb-2
│   │
│   ├── Document row  (per document)
│   │     px-3 py-2 mx-1 rounded-lg
│   │     hover: bg #EEECEA  |  transition 120ms
│   │     │
│   │     ├── File type label  (left)
│   │     │     9px  |  600  |  fg-4  |  uppercase  (just "PDF", "MD" etc)
│   │     │     No colored background — plain muted text
│   │     │
│   │     ├── Filename  (flex-1, 12px, fg-2, truncate)
│   │     │
│   │     └── Status dot  (right, w-1.5 h-1.5)
│   │           completed → #16A34A
│   │           processing → #D97706 + pulse
│   │           failed → #DC2626
│   │           pending → #D1D5DB
│   │
│   └── Upload link  (mt-4, px-4)
│         13px  |  fg-4  |  hover: fg-2
│         Arrow icon inline
│
└── USER FOOTER  (border-top: 1px #E3E1DC, shrink-0)
    │
    ├── Dropdown menu  (absolute, bottom-full, white card, border #E3E1DC, shadow)
    │     · Manage members
    │     · Sign out  (danger color on hover)
    │
    └── User row button  (px-4 py-3.5, hover: #EEECEA)
          │
          ├── Avatar  (w-8 h-8, rounded-full)
          │     bg: #E3E1DC  |  initial letter  |  13px 600 fg-2
          │     NO gradient
          │
          ├── Email  (12px, fg-2, truncate)  +  Role  (10px, fg-4)
          │
          └── Chevron  (fg-4, rotates 180° when open)
```

### Document type treatment

Replace colored badges entirely. Just show the extension as plain `fg-4` text before the filename:

```
pdf  deployment-guide.pdf    ●
md   onboarding.md           ●
```

Clean, scannable, no rainbow of badge colors.

---

## 4. Chat Window — Top Bar

### Decision: Remove it

The current top bar shows "New conversation" / "Chat" as a title, a "docs indexed" count, and an Upload link. None of this requires a dedicated 56px header bar.

- The "docs indexed" count moves to the sidebar (as a small count next to the Documents label)
- The "Upload" link already exists in the sidebar
- The title ("Chat" / "New conversation") provides no value to the user mid-session

**Result:** The chat area becomes full-height with no top chrome. More space for messages.

---

## 5. Empty State

### Current problems
- Logo `animate-float` (decorative, we're removing this)
- Suggestion cards use emoji + colored card backgrounds
- Spring hover lift animation on cards

### New empty state

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [vertically centred]                     │
│                                                             │
│              What would you like to know?                   │
│              (28px 700, fg, -0.02em tracking)               │
│                                                             │
│         Your workspace has 4 documents indexed.             │
│         (14px, fg-4, mt-2)                                  │
│                                                             │
│    OR (if no docs):                                         │
│         Upload documents to start asking questions.         │
│         [Upload your first document →]  (accent link)       │
│                                                             │
│  ─────────────────────────────────────────────────────      │
│  (1px divider, max-w same as message column, mt-10 mb-8)   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  SUMMARISE           │  │  FIND SPECIFIC INFO  │        │
│  │  11px uppercase fg-4 │  │                      │        │
│  │                      │  │                      │        │
│  │  Summarize the key   │  │  What are the main   │        │
│  │  points from the     │  │  risks in the SLA?   │        │
│  │  latest report.      │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  COMPARE             │  │  ACTION ITEMS        │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Suggestion cards:**
```
  bg: white
  border: 1px solid #E3E1DC
  radius: 10px
  padding: 18px
  width: equal in 2-col grid, max-w [760px] same as messages

  Category label:  11px  |  600  |  uppercase  |  tracking-wide  |  fg-4
  Example text:    13px  |  fg-3  |  line-height 1.6  |  mt-2

  Hover: bg #F7F5F2  |  border-color: #4361EE  (just color, no lift)
  No emoji  |  No colored backgrounds
```

---

## 6. Messages

### User message

```
  Layout: right-aligned (items-end)
  Label:  "You"  |  11px  |  fg-4  |  mb-1

  Bubble:
    bg: #F0EFEC  (warm, reads as "user", not AI)
    border: none  (no border needed, bg is enough)
    border-radius: 14px 14px 4px 14px
    padding: 12px 16px
    font: 15px  |  fg  |  line-height 1.65
    max-width: 75%
```

### AI message

```
  Layout: left-aligned (items-start)
  Label:  "AskBro"  |  11px  |  fg-4  |  mb-1

  Avatar row:
    Small circle  w-6 h-6
    bg: #EEF1FD  (accent-subtle)
    Contains a small chat/sparkle SVG icon in accent color
    NO logo PNG (avoid the white-box issue, consistent with UI tokens)

  Text:
    No background
    15px  |  fg-2  |  line-height 1.8
    Streaming cursor: thin 2px inline bar, accent, blink keyframe

  Typing indicator (before content arrives):
    3 dots, fg-4, 400ms stagger  (keep — functional, not decorative)
```

### Message spacing

- Between messages: `space-y-8` (generous, keeps the conversation readable)
- Message column: `max-w-[720px] mx-auto px-6`
- Scroll area: `py-10` top/bottom padding

---

## 7. Citation Chips

After an AI message, citation chips appear as a row below the text.

```
  Chip:
    bg: #F4F3F0
    border: 1px solid #E3E1DC
    border-radius: 8px
    padding: 6px 12px
    inline-flex items-center gap-2

  File type:  9px  |  600  |  uppercase  |  fg-4  (plain text, no colored badge)
  Filename:   12px  |  fg-2  |  truncate  |  max-w 120px
  Page:       11px  |  fg-4  |  "p.8"

  Active (source panel open):
    bg: #EEF1FD
    border-color: #4361EE

  Hover: bg #EEECEA  |  border-color: #4361EE
  No scale animation — just color transition 120ms
```

---

## 8. Chat Input

```
  Container:
    border-top: 1px solid #E3E1DC
    bg: white
    px-6 py-4

  Inner wrapper  (max-w-[720px] mx-auto):
    border: 1.5px solid #E3E1DC
    border-radius: 12px
    bg: white
    px-4 py-3
    flex items-end gap-3

    Focus:
      border-color: #4361EE
      box-shadow: 0 0 0 3px rgba(67,97,238,0.10)

  Textarea:
    Resizes from 1 row to max 5 rows
    bg: transparent
    15px  |  fg  |  placeholder: fg-4
    No outline

  Send button:
    w-9 h-9  (slightly smaller than current)
    border-radius: 8px
    bg: #4361EE (FLAT, no gradient, no shadow)
    hover: #3451D6
    disabled (no text / streaming): bg #E3E1DC, cursor not-allowed
    Arrow icon: →

  Hint text below (on focus):
    "↵ to send  ·  ⇧↵ for new line"
    11px  |  fg-4  |  fade in on focus
```

---

## 9. Source Panel (Citation Detail)

Slides in from the right when a citation chip is clicked.

```
  width: 320px
  bg: white
  border-left: 1px solid #E3E1DC
  flex-col

  Header  (px-5 py-4, border-bottom):
    Filename:  13px 600 fg
    Page:      11px fg-4 mt-0.5
    Close ×:  w-7 h-7, rounded-lg, bg hover #F4F3F0, fg-4

  Body  (flex-1, overflow-y-auto, px-5 py-5):
    Label: "Relevant excerpt"  |  10px  |  600  |  uppercase  |  tracking-wide  |  fg-4
    Excerpt box:
      bg: #FEFCE8  (warm yellow — keeps existing intent but fits palette)
      border-left: 3px solid #D97706  (amber accent)
      border-radius: 6px
      padding: 14px
      13px  |  fg-2  |  line-height 1.7
      NO scale animation on entry — just fade in

  Footer  (px-5 py-3, border-top):
    "Source document"  |  11px  |  fg-4
    "View all docs →"  |  12px  |  accent  |  hover underline
```

---

## 10. Overall Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard (h-screen, overflow-hidden, bg: #F7F5F2)            │
│                                                                │
│  ┌──────────┬────────────────────────────────────┬──────────┐ │
│  │          │                                    │  SOURCE  │ │
│  │ SIDEBAR  │    CHAT AREA  (bg: white)           │  PANEL   │ │
│  │ 240px    │    flex-col  h-full                 │  320px   │ │
│  │ #F7F5F2  │                                    │ (slide   │ │
│  │          │    Messages  (flex-1 scroll)        │  in/out) │ │
│  │          │    ChatInput (shrink-0, border-top) │          │ │
│  └──────────┴────────────────────────────────────┴──────────┘ │
└────────────────────────────────────────────────────────────────┘
```

No top bar. The sidebar's right border and the source panel's left border are the only structural lines.

---

## 11. Interactions

| Interaction | Treatment |
|-------------|-----------|
| New message appears | Fade-in + subtle y slide (12px → 0, 300ms) — keep, it's functional |
| Streaming cursor | Inline blinking `\|` bar — keep |
| Typing indicator | 3-dot bounce — keep (tells user something is happening) |
| Citation chip click → source panel | Slide in from right, 220ms ease-out — keep |
| Source panel close | Slide out, 180ms — keep |
| Suggestion card hover | Border accent color + bg tint only — no lift, no scale |
| Send button press | `scale(0.97)` — keep, feels responsive |
| Sidebar row hover | `bg: #EEECEA` — CSS transition, no Framer Motion needed |

**Removed:**
- `animate-float` on the empty-state logo
- Spring hover lift (`y: -4`) on suggestion cards
- `ITEM_ANIM` / `PAGE_ANIM` stagger on document list
- `gradient-brand` on send button and avatar
- Colored badge backgrounds on file type labels
- The entire top bar (56px reclaimed for content)

---

## 12. Files to Change

| File | Change |
|------|--------|
| `Sidebar.jsx` | Full rewrite — warm bg, clean workspace row, no colored badges, flat avatar |
| `ChatWindow.jsx` | Remove top bar, new empty state, no `PAGE_ANIM`/`ITEM_ANIM` |
| `MessageBubble.jsx` | Warm user bubble, replace PNG avatar with SVG circle icon |
| `ChatInput.jsx` | Flat send button (no gradient), warm borders |
| `CitationCard.jsx` | Warm neutral chip, no colored badge, hover color only |
| `dashboard/page.jsx` | Minor — bg update to `#F7F5F2` |

---

*Proposal ready. Awaiting approval before implementation.*
