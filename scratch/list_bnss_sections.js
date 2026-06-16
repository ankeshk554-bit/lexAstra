const fs = require('fs');
const bnss = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/bharatiya-nagarik-suraksha-sanhita.json', 'utf8'));

console.log('BNSS Section list:');
for (const chap of bnss.chapters) {
  for (const sec of chap.sections) {
    console.log(`${sec.number}: ${sec.title}`);
  }
}
