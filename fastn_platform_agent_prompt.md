# Fastn Platform Agent Instructions & Prompt
## Track 04: Cross-Platform Social Publisher

### Setup Instructions for app.fastn.dev:
1. Log into your Fastn workspace: https://app.fastn.dev
2. In the Fastn Platform Agent chat window, paste the prompt below.
3. Fastn will automatically configure your Google Sheets trigger, Slack connector, Telegram connector, Discord connector, and the update-back connector.

---

### Exact Copy-Paste Prompt for Fastn Platform Agent:

```text
Create a resilient Track 04 Cross-Platform Social Publisher workflow with the following specifications:

1. Trigger:
   - Source: Google Sheets connector (or Airtable).
   - Event: Listen to new rows or updates on table with columns: 'ID', 'Title', 'Content', 'Image_URL', 'Tags', 'Status'.
   - Trigger Condition: Execute only when Status equals 'Draft' or 'Ready to Publish'.

2. Data Transformation (Fastn Runtime Function):
   - Slack Adapter: Format message with mrkdwn blocks containing bold *Title*, formatted Content, and an optional image block if Image_URL is present.
   - Telegram / Discord Adapter: Format as clean Markdown with emojis, title, body, and hashtag list. Enforce a 2000-character safety cutoff.
   - Twitter / X Adapter: Format strictly under 280 characters including Title, truncated Content, and hashtags.

3. Parallel Fan-Out & Fault Tolerance:
   - Dispatch posts to Slack, Discord, and Telegram in parallel using Promise.allSettled error isolation.
   - Fault Isolation Guarantee: If any destination fails (e.g. rate limit, expired OAuth token, or bad webhook), capture the error and DO NOT terminate the other destinations.

4. Confirmation & Source Audit Log:
   - Aggregate execution results and collect post IDs / error messages per platform.
   - Update the trigger row in Google Sheets via the Google Sheets connector:
     * Status: 'Published' (if all succeed), 'Partially Published' (if any fail), or 'Failed' (if all fail).
     * Slack_Log: Confirmation TS or Error message.
     * Telegram_Log: Confirmation Message ID or Error message.
     * Discord_Log: Confirmation Message ID or Error message.
     * Updated_At: Current ISO timestamp.
```
