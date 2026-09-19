const https = require('https');

const newAccessToken = 'UzNPZThPVzdTTDc5eTdubUZobGtKX1FNMjE4cDJRSXUxcm8tcDRXQmZUaW56OjE3ODk4MDY3OTk4NTY6MToxOmF0OjE';
const tweetBody = JSON.stringify({ text: 'Hello from FourFrontLab Fastn Cross-Platform Publisher! ' + new Date().toISOString() });

const req = https.request('https://api.twitter.com/2/tweets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${newAccessToken}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(tweetBody)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Tweet Post Status:', res.statusCode);
    console.log('Tweet Post Body:', body);
  });
});

req.on('error', e => console.error(e));
req.write(tweetBody);
req.end();
