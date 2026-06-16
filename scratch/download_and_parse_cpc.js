const fs = require('fs');
const path = require('path');

const targetPath = 'c:/AI project/lexastra/data/bare-acts/cpc-rules.json';

const orderMapping = [
  { file: 'orderI.php', number: 'Order I', title: 'Parties to Suits' },
  { file: 'orderII.php', number: 'Order II', title: 'Frame of Suit' },
  { file: 'orderIII.php', number: 'Order III', title: 'Recognised Agents and Pleaders' },
  { file: 'orderIV.php', number: 'Order IV', title: 'Institution of Suits' },
  { file: 'orderV.php', number: 'Order V', title: 'Issue and Service of Summons' },
  { file: 'orderVI.php', number: 'Order VI', title: 'Pleadings Generally' },
  { file: 'orderVII.php', number: 'Order VII', title: 'Plaint' },
  { file: 'orderVIII.php', number: 'Order VIII', title: 'Written Statement, Set-off and Counter-claim' },
  { file: 'orderIX.php', number: 'Order IX', title: 'Appearance of Parties and Consequence of Non-appearance' },
  { file: 'orderX.php', number: 'Order X', title: 'Examination of Parties by the Court' },
  { file: 'orderXI.php', number: 'Order XI', title: 'Discovery and Inspection' },
  { file: 'orderXII.php', number: 'Order XII', title: 'Admissions' },
  { file: 'orderXIII.php', number: 'Order XIII', title: 'Production, Impounding and Return of Documents' },
  { file: 'orderXIV.php', number: 'Order XIV', title: 'Settlement of Issues and Determination of Suit on Issues of Law or on Agreement' },
  { file: 'orderXV.php', number: 'Order XV', title: 'Disposal of the Suit at the First Hearing' },
  { file: 'orderXVI.php', number: 'Order XVI', title: 'Summoning and Attendance of Witnesses' },
  { file: 'orderXVII.php', number: 'Order XVII', title: 'Adjournments' },
  { file: 'orderXVIII.php', number: 'Order XVIII', title: 'Hearing of the Suit and Examination of Witnesses' },
  { file: 'orderXIX.php', number: 'Order XIX', title: 'Affidavits' },
  { file: 'orderXX.php', number: 'Order XX', title: 'Judgment and Decree' },
  { file: 'orderXXI.php', number: 'Order XXI', title: 'Execution of Decrees and Orders' },
  { file: 'orderXXII.php', number: 'Order XXII', title: 'Death, Marriage and Insolvency of Parties' },
  { file: 'orderXXIII.php', number: 'Order XXIII', title: 'Withdrawal and Adjustment of Suits' },
  { file: 'orderXXIV.php', number: 'Order XXIV', title: 'Payment into Court' },
  { file: 'orderXXV.php', number: 'Order XXV', title: 'Security for Costs' },
  { file: 'orderXXVI.php', number: 'Order XXVI', title: 'Commissions' },
  { file: 'orderXXVII.php', number: 'Order XXVII', title: 'Suits by or against the Government or Public Officers in their official capacity' },
  { file: 'orderXXVIIA.php', number: 'Order XXVII-A', title: 'Suits Involving a Substantial Question of Law as to the Interpretation of the Constitution' },
  { file: 'orderXXVIII.php', number: 'Order XXVIII', title: 'Suits by or against Military or Naval Men or Airmen' },
  { file: 'orderXXIX.php', number: 'Order XXIX', title: 'Suits by or against Corporations' },
  { file: 'orderXXX.php', number: 'Order XXX', title: 'Suits by or against Firms and Persons carrying on business in names other than their own' },
  { file: 'orderXXXI.php', number: 'Order XXXI', title: 'Suits by or against Trustees, Executors and Administrators' },
  { file: 'orderXXXII.php', number: 'Order XXXII', title: 'Suits by or against Minors and Persons of Unsound Mind' },
  { file: 'orderXXXIII.php', number: 'Order XXXIII', title: 'Suits by Indigent Persons' },
  { file: 'orderXXXIV.php', number: 'Order XXXIV', title: 'Suits Relating to Mortgages of Immovable Property' },
  { file: 'orderXXXV.php', number: 'Order XXXV', title: 'Interpleader' },
  { file: 'orderXXXVI.php', number: 'Order XXXVI', title: 'Special Case' },
  { file: 'orderXXXVII.php', number: 'Order XXXVII', title: 'Summary Procedure' },
  { file: 'orderXXXVIII.php', number: 'Order XXXVIII', title: 'Arrest and Attachment before Judgment' },
  { file: 'orderXXXIX.php', number: 'Order XXXIX', title: 'Temporary Injunctions and Interlocutory Orders' },
  { file: 'orderXL.php', number: 'Order XL', title: 'Appointment of Receivers' },
  { file: 'orderXLI.php', number: 'Order XLI', title: 'Appeals from Original Decrees' },
  { file: 'orderXLII.php', number: 'Order XLII', title: 'Appeals from Appellate Decrees' },
  { file: 'orderXLIII.php', number: 'Order XLIII', title: 'Appeals from Orders' },
  { file: 'orderXLIV.php', number: 'Order XLIV', title: 'Appeals by Indigent Persons' },
  { file: 'orderXLV.php', number: 'Order XLV', title: 'Appeals to the Supreme Court' },
  { file: 'orderXLVI.php', number: 'Order XLVI', title: 'Reference' },
  { file: 'orderXLVII.php', number: 'Order XLVII', title: 'Review' },
  { file: 'orderXLVIII.php', number: 'Order XLVIII', title: 'Miscellaneous' },
  { file: 'orderXLIX.php', number: 'Order XLIX', title: 'Chartered High Courts' },
  { file: 'orderL.php', number: 'Order L', title: 'Provincial Small Cause Courts' },
  { file: 'orderLI.php', number: 'Order LI', title: 'Presidency Small Cause Courts' }
];

const customOrders = [
  {
    number: 'Order XVI-A',
    title: 'Attendance of Witnesses Confined or Detained in Prisons',
    rules: [
      {
        number: '1',
        title: 'Definitions',
        text: 'In this Order,—\n(a) "detained" includes detained under any law providing for preventive detention;\n(b) "prison" includes—\n(i) any place which has been declared by the State Government, by general or special order, to be a subsidiary jail; and\n(ii) any reformatory, borstal institution or other institution of a like nature.'
      },
      {
        number: '2',
        title: 'Power to require attendance of prisoners to give evidence',
        text: 'Where it appears to a Court that the evidence of a person confined or detained in a prison within the State is material in a suit, the Court may make an order requiring the officer in charge of the prison to produce that person before the Court to give evidence:\n\nProvided that, if the distance from the prison to the court-house is more than twenty-five kilometres, no such order shall be made except with the previous sanction of the State Government.'
      },
      {
        number: '3',
        title: 'Expenses to be paid into Court',
        text: '(1) Before making any order under rule 2, the Court shall require the party at whose instance or for whose benefit the order is to be made, to pay into Court such sum of money as appears to the Court to be sufficient to defray the expenses of the journey of the prisoner and of the escort, if any, accompanying him.\n\n(2) Where the prisoner is confined or detained in a prison in another State, the Court shall, before making the order, require the party to pay into Court such sum of money as appears to the Court to be sufficient to defray the expenses of the journey of the prisoner and of the escort, if any, accompanying him, in accordance with the rules, if any, made by the State Government in this behalf.'
      },
      {
        number: '4',
        title: 'Power of State Government to exclude certain persons from the operation of rule 2',
        text: '(1) The State Government may, at any time, by notification in the Official Gazette, direct that any person or class of persons shall not be removed from the prison in which he or they may be confined or detained, and thereupon, so long as the notification remains in force, no order made under rule 2 shall have effect in respect of such person or class of persons.\n\n(2) Before making any order under sub-rule (1), the State Government shall have regard to—\n(a) the nature of the offence for which the person or class of persons has been ordered to be confined or detained;\n(b) the likelihood of the disturbance of public order if the person or class of persons is allowed to be removed from the prison; and\n(c) the public interest, generally.'
      },
      {
        number: '5',
        title: 'Officer in charge of prison to abstain from carrying out order in certain cases',
        text: 'Where the person in respect of whom an order is made under rule 2—\n(a) is certified by the medical officer attached to the prison as unfit to be removed from the prison by reason of sickness or infirmity; or\n(b) is under committal for trial or under remand pending trial or pending a preliminary investigation; or\n(c) is in custody for a period which would expire before the expiration of the time required for complying with the order and for taking him back to the prison in which he is confined or detained; or\n(d) is a person to whom an order made by the State Government under rule 4 applies,\nthe officer in charge of the prison shall abstain from carrying out the Court\'s order and shall send to the Court a statement of reasons for so abstaining.'
      },
      {
        number: '6',
        title: 'Prisoner to be brought to Court in custody',
        text: 'Save as otherwise provided in this Order, the officer in charge of the prison shall cause the person named in the order to be brought to the Court at the time and place mentioned in the order, and shall cause him to be kept in custody in or near the Court until he has been examined or until the Court authorises him to be taken back to the prison.'
      },
      {
        number: '7',
        title: 'Power to issue commission for examination of witness in prison',
        text: '(1) Where it appears to the Court that the evidence of a person confined or detained in a prison is material in a suit, and that he cannot be produced before the Court by reason of any of the circumstances mentioned in rule 4 or rule 5, or that the distance from the prison to the court-house is more than twenty-five kilometres, the Court may, on the application of any party or of its own motion, issue a commission for the examination of such person in the prison.\n\n(2) The provisions of Order XXVI, so far as they may be applicable, shall apply to the execution of any commission issued under this rule.'
      }
    ]
  },
  {
    number: 'Order XX-A',
    title: 'Costs',
    rules: [
      {
        number: '1',
        title: 'Provisions relating to certain items',
        text: 'Without prejudice to the generality of the provisions of this Code relating to costs, the Court may award costs in respect of,—\n(a) expenses incurred on giving notice required to be given by law before the institution of the suit;\n(b) expenses incurred on writing to the duplicate of any document required to be filed;\n(c) expenses incurred on the preparation of typescript or photocopy of pleadings, where the pleading is typescript or photocopy;\n(d) expenses incurred on the service of process or notice by the party;\n(e) expenses incurred on the production of documents or witnesses, where the documents or witnesses are material to the suit.'
      },
      {
        number: '2',
        title: 'Costs to be awarded in accordance with the rules made by High Court',
        text: '(1) Costs under this Order shall be awarded in accordance with such rules as the High Court may from time to time make in this behalf.\n\n(2) The rules made by the High Court under sub-rule (1) shall be laid before the State Legislature.'
      }
    ]
  },
  {
    number: 'Order XXXII-A',
    title: 'Suits Relating to Matters Concerning the Family',
    rules: [
      {
        number: '1',
        title: 'Application of the Order',
        text: '(1) The provisions of this Order shall apply to suits or proceedings relating to matters concerning the family including—\n(a) a suit or proceeding for matrimonial relief, including a suit or proceeding for declaration as to the validity of a marriage or as to the matrimonial status of any person;\n(b) a suit or proceeding for a declaration as to the legitimacy of any person;\n(c) a suit or proceeding in relation to the guardianship of the person or the custody of any minor or other member of the family, under a disability;\n(d) a suit or proceeding for maintenance;\n(e) a suit or proceeding as to the validity of an adoption;\n(f) a suit or proceeding, relating to wills, intestacy and succession;\n(g) a suit or proceeding, relating to partition or other matter, for the purpose of ensuring that the family, as a unit, is kept together;\n(h) any other suit or proceeding, which, in the opinion of the Court, is of such a nature that the provisions of this Order should apply.\n\n(2) If the Court so directs, the provisions of this Order shall apply to any suit or proceeding, though not of a kind referred to in sub-rule (1), if the Court is of the opinion that it is necessary in the interest of justice.'
      },
      {
        number: '2',
        title: 'Proceedings to be held in camera',
        text: 'In every suit or proceeding to which this Order applies, the proceedings shall be held in camera if the Court so desires or if either party so desires.'
      },
      {
        number: '3',
        title: 'Duty of Court to make efforts for settlement',
        text: '(1) In every suit or proceeding to which this Order applies, an endeavour shall be made by the Court in the first instance, where it is possible to do so consistently with the nature and circumstances of the case, to assist the parties in arriving at a settlement in respect of the subject-matter of the suit.\n\n(2) If, in any such suit or proceeding, at any stage it appears to the Court that there is a reasonable possibility of a settlement between the parties, the Court may adjourn the proceeding for such period as it thinks fit to enable attempts to be made to effect such a settlement.\n\n(3) The power of the Court to adjourn the proceedings under sub-rule (2) shall be in addition to, and not in derogation of, any other power of the Court to adjourn the proceedings.'
      },
      {
        number: '4',
        title: 'Assistance of welfare expert',
        text: 'In every suit or proceeding to which this Order applies, it shall be open to the Court to secure the services of such person (preferably a woman where available), whether related to the parties or not, including a person professionally engaged in promoting the welfare of the family, as the Court may think fit, for the purpose of assisting the Court in discharging the functions imposed by rule 3 of this Order.'
      },
      {
        number: '5',
        title: 'Duty to inquire into facts',
        text: 'In every suit or proceeding to which this Order applies, it shall be the duty of the Court to inquire, so far as it reasonably can, into the facts and circumstances of the case, and to make every effort to satisfy itself that the claims of the parties are well founded.'
      },
      {
        number: '6',
        title: 'Family—meaning of',
        text: '(1) For the purposes of this Order, each of the following shall be treated as constituting a family, namely:—\n(a) a man and his wife living together, any child or children, being issue of theirs or of either of them, and any relation (if any) of theirs or of either of them;\n(b) a man not having a wife or not living together with his wife, any child or children, being issue of his or of either of them, and any relation (if any) of his or of either of them;\n(c) a woman not having a husband or not living together with her husband, any child or children, being issue of hers or of either of them, and any relation (if any) of hers or of either of them;\n(d) a man or woman and his or her brother, sister, ancestor or lineal descendant living with him or her;\n(e) a combination of families or members of a family as defined in clause (a), (b), (c) or (d).\n\nExplanation.—For the avoidance of doubt, it is hereby declared that—\n(i) the family unit shall be determined with reference to the date of the institution of the suit or proceeding;\n(ii) the expression "relation" includes a relation by adoption;\n(iii) a relation shall be treated as residing with the family if he resides with the family in a house or other dwelling-place, whether owned or rented by the family or not.'
      }
    ]
  }
];

function cleanText(text) {
  return text
    .replace(/<sup>[^<]*<\/sup>/gi, '') // remove superscripts
    .replace(/<[^>]+>/g, '') // strip tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, '')
    .trim();
}

function parseHTMLToRules(html, orderNum) {
  const lines = html.split('\n');
  const rules = [];
  let currentRule = null;
  let foundStart = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cleaned = cleanText(line);
    if (!cleaned) continue;

    const ordStr = orderNum.replace('-', ''); // Order XXVII-A matches ORDER XXVIIA
    if (line.toUpperCase().includes(`<b>${ordStr.toUpperCase()}</b>`) || line.toUpperCase().includes(`<b>${orderNum.toUpperCase()}</b>`)) {
      foundStart = true;
      continue;
    }
    
    if (!foundStart && cleaned.toUpperCase().includes(orderNum.toUpperCase())) {
      foundStart = true;
    }

    if (!foundStart) continue;

    // Stop at footer/links
    if (cleaned === 'Back' || cleaned === 'Index' || cleaned.includes('User Agreement') || cleaned.includes('Privacy Policy') || cleaned.includes('Powered by')) {
      if (currentRule) {
        rules.push(currentRule);
        currentRule = null;
      }
      break;
    }

    // Check if this is a rule header
    const isBoldHeader = line.includes('<b>') || line.includes('<strong>');
    
    const cleanedNoBrackets = cleaned.replace(/[\[\]]/g, '').trim();
    // Match rule numbers like 1, 2, 9A, 10, etc.
    const headerMatch = cleanedNoBrackets.match(/^(\d+[A-Z]?)\.\s+([^.-]+?)(?:\.-|\.-|\.?-|.-|:|$)/);

    if (isBoldHeader && headerMatch) {
      const num = headerMatch[1];
      let title = headerMatch[2].trim();
      title = title.replace(/[\[\]]/g, '').trim();

      if (currentRule) {
        rules.push(currentRule);
      }

      currentRule = {
        number: num,
        title: title,
        paragraphs: []
      };

      const cleanedLineNoBrackets = cleaned.replace(/[\[\]]/g, '').trim();
      const remaining = cleanedLineNoBrackets.substring(headerMatch[0].length).trim();
      if (remaining) {
        currentRule.paragraphs.push(remaining);
      }
    } else {
      if (currentRule) {
        // Skip footnote sources
        if (cleaned.match(/^\d+\.\s+Subs\.\s+by/i) || cleaned.match(/^\d+\.\s+Ins\.\s+by/i) || cleaned.match(/^\*\.\s+Shall\s+be/i) || cleaned.match(/^\d+\.\s+Omitted\s+by/i) || cleaned.match(/^\d+\.\s+Rep\.\s+by/i) || cleaned.includes('Subs. by Act') || cleaned.includes('Ins. by Act')) {
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

  return rules;
}

// Convert Roman numerals to value for sorting
function romanToVal(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50 };
  let val = 0;
  // Strip Order suffix
  const r = roman.replace('Order ', '').trim();
  
  // Custom suffix check like XXVII-A
  let suffix = 0;
  let baseRoman = r;
  if (r.endsWith('-A')) {
    suffix = 0.5;
    baseRoman = r.substring(0, r.length - 2);
  } else if (r.endsWith('A')) {
    suffix = 0.5;
    baseRoman = r.substring(0, r.length - 1);
  }
  
  for (let i = 0; i < baseRoman.length; i++) {
    const current = map[baseRoman[i]];
    const next = map[baseRoman[i+1]];
    if (next && current < next) {
      val -= current;
    } else {
      val += current;
    }
  }
  return val + suffix;
}

async function scrapeAllOrders() {
  console.log('--- Starting CPC First Schedule Scraping and Rebuilding ---');
  const results = [];

  // Add custom rules first
  for (const ord of customOrders) {
    results.push(ord);
    console.log(`Loaded custom ${ord.number} with ${ord.rules.length} rules.`);
  }

  // Fetch and parse the rest
  for (const mapping of orderMapping) {
    const url = `https://www.advocatekhoj.com/library/bareacts/codeofcivilprocedure/${mapping.file}`;
    console.log(`Fetching ${mapping.number} (${mapping.title}) from ${url}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const html = await res.text();
      const rules = parseHTMLToRules(html, mapping.number);
      
      if (rules.length === 0) {
        console.warn(`⚠️ Warning: No rules parsed for ${mapping.number}!`);
      } else {
        console.log(`✅ Parsed ${rules.length} rules for ${mapping.number}.`);
      }
      
      results.push({
        number: mapping.number,
        title: mapping.title,
        rules: rules
      });

      // 100ms delay to be polite
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`❌ Error fetching/parsing ${mapping.number}:`, err.message);
      process.exit(1);
    }
  }

  // Sort all orders numerically
  results.sort((a, b) => romanToVal(a.number) - romanToVal(b.number));

  // Verify that we have all 55 Orders
  console.log(`\nRebuild summary:`);
  console.log(`Total Orders in database: ${results.length}`);
  
  let totalRules = 0;
  let emptyOrders = [];
  results.forEach(o => {
    totalRules += o.rules.length;
    if (o.rules.length === 0) emptyOrders.push(o.number);
  });
  console.log(`Total rules in database: ${totalRules}`);

  if (emptyOrders.length > 0) {
    console.error('❌ Error: The following orders have 0 rules:', emptyOrders);
    process.exit(1);
  }

  // Save to target file
  fs.writeFileSync(targetPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`🎉 SUCCESS: Verbatim cpc-rules.json has been written to ${targetPath}!`);
}

scrapeAllOrders();
