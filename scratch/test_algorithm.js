const fs = require('fs');
const crpc = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/code-of-criminal-procedure.json', 'utf8'));

// Build CrPC section lookup map
const crpcMap = {};
for (const chap of crpc.chapters) {
  for (const sec of chap.sections) {
    crpcMap[String(sec.number)] = sec;
  }
}

function stripSectionPrefix(text, number, title) {
  let clean = text.trim();
  const cleanTitle = title.replace(/\(Corresponding to Sec.*\)/i, '').trim();
  const titleEscaped = cleanTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s+');
  const regex = new RegExp('^' + number + '\\s*\\.\\s*' + titleEscaped + '\\s*([\\.\\-—–~•]{1,3})\\s*', 'i');
  if (regex.test(clean)) {
    clean = clean.replace(regex, '');
  } else {
    const fallbackRegex = new RegExp('^' + number + '\\s*\\.\\s*[^\\.\\-—–]{3,100}?[\\.\\-—–]{1,3}\\s*');
    clean = clean.replace(fallbackRegex, '');
  }
  return clean.trim();
}

function toRoman(num) {
  const val = [10, 9, 5, 4, 1];
  const syb = ["x", "ix", "v", "iv", "i"];
  let roman = "";
  for (let i = 0; i < val.length; i++) {
    while (num >= val[i]) {
      roman += syb[i];
      num -= val[i];
    }
  }
  return roman;
}

function formatSectionText(text, number, title) {
  if (!text) return '';
  
  let cleanText = stripSectionPrefix(text, number, title);
  cleanText = cleanText.replace(/\r/g, '').trim();

  // Add newlines before "Provided that" and "Provided further that" if they are glued to sentences
  cleanText = cleanText.replace(/([.\w;])\s*(Provided\s+that)/g, '$1\n\n$2');
  cleanText = cleanText.replace(/([.\w;])\s*(Provided\s+further\s+that)/g, '$1\n\n$2');
  cleanText = cleanText.replace(/([.\w;])\s*(Explanation\s+\d*|Explanation[s]?\b)/g, '$1\n\n$2');
  cleanText = cleanText.replace(/([.\w;])\s*(Illustration[s]?\b)/g, '$1\n\n$2');

  const lines = cleanText.split('\n');
  const paragraphs = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    let level = 0;
    let matchTabs = line.match(/^(\t+)/);
    if (matchTabs) {
      level = matchTabs[1].length;
    } else {
      let matchSpaces = line.match(/^(\s+)/);
      if (matchSpaces) {
        level = Math.floor(matchSpaces[1].length / 2);
      }
    }
    
    paragraphs.push({
      text: trimmed,
      level: level
    });
  }

  // Find unique levels > 0 in this section
  const uniqueLevels = [...new Set(paragraphs.filter(p => p.level > 0).map(p => p.level))].sort((a, b) => a - b);

  const formattedParagraphs = [];
  
  // Track numbering state
  const firstPara = paragraphs[0];
  const firstParaLower = firstPara ? firstPara.text.toLowerCase() : '';
  const firstParaIsSpecial = firstParaLower.startsWith('provided') || firstParaLower.startsWith('explanation') || firstParaLower.startsWith('illustration') || /^\d+\s+[A-Za-z]/.test(firstPara ? firstPara.text : '');
  const hasRootIntro = firstPara && firstPara.level === 0 && !firstParaIsSpecial;
  
  let subSectionIndex = hasRootIntro ? 2 : 1;
  
  // Stack to track active hierarchy path
  const stack = [{ level: -1, type: 'root', clauseIndex: 0, romanIndex: 1 }];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textStr = p.text;
    const lower = textStr.toLowerCase();
    const firstChar = textStr.charAt(0);
    const isLowercase = firstChar >= 'a' && firstChar <= 'z';
    const isFootnote = /^\d+\s+[A-Za-z]/.test(textStr);

    const isSpecial = 
      lower.startsWith('provided') ||
      lower.startsWith('explanation') ||
      lower.startsWith('illustration') ||
      lower.startsWith('note') ||
      lower.startsWith('exception') ||
      lower.startsWith('saving') ||
      isFootnote;

    // Check if it already has a prefix like (1), (a), (i), 1., 2A., a)
    const alreadyMarked = /^\(\d+\)/.test(textStr) || /^\([a-z]\)/.test(textStr) || /^\([ivx]+\)/.test(textStr) || /^\d+[A-Z]?\s*[\.\-—]/i.test(textStr) || /^[a-z]\)\s*/.test(textStr);

    if (isSpecial || alreadyMarked) {
      formattedParagraphs.push(textStr);
      
      // Sync stack indices if we see explicit markings
      if (textStr.startsWith('(a)')) {
        const top = stack[stack.length - 1];
        if (top) top.clauseIndex = 1;
      } else if (/^\(\d+\)/.test(textStr)) {
        const num = parseInt(textStr.match(/^\((\d+)\)/)[1], 10);
        subSectionIndex = num + 1;
      }
      continue;
    }

    // Pop from stack until we find a parent level < current level
    while (stack.length > 1 && stack[stack.length - 1].level >= p.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (p.level === 0) {
      // Root level paragraph
      // If there are no other levels in this section, and there are multiple paragraphs,
      // we can number them as sub-sections.
      const hasOtherLevels = uniqueLevels.length > 0;
      const normalParasCount = paragraphs.filter(x => x.level === 0 && !/^\d+\s+[A-Za-z]/.test(x.text) && !x.text.toLowerCase().startsWith('provided') && !x.text.toLowerCase().startsWith('explanation') && !x.text.toLowerCase().startsWith('illustration')).length;
      
      if (!hasOtherLevels && normalParasCount > 1) {
        formattedParagraphs.push(`(${subSectionIndex}) ${textStr}`);
        subSectionIndex++;
      } else {
        formattedParagraphs.push(textStr);
      }
      
      // Push root frame if we aren't already there
      if (stack[stack.length - 1].level !== 0) {
        stack.push({ level: 0, type: 'root', clauseIndex: 0, romanIndex: 1 });
      }
    } else {
      // Indented paragraph
      // Determine what type this item should be based on its level and parent type
      let type = 'clause';
      let formattedText = textStr;

      // Special check: in CrPC, level 2 is often used for sub-sections (starts with uppercase)
      // or for clauses (starts with lowercase).
      const isLevel2SubSec = p.level === 2 && !isLowercase;

      if (isLevel2SubSec) {
        type = 'subsection';
        formattedText = `(${subSectionIndex}) ${textStr}`;
        subSectionIndex++;
      } else {
        // Normal nesting based on parent type
        if (parent.type === 'root' || parent.type === 'subsection') {
          // Under root or subsection, indented item is a clause (a, b, c)
          type = 'clause';
          const letter = String.fromCharCode(97 + parent.clauseIndex);
          formattedText = `(${letter}) ${textStr}`;
          parent.clauseIndex++;
        } else if (parent.type === 'clause') {
          // Under clause, indented item is a sub-clause (i, ii, iii)
          type = 'subclause';
          formattedText = `(${toRoman(parent.romanIndex)}) ${textStr}`;
          parent.romanIndex++;
        } else {
          // Under sub-clause, indented item is a sub-sub-clause (A, B, C)
          type = 'subsubclause';
          const letter = String.fromCharCode(65 + (parent.clauseIndex || 0)); // 65 is 'A'
          formattedText = `(${letter}) ${textStr}`;
          parent.clauseIndex = (parent.clauseIndex || 0) + 1;
        }
      }

      formattedParagraphs.push(formattedText);
      stack.push({ level: p.level, type: type, clauseIndex: 0, romanIndex: 1 });
    }
  }

  return formattedParagraphs.join('\n\n');
}

// Test against some sections
const testSecs = ['26', '41', '125', '167', '313', '374'];
for (const num of testSecs) {
  const sec = crpcMap[num];
  if (sec) {
    console.log(`\n=================== FORMATTED BNSS/CRPC SEC ${num} ===================`);
    console.log(formatSectionText(sec.text, sec.number, sec.title));
  }
}
