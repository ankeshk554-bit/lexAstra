const fs = require('fs');
const bns = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/bharatiya-nyaya-sanhita.json', 'utf8'));

let placeholderCount = 0;
let verbatimCount = 0;

console.log('Sample BNS Sections:');
for (const chap of bns.chapters) {
  for (const sec of chap.sections) {
    const isPlaceholder = sec.text.includes('Statutory provision of Section') || sec.text.includes('This section defines or regulates');
    if (isPlaceholder) {
      placeholderCount++;
    } else {
      verbatimCount++;
      if (verbatimCount <= 5) {
        console.log(`BNS Sec ${sec.number} [Verbatim]: ${sec.title}`);
        console.log(sec.text.substring(0, 200) + '...\n');
      }
    }
  }
}

console.log(`Total sections: ${bns.chapters.reduce((acc, chap) => acc + chap.sections.length, 0)}`);
console.log(`Verbatim/Custom sections: ${verbatimCount}`);
console.log(`Placeholder/Fallback sections: ${placeholderCount}`);
