const fs = require('fs');

const html = fs.readFileSync('C:/Users/Ankes/.gemini/antigravity/brain/652dfe04-73a1-4a65-a8ce-bbb2341ce48b/.system_generated/steps/2363/content.md', 'utf8');

// Helper to clean HTML tags and entities
function cleanText(text) {
  return text
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

// Extract paragraphs
const pMatches = html.match(/<(p|td|div)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
console.log('Total paragraphs/cells:', pMatches.length);

const rules = [];
let currentRule = null;

for (let i = 0; i < pMatches.length; i++) {
  const innerHTML = pMatches[i].replace(/^<(p|td|div)[^>]*>|<\/\1>$/gi, '').trim();
  const cleaned = cleanText(innerHTML);
  if (!cleaned) continue;

  // Let's check if this is a rule header
  // Example: 1. Summons.- or [2. Copy of plaint annexed to summons.- or 9A. Summons given to the plaintiff for service.
  // We look for a line starting with a number and dot, followed by a title, and ending with a dot-dash or just containing bold text
  // Let's inspect if the innerHTML contains bold text at the beginning
  const isBoldHeader = innerHTML.includes('<b>') || innerHTML.includes('<strong>');
  
  // Regex to match "Rule Number. Rule Title" at the start
  // It can have footnotes like <sup>1</sup> or brackets like [ or 1[(1) etc.
  // So let's strip HTML tags from a prefix of the text first to check if it matches "X. Title"
  const headerMatch = cleaned.match(/^\[?(\d+[A-Z]?)\.\s+([^.-]+?)(?:\.-|\.-|\.?-|.-|:|$)/);
  
  if (isBoldHeader && headerMatch) {
    const num = headerMatch[1];
    let title = headerMatch[2].trim();
    // Clean brackets from title if any
    title = title.replace(/[\[\]]/g, '').trim();
    
    // Save previous rule
    if (currentRule) {
      rules.push(currentRule);
    }
    
    currentRule = {
      number: num,
      title: title,
      paragraphs: []
    };
    
    // Let's check if there's any remaining text in this paragraph after the title
    const headerPrefix = headerMatch[0];
    const remainingInHeader = cleaned.substring(headerPrefix.length).trim();
    if (remainingInHeader) {
      currentRule.paragraphs.push(remainingInHeader);
    }
  } else {
    // It's a body paragraph
    if (currentRule) {
      // Ignore footnotes and state amendment titles if we want, or keep them.
      // Usually, state amendment headers contain "STATE AMENDMENT" or "Jammu and Kashmir" etc.
      // Let's filter out footnotes like "1. Subs. by..." or "2. Subs. by..." if they are at the end
      if (cleaned.match(/^\d+\.\s+Subs\.\s+by/i) || cleaned.match(/^\d+\.\s+Ins\.\s+by/i) || cleaned.match(/^\*\.\s+Shall\s+be/i)) {
        // footnote, ignore or keep. Let's ignore it to keep rules clean
        continue;
      }
      
      // Also check if it's a state amendment header
      if (cleaned === 'STATE AMENDMENT' || cleaned.includes('STATE AMENDMENTS') || cleaned.match(/^[A-Za-z\s]+(UTs|State|and|Union|Territory|Territories)?\.-/i)) {
        // We can append it as a paragraph to the current rule
        currentRule.paragraphs.push(`State Amendment: ${cleaned}`);
        continue;
      }
      
      currentRule.paragraphs.push(cleaned);
    }
  }
}

if (currentRule) {
  rules.push(currentRule);
}

// Format rule text by joining paragraphs
rules.forEach(r => {
  r.text = r.paragraphs.join('\n\n');
  delete r.paragraphs;
});

console.log('Parsed rules:', rules.length);
console.log(JSON.stringify(rules.slice(0, 5), null, 2));
console.log('Last rule:', JSON.stringify(rules[rules.length - 1], null, 2));
