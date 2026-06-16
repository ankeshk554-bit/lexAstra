const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');

const crpcChapters = {
  1: 'Preliminary',
  2: 'Constitution of Criminal Courts and Offices',
  3: 'Power of Courts',
  4: 'Powers of Superior Officers of Police / Aid to the Magistrates and Police',
  5: 'Arrest of Persons',
  6: 'Processes to Compel Appearance',
  7: 'Processes to Compel the Production of Things',
  '7A': 'Reciprocal Arrangements',
  8: 'Security for Keeping the Peace and for Good Behaviour',
  9: 'Order for Maintenance of Wives, Children and Parents',
  10: 'Maintenance of Public Order and Tranquillity',
  11: 'Preventive Action of the Police',
  12: 'Information to the Police and Their Powers to Investigate',
  13: 'Jurisdiction of the Criminal Courts in Inquiries and Trials',
  14: 'Conditions Requisite for Initiation of Proceedings',
  15: 'Complaints to Magistrates',
  16: 'Commencement of Proceedings Before Magistrates',
  17: 'The Charge',
  18: 'Trial Before a Court of Session',
  19: 'Trial of Warrant-Cases by Magistrates',
  20: 'Trial of Summons-Cases by Magistrates',
  21: 'Summary Trials',
  '21A': 'Plea Bargaining',
  22: 'Attendance of Persons Confined or Detained in Prisons',
  23: 'Evidence in Inquiries and Trials',
  24: 'General Provisions as to Inquiries and Trials',
  25: 'Provisions as to Accused Persons of Unsound Mind',
  26: 'Provisions as to Offences Affecting the Administration of Justice',
  27: 'The Judgment',
  28: 'Submission of Death Sentences for Confirmation',
  29: 'Appeals',
  30: 'Reference and Revision',
  31: 'Transfer of Criminal Cases',
  32: 'Execution, Suspension, Remission and Commutation of Sentences',
  33: 'Provisions as to Bail and Bonds',
  34: 'Disposal of Property',
  35: 'Irregular Proceedings',
  36: 'Limitation for Taking Cognizance of Certain Offences',
  37: 'Miscellaneous'
};

const ieaChapters = {
  1: 'Preliminary',
  2: 'Of the Relevancy of Facts',
  3: 'Facts Which Need Not Be Proved',
  4: 'Of Oral Evidence',
  5: 'Of Documentary Evidence',
  6: 'Of the Exclusion of Oral by Documentary Evidence',
  7: 'Of the Burden of Proof',
  8: 'Estoppel',
  9: 'Of Witnesses',
  10: 'Of the Examination of Witnesses',
  11: 'Of Improper Admission and Rejection of Evidence'
};

function getCpcPart(secNum) {
  const num = parseInt(secNum, 10);
  if (isNaN(num)) return { number: 'Misc', title: 'Special Provisions' };
  if (num >= 1 && num <= 8) return { number: 'Preliminary', title: 'Preliminary Sections' };
  if (num >= 9 && num <= 35) return { number: 'I', title: 'Suits in General' };
  if (num >= 36 && num <= 74) return { number: 'II', title: 'Execution' };
  if (num >= 75 && num <= 78) return { number: 'III', title: 'Incidental Proceedings' };
  if (num >= 79 && num <= 88) return { number: 'IV', title: 'Suits in Particular Cases' };
  if (num >= 89 && num <= 93) return { number: 'V', title: 'Special Proceedings' };
  if (num >= 94 && num <= 95) return { number: 'VI', title: 'Supplemental Proceedings' };
  if (num >= 96 && num <= 112) return { number: 'VII', title: 'Appeals' };
  if (num >= 113 && num <= 115) return { number: 'VIII', title: 'Reference, Review and Revision' };
  if (num >= 116 && num <= 120) return { number: 'IX', title: 'Special Provisions Relating to the High Courts' };
  if (num >= 121 && num <= 131) return { number: 'X', title: 'Rules' };
  return { number: 'XI', title: 'Miscellaneous' };
}

function fetchFile(fileName) {
  const url = `https://raw.githubusercontent.com/civictech-India/Indian-Law-Penal-Code-Json/master/${fileName}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${fileName}, status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function romanize(num) {
  if (isNaN(num)) return num;
  const lookup = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  let i;
  let numVal = num;
  for (i in lookup) {
    while (numVal >= lookup[i]) {
      roman += i;
      numVal -= lookup[i];
    }
  }
  return roman;
}

async function main() {
  console.log('Starting Bare Acts data synchronization...');

  // 1. IPC
  try {
    console.log('Fetching Indian Penal Code (IPC)...');
    const rawIpc = await fetchFile('ipc.json');
    const chaptersMap = {};
    for (const item of rawIpc) {
      const rawChap = item.chapter;
      const chapNum = isNaN(rawChap) ? String(rawChap) : romanize(parseInt(rawChap, 10));
      const chapTitle = item.chapter_title ? item.chapter_title.toUpperCase() : `CHAPTER ${chapNum}`;
      const secNum = String(item.Section || item.section);
      const secTitle = item.section_title || 'No Title';
      const secText = item.section_desc || '';

      if (!chaptersMap[chapNum]) {
        chaptersMap[chapNum] = {
          number: chapNum,
          title: chapTitle,
          sections: []
        };
      }
      chaptersMap[chapNum].sections.push({
        number: secNum,
        title: secTitle,
        text: secText
      });
    }

    const ipcObj = {
      id: 'indian-penal-code',
      slug: 'indian-penal-code',
      name: 'The Indian Penal Code',
      year: 1860,
      sectionCount: 511,
      category: 'Criminal',
      description: 'The official criminal code of India, defining substantive offences and their punishments (replaced by BNS 2023).',
      lastUpdated: '2023-12-01',
      isNew: false,
      replacedBy: 'bharatiya-nyaya-sanhita',
      replaces: null,
      transitionNote: 'This Act is replaced by the Bharatiya Nyaya Sanhita, 2023 (BNS) with effect from July 1, 2024.',
      chapters: Object.values(chaptersMap)
    };

    fs.writeFileSync(
      path.join(targetDir, 'indian-penal-code.json'),
      JSON.stringify(ipcObj, null, 2),
      'utf8'
    );
    console.log(`Successfully compiled IPC: ${rawIpc.length} sections.`);
  } catch (err) {
    console.error('Error processing IPC:', err);
  }

  // 2. CrPC
  try {
    console.log('Fetching Code of Criminal Procedure (CrPC)...');
    const rawCrpc = await fetchFile('crpc.json');
    const chaptersMap = {};
    for (const item of rawCrpc) {
      const rawChap = item.chapter;
      const chapNum = isNaN(rawChap) ? String(rawChap) : romanize(parseInt(rawChap, 10));
      const chapTitle = crpcChapters[rawChap] ? crpcChapters[rawChap].toUpperCase() : `CHAPTER ${chapNum}`;
      const secNum = String(item.section);
      const secTitle = item.section_title || 'No Title';
      const secText = item.section_desc || '';

      if (!chaptersMap[chapNum]) {
        chaptersMap[chapNum] = {
          number: chapNum,
          title: chapTitle,
          sections: []
        };
      }
      chaptersMap[chapNum].sections.push({
        number: secNum,
        title: secTitle,
        text: secText
      });
    }

    const crpcObj = {
      id: 'code-of-criminal-procedure',
      slug: 'code-of-criminal-procedure',
      name: 'Code of Criminal Procedure',
      year: 1973,
      sectionCount: 484,
      category: 'Criminal',
      description: 'The main legislation on procedure for administration of substantive criminal law in India.',
      lastUpdated: '2023-12-01',
      isNew: false,
      replacedBy: 'bharatiya-nagarik-suraksha-sanhita',
      replaces: null,
      transitionNote: 'This Act is replaced by the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS) with effect from July 1, 2024.',
      chapters: Object.values(chaptersMap)
    };

    fs.writeFileSync(
      path.join(targetDir, 'code-of-criminal-procedure.json'),
      JSON.stringify(crpcObj, null, 2),
      'utf8'
    );
    console.log(`Successfully compiled CrPC: ${rawCrpc.length} sections.`);
  } catch (err) {
    console.error('Error processing CrPC:', err);
  }

  // 3. IEA
  try {
    console.log('Fetching Indian Evidence Act (IEA)...');
    const rawIea = await fetchFile('iea.json');
    const chaptersMap = {};
    for (const item of rawIea) {
      const rawChap = item.chapter;
      const chapNum = isNaN(rawChap) ? String(rawChap) : romanize(parseInt(rawChap, 10));
      const chapTitle = ieaChapters[rawChap] ? ieaChapters[rawChap].toUpperCase() : `CHAPTER ${chapNum}`;
      const secNum = String(item.section);
      const secTitle = item.section_title || 'No Title';
      const secText = item.section_desc || '';

      if (!chaptersMap[chapNum]) {
        chaptersMap[chapNum] = {
          number: chapNum,
          title: chapTitle,
          sections: []
        };
      }
      chaptersMap[chapNum].sections.push({
        number: secNum,
        title: secTitle,
        text: secText
      });
    }

    const ieaObj = {
      id: 'indian-evidence-act',
      slug: 'indian-evidence-act',
      name: 'Indian Evidence Act',
      year: 1872,
      sectionCount: 167,
      category: 'Criminal',
      description: 'A set of rules and allied issues governing admissibility of evidence in the Indian courts of law.',
      lastUpdated: '2023-12-01',
      isNew: false,
      replacedBy: 'bharatiya-sakshya-adhiniyam',
      replaces: null,
      transitionNote: 'This Act is replaced by the Bharatiya Sakshya Adhiniyam, 2023 (BSA) with effect from July 1, 2024.',
      chapters: Object.values(chaptersMap)
    };

    fs.writeFileSync(
      path.join(targetDir, 'indian-evidence-act.json'),
      JSON.stringify(ieaObj, null, 2),
      'utf8'
    );
    console.log(`Successfully compiled Evidence Act: ${rawIea.length} sections.`);
  } catch (err) {
    console.error('Error processing Evidence Act:', err);
  }

  // 4. CPC
  try {
    console.log('Fetching Code of Civil Procedure (CPC)...');
    const rawCpc = await fetchFile('cpc.json');
    const chaptersMap = {};
    for (const item of rawCpc) {
      const secNum = String(item.section);
      const secTitle = item.title || 'No Title';
      const secText = item.description || '';
      
      const partInfo = getCpcPart(secNum);
      const chapNum = partInfo.number;
      const chapTitle = partInfo.title.toUpperCase();

      if (!chaptersMap[chapNum]) {
        chaptersMap[chapNum] = {
          number: chapNum,
          title: chapTitle,
          sections: []
        };
      }
      chaptersMap[chapNum].sections.push({
        number: secNum,
        title: secTitle,
        text: secText
      });
    }

    // Sort chapters key order logically
    const order = ['Preliminary', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'Misc'];
    const sortedChapters = Object.values(chaptersMap).sort((a, b) => {
      return order.indexOf(a.number) - order.indexOf(b.number);
    });

    const cpcObj = {
      id: 'code-of-civil-procedure',
      slug: 'code-of-civil-procedure',
      name: 'Code of Civil Procedure',
      year: 1908,
      sectionCount: 158,
      category: 'Civil',
      description: 'The procedural law relating to the administration of civil proceedings in India.',
      lastUpdated: '2023-10-01',
      isNew: false,
      replacedBy: null,
      replaces: null,
      transitionNote: null,
      chapters: sortedChapters
    };

    fs.writeFileSync(
      path.join(targetDir, 'code-of-civil-procedure.json'),
      JSON.stringify(cpcObj, null, 2),
      'utf8'
    );
    console.log(`Successfully compiled CPC: ${rawCpc.length} sections.`);
  } catch (err) {
    console.error('Error processing CPC:', err);
  }

  console.log('Data synchronization complete!');
}

main();
