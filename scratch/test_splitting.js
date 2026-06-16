const https = require('https');
const url = 'https://raw.githubusercontent.com/Anish-2005/LawAI-Mobile/master/Json/iea.json';

function normalizeLine(line) {
  return line
    .replace(/^(Illustrations|Illustration|Explanations|Explanation|The Court may presume[—\-–\s]*|Court may presume[—\-–\s]*)/i, '')
    .trim();
}

function cleanDescription(desc) {
  if (!desc) return '';
  
  let prepared = desc
    .replace(/(Illustrations|Illustration)(?=[A-Z\s]|$)/g, '\nIllustrations\n')
    .replace(/(Explanations|Explanation)(?=[A-Z\s]|$)/g, '\nExplanation\n')
    .replace(/STATE AMENDMENTSUttar Pradesh[\s\S]+/g, '');
    
  const lines = prepared.split('\n').map(l => l.trim()).filter(Boolean);
  const uniqueLines = [];
  const normalizedSeen = new Set();
  
  for (const line of lines) {
    const isHeader = /^(Illustrations|Illustration|Explanations|Explanation)$/.test(line);
    
    if (isHeader) {
      const standardHeader = line.startsWith('Ill') ? 'Illustrations' : 'Explanation';
      uniqueLines.push(standardHeader);
      continue;
    }
    
    const norm = normalizeLine(line);
    if (!norm) continue;
    
    if (normalizedSeen.has(norm)) {
      continue;
    }
    
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

// Splits run-on illustrations into properly lettered lists
function formatIllustrations(text) {
  if (!text) return '';
  
  // Find where Illustrations start
  const parts = text.split(/\n\nIllustrations\n\n/);
  if (parts.length < 2) return text;
  
  const mainText = parts[0];
  let illBlock = parts.slice(1).join('\n\n').trim();
  
  // Check if there is a trailing paragraph like "But the Court shall also have regard to..."
  let trailingText = '';
  const trailMatch = illBlock.match(/(But the Court shall[\s\S]+)/i);
  if (trailMatch) {
    let rawTrail = trailMatch[1].trim();
    // Split sub-illustrations separated by "As to illustration"
    const trailParts = rawTrail.split(/(?=As to illustration)/i);
    if (trailParts.length > 1) {
      trailingText = '\n\n' + trailParts[0].trim() + '\n\n' + trailParts.slice(1).map(p => {
        let cleanP = p.trim();
        // Clean up dashes and spacing: "As to illustration (a)- A shop-keeper" -> "As to illustration (a): A shop-keeper"
        cleanP = cleanP.replace(/As to illustration\s*\(([a-z])\)\s*[-—–\s]*\s*/i, 'As to illustration ($1): ');
        return cleanP;
      }).join('\n\n');
    } else {
      trailingText = '\n\n' + rawTrail;
    }
    illBlock = illBlock.replace(trailMatch[1], '').trim();
  }
  
  // Patterns that signify the start of a new illustration
  const patterns = [
    'A is tried', 'A sues', 'A is accused', 'A is prosecuted', 'A suitor',
    'A produces', 'A, a connection', 'A has been', 'A shop-keeper', 'A crime',
    'A bond', 'A judicial Act', 'A, the drawer', 'A, a person', 'The question is',
    'A, in possession', 'A, under the influence',
    'Y gives grave', 'A is lawfully', 'A appears as a witness', 'A attempts to pull',
    'Z strikes B', 'Z attempts to horsewhip', 'A, by instigation', 'A shoots Z',
    'A, knowing that', 'A intentionally gives', 'A without any excuse', 'That a man',
    'That an accomplice', 'That a bill', 'That a thing', 'That judicial',
    'That the common', 'That evidence', 'That if a man', 'That when a document',
    'Reasonable ground exists', 'A has been in possession', 'A produces deeds',
    'A, a connection'
  ];
  
  const regexStr = '(?<=\\.|\\?|;|^|\\n)\\s*(' + patterns.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b';
  const regex = new RegExp(regexStr, 'g');
  
  let marked = illBlock.replace(regex, '|||$1');
  let items = marked.split('|||').map(x => x.trim()).filter(Boolean);
  
  if (items.length <= 1) {
    marked = illBlock.replace(/\.\s*(?=[A-Z])/g, '.|||');
    items = marked.split('|||').map(x => x.trim()).filter(Boolean);
  }
  
  const letteredItems = items.map((item, idx) => {
    const letter = String.fromCharCode(97 + idx);
    if (/^\([a-z]\)/i.test(item) || /^[a-z]\)/i.test(item)) {
      return item;
    }
    let cleanItem = item.trim();
    cleanItem = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
    return `(${letter}) ${cleanItem}`;
  });
  
  return mainText + '\n\nIllustrations.\n\n' + letteredItems.join('\n\n') + trailingText;
}

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const lines = data.trim().split('\n');
    lines.forEach(l => {
      try {
        const o = JSON.parse(l);
        if (o.section_id === '114' || o.section_id === '5' || o.section_id === '6') {
          console.log(`=== SECTION ${o.section_id} ===`);
          const cleaned = cleanDescription(o.description);
          console.log(formatIllustrations(cleaned));
          console.log('====================================\n');
        }
      } catch (e) {}
    });
  });
});
