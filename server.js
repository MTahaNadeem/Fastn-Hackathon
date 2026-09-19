const http = require('http');
const fs = require('fs');
const path = require('path');
const { run: runWorkflow } = require('./workflow');

const PORT = process.env.PORT || 3456;
const PUBLIC_DIR = path.join(__dirname, 'public');

// In-Memory Database mimicking Google Sheets
let googleSheetsDb = [
  {
    row_id: '101',
    Title: '🚀 Build with Fastn Hackathon Kickoff!',
    Content: 'Developers at NUST SEECS are building production-grade autonomous agent workflows using Fastn connectors.',
    Image_URL: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    Tags: 'hackathon, fastn, ai, nust',
    Status: 'Ready to Publish',
    Slack_Log: '',
    Telegram_Log: '',
    Discord_Log: '',
    Updated_At: ''
  },
  {
    row_id: '102',
    Title: '⚡ Fastn Unified Context Layer (UCL)',
    Content: 'Fastn turns any API or database into an MCP Tool with managed OAuth 2.1, RBAC, and zero-latency caching.',
    Image_URL: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    Tags: 'mcp, devtools, architecture',
    Status: 'Draft',
    Slack_Log: '',
    Telegram_Log: '',
    Discord_Log: '',
    Updated_At: ''
  },
  {
    row_id: '103',
    Title: '🛡️ Resilient Fault-Isolation Demonstration',
    Content: 'Watch how Fastn handles an expired Telegram bot token without failing Slack or Discord publishing.',
    Image_URL: '',
    Tags: 'resilience, faulttolerance',
    Status: 'Ready to Publish',
    Slack_Log: '',
    Telegram_Log: '',
    Discord_Log: '',
    Updated_At: ''
  }
];

const initialDb = JSON.parse(JSON.stringify(googleSheetsDb));

function createConnectors(failurePlatform) {
  return {
    slack: {
      postMessage: async (payload) => {
        if (failurePlatform === 'slack') {
          throw new Error('Slack API 429: Rate Limit Exceeded (Retry-After: 30s)');
        }
        return { ts: (Date.now() / 1000).toFixed(6), channel: 'C08ANNOUNCEMENTS' };
      }
    },
    telegram: {
      sendMessage: async (payload) => {
        if (failurePlatform === 'telegram') {
          throw new Error('Telegram Bot API 401: Unauthorized (Invalid bot token)');
        }
        return { message_id: Math.floor(100000 + Math.random() * 900000), chat_id: '@FastnLive' };
      }
    },
    discord: {
      postMessage: async (payload) => {
        if (failurePlatform === 'discord') {
          throw new Error('Discord Webhook 404: Webhook token revoked');
        }
        return { id: (BigInt(Date.now()) * 1000n + 123n).toString(), channel_id: '1192837465' };
      }
    },
    google_sheets: {
      updateRow: async ({ row_id, fields }) => {
        const row = googleSheetsDb.find(r => r.row_id === String(row_id));
        if (row) {
          Object.assign(row, fields);
        }
        return { updated: true };
      }
    }
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API Endpoints
  if (url.pathname === '/api/posts' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(googleSheetsDb));
  }

  if (url.pathname === '/api/posts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newPost = {
          row_id: String(Date.now()).slice(-4),
          Title: data.Title || 'Untitled Post',
          Content: data.Content || '',
          Image_URL: data.Image_URL || '',
          Tags: data.Tags || '',
          Status: data.Status || 'Ready to Publish',
          Slack_Log: '',
          Telegram_Log: '',
          Discord_Log: '',
          Updated_At: ''
        };
        googleSheetsDb.push(newPost);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newPost));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const row_id = data.row_id || String(Date.now()).slice(-4);
        const Title = data.Title || data.title || 'Broadcast Post';
        const Content = data.Content || data.content || '';
        const Tags = data.Tags || data.tags || '';
        const Link = data.Link || data.link || '';
        const Image_URL = data.Image_URL || data.image_url || data.imageUrl || '';
        const Status = data.Status || data.status || 'Ready';
        const fault = data.failurePlatform || data.fault || 'none';

        // Check if duplicate post without force
        const dedupIdx = googleSheetsDb.findIndex(r => r.Title.toLowerCase().trim() === Title.toLowerCase().trim() && r.Status === 'Published');
        if (dedupIdx >= 0 && !data.force && Status !== 'Ready') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            row_id,
            status: 'Skipped',
            message: `Duplicate post detected for "${Title}". Already published. Use force: true to override.`,
            skipped: true,
            results: {
              slack: { success: true, id: googleSheetsDb[dedupIdx].Slack_ID || '1789802771.063469' },
              discord: { success: true, id: googleSheetsDb[dedupIdx].Social_ID || '1550769961470001163' }
            },
            auditLog: { Status: 'Skipped', Updated_At: googleSheetsDb[dedupIdx].Timestamp || new Date().toISOString(), errors: 'None' }
          }));
        }

        const slackSuccess = fault !== 'slack';
        const discordSuccess = fault !== 'discord';
        const fbSuccess = fault !== 'facebook';
        const twitterSuccess = fault === 'none' && false; // Demonstrates 401/402 fault-isolation
        const telegramSuccess = false; // Demonstrates connector fault-isolation
        const linkedinSuccess = true;

        const ts = (Date.now() / 1000).toFixed(6);
        const discordId = (BigInt(Date.now()) * 1000n + 54n).toString();
        const fbId = `fb_relay_${Date.now()}`;
        const liId = `urn:li:share:${Date.now()}`;

        const results = {
          slack: slackSuccess
            ? { success: true, id: ts, permalink: `https://fourfrontlab.slack.com/archives/C0C278R4PRD/p${ts.replace('.', '')}` }
            : { success: false, error: 'Slack API 429: Rate Limit Exceeded (Retry-After: 30s)' },
          discord: discordSuccess
            ? { success: true, id: discordId, permalink: `https://discord.com/channels/@me/${discordId}` }
            : { success: false, error: 'Discord Webhook 404: Webhook token revoked' },
          facebook: fbSuccess
            ? { success: true, id: fbId, permalink: 'https://facebook.com/' }
            : { success: false, error: 'Facebook Relay HTTP 500: Relay timeout' },
          twitter_x: {
            success: false,
            error: fault === 'twitter' ? 'X API 402: Credits Depleted' : 'X API 401: Unauthorized (Free Tier Depleted)'
          },
          telegram: {
            success: false,
            error: 'Telegram Bot API: Connector "telegram" not found'
          },
          linkedin: {
            success: true,
            id: liId,
            permalink: `https://linkedin.com/feed/update/${liId}`
          }
        };

        const primarySuccess = slackSuccess && discordSuccess && fbSuccess;
        const anyPrimarySuccess = slackSuccess || discordSuccess || fbSuccess;
        const overallStatus = primarySuccess ? 'Published' : (anyPrimarySuccess ? 'Partially Published' : 'Failed');

        const errorsList = [];
        if (!slackSuccess) errorsList.push(`slack: ${results.slack.error}`);
        if (!discordSuccess) errorsList.push(`discord: ${results.discord.error}`);
        if (!fbSuccess) errorsList.push(`facebook: ${results.facebook.error}`);
        errorsList.push('twitter_x: 401 Unauthorized');
        errorsList.push('telegram: connector not found');

        const auditLog = {
          Status: overallStatus,
          Updated_At: new Date().toISOString(),
          errors: errorsList.join('; ')
        };

        const sheetRow = {
          row_id,
          Timestamp: auditLog.Updated_At,
          Title,
          Content,
          Tags,
          Image_URL,
          Status: overallStatus,
          Slack_ID: slackSuccess ? ts : 'FAILED',
          Social_ID: discordSuccess ? discordId : fbId,
          Error_Log: auditLog.errors
        };

        googleSheetsDb.unshift(sheetRow);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          row_id,
          status: overallStatus,
          results,
          auditLog,
          updatedDb: googleSheetsDb
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/fastn-proxy' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const fastnWebhookUrl = 'https://webhooks.fastn.dev/prod/triggers/personal_29e5272ccca34fc5d046/webhooks/671bf3f9-9d68-4e14-a2d9-89830c7e2e3b';
        
        let forwardHeaders = { 'Content-Type': 'application/json' };
        if (process.env.FASTN_API_KEY) {
          forwardHeaders['x-api-key'] = process.env.FASTN_API_KEY;
        }

        try {
          const fastnRes = await fetch(fastnWebhookUrl, {
            method: 'POST',
            headers: forwardHeaders,
            body: JSON.stringify(data)
          });
          const fastnText = await fastnRes.text();
          let fastnJson;
          try { fastnJson = JSON.parse(fastnText); } catch { fastnJson = { raw: fastnText }; }
          
          if (fastnRes.ok) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true, live: true, data: fastnJson }));
          }
        } catch (fetchErr) {
          console.warn('[Proxy] Fastn Webhook fetch warning:', fetchErr.message);
        }

        // Fallback to local workflow execution if webhook is unauthenticated or unreachable
        const connectors = createConnectors(data.failurePlatform || data.fault);
        const post = {
          row_id: data.row_id || String(Date.now()).slice(-4),
          Title: data.Title || data.title || 'Broadcast Post',
          Content: data.Content || data.content || '',
          Image_URL: data.Image_URL || data.image_url || data.imageUrl || '',
          Tags: data.Tags || data.tags || '',
          Status: data.Status || data.status || 'Ready to Publish'
        };
        const result = await runWorkflow({ input: post, connectors });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, live: false, fallback: true, result }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (url.pathname === '/api/reset' && req.method === 'POST') {
    googleSheetsDb = JSON.parse(JSON.stringify(initialDb));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, posts: googleSheetsDb }));
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg'
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    return fs.createReadStream(filePath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 Fastn Track 04 Live Dashboard running at:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log(`================================================================`);
});
