const fs = require('fs');
const constPath = 'c:/AI project/lexastra/data/bare-acts/constitution-of-india.json';
const data = JSON.parse(fs.readFileSync(constPath, 'utf8'));

console.log('Constitution Metadata:');
console.log('ID:', data.id);
console.log('Chapters/Parts count:', data.chapters.length);
console.log('Total sections/articles:', data.sectionCount);

const articlesToPrint = ['1', '19', '21', '300A'];

for (const part of data.chapters) {
  const sections = part.sections || [];
  for (const sec of sections) {
    if (articlesToPrint.includes(sec.number)) {
      console.log('========================================');
      console.log(`ARTICLE ${sec.number}: ${sec.title}`);
      console.log('========================================');
      console.log(sec.text);
      console.log('\n');
    }
  }
}
