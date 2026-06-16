const fs = require('fs');
const html = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2363/content.md', 'utf8');

const pMatches = html.match(/<(p|td|div)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
console.log('Matches length:', pMatches.length);
pMatches.slice(0, 10).forEach((p, i) => {
  console.log(`[${i}]: ${p.substring(0, 200)}...`);
});
