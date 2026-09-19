# 2-Minute Demo Video Script & Recording Guide
**Track 04: Cross-Platform Social Publisher**  
*Target Duration: Exactly 1:50 - 2:00*  
*Screen Setup: Browser open to http://localhost:3456*

---

### [0:00 - 0:25] The Hook & Problem Statement
- **Screen:** Show Fastn Social Publisher Dashboard (`http://localhost:3456`).
- **Voiceover:**
  > "Hi everyone! Marketing and devrel teams waste 30 to 45 minutes manually adapting a single post across Slack, Discord, and Telegram. Each platform has different formatting, image handling, and character limits. Even worse, when traditional automations hit a rate limit or bad token on one platform, the entire publish crashes mid-way with zero audit trail."

---

### [0:25 - 1:10] The Solution & Live Fan-Out (Happy Path)
- **Action:**
  1. Click **"Add New Post Row"** in the Google Sheets table.
  2. Enter:
     - Title: `🚀 Build with Fastn Launch!`
     - Content: `Publishing simultaneously across all community channels with Fastn Unified Context Layer.`
     - Image URL: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600`
     - Tags: `fastn, ai, launch`
     - Status: `Ready to Publish`
  3. Click **"Insert Row"**.
  4. Ensure Fault Test dropdown is set to **"🟢 Normal (All Channels Pass)"**.
  5. Click **"Publish"** on row 101.
- **Voiceover:**
  > "With Fastn, we solve this with a single click. We add a post to our Google Sheet with title, body, and an image URL. When we trigger Fastn, watch the parallel fan-out: Fastn immediately adapts the content to Slack Block Kit, Telegram Markdown, and Discord Embeds—and dispatches all three in parallel within milliseconds."
- **Screen:** Point cursor to the three preview cards showing the green "Delivered" badges and formatted cards.

---

### [1:10 - 1:35] Two-Way Audit Logging
- **Action:** Point cursor to the updated Google Sheets table row.
- **Voiceover:**
  > "Fastn closes the audit loop: our Google Sheet row status updates from 'Ready to Publish' to 'Published', recording the exact Slack message timestamp and Telegram message ID. If a user clicks publish again, Fastn's deduplication guard prevents duplicate spam."

---

### [1:35 - 2:00] Winning Resilience Demo: Fault Isolation
- **Action:**
  1. Change the Fault Test dropdown to: **"🔴 Inject Telegram 401 Auth Failure"**.
  2. Click **"Publish"** on row 103 (`🛡️ Resilient Fault-Isolation Demonstration`).
  3. Watch Slack and Discord succeed while Telegram fails gracefully.
- **Voiceover:**
  > "Now, here is our key innovation: resilience. We simulate an expired Telegram bot token. Naive automations would fail completely. In Fastn, our Promise.allSettled error isolation ensures Slack and Discord still publish cleanly! And the Google Sheet logs 'Partially Published' with the exact 401 diagnostic error. That is enterprise-grade social orchestration with Fastn."
