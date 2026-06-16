const cleanTitle = 'Courts by which offences are triable';
const number = '21';
const text = `Subject to the other provisions of this Sanhita,-
(a) any offence under the Bharatiya Nyaya Sanhita (45 of 1860) may be tried by-
		the High Court, or
		the Court of Session, or
		any other Court by which such offence is shown in the First Schedule to be triable;
	Provided that any offence under section 376... shall be tried... presided over by a woman.
any offence under any other law shall, when any Court is mentioned in this behalf in such law, be tried by such Court and when no Court is so mentioned, may be tried by.-
		the High Court, or
		any other Court by which such offence is shown in the First Schedule to be triable.
1 Criminal Law (Amendment) Act, 2018`;

function stripSectionPrefix(text, number, title) {
  let clean = text.trim();
  const cleanTitle = title.replace(/\\(Corresponding to Sec.*\\)/i, '').trim();
  const titleEscaped = cleanTitle.replace(/[-\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&').replace(/\\s+/g, '\\\\s+');
  const regex = new RegExp('^' + number + '\\\\s*\\\\.\\\\s*' + titleEscaped + '\\\\s*([\\\\.\\\\-—–~•]{1,3})\\\\s*', 'i');
  if (regex.test(clean)) {
    clean = clean.replace(regex, '');
  } else {
    const fallbackRegex = new RegExp('^' + number + '\\\\s*\\\\.\\\\s*[^\\\\.\\\\-—–]{3,100}?[\\\\.\\\\-—–]{1,3}\\\\s*');
    clean = clean.replace(fallbackRegex, '');
  }
  return clean.trim();
}

function formatSectionText(text, number, title) {
  if (!text) return '';
  
  let cleanText = stripSectionPrefix(text, number, title);
  cleanText = cleanText.replace(/\\r/g, '');

  cleanText = cleanText.replace(/([.\\w;])\\s*(Provided\\s+that)/g, '$1\\n\\n$2');
  cleanText = cleanText.replace(/([.\\w;])\\s*(Provided\\s+further\\s+that)/g, '$1\\n\\n$2');
  cleanText = cleanText.replace(/([.\\w;])\\s*(Explanation\\s+\\d*|Explanation[s]?\\b)/g, '$1\\n\\n$2');
  cleanText = cleanText.replace(/([.\\w;])\\s*(Illustration[s]?\\b)/g, '$1\\n\\n$2');

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

  const formattedParagraphs = [];
  let subIndex = 1;
  let clauseIndex = 0;
  let romanIndex = 1;
  let lastLevel = 0;
  
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

  let normalParagraphsCount = 0;
  for (let p of paragraphs) {
    if (p.level > 0) continue;
    
    const lower = p.text.toLowerCase();
    const isSpecial = 
      lower.startsWith('provided') ||
      lower.startsWith('explanation') ||
      lower.startsWith('illustration') ||
      lower.startsWith('note') ||
      lower.startsWith('exception') ||
      lower.startsWith('saving') ||
      /^\\d+\\s+[A-Za-z]/.test(p.text);

    const firstChar = p.text.charAt(0);
    const isLowercase = firstChar >= 'a' && firstChar <= 'z';

    if (!isSpecial && !isLowercase) {
      normalParagraphsCount++;
    }
  }
  const shouldNumber = normalParagraphsCount > 1;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textStr = p.text;
    const lower = textStr.toLowerCase();
    const firstChar = textStr.charAt(0);
    const isLowercase = firstChar >= 'a' && firstChar <= 'z';
    const isFootnote = /^\\d+\\s+[A-Za-z]/.test(textStr);

    const isSpecial = 
      lower.startsWith('provided') ||
      lower.startsWith('explanation') ||
      lower.startsWith('illustration') ||
      lower.startsWith('note') ||
      lower.startsWith('exception') ||
      lower.startsWith('saving') ||
      isFootnote;

    if (p.level !== lastLevel) {
      if (p.level > lastLevel) {
        romanIndex = 1;
      }
      lastLevel = p.level;
    }

    const alreadyMarked = /^\\(\\d+\\)/.test(textStr) || /^\\([a-z]\\)/.test(textStr) || /^\\([ivx]+\\)/.test(textStr) || /^\\d+\\s*[\\.\\-—]/.test(textStr);

    if (alreadyMarked || isFootnote) {
      formattedParagraphs.push(textStr);
      if (textStr.startsWith('(a)')) {
        clauseIndex = 1;
      }
    } else if (p.level >= 2 || (p.level === 1 && isLowercase && formattedParagraphs[formattedParagraphs.length - 1]?.includes('may be tried by—'))) {
      formattedParagraphs.push(`(${toRoman(romanIndex)}) ${textStr}`);
      romanIndex++;
    } else if (isLowercase || (p.level === 1 && !isSpecial)) {
      const letter = String.fromCharCode(97 + clauseIndex);
      formattedParagraphs.push(`(${letter}) ${textStr}`);
      clauseIndex++;
    } else if (shouldNumber && p.level === 0 && !isSpecial) {
      formattedParagraphs.push(`(${subIndex}) ${textStr}`);
      subIndex++;
      clauseIndex = 0;
    } else {
      formattedParagraphs.push(textStr);
      if (p.level === 0 && !isSpecial) {
        clauseIndex = 0;
      }
    }
  }

  return formattedParagraphs.join('\n\n');
}

console.log(formatSectionText(text, number, cleanTitle));
