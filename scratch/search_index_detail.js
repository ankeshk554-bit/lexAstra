const fs = require('fs');
const content = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2348/content.md', 'utf8');

const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('order') && (line.includes('XVI') || line.includes('XXXII'))) {
    console.log(`${idx + 1}: ${line}`);
  }
});
