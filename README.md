# Track 04: Resilient Cross-Platform Social Publisher
**Build with Fastn Hackathon Official Submission**  
- **Track:** Track 04 — Cross-Platform Social Publisher  
- **Organization:** Hackathon_FourFrontLab (`personal_29e5272ccca34fc5d046`)  
- **Team Lead:** Muhammad Taha Nadeem (tahanadeem478@gmail.com)  
- **Team Co-Developer:** Haseeb (FourFrontLab)  
- **Production Workflow ID:** [`wf_6cfc644efb9d`](https://connect.fastn.dev/integrations/workflows/wf_6cfc644efb9d)  
- **Embed Widget ID:** [`wgt_c70a813b22ba`](https://connect.fastn.dev/widgets/wgt_c70a813b22ba)  
- **Tracking Google Sheet:** [`1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s`](https://docs.google.com/spreadsheets/d/1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s)  

---

## 1. Problem Framing & Innovation (30 Points: Idea & Innovation)

### The Real-World Pain Point
Marketing teams, developer advocates, and community managers waste **30 to 45 minutes adapting every single post** across platforms:
- **Character constraints:** Twitter/X has a strict 280-character limit; Discord and Telegram cap at 2000–4000 characters.
- **Formatting divergence:** Slack requires strict Block Kit JSON schemas (`mrkdwn`), Discord uses standard Markdown with webhook embeds, and Telegram uses Markdown/HTML.
- **Cascading Failures:** When traditional automation tools (e.g. Zapier or Make) hit an expired bot token or rate limit on one service (e.g., Twitter 401/402), the entire execution crashes mid-flight. Posts are left half-published with no audit trail, creating "ghost records" and forcing manual clean-up.

### Our Fastn-Native Innovation
A resilient, enterprise-grade multi-channel broadcast engine built on Fastn:
1. **Multi-Protocol Content Adapters:** Generates customized payloads for Slack (Block Kit), Discord (rich embeds), Facebook (webhook relay), Twitter/X (280-char math), and Mailchimp (responsive HTML cards).
2. **Parallel Fan-out with Failure Isolation (`Promise.allSettled` Pattern):** Independent error sandboxing ensures one channel's failure (e.g., Twitter 401 or Telegram connector) never blocks Slack, Discord, or Facebook.
3. **True Stateful Deduplication (Fastn State Store):** Uses `fastn.state.get()` and `fastn.state.set()` to detect duplicate submissions by title signature and skip re-broadcasting unless `force: true` is passed.
4. **Bi-Directional Google Sheets Audit Loop:** Automatically appends confirmation post IDs (`ts`, `message_id`), permalinks, and diagnostic error logs back to the tracking spreadsheet in real-time.
5. **Interactive Embeddable Form Widget:** Registered Fastn embed widget (`wgt_c70a813b22ba`) allowing non-technical marketing staff to publish directly from any web portal.

---

## 2. Fastn Architecture & MCP Connectors

```
                 ┌──────────────────────────────────────┐
                 │  Source Ingestion: API / Webhook /   │
                 │  Google Sheets Row Poller            │
                 │  (Title, Content, Image_URL, Tags)   │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ Fastn Content Transformation Engine  │
                 │ - Slack mrkdwn Block Adapter         │
                 │ - Discord Webhook Embed Adapter      │
                 │ - Facebook Relay Adapter             │
                 │ - Twitter 280-Char Safety Truncator  │
                 │ - Fastn State Key Deduplication      │
                 └──────────────────┬───────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
 ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
 │ Fastn Slack UCL  │      │ Discord Webhook  │      │ Facebook Relay   │
 │ OAuth Connector  │      │ Direct HTTP Post │      │ Make.com Webhook │
 │ Channel: #social │      │ Rich Embed Card  │      │ Page Feed Relay  │
 └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │ Parallel Promise.all with .catch()
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ Fastn Google Sheets UCL Connector    │
                 │ - Action: appendValues to Sheet1!A1  │
                 │ - Records Timestamp, Status, IDs,    │
                 │   and Diagnostic Errors              │
                 └──────────────────────────────────────┘
```

### Connectors Active in Fastn:
1. **Slack Connector (`8de5d696-5289-4c9c-ade4-de918d019d06`):**
   - Type: Fastn UCL Managed OAuth Connector (`org_platform`)
   - Channel: `#social` (`C0C278R4PRD`) in FourFrontLab workspace
   - Action: `fastn.connector.slack.createChatPostMessage`
2. **Google Sheets Connector (`38d254e2-b92e-44f4-81cd-8251fd9373d9`):**
   - Type: Fastn UCL Managed OAuth Connector (`org_platform`)
   - Spreadsheet: `1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s`
   - Action: `fastn.connector.googleSheets.appendValues`
3. **Discord Integration:**
   - Type: Direct HTTP Webhook dispatch with rich embed JSON schema
4. **Facebook Integration:**
   - Type: Make.com Webhook Relay dispatch (`hook.eu1.make.com/...`)
5. **Deduplication Store:**
   - Type: Native Fastn State Store (`fastn.state`)

---

## 3. Fastn Platform Agent & MCP Integration (20 Points)

We collaborated extensively with the Fastn Platform Agent and MCP Gateway:
- **163 Governed MCP Tools:** Leveraged to synthesize workflow logic, validate schemas, bind webhook routes, and inspect runtime executions.
- **25+ Live MCP Executions:** Audit trail verified in Fastn logs with `user-agent: fastn-connect` and Google SPIFFE authentication.
- **Incremental Versioning:** Workflow evolved from initial draft across 18 version iterations (`wv_1ff3c13ce8c3` to current live version).
- **Embed Widget Generation:** Created `wgt_c70a813b22ba` linked directly to `wf_6cfc644efb9d`.

---

## 4. Technical Execution & Error Handling (20 Points)

- **Parallel Dispatch:** All network requests are executed concurrently via `Promise.all()`.
- **Fault Isolation:** Individual `.catch()` handlers ensure that third-party failures (e.g. Twitter 401 or Telegram token error) do not crash Slack, Discord, or Facebook.
- **Audit Verification:** The source spreadsheet is updated with exact post timestamps, IDs, and error diagnostics (`Errors: None` or granular failure strings).
- **Automated Test Suite:** Complete 16/16 test assertions pass in `test_suite.js`.

---

## 5. Quick Start & Verification

### Run the Automated Test Suite:
```bash
node test_suite.js
```
*Output: 16/16 assertions passed (100%) — Happy Path, Fault Isolation, Deduplication, and Character Boundaries.*

### Launch the Local Live Dashboard & Proxy:
```bash
node server.js
```
Open **`http://localhost:3456`** in your browser to test:
- **View 1:** Broadcast Composer & Multi-Platform Previews (Slack, Discord, Facebook, Twitter).
- **View 2:** Real-Time Delivery Monitor with latency metrics and live event console.
- **View 3:** 9-Column Google Sheets Audit Matrix Viewer.

---

## 6. Official Submission Checklist

- [x] **Working Fastn Workflow Link:** [`https://connect.fastn.dev/integrations/workflows/wf_6cfc644efb9d`](https://connect.fastn.dev/integrations/workflows/wf_6cfc644efb9d)
- [x] **Active Embed Widget Link:** [`https://connect.fastn.dev/widgets/wgt_c70a813b22ba`](https://connect.fastn.dev/widgets/wgt_c70a813b22ba)
- [x] **Tracking Google Sheet:** [`1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s`](https://docs.google.com/spreadsheets/d/1wquYVUl_EBAUjixTCV-rXPLH4pth7j5OJ0okZRzgD5s)
- [x] **Team Details:** Muhammad Taha Nadeem & Haseeb (Team FourFrontLab)
- [x] **Track Identifier:** Track 04 — Cross-Platform Social Publisher
- [x] **2-Minute Demo Video Script:** Documented in [`DEMO_VIDEO_SCRIPT.md`](./DEMO_VIDEO_SCRIPT.md)
- [x] **Screenshots Guide:** Documented in [`SCREENSHOTS_GUIDE.md`](./SCREENSHOTS_GUIDE.md)
