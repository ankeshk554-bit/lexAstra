const fs = require('fs');
const path = require('path');

const bnssPath = 'c:/AI project/lexastra/data/bare-acts/bharatiya-nagarik-suraksha-sanhita.json';
const data = JSON.parse(fs.readFileSync(bnssPath, 'utf8'));

console.log('BNSS metadata:');
console.log('ID:', data.id);
console.log('Name:', data.name);
console.log('Chapters count:', data.chapters.length);
console.log('Sections total:', data.sectionCount);

for (const chap of data.chapters) {
  const sections = chap.sections || [];
  console.log(`Chapter ${chap.number}: ${chap.title} (${sections.length} sections: ${sections[0]?.number} to ${sections[sections.length - 1]?.number})`);
}
