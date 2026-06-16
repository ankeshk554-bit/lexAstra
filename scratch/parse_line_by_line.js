const fs = require('fs');

const html = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2363/content.md', 'utf8');

function cleanText(text) {
  return text
    .replace(/<sup>[^<]*<\/sup>/gi, '') // remove superscripts before stripping tags
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .trim();
}

const lines = html.split('\n');
const rules = [];
let currentRule = null;
let foundStart = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cleaned = cleanText(line);
  if (!cleaned) continue;

  if (line.includes('<b>ORDER V</b>')) {
    foundStart = true;
    continue;
  }
  
  if (!foundStart && cleaned.includes('ORDER V')) {
    foundStart = true;
  }

  if (!foundStart) continue;

  // Check for footer to stop
  if (cleaned === 'Back' || cleaned === 'Index' || cleaned.includes('User Agreement') || cleaned.includes('Privacy Policy') || cleaned.includes('Powered by')) {
    if (currentRule) {
      rules.push(currentRule);
      currentRule = null;
    }
    break;
  }

  // Check if this is a rule header
  const isBoldHeader = line.includes('<b>') || line.includes('<strong>');
  
  // Clean brackets from cleaned for header matching
  const cleanedNoBrackets = cleaned.replace(/[\[\]]/g, '').trim();
  const headerMatch = cleanedNoBrackets.match(/^(\d+[A-Z]?)\.\s+([^.-]+?)(?:\.-|\.-|\.?-|.-|:|$)/);

  if (isBoldHeader && headerMatch) {
    const num = headerMatch[1];
    let title = headerMatch[2].trim();

    if (currentRule) {
      rules.push(currentRule);
    }

    currentRule = {
      number: num,
      title: title,
      paragraphs: []
    };

    // Remaining text on same line
    const cleanedLineNoBrackets = cleaned.replace(/[\[\]]/g, '').trim();
    const remaining = cleanedLineNoBrackets.substring(headerMatch[0].length).trim();
    if (remaining) {
      currentRule.paragraphs.push(remaining);
    }
  } else {
    if (currentRule) {
      // Check for footnotes to skip
      if (cleaned.match(/^\d+\.\s+Subs\.\s+by/i) || cleaned.match(/^\d+\.\s+Ins\.\s+by/i) || cleaned.match(/^\*\.\s+Shall\s+be/i) || cleaned.match(/^\d+\.\s+Omitted\s+by/i) || cleaned.match(/^\d+\.\s+Rep\.\s+by/i)) {
        continue;
      }
      
      currentRule.paragraphs.push(cleaned);
    }
  }
}

if (currentRule) {
  rules.push(currentRule);
}

rules.forEach(r => {
  r.text = r.paragraphs.join('\n\n')
    .replace(/^\[|\]$/g, '')
    .trim();
  delete r.paragraphs;
});

console.log('Parsed rules count:', rules.length);
console.log('Sample rules:');
rules.forEach(r => {
  console.log(`Rule ${r.number}: ${r.title} (${r.text.substring(0, 100)}...)`);
});
