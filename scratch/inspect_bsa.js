const fs = require('fs');
const path = require('path');
const bsa = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bare-acts', 'bharatiya-sakshya-adhiniyam.json'), 'utf8'));

for (const chap of bsa.chapters) {
  for (const sec of chap.sections) {
    const num = parseInt(sec.number, 10);
    if (num <= 25 || num === 52 || num === 58 || num === 60 || num === 77) {
      console.log(`=== Section ${sec.number}: ${sec.title} ===`);
      console.log(sec.text);
      console.log('\n');
    }
  }
}
