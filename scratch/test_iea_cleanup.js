const https = require('https');
const url = 'https://raw.githubusercontent.com/Anish-2005/LawAI-Mobile/master/Json/iea.json';

function normalizeLine(line) {
  return line
    .replace(/^(Illustrations|Illustration|Explanations|Explanation|The Court may presume[—\-–\s]*|Court may presume[—\-–\s]*)/i, '')
    .trim();
}

function cleanDescription(desc) {
  if (!desc) return '';
  
  // Format special headers to be on separate lines
  let prepared = desc
    .replace(/Illustrations\s*/g, '\nIllustrations\n')
    .replace(/Illustration\s*/g, '\nIllustration\n')
    .replace(/Explanations\s*/g, '\nExplanations\n')
    .replace(/Explanation\s*/g, '\nExplanation\n')
    .replace(/STATE AMENDMENTSUttar Pradesh[\s\S]+/g, ''); // Strip UP state amendments
    
  const lines = prepared.split('\n').map(l => l.trim()).filter(Boolean);
  const uniqueLines = [];
  const normalizedSeen = new Set();
  
  for (const line of lines) {
    const norm = normalizeLine(line);
    if (!norm) continue;
    
    // Check if this line is identical or a duplicate
    if (normalizedSeen.has(norm)) {
      continue;
    }
    
    // Check if this line is a substring of an already seen line, or vice versa
    let isDuplicate = false;
    for (const seen of normalizedSeen) {
      if (seen.length > 50 && (seen.includes(norm) || norm.includes(seen))) {
        isDuplicate = true;
        break;
      }
    }
    
    if (isDuplicate) {
      continue;
    }
    
    normalizedSeen.add(norm);
    uniqueLines.push(line);
  }
  
  return uniqueLines.join('\n\n');
}

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.trim().split('\n');
    lines.forEach(l => {
      try {
        const o = JSON.parse(l);
        if (['5', '6', '114', '90'].includes(o.section_id)) {
          console.log(`=== SECTION ${o.section_id} ===`);
          console.log(cleanDescription(o.description));
          console.log('====================================\n');
        }
      } catch (e) {}
    });
  });
});
