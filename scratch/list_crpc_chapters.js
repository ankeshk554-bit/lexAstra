const fs = require('fs');
const crpc = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/code-of-criminal-procedure.json', 'utf8'));

console.log('CrPC Chapters:');
for (const chap of crpc.chapters) {
  const sections = chap.sections || [];
  console.log(`Chapter ${chap.number}: ${chap.title} (${sections.length} sections: ${sections[0]?.number} to ${sections[sections.length - 1]?.number})`);
}
