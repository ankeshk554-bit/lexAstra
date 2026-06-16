const fs = require('fs');
const path = require('path');

const bsaPath = path.join(__dirname, '..', 'data', 'bare-acts', 'bharatiya-sakshya-adhiniyam.json');
if (!fs.existsSync(bsaPath)) {
  console.error('BSA JSON not found!');
  process.exit(1);
}

const bsa = JSON.parse(fs.readFileSync(bsaPath, 'utf8'));
const colonialKeywords = [
  'her majesty', 'privy council', 'united kingdom', 'london gazette', 'queen\'s printer',
  'sovereign of the united kingdom', 'crown representative', 'british calendar', 'parliament of the united kingdom'
];

for (const chap of bsa.chapters) {
  for (const sec of chap.sections) {
    const text = sec.text.toLowerCase();
    const title = sec.title.toLowerCase();
    for (const kw of colonialKeywords) {
      if (text.includes(kw) || title.includes(kw)) {
        console.log(`Colonial keyword "${kw}" found in Section ${sec.number}: ${sec.title}`);
        console.log(`Snippet: ${sec.text.substring(0, 150)}...\n`);
      }
    }
  }
}
