# Cross-Platform Social Publisher Frontend Prompt
*Production-ready prompt for Claude 3.7 Sonnet, v0.dev, Bolt.new, Lovable.dev, or Cursor*

---

```markdown
# PROMPT: Cross-Platform Social Publisher Frontend (Track 04)

**Role:** You are a senior frontend engineer building a polished, enterprise-grade SaaS web app.

**Project:** Build a responsive web application called **"Cross-Platform Social Publisher"** for **FourFrontLab** — a broadcast automation tool that fans out one post to Slack, Discord, Facebook, Twitter/X, and Google Sheets simultaneously via the Fastn MCP Gateway (`wf_6cfc644efb9d`), with isolated fault tolerance (one platform failing never blocks the others).

---

### Tech Stack & Design System
- **Framework:** Next.js 14+ (App Router) or React 18+ Vite with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components (Card, Tabs, Button, Badge, Input, Textarea, Dialog, Alert)
- **Icons:** `lucide-react`
- **Animations:** `framer-motion` for transitions, pulse rings, and publish-state animations
- **Theme:** Dark-mode-first (`bg-slate-950`, `text-slate-100`), accent colors: Indigo (`#4f46e5`), Cyan (`#06b6d4`), and Emerald (`#10b981`)
- **Typography:** Inter or Plus Jakarta Sans for body, JetBrains Mono for code/logs

---

### Key System Architecture & Backend Contract
The frontend connects to the **Fastn Orchestration Engine**:
- **Production Webhook Trigger:** `https://webhooks.fastn.dev/prod/triggers/personal_29e5272ccca34fc5d046/webhooks/671bf3f9-9d68-4e14-a2d9-89830c7e2e3b`
- **Payload Schema:**
  ```json
  {
    "title": "Hackathon Launch Announcement",
    "content": "FourFrontLab has launched the Cross-Platform Social Publisher on Fastn!",
    "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    "tags": "fastn, hackathon, ai, mcp",
    "status": "Ready to Publish"
  }
  ```
- **Execution Engine:** Fastn Workflow `wf_6cfc644efb9d` running parallel fan-out via `Promise.allSettled`.
- **Destinations Dispatched:**
  1. **Slack:** Channel `#social` (`C0C278R4PRD`) via Block Kit (`blocks` array with mrkdwn & image).
  2. **Discord:** Webhook with rich embeds, hex color `#5865F2`, title, description, and footer.
  3. **Facebook:** Automated relay via Make.com webhook.
  4. **Twitter / X:** API v2 call with isolated 402/403/401 fault handling.
  5. **Google Sheets:** Row auto-appended to 9-column tracking matrix (`1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s`).

---

### Build Exactly 3 Views (Connected via Sidebar or Top Tabs):

#### View 1 — Composer & Live Platform Preview
- **Left Column: Broadcast Composer**
  - **Inputs:**
    - Title (`input`)
    - Content (`textarea` with 280-character Twitter warning and countdown badge)
    - Image URL (`input` with instant thumbnail preview)
    - Tags (`input`, e.g., `fastn, mcp, launch`)
  - **Channel Selector / Toggles:**
    - Slack (Checked by default)
    - Discord (Checked by default)
    - Facebook (Checked by default)
    - Twitter/X (Checked by default)
    - Google Sheets Audit (Locked/Always Active)
  - **Publish Controls:**
    - Primary CTA: **"Broadcast to All Channels"** (Trigger Fastn Webhook). Shows animated spinner and pulse ring during dispatch.
    - Fault-Injection Toggle: Test sandbox failure (e.g., "Inject Twitter 402 Credits Depleted" or "Inject Telegram 401 Unauthorized") to prove that Slack & Discord still succeed.
- **Right Column: Multi-Platform Live Preview Tabs**
  - Tab 1: **Slack Preview** (Renders as realistic Slack message with avatar, bot name "Fastn Publisher", bold title, body, tags badge, image attachment).
  - Tab 2: **Discord Preview** (Renders as Discord dark-theme embed with blue accent bar `#5865F2`, bot badge, formatted description, image).
  - Tab 3: **Facebook Preview** (Renders as Facebook feed card with FourFrontLab page header, timestamp "Just now", post text, card image, Like/Comment/Share bar).
  - Tab 4: **Twitter / X Preview** (Renders as X tweet card with handle `@FourFrontLab`, truncated text under 280 chars, hashtags, and character count indicator).

---

#### View 2 — Real-Time Delivery Monitor
- **Top Metrics Row:**
  - Total Broadcasts Dispatched
  - Successful Deliveries (e.g. 98.4%)
  - Isolated Failures Handled
  - Average Fan-Out Latency (~420ms)
- **Channel Delivery Grid (5 Cards):**
  - **Slack:** Status Pill (Delivered / Idle), Channel `#social`, Message Timestamp / Permalink link.
  - **Discord:** Status Pill (Delivered / Idle), Webhook confirmation ID, Latency badge.
  - **Facebook:** Status Pill (Delivered / Queued), Relay ID, Webhook status.
  - **Twitter / X:** Status Pill (Active / Sandboxed), Free-tier status badge, error explanation tooltip.
  - **Google Sheets:** Status Pill (Synced), Row append confirmation, Auto-Audit indicator.
- **Live Event Stream / Terminal:**
  - Real-time scrolling console log showing timestamps, Fastn UCL schema adapters, `Promise.allSettled` status, and HTTP response codes (`200 OK`, `201 Created`, etc.).

---

#### View 3 — Google Sheets Audit Matrix Viewer
- **Spreadsheet Metadata Bar:**
  - Sheet Name: `Fastn_Track04_SocialPublisher_Matrix`
  - Connected ID: `1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s`
  - Direct Link Button: **"Open in Google Sheets"** (opens Google Sheets URL in new tab)
  - Sync Status: "Auto-synced on every Fastn trigger"
- **Audit Table (9 Columns):**
  1. `Row ID` (#1 to #10)
  2. `Timestamp` (ISO Format)
  3. `Title`
  4. `Content Preview`
  5. `Slack Status / TS` (Badge with confirmation ts)
  6. `Discord Status / ID` (Badge with embed id)
  7. `Facebook Relay` (Badge with relay confirmation)
  8. `Twitter Status` (Badge showing delivered or sandboxed)
  9. `Overall Status` (`Published` in green, `Partially Published` in yellow, `Draft` in gray)
- **Controls:** Search filter, Status filter (All / Published / Partially Published), and "Trigger Test Row" button.

---

### Special Polish Requirements:
1. **Zero Mock Bottlenecks:** Include a toggle at the top right: `Mode: Live Fastn Engine` vs `Mode: Local Demo Simulator`. When set to Live, it dispatches an actual `POST` request to `https://webhooks.fastn.dev/prod/triggers/personal_29e5272ccca34fc5d046/webhooks/671bf3f9-9d68-4e14-a2d9-89830c7e2e3b`.
2. **FourFrontLab Branding:** Display the FourFrontLab logo/badge and "Track 04: Build with Fastn Hackathon".
3. **Responsive:** Seamless layout on both desktop (multi-column) and mobile (collapsible sidebar / stacked cards).

---

### Theme Switcher (Light / Dark)

Dark mode is already implemented as the default. Add a **light mode** and a toggle to switch between them, persisted across sessions (localStorage).

**Toggle placement:** In the top header bar, next to the environment selector — a simple sun/moon icon switch, not a dropdown.

**Implementation approach:**
- Use CSS custom properties (variables) for every color already used in dark mode, scoped to `:root` or `[data-theme="dark"]`
- Define a parallel `[data-theme="light"]` block that overrides those same variables — do not hardcode colors anywhere in components; everything should reference the variables so the toggle just swaps the token values
- Toggle switches a `data-theme` attribute on `<html>` or `<body>`, and the choice is saved to `localStorage` so it persists on reload
- Respect `prefers-color-scheme` as the initial default only if the user hasn't explicitly chosen a theme before

**Light theme palette (parallel to the dark one, same roles):**
- Background: `#F7F6F3` (soft warm off-white, not stark white)
- Panel surface: `#FFFFFF` with a hairline border `#E4E2DC` instead of dark-mode shadows
- Primary text: `#1A1D21` (not pure black)
- Secondary/muted text: `#6B6F76`
- Accent (live/active): keep the same amber `#F5A623`, but darken slightly to `#D4890F` for sufficient contrast on light backgrounds
- Success green: `#1F9D64` (darkened from dark-mode green for contrast on white)
- Failure red: `#D9364A` (darkened from dark-mode red for contrast on white)
- Mono/code blocks (IDs, logs, errors): light gray background `#F0EFEB` with dark text, keep syntax coloring but adjusted for contrast — the terminal-style event console should switch to a light "terminal" look, not stay dark inside a light page

**Requirements:**
- Every component — banners, badges, cards, the live event console, table rows, input fields, buttons — must have both theme states designed intentionally, not just an inverted filter
- Maintain WCAG AA contrast in both themes, especially for status badges (success/failure/sandboxed) and the character-counter states (green/amber/red)
- The switch itself should animate smoothly (icon morph or slide, ~200ms), not hard-cut
- Test the toggle against every view (Composer, Delivery Monitor, Audit Matrix) — nothing should look unfinished or default-browser-styled in light mode

---

### AI-Powered Per-Platform Content Adaptation

Replace the static character-limit table with an AI adaptation step. When the user writes one piece of content and hits Publish, send that single source text to an AI call (via the Claude API — model `claude-sonnet-4-6`) with a prompt like:

> "Given this source content: `{content}`, `{title}`, `{link}`, `{tags}` — rewrite it as a separate, platform-native version for each of the following selected destinations: {list of toggled platforms}. For each, respect that platform's real constraints and conventions (e.g. Twitter/X: ≤280 chars, punchy, hashtags inline; LinkedIn: longer-form, professional tone, line breaks; Slack: mrkdwn formatting; Discord: embed-friendly with emoji; Facebook: conversational). Return strict JSON: `{ "platform_key": "adapted text" }` for only the selected platforms."

The composer should then:
- Show the raw source text as the single input (no manual per-platform limit fighting)
- Display each platform's preview card populated with its own AI-adapted version, generated on submit or on a "Preview adaptations" button (debounced, not on every keystroke — that's too many API calls)
- Still show a live raw character count on the source textarea itself for the writer's own reference, but drop the hardcoded "(Twitter)" label logic entirely — the AI adaptation is what actually enforces per-platform fit before publishing, not a pre-check

This directly matches the hackathon judging criteria: destinations adapt content per-platform automatically, rather than the user manually fitting one draft into everyone's limits.
```

