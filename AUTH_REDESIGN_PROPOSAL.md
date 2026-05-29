# AskBro Auth Pages — Redesign Proposal v2

> **Scope:** Sign-in (`/login`) and Create Workspace (`/create`)
> **Approach:** Clean slate. No reference to the existing implementation.
> **Constraints:** Light mode · No gradients · No decorative animation · Modern, beautiful

---

## 1. Design Philosophy

AskBro is a serious internal tool — a document intelligence platform for teams. The auth pages should feel like the front door to professional software, not a generic AI startup landing page.

**Three principles driving every decision:**

**1. Show, don't tell.** The login page demonstrates what the product does through a real, static product excerpt — not feature bullet points. The user understands the value proposition before they even fill in a field.

**2. Editorial over decorative.** Every element earns its place. No floating cards, no background textures, no ornamental shapes. The layout itself communicates hierarchy.

**3. Space is a design element.** Generous padding, careful vertical rhythm, and breathing room make the page feel premium. This is what separates Linear from a template.

**Visual reference:** Vercel dashboard, Linear auth, Stripe Atlas onboarding — clean, spacious, purposeful.

---

## 2. Color System

A warm neutral system. The warmth (slight cream tint) makes the pages feel softer and more human than cold blue-grays.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#F7F5F2` | Page background (warm off-white) |
| `--color-surface` | `#FFFFFF` | Form panel, cards |
| `--color-surface-2` | `#F4F3F0` | Input backgrounds, table rows |
| `--color-surface-3` | `#EEECEA` | Showcase panel, hover states |
| `--color-border` | `#E3E1DC` | All borders |
| `--color-border-strong` | `#D1CEC9` | Dividers that need more presence |
| `--color-fg` | `#111110` | Primary text |
| `--color-fg-2` | `#3D3C3A` | Secondary text |
| `--color-fg-3` | `#7A7874` | Labels, muted text |
| `--color-fg-4` | `#AEABA6` | Placeholders, disabled |
| `--color-accent` | `#4361EE` | CTA, focus rings, links |
| `--color-accent-subtle` | `#EEF1FD` | Question bubble bg, accent tints |
| `--color-accent-fg` | `#FFFFFF` | Text on accent backgrounds |
| `--color-danger` | `#DC2626` | Errors |
| `--color-danger-subtle` | `#FEF2F2` | Error alert background |
| `--color-success` | `#16A34A` | Strong password |
| `--color-warning` | `#D97706` | Fair password |

**Removed entirely:** Every existing gradient utility (`gradient-brand`), every branded shadow (`shadow-blue`), the solid blue `#4361EE` panel background.

---

## 3. Typography Scale

| Role | Size | Weight | Color | Tracking |
|------|------|--------|-------|---------|
| Page headline | `36px` | `700` | `fg` | `-0.03em` |
| Form heading | `24px` | `700` | `fg` | `-0.02em` |
| Step label | `11px` | `600` | `fg-3` | `0.08em uppercase` |
| Body / prose | `15px` | `400` | `fg-3` | normal |
| Form label | `12px` | `500` | `fg-2` | normal |
| Input | `14px` | `400` | `fg` | normal |
| Button | `14px` | `600` | `accent-fg` | `-0.01em` |
| Caption | `12px` | `400` | `fg-4` | normal |
| Citation | `11px` | `500` | `fg-3` | normal (monospace) |

---

## 4. Core Components

### Input

```
┌─────────────────────────────────────────────────┐
│  Placeholder text                               │
└─────────────────────────────────────────────────┘
  bg: surface-2 (#F4F3F0)
  border: 1.5px solid border (#E3E1DC)
  height: 44px  |  radius: 8px  |  font: 14px

  Focus:
    border-color: accent
    box-shadow: 0 0 0 3px rgba(67,97,238,0.12)

  Error:
    border-color: danger
    box-shadow: 0 0 0 3px rgba(220,38,38,0.10)
```

### Primary Button

```
┌─────────────────────────────────────────────────┐
│                  Sign in                        │
└─────────────────────────────────────────────────┘
  bg: #4361EE  |  color: white  |  flat (no gradient, no shadow)
  height: 44px  |  radius: 8px  |  font: 14px 600

  Hover: bg: #3451D6
  Active: scale: 0.99
  Disabled: opacity: 0.4
```

### Ghost Button

```
  bg: transparent
  border: 1.5px solid border
  color: fg-3  |  height: 44px  |  radius: 8px
  Hover: bg: surface-2
```

### Error Alert

```
  bg: danger-subtle  |  border-left: 3px solid danger
  color: danger  |  radius: 6px  |  padding: 12px 16px
  font: 13px
```

---

## 5. Login Page (`/login`)

### Concept

The page is split asymmetrically. The left side (wider) is the **product stage** — it shows a real exchange between a user and AskBro, demonstrating the core value proposition: cited answers from documents. The right side is the **form stage** — focused, minimal, no distractions.

The separation between the two halves is not a color contrast but a single hairline border. Both halves share the same warm background tone but the showcase panel is `#F4F3F0` (slightly more saturated) and the form panel is `#FFFFFF`, creating a quiet, natural-feeling division.

### Layout

```
┌──────────────────────────────┬───────────────────────────┐
│                              │                           │
│  SHOWCASE  (58%)             │  FORM  (42%)              │
│  bg: #F4F3F0                 │  bg: #FFFFFF              │
│                              │                           │
└──────────────────────────────┴───────────────────────────┘
                                ↑ 1px solid #E3E1DC
                         full viewport height
```

### Showcase Panel — Anatomy

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [Logo]   AskBro                  (top-left)     │
│            40px padding                          │
│                                                  │
│                                                  │
│                 [CENTRED VERTICALLY]             │
│                                                  │
│  DOCUMENT INTELLIGENCE              (eyebrow)    │
│  11px  ·  fg-4  ·  uppercase  ·  letter-spaced  │
│                                                  │
│  Ask once.                                       │
│  Know forever.                      (headline)   │
│  36px  ·  700  ·  fg  ·  -0.03em tracking       │
│  line-height: 1.1                                │
│                                                  │
│  Upload your team's documents.                   │
│  Ask in plain English.              (subline)    │
│  Every answer cites its source.                  │
│  15px  ·  fg-3  ·  400  ·  max-w: 360px         │
│                                                  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   (divider)    │
│  1px solid border  ·  max-w: 400px               │
│                                                  │
│  ┌───────────────────────────────────────────┐   │
│  │  PRODUCT EXCERPT CARD                     │   │
│  │  bg: white  ·  border: 1px solid border   │   │
│  │  radius: 12px  ·  no shadow               │   │
│  │                                           │   │
│  │  QUESTION                                 │   │
│  │  11px  ·  fg-4  ·  uppercase              │   │
│  │                                           │   │
│  │  When does the API rate limit reset?      │   │
│  │  14px  ·  fg  ·  padding: 10px 14px       │   │
│  │  bg: accent-subtle  ·  radius: 8px        │   │
│  │  inline-block  ·  max-w: fit              │   │
│  │                                           │   │
│  │  ANSWER                                   │   │
│  │  11px  ·  fg-4  ·  uppercase              │   │
│  │                                           │   │
│  │  Rate limits reset every 15 minutes per   │   │
│  │  user token. Burst limits apply during    │   │
│  │  peak hours. See §3.4 for exceptions.     │   │
│  │  14px  ·  fg-2  ·  line-height: 1.6       │   │
│  │                                           │   │
│  │  ┌───────────────────────────────────┐    │   │
│  │  │  ▤  API-Reference.pdf  ·  §3.4    │    │   │
│  │  └───────────────────────────────────┘    │   │
│  │  bg: surface-2  ·  border-top: border     │   │
│  │  padding: 10px 14px  ·  radius: 0 0 8px 8px│  │
│  │  font: 12px mono  ·  fg-3                 │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Product excerpt card detail:**
- The "QUESTION" and "ANSWER" eyebrows are small uppercase labels — they communicate the structure like a document annotation, not a chat UI chrome.
- The question text sits in a very light blue pill (`accent-subtle`). Not a chat bubble — just highlighted text.
- The answer is plain prose — no bubble, no avatar.
- The citation sits at the bottom of the card as a bar, visually attached to the card. The `▤` icon is a simple document icon in SVG.
- **No animation on this card.** Static. Complete.

### Form Panel — Anatomy

Centered vertically within the panel. `max-width: 340px`, centered horizontally.

```
┌──────────────────────────────────────────┐
│                                          │
│  Welcome back                            │  ← 24px 700, fg
│  Sign in to your workspace.              │  ← 13px, fg-4, mt: 4px
│                                          │
│  ── (spacer 32px) ──                    │
│                                          │
│  Workspace code                          │  ← 12px 500, fg-2
│  ┌──────────────────────────────────┐    │
│  │  WSP-XXXX                        │    │  ← fg-4 placeholder
│  └──────────────────────────────────┘    │
│                                          │
│  Email                                   │
│  ┌──────────────────────────────────┐    │
│  │  you@company.com                 │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Password                                │
│  ┌──────────────────────────────────┐    │
│  │  ••••••••                  Show  │    │  ← "Show" in fg-4
│  └──────────────────────────────────┘    │
│                                          │
│  [error alert — conditionally rendered] │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │           Sign in                │    │  ← flat accent btn
│  └──────────────────────────────────┘    │
│                                          │
│  ─────────────── or ───────────────      │  ← 1px rule + label
│                                          │
│  Don't have a workspace?                 │  ← 13px, fg-4
│  Create one →                            │  ← accent color link
│                                          │
└──────────────────────────────────────────┘
```

**Mobile:** The showcase panel is hidden. The form panel becomes full-width on the warm `#F7F5F2` bg. The AskBro wordmark appears above the form heading.

---

## 6. Create Workspace Page (`/create`)

### Concept

This breaks entirely from the "modal card with a stepper" pattern. Instead, it's a **full-page, two-column layout** at every step. The left column is the **context column** — it tells you what this step is for and why it matters. The right column is the **action column** — the form fields for this step. This is inspired by how Stripe Atlas and Brex handle onboarding: spacious, editorial, never cramped.

The page bg is `#F7F5F2`. No card. The content sits directly on the page.

### Page Frame (persistent across steps)

```
┌─────────────────────────────────────────────────────────────┐
│  [AskBro logo]          (top-left, 20px padding)            │
│  ──────────────────────────────────────────────────────────  │  (1px border)
│                                                             │
│  [STEP CONTENT — changes per step]                          │
│                                                             │
│  ──────────────────────────────────────────────────────────  │  (1px border)
│  Already have a workspace?  Sign in →     (bottom bar)      │
└─────────────────────────────────────────────────────────────┘
```

The top border under the logo and the bottom footer bar create a contained, intentional frame.

### Step Indicator

Sits below the top nav, centered, above the step content.

```
  Step 1 of 3   ──────────────────────────────
                Workspace      Members      Confirm
```

- `Step 1 of 3`: `12px`, `fg-4`, top
- Three labels: `12px`, current step in `fg` `600`, others in `fg-4`
- Progress line: `1px solid border`, fill segment in `accent` using width, **no gradient**
- No circles, no dots — purely typographic

### Step Content Layout (two columns, inside a centered max-w: 960px container)

```
┌────────────────────────────┬────────────────────────────┐
│  CONTEXT COLUMN (42%)      │  FORM COLUMN (58%)         │
│  No bg, sits on page       │  No bg, sits on page       │
│  pr: 64px                  │  pl: 64px                  │
│  border-right: 1px border  │                            │
└────────────────────────────┴────────────────────────────┘
```

### Step 1 — Workspace Details

**Context column:**
```
│  01                             ← 64px, 700, fg-4 (large quiet number)
│
│  Set up your                    ← 28px, 700, fg, -0.02em
│  workspace.
│
│  Your workspace is a private    ← 14px, fg-3, line-height 1.7
│  environment for your team.
│  Documents uploaded here are
│  only accessible to members
│  you invite.
│
│  The workspace password is
│  shared with all members —
│  choose something memorable.
```

**Form column:**
```
│  Workspace name
│  ┌──────────────────────────────────────┐
│  │  Acme Corp                           │
│  └──────────────────────────────────────┘
│
│  Your email  (you'll be the owner)
│  ┌──────────────────────────────────────┐
│  │  you@company.com                     │
│  └──────────────────────────────────────┘
│
│  Workspace password
│  ┌──────────────────────────────────────┐
│  │  ••••••••                      Show  │
│  └──────────────────────────────────────┘
│  [strength bar — 4 flat segments]
│  Weak · Fair · Good · Strong  (label updates)
│
│  Confirm password
│  ┌──────────────────────────────────────┐
│  │  ••••••••                            │
│  └──────────────────────────────────────┘
│
│  [error alert — conditional]
│
│  ┌──────────────────────────────────────┐
│  │            Continue                  │  ← flat accent
│  └──────────────────────────────────────┘
```

**Password strength bar:**
- 4 plain `div` segments, `h: 3px`, `radius: full`, `bg: border` default
- Active segments colored: danger / warning / accent / success
- Width transition only: `transition: background-color 150ms ease` — no spring, no width animation

### Step 2 — Invite Members

**Context column:**
```
│  02                             ← large quiet number
│
│  Invite your                    ← 28px, 700, fg
│  team.
│
│  Add member emails now, or      ← 14px, fg-3
│  skip and do it later from
│  the members panel.
│
│  Members can log in using
│  the workspace code and the
│  shared password.
│
│  (Up to 5 members at setup.)
```

**Form column:**
```
│  Member emails
│  ┌──────────────────────────────────┐  ×
│  │  teammate@company.com            │
│  └──────────────────────────────────┘
│  ┌──────────────────────────────────┐  ×
│  │                                  │
│  └──────────────────────────────────┘
│
│  + Add another                 ← 13px, accent, no icon
│
│
│  ┌───────────┐   ┌──────────────────────────┐
│  │   Skip    │   │         Continue         │
│  └───────────┘   └──────────────────────────┘
│  (ghost)          (flat accent, flex-1)
```

`×` remove: `fg-4`, hover `danger`. Plain character, no box.

### Step 3 — Confirm & Create

**Context column:**
```
│  03                             ← large quiet number
│
│  Everything                     ← 28px, 700, fg
│  looks right?
│
│  After you create the           ← 14px, fg-3
│  workspace you'll receive a
│  unique workspace code to
│  share with your team.
│
│  You can change the password
│  and manage members from
│  the dashboard at any time.
```

**Form column (summary + CTA):**
```
│  ┌──────────────────────────────────────────────┐
│  │  Workspace    │  Acme Corp                   │
│  ├───────────────┼──────────────────────────────┤
│  │  Owner        │  you@company.com             │
│  ├───────────────┼──────────────────────────────┤
│  │  Members      │  2 invited                   │
│  └──────────────────────────────────────────────┘
│   bg: surface-2  ·  1px border rows
│   label: fg-4 12px  ·  value: fg 14px 600
│   radius: 10px
│
│  [error alert — conditional]
│
│  ┌────────────────────────────────────────────┐
│  │          Create workspace                  │  ← flat accent
│  └────────────────────────────────────────────┘
│
│  ← Back                        ← 13px, fg-4, plain text
```

---

## 7. Interaction Patterns

### Kept (functional only)

| Interaction | Note |
|-------------|------|
| Step slide transition (x-axis, 220ms) | On step change only |
| Error alert enter (opacity + y: -4px → 0, 150ms) | Subtle, no scale pop |
| Input focus ring | Color only, no size change |
| Submit loading state (spinner + disabled) | Plain SVG animation |
| Password show/hide | No animation |

### Removed

| Element | Why |
|---------|-----|
| `animate-float` keyframe | Decorative |
| Framer Motion `ITEM_ANIM` / `PAGE_ANIM` stagger | Decorative startup feel |
| `gradient-brand` | Gradient |
| `shadow-blue` | Gradient glow |
| `FloatingChatCard` with float animation | Decorative |
| Dot-texture backgrounds | Gradient-based |
| Decorative circles on panels | Decorative |
| Emoji in button copy | Visual noise |
| Gradient step progress bar | Gradient |

---

## 8. Files

| File | Action |
|------|--------|
| `globals.css` | Replace all tokens with new warm neutral system; remove `gradient-brand`, `shadow-blue`, `animate-float`; update `.field-input` |
| `animations.js` | Strip to: `FADE_IN` (opacity only), `SLIDE_X` (step transition) |
| `LoginForm.jsx` | Full rewrite — new asymmetric layout, product excerpt card |
| `CreateWorkspaceForm.jsx` | Full rewrite — two-column per-step layout, no card |

---

*Proposal v2. Awaiting approval.*
