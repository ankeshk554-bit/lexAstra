const fs = require('fs');
const bns = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/bharatiya-nyaya-sanhita.json', 'utf8'));

console.log('BNS Chapters & Section Ranges:');
for (const chap of bns.chapters) {
  const sections = chap.sections || [];
  const start = sections[0] ? sections[0].number : 'none';
  const end = sections[sections.length - 1] ? sections[sections.length - 1].number : 'none';
  console.log(`Chapter ${chap.number}: ${chap.title} (Sections: ${start} to ${end}, total ${sections.length})`);
}
