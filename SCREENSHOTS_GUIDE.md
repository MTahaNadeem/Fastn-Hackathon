# Screenshots Guide for Hackathon Submission
*(The submission form requires at least 3 screenshots showing the workflow and the result)*

### Screenshot 1: Fastn Orchestration Architecture & Source Sheet
- **What to show:** The top architecture cards (Source Trigger -> Format Adapters -> Parallel Fan-Out -> Audit Log) and the Google Sheets table showing rows in `Draft`, `Ready to Publish`, and `Published`.
- **Filename:** `screenshot_1_architecture_and_source.png`

### Screenshot 2: Multi-Platform Fan-Out Previews
- **What to show:** The three destination preview cards (Slack Block Kit, Telegram Markdown, and Discord Embed) all displaying green **"DELIVERED"** badges and formatted messages.
- **Filename:** `screenshot_2_multiplatform_delivered.png`

### Screenshot 3: Resilience & Fault Isolation (Key Differentiator)
- **What to show:** Execution with Telegram failure injected:
  - Telegram shows red **"FAILED (ISOLATED)"** badge with `401 Unauthorized`.
  - Slack & Discord show green **"DELIVERED"** badges.
  - The Google Sheet table shows Status: **`Partially Published`** and `Telegram_Log: FAILED: Telegram Bot API 401: Unauthorized`.
- **Filename:** `screenshot_3_resilience_fault_isolation.png`
