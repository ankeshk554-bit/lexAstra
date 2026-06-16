const fs = require('fs');

const bnsPath = 'c:/AI project/lexastra/data/bare-acts/bharatiya-nyaya-sanhita.json';
if (fs.existsSync(bnsPath)) {
  const bns = JSON.parse(fs.readFileSync(bnsPath, 'utf8'));
  console.log('BNS Metadata:');
  console.log('Name:', bns.name);
  console.log('Chapters count:', bns.chapters.length);
  
  // Print section 303
  for (const chap of bns.chapters) {
    for (const sec of chap.sections) {
      if (sec.number === '303' || sec.number === '103') {
        console.log(`\n================ BNS SEC ${sec.number}: ${sec.title} ================`);
        console.log(sec.text);
      }
    }
  }
}

const bsaPath = 'c:/AI project/lexastra/data/bare-acts/bharatiya-sakshya-adhiniyam.json';
if (fs.existsSync(bsaPath)) {
  const bsa = JSON.parse(fs.readFileSync(bsaPath, 'utf8'));
  console.log('\nBSA Metadata:');
  console.log('Name:', bsa.name);
  console.log('Chapters count:', bsa.chapters.length);
  
  // Print section 63 or 60
  for (const chap of bsa.chapters) {
    for (const sec of chap.sections) {
      if (sec.number === '63' || sec.number === '60') {
        console.log(`\n================ BSA SEC ${sec.number}: ${sec.title} ================`);
        console.log(sec.text);
      }
    }
  }
}
