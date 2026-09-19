const crypto = require('crypto');
const https = require('https');

const consumerKey = 'WEb8sWZoabYiHX8FRrp35BxQ2';
const consumerSecret = 'FmatRjrTY2fbWVUpeSwD2QUE2SxRoViQdFC7aRcyrcjmv6wnUl';
const accessToken = '2064350886604972032-Ftb0CLwSmWK1DB45kCGI3rLRRp8YSD';
const tokenSecret = 'UavDzxiD0MUUMRrunkw4KTRNk9VFSKZTmMDEsfGQ6UjlJ';

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function getOAuth1Header(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...extraParams
  };

  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys.map(k => percentEncode(k) + '=' + percentEncode(oauthParams[k])).join('&');
  const baseString = method.toUpperCase() + '&' + percentEncode(url) + '&' + percentEncode(paramString);
  const signingKey = percentEncode(consumerSecret) + '&' + percentEncode(tokenSecret);
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerKeys = Object.keys(oauthParams).filter(k => k.startsWith('oauth_')).sort();
  const headerParts = headerKeys.map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`);
  return 'OAuth ' + headerParts.join(', ');
}

// Test 1: v1.1 statuses/update.json
async function testV1() {
  console.log('--- Testing v1.1 statuses/update.json ---');
  const url = 'https://api.twitter.com/1.1/statuses/update.json';
  const statusText = 'FourFrontLab live test v1.1 ' + Date.now();
  const authHeader = getOAuth1Header('POST', url, { status: statusText });

  const postData = 'status=' + percentEncode(statusText);

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log('v1.1 Status:', res.statusCode);
        console.log('v1.1 Body:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', e => resolve({ error: e.message }));
    req.write(postData);
    req.end();
  });
}

// Test 2: v2 tweets with OAuth 1.0a
async function testV2() {
  console.log('\n--- Testing v2 tweets with OAuth 1.0a ---');
  const url = 'https://api.twitter.com/2/tweets';
  const authHeader = getOAuth1Header('POST', url);
  const tweetBody = JSON.stringify({ text: 'FourFrontLab live test v2 ' + Date.now() });

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(tweetBody)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log('v2 Status:', res.statusCode);
        console.log('v2 Body:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', e => resolve({ error: e.message }));
    req.write(tweetBody);
    req.end();
  });
}

async function run() {
  await testV1();
  await testV2();
}

run();
