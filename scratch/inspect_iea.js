const fs = require('fs');
const path = require('path');
const iea = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'bare-acts', 'indian-evidence-act.json'), 'utf8'));

for (const chap of iea.chapters) {
  for (const sec of chap.sections) {
    const num = parseInt(sec.number, 10);
    if (num === 3 || num === 24 || num === 25 || num === 26 || num === 27 || num === 30 || num === 37 || num === 57 || num === 63 || num === 65 || num === 78) {
      console.log(`=== IEA Section ${sec.number}: ${sec.title} ===`);
      console.log(sec.text);
      console.log('\n');
    }
  }
}
