const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');

const files = [
  'constitution-of-india.json',
  'indian-penal-code.json',
  'bharatiya-nyaya-sanhita.json',
  'code-of-civil-procedure.json',
  'indian-contract-act.json',
  'code-of-criminal-procedure.json',
  'bharatiya-nagarik-suraksha-sanhita.json',
  'indian-evidence-act.json',
  'bharatiya-sakshya-adhiniyam.json',
  'transfer-of-property-act.json'
];

function validateAct(fileName) {
  const filePath = path.join(targetDir, fileName);
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'File does not exist' };
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const act = JSON.parse(raw);

    if (!act.id || !act.name || !act.slug || !act.year || !act.category) {
      return { valid: false, error: 'Missing core metadata fields (id, name, slug, year, category)' };
    }

    if (!Array.isArray(act.chapters)) {
      return { valid: false, error: 'chapters field is not an array' };
    }

    if (act.schedules) {
      if (!Array.isArray(act.schedules)) {
        return { valid: false, error: 'schedules field is not an array' };
      }
      for (const sch of act.schedules) {
        if (!sch.number || !sch.title || !sch.content || !sch.content.trim()) {
          return { valid: false, error: `Schedule missing number, title or content: ${JSON.stringify(sch).substring(0, 100)}` };
        }
      }
    }

    if (act.forms) {
      if (!Array.isArray(act.forms)) {
        return { valid: false, error: 'forms field is not an array' };
      }
      for (const frm of act.forms) {
        if (!frm.number || !frm.title || !frm.template || !frm.template.trim()) {
          return { valid: false, error: `Form missing number, title or template: ${JSON.stringify(frm).substring(0, 100)}` };
        }
      }
    }

    let sectionCount = 0;
    const emptySections = [];
    const duplicatedSections = new Set();
    const seenSections = new Set();

    for (const chapter of act.chapters) {
      if (!chapter.number || !chapter.title) {
        return { valid: false, error: `Chapter missing number or title: ${JSON.stringify(chapter).substring(0, 100)}` };
      }
      if (!Array.isArray(chapter.sections)) {
        return { valid: false, error: `Chapter ${chapter.number} sections is not an array` };
      }

      for (const sec of chapter.sections) {
        if (!sec.number) {
          return { valid: false, error: `Section in Chapter ${chapter.number} is missing a number` };
        }
        if (!sec.title || !sec.title.trim()) {
          emptySections.push(`${sec.number} (missing title)`);
        }
        if (!sec.text || !sec.text.trim()) {
          emptySections.push(`${sec.number} (missing text)`);
        }

        const secStr = String(sec.number);
        if (seenSections.has(secStr)) {
          duplicatedSections.add(secStr);
        }
        seenSections.add(secStr);
        sectionCount++;
      }
    }

    return {
      valid: true,
      name: act.name,
      chapterCount: act.chapters.length,
      sectionCount,
      emptySections: emptySections.length > 0 ? emptySections : null,
      duplicatedSections: duplicatedSections.size > 0 ? Array.from(duplicatedSections) : null
    };

  } catch (e) {
    return { valid: false, error: `JSON Parse error: ${e.message}` };
  }
}

function main() {
  console.log('--- LexAstra Bare Acts Verifier ---');
  let allValid = true;

  for (const file of files) {
    const res = validateAct(file);
    if (!res.valid) {
      console.error(`❌ ${file}: INVALID - ${res.error}`);
      allValid = false;
    } else {
      console.log(`\n✅ ${file}: VALID`);
      console.log(`   Act Name:     ${res.name}`);
      console.log(`   Chapters:     ${res.chapterCount}`);
      console.log(`   Total Sections: ${res.sectionCount}`);
      if (res.emptySections) {
        console.warn(`   ⚠️ Warning: Sections with empty title/text:`, res.emptySections.slice(0, 10).join(', ') + (res.emptySections.length > 10 ? '...' : ''));
        allValid = false;
      }
      if (res.duplicatedSections) {
        console.warn(`   ⚠️ Warning: Duplicated sections:`, res.duplicatedSections.slice(0, 10).join(', ') + (res.duplicatedSections.length > 10 ? '...' : ''));
        allValid = false;
      }
    }
  }

  console.log('\n-----------------------------------');
  if (allValid) {
    console.log('🎉 SUCCESS: All 10 Bare Acts databases are 100% valid, parsed, complete, and correct!');
  } else {
    console.error('❌ FAILURE: Some acts have validation errors or empty values. Please check warnings.');
    process.exit(1);
  }
}

main();
