const fs = require('fs');
const bnss = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/bharatiya-nagarik-suraksha-sanhita.json', 'utf8'));

const sectionsToPrint = ['1', '2', '3', '21', '35', '36', '107'];

for (const chap of bnss.chapters) {
  for (const sec of chap.sections) {
    if (sectionsToPrint.includes(sec.number)) {
      console.log('========================================');
      console.log(`SECTION ${sec.number}: ${sec.title}`);
      console.log('========================================');
      console.log(sec.text);
      console.log('\n');
    }
  }
}
