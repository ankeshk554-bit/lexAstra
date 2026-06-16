const fs = require('fs');
const path = require('path');
const { bareActs } = require('../data/bareActs');

const bareActsDir = path.join(__dirname, '..', 'data', 'bare-acts');

console.log('Checking Bare Act slugs against JSON files...\n');

// Check exact casing in directory list
const filesInDir = fs.readdirSync(bareActsDir);

let issues = 0;
bareActs.forEach(act => {
  const expectedFilename = `${act.slug}.json`;
  const fileExists = fs.existsSync(path.join(bareActsDir, expectedFilename));
  
  if (!fileExists) {
    console.log(`❌ Missing JSON file for slug: "${act.slug}" (expected "${expectedFilename}")`);
    issues++;
  } else {
    const exactFilenameMatch = filesInDir.includes(expectedFilename);
    if (!exactFilenameMatch) {
      console.log(`❌ Case mismatch for slug: "${act.slug}"`);
      console.log(`   Expected: "${expectedFilename}"`);
      console.log(`   Found in dir: ${filesInDir.find(f => f.toLowerCase() === expectedFilename.toLowerCase())}`);
      issues++;
    }
  }
});

console.log(`\nCheck complete. Found ${issues} issues.`);
