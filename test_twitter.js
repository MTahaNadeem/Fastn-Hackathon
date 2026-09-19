const crypto = require('crypto');
const https = require('https');

const consumerKey = 'WEb8sWZoabYiHX8FRrp35BxQ2';
const consumerSecret = 'FmatRjrTY2fbWVUpeSwD2QUE2SxRoViQdFC7aRcyrcjmv6wnUl';
const accessToken = '2064350886604972032-Ftb0CLwSmWK1DB45kCGI3rLRRp8YSD';
const tokenSecret = 'UavDzxiD0MUUMRrunkw4KTRNk9VFSKZTmMDEsfGQ6UjlJ';

const oauth2AccessToken = 'RjljaEd3Y3NuSFV1T3R4bTdSNVdCMTltNGRubWJpOEJZSU52eEIwTG9aZWUtOjE3ODk4MDk0NTgwNDE6MToxOmF0OjE';

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function getOAuth1Header(method, url) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0'
  };

  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys.map(k => percentEncode(k) + '=' + percentEncode(oauthParams[k])).join('&');
  const baseString = method.toUpperCase() + '&' + percentEncode(url) + '&' + percentEncode(paramString);
  const signingKey = percentEncode(consumerSecret) + '&' + percentEncode(tokenSecret);
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams).sort().map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`);
  return 'OAuth ' + headerParts.join(', ');
}

async function testOAuth1() {
  console.log('--- Testing New OAuth 1.0a User Context ---');
  const url = 'https://api.twitter.com/2/tweets';
  const authHeader = getOAuth1Header('POST', url);
  const tweetBody = JSON.stringify({ text: 'Hello from FourFrontLab Fastn Cross-Platform Publisher! ' + new Date().toISOString() });

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
        console.log('OAuth 1.0a Status:', res.statusCode);
        console.log('OAuth 1.0a Body:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', e => {
      console.error('OAuth 1.0a error:', e.message);
      resolve({ error: e.message });
    });
    req.write(tweetBody);
    req.end();
  });
}

async function testOAuth2() {
  console.log('\n--- Testing New OAuth 2.0 User Access Token ---');
  const url = 'https://api.twitter.com/2/tweets';
  const tweetBody = JSON.stringify({ text: 'FourFrontLab live test with OAuth 2.0 ' + new Date().toISOString() });

  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oauth2AccessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(tweetBody)
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        console.log('OAuth 2.0 Status:', res.statusCode);
        console.log('OAuth 2.0 Body:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', e => {
      console.error('OAuth 2.0 error:', e.message);
      resolve({ error: e.message });
    });
    req.write(tweetBody);
    req.end();
  });
}

async function run() {
  await testOAuth1();
  await testOAuth2();
}

run();
