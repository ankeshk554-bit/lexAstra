const fs = require('fs');
const code = fs.readFileSync('c:/AI project/lexastra/scripts/patchVerbatimStatutes.js', 'utf8');

code.split('\n').forEach((line, idx) => {
  if (line.includes('bharatiya-nyaya-sanhita.json')) {
    console.log(`${idx + 1}: ${line}`);
  }
});
