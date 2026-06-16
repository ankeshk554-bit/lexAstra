const fs = require('fs');

const html = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2363/content.md', 'utf8');

// Let's print out lines matching rule definitions
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('<b>') && line.includes('.-</b>') || line.includes('<b>') && line.includes('.</b>-')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
