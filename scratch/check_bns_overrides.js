const fs = require('fs');
const code = fs.readFileSync('c:/AI project/lexastra/scripts/patchVerbatimStatutes.js', 'utf8');

const targetLines = [340, 350, 360, 370, 430, 442];
const lines = code.split('\n');

for (let i = 338; i <= 446; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
