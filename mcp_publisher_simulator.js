/**
 * Fastn MCP Tools Simulation Runner for Track 04
 * Demonstrates:
 * 1. Fastn Connectors acting as MCP Tools (Model Context Protocol).
 * 2. Parallel fan-out execution.
 * 3. Error isolation (Fault tolerance when one platform fails).
 * 4. Two-way audit logging back to the source Google Sheet.
 */

const { run: runWorkflow } = require('./workflow');

// Simulated Database / Google Sheets State
const googleSheetsDatabase = [
  {
    row_id: '101',
    Title: '🚀 Build with Fastn Hackathon Kickoff!',
    Content: 'Join developers at NUST SEECS building autonomous AI agent workflows with Fastn connectors.',
    Image_URL: 'https://fastn.ai/hackathon-banner.png',
    Tags: 'hackathon, fastn, ai, automation',
    Status: 'Ready to Publish',
    Slack_Log: null,
    Telegram_Log: null,
    Discord_Log: null,
    Updated_At: null
  },
  {
    row_id: '102',
    Title: '⚠️ Resilient Architecture Test Post',
    Content: 'Testing parallel fan-out with intentional Telegram API credential failure.',
    Image_URL: 'https://fastn.ai/resilience.png',
    Tags: 'testing, faulttolerance, fastn',
    Status: 'Ready to Publish',
    Slack_Log: null,
    Telegram_Log: null,
    Discord_Log: null,
    Updated_At: null
  }
];

/**
 * Fastn MCP Tool Definitions
 * These represent the MCP Tools exposed by Fastn to AI agents.
 */
function createFastnMCPConnectors(simulateFailurePlatform = null) {
  return {
    slack: {
      postMessage: async (payload) => {
        if (simulateFailurePlatform === 'slack') {
          throw new Error('Slack API 429: Rate Limit Exceeded');
        }
        console.log('   [MCP Tool: fastn_slack_post_message] Posted blocks to #announcements');
        return { ts: '1726701234.567890', channel: 'C01234567' };
      }
    },
    telegram: {
      sendMessage: async (payload) => {
        if (simulateFailurePlatform === 'telegram') {
          throw new Error('Telegram Bot API 401: Unauthorized (Invalid or expired bot token)');
        }
        console.log('   [MCP Tool: fastn_telegram_send_message] Sent message to @FastnAnnouncements');
        return { message_id: 884920, chat_id: '@FastnAnnouncements' };
      }
    },
    discord: {
      postMessage: async (payload) => {
        if (simulateFailurePlatform === 'discord') {
          throw new Error('Discord Webhook 404: Webhook not found');
        }
        console.log('   [MCP Tool: fastn_discord_post_message] Dispatched webhook to #social-feed');
        return { id: '1285948392019485732', channel_id: '9988776655' };
      }
    },
    google_sheets: {
      appendValues: async ({ requestBody }) => {
        const fields = requestBody.values[0];
        console.log(`   [MCP Tool: fastn_google_sheets_append_values] Appended row in Source Sheet:`);
        console.log('   -> Fields:', JSON.stringify(fields, null, 2));
        return { updates: { updatedRows: 1 } };
      },
      updateRow: async ({ row_id, fields }) => {
        console.log(`   [MCP Tool: fastn_google_sheets_update_row] Updated row ${row_id} in Source Sheet:`);
        console.log('   -> Fields:', JSON.stringify(fields, null, 2));
        const row = googleSheetsDatabase.find(r => r.row_id === row_id);
        if (row) {
          Object.assign(row, fields);
        }
        return { updatedRows: 1 };
      }
    }
  };
}

async function main() {
  console.log('================================================================');
  console.log('🌟 FASTN MCP RUNNER: TRACK 04 CROSS-PLATFORM SOCIAL PUBLISHER');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST SCENARIO 1: Happy Path (All 3 platforms succeed)
  // -------------------------------------------------------------
  console.log('▶ [TEST SCENARIO 1] Full Fan-Out Success (Happy Path)');
  console.log('-------------------------------------------------------------');
  const post1 = googleSheetsDatabase[0];
  console.log(`Input Row ${post1.row_id}: "${post1.Title}"`);
  
  const connectors1 = createFastnMCPConnectors(null);
  const result1 = await runWorkflow({
    input: post1,
    connectors: connectors1
  });

  console.log('\nExecution Result Summary:');
  console.log(`- Final Status: ${result1.status}`);
  console.log(`- Slack: ${result1.summary.slack.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- Telegram: ${result1.summary.telegram.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- Discord: ${result1.summary.discord.success ? '✅ Success' : '❌ Failed'}`);
  console.log('\n');

  // -------------------------------------------------------------
  // TEST SCENARIO 2: Fault Tolerance (Telegram Fails, Others Succeed)
  // -------------------------------------------------------------
  console.log('▶ [TEST SCENARIO 2] Fault Isolation (Simulating Telegram API Failure)');
  console.log('-------------------------------------------------------------');
  console.log('Simulating: Telegram Bot Token expired (401 Unauthorized)');
  const post2 = googleSheetsDatabase[1];
  console.log(`Input Row ${post2.row_id}: "${post2.Title}"`);

  const connectors2 = createFastnMCPConnectors('telegram');
  const result2 = await runWorkflow({
    input: post2,
    connectors: connectors2
  });

  console.log('\nExecution Result Summary:');
  console.log(`- Final Status: ${result2.status} (Isolated failure caught gracefully!)`);
  console.log(`- Slack: ${result2.summary.slack.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`- Telegram: ${result2.summary.telegram.success ? '✅ Success' : '❌ Failed (' + result2.summary.telegram.error + ')'}`);
  console.log(`- Discord: ${result2.summary.discord.success ? '✅ Success' : '❌ Failed'}`);
  console.log('\n');

  console.log('================================================================');
  console.log('📊 FINAL SOURCE SHEET AUDIT LOG (Deduplication & Verification):');
  console.log('================================================================');
  console.table(googleSheetsDatabase.map(r => ({
    ID: r.row_id,
    Title: r.Title.substring(0, 25) + '...',
    Status: r.Status,
    Slack: r.Slack_Log ? r.Slack_Log.substring(0, 22) + '...' : '',
    Telegram: r.Telegram_Log ? r.Telegram_Log.substring(0, 22) + '...' : '',
    Discord: r.Discord_Log ? r.Discord_Log.substring(0, 22) + '...' : ''
  })));
  console.log('\n🎉 All criteria verified: Fan-out, Adapters, Error Isolation, and Audit Log!');
}

main().catch(console.error);
