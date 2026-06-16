const fs = require('fs');
const crpc = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/code-of-criminal-procedure.json', 'utf8'));

const sectionsToCheck = ['26', '41', '125', '167', '313', '374'];

for (const chap of crpc.chapters) {
  for (const sec of chap.sections) {
    if (sectionsToCheck.includes(sec.number)) {
      console.log(`\n=================== CRPC SEC ${sec.number} ===================`);
      sec.text.split('\n').forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let tabs = 0;
        let spaces = 0;
        const matchTabs = line.match(/^(\t+)/);
        if (matchTabs) tabs = matchTabs[1].length;
        const matchSpaces = line.match(/^(\s+)/);
        if (matchSpaces && !matchTabs) spaces = matchSpaces[1].length;
        
        console.log(`Line ${idx + 1} (tabs: ${tabs}, spaces: ${spaces}): [${trimmed.substring(0, 80)}]`);
      });
    }
  }
}
