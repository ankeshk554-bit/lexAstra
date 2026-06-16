const https = require('https');

const url = 'https://api.github.com/repos/kmeanskaran/nyaynidhi/contents/src/ingestion';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('GitHub contents of src/ingestion:');
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          console.log(`${item.type}: ${item.name} (${item.download_url})`);
        });
      } else {
        console.log('Response not an array, keys:', Object.keys(parsed));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
});
