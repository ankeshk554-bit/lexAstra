const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');
const ieaPath = path.join(targetDir, 'indian-evidence-act.json');

if (!fs.existsSync(ieaPath)) {
  console.error('Missing indian-evidence-act.json!');
  process.exit(1);
}

const iea = JSON.parse(fs.readFileSync(ieaPath, 'utf8'));
const url = 'https://raw.githubusercontent.com/Anish-2005/LawAI-Mobile/master/Json/iea.json';

function normalizeLine(line) {
  return line
    .replace(/^(Illustrations|Illustration|Explanations|Explanation|The Court may presume[—\-–\s]*|Court may presume[—\-–\s]*)/i, '')
    .trim();
}

function cleanDescription(desc) {
  if (!desc) return '';
  
  // Case-sensitive replacement to avoid replacing "explanation" in lowercase inside sentences
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

console.log('Downloading Anish-2005 Indian Evidence Act JSON...');
https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download: status ${res.statusCode}`);
    process.exit(1);
  }
  
  let rawData = '';
  res.on('data', chunk => rawData += chunk);
  res.on('end', () => {
    console.log('Download complete. Processing sections...');
    const anishMap = {};
    const lines = rawData.trim().split('\n');
    
    lines.forEach(line => {
      try {
        const obj = JSON.parse(line);
        const secId = obj.section_id.trim();
        const cleanedText = formatIllustrations(cleanDescription(obj.description));
        anishMap[secId] = {
          title: obj.section_title.trim(),
          text: cleanedText
        };
      } catch (e) {
        // Skip malformed lines
      }
    });
    
    let updatedCount = 0;
    
    // Iterate over IEA chapters and sections
    iea.chapters.forEach(chap => {
      chap.sections.forEach(sec => {
        const secNum = sec.number.trim();
        if (anishMap[secNum]) {
          sec.text = anishMap[secNum].text;
          updatedCount++;
        }
      });
    });
    
    fs.writeFileSync(ieaPath, JSON.stringify(iea, null, 2), 'utf8');
    console.log(`Successfully enriched ${updatedCount} sections of the Indian Evidence Act!`);
  });
}).on('error', (err) => {
  console.error(`Network error: ${err.message}`);
});
