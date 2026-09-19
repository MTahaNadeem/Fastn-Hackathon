const fs = require('fs');
const lines = fs.readFileSync('public/index.html', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (/twitter/i.test(line)) {
    console.log((idx + 1) + ': ' + line.trim().slice(0, 100));
  }
});
