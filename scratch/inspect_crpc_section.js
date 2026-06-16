const fs = require('fs');
const crpc = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/code-of-criminal-procedure.json', 'utf8'));

for (const chap of crpc.chapters) {
  for (const sec of chap.sections) {
    if (sec.number === '26') {
      console.log('CRPC SEC 26 RAW TEXT:');
      console.log(JSON.stringify(sec.text));
      console.log('\nCRPC SEC 26 SPLIT BY NEWLINE:');
      sec.text.split('\n').forEach((line, idx) => {
        console.log(`${idx + 1}: [${line}]`);
      });
    }
    if (sec.number === '41') {
      console.log('CRPC SEC 41 RAW TEXT:');
      console.log(JSON.stringify(sec.text));
    }
  }
}
