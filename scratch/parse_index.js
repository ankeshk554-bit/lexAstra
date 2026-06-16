const fs = require('fs');

const content = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2348/content.md', 'utf8');

const matches = content.match(/href="(order[^"]+)"/gi);
if (matches) {
  const fileNames = matches.map(m => m.match(/href="([^"?]+)/)[1]);
  console.log('Order filenames count:', fileNames.length);
  console.log(fileNames);
} else {
  console.log('No matches');
}
