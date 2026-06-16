const fs = require('fs');
const path = require('path');

const jsonPath = 'c:/AI project/lexastra/data/bare-acts/constitution-of-india.json';
const jsPath = 'c:/AI project/lexastra/data/constitution.js';

// Read the original file
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// The flat list of sections
const flatSections = data.chapters[0].sections;

// Helper to get the base numeric value of the article (e.g. "21A" -> 21)
function getNumericPart(numStr) {
  const match = numStr.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Map article to Part number and title
function classify(numStr) {
  const num = getNumericPart(numStr);
  if (num === null) return null;
  if (num === 0) return { number: 'Preamble', title: 'Preamble' };
  
  if (num >= 1 && num <= 4) return { number: 'I', title: 'The Union and its Territory' };
  if (num >= 5 && num <= 11) return { number: 'II', title: 'Citizenship' };
  if (num >= 12 && num <= 35) return { number: 'III', title: 'Fundamental Rights' };
  
  if (numStr === '51A') return { number: 'IV-A', title: 'Fundamental Duties' };
  if (num >= 36 && num <= 51) return { number: 'IV', title: 'Directive Principles of State Policy' };
  
  if (num >= 52 && num <= 151) return { number: 'V', title: 'The Union' };
  if (num >= 152 && num <= 237) return { number: 'VI', title: 'The States' };
  if (num === 238) return { number: 'VII', title: 'The States in Part B of the First Schedule (Repealed)' };
  if (num >= 239 && num <= 242) return { number: 'VIII', title: 'The Union Territories' };
  
  if (num === 243) {
    const suffix = numStr.substring(3).trim().toUpperCase();
    if (!suffix) return { number: 'IX', title: 'The Panchayats' };
    if (suffix >= 'A' && suffix <= 'O') return { number: 'IX', title: 'The Panchayats' };
    if (suffix >= 'P' && suffix <= 'ZG') return { number: 'IX-A', title: 'The Municipalities' };
    if (suffix >= 'ZH' && suffix <= 'ZT') return { number: 'IX-B', title: 'The Co-operative Societies' };
    return { number: 'IX', title: 'The Panchayats' };
  }
  
  if (num === 244 || numStr === '244A') return { number: 'X', title: 'The Scheduled and Tribal Areas' };
  if (num >= 245 && num <= 263) return { number: 'XI', title: 'Relations between the Union and the States' };
  if (num >= 264 && num <= 300) return { number: 'XII', title: 'Finance, Property, Contracts and Suits' };
  if (num >= 301 && num <= 307) return { number: 'XIII', title: 'Trade, Commerce and Intercourse within the Territory of India' };
  
  if (numStr === '323A' || numStr === '323B') return { number: 'XIV-A', title: 'Tribunals' };
  if (num >= 308 && num <= 323) return { number: 'XIV', title: 'Services under the Union and the States' };
  
  if (num >= 324 && num <= 329) return { number: 'XV', title: 'Elections' };
  if (num >= 330 && num <= 342) return { number: 'XVI', title: 'Special Provisions Relating to Certain Classes' };
  if (num >= 343 && num <= 351) return { number: 'XVII', title: 'Official Language' };
  if (num >= 352 && num <= 360) return { number: 'XVIII', title: 'Emergency Provisions' };
  if (num >= 361 && num <= 367) return { number: 'XIX', title: 'Miscellaneous' };
  if (num === 368) return { number: 'XX', title: 'Amendment of the Constitution' };
  if (num >= 369 && num <= 392) return { number: 'XXI', title: 'Temporary, Transitional and Special Provisions' };
  if (num >= 393 && num <= 395) return { number: 'XXII', title: 'Short Title, Commencement, Authoritative Text in Hindi and Repeals' };
  
  return null;
}

// 27 official Parts definition to preserve order and structure
const partsOrder = [
  { number: 'Preamble', title: 'Preamble' },
  { number: 'I', title: 'The Union and its Territory' },
  { number: 'II', title: 'Citizenship' },
  { number: 'III', title: 'Fundamental Rights' },
  { number: 'IV', title: 'Directive Principles of State Policy' },
  { number: 'IV-A', title: 'Fundamental Duties' },
  { number: 'V', title: 'The Union' },
  { number: 'VI', title: 'The States' },
  { number: 'VII', title: 'The States in Part B of the First Schedule (Repealed)' },
  { number: 'VIII', title: 'The Union Territories' },
  { number: 'IX', title: 'The Panchayats' },
  { number: 'IX-A', title: 'The Municipalities' },
  { number: 'IX-B', title: 'The Co-operative Societies' },
  { number: 'X', title: 'The Scheduled and Tribal Areas' },
  { number: 'XI', title: 'Relations between the Union and the States' },
  { number: 'XII', title: 'Finance, Property, Contracts and Suits' },
  { number: 'XIII', title: 'Trade, Commerce and Intercourse within the Territory of India' },
  { number: 'XIV', title: 'Services under the Union and the States' },
  { number: 'XIV-A', title: 'Tribunals' },
  { number: 'XV', title: 'Elections' },
  { number: 'XVI', title: 'Special Provisions Relating to Certain Classes' },
  { number: 'XVII', title: 'Official Language' },
  { number: 'XVIII', title: 'Emergency Provisions' },
  { number: 'XIX', title: 'Miscellaneous' },
  { number: 'XX', title: 'Amendment of the Constitution' },
  { number: 'XXI', title: 'Temporary, Transitional and Special Provisions' },
  { number: 'XXII', title: 'Short Title, Commencement, Authoritative Text in Hindi and Repeals' }
];

// Initialize chapters map
const chaptersMap = {};
for (const part of partsOrder) {
  chaptersMap[part.number] = {
    number: part.number,
    title: part.title,
    sections: []
  };
}

// Distribute sections
let totalDistributed = 0;
for (const sec of flatSections) {
  const cls = classify(sec.number);
  if (cls && chaptersMap[cls.number]) {
    chaptersMap[cls.number].sections.push(sec);
    totalDistributed++;
  } else {
    console.error(`Could not classify section:`, sec.number);
  }
}

console.log(`Successfully classified ${totalDistributed} of ${flatSections.length} articles.`);

// Convert back to sorted array
const newChapters = partsOrder.map(part => chaptersMap[part.number]);

// Define the 12 Schedules in high verbatim detail
const schedules = [
  {
    number: "First Schedule",
    title: "States and Union Territories",
    content: "I. THE STATES\n\n1. Andhra Pradesh: The territory which at the commencement of this Constitution was comprised in the State of Andhra, and the territories added under the States Reorganisation Act, 1956, and Andhra Pradesh and Madras (Alteration of Boundaries) Act, 1959.\n2. Assam: The territories which immediately before the commencement of this Constitution were comprised in the Province of Assam, the Khasi States and the Assam Tribal Areas.\n3. Bihar: The territories which immediately before the commencement of this Constitution were comprised in the Province of Bihar.\n4. Gujarat: The territory which was comprised in the State of Bombay immediately before 1st May, 1960.\n5. Kerala: The territories comprised in the Travancore-Cochin State (excluding Shencottah taluk), Malabar district, and Kasaragod taluk of South Kanara district.\n6. Madhya Pradesh: The territories comprised in the State of Madhya Pradesh immediately before the States Reorganisation Act, 1956.\n7. Tamil Nadu: The territories comprised in the State of Madras immediately before the commencement of this Constitution.\n8. Maharashtra: The territories comprised in the State of Bombay immediately before 1st May, 1960 (excluding Gujarat).\n9. Karnataka: The territories comprised in the State of Mysore immediately before the States Reorganisation Act, 1956.\n10. Odisha: The territories comprised in the Province of Orissa immediately before this Constitution.\n11. Punjab: The territories comprised in the State of Punjab immediately before this Constitution.\n12. Rajasthan: The territories comprised in the State of Rajasthan immediately before the States Reorganisation Act, 1956.\n13. Uttar Pradesh: The territories comprised in the Province of United Provinces immediately before this Constitution.\n14. West Bengal: The territories comprised in the Province of West Bengal immediately before this Constitution.\n15. Jammu and Kashmir: The territory which immediately before the commencement of this Constitution was comprised in the Indian State of Jammu and Kashmir (subject to Jammu and Kashmir Reorganisation Act, 2019).\n16. Nagaland: The territories comprised in the Naga Hills-Tuensang Area.\n17. Haryana: The territories specified in the Punjab Reorganisation Act, 1966.\n18. Himachal Pradesh: The territories comprised in the Union territory of Himachal Pradesh immediately before 25th January, 1971.\n19. Manipur: The territory comprised in the Union territory of Manipur immediately before 21st January, 1972.\n20. Tripura: The territory comprised in the Union territory of Tripura immediately before 21st January, 1972.\n21. Meghalaya: The territories comprised in the autonomous State of Meghalaya immediately before 21st January, 1972.\n22. Sikkim: The territories which immediately before the Constitution (Thirty-sixth Amendment) Act, 1975, were comprised in Sikkim.\n23. Mizoram: The territories comprised in the Union territory of Mizoram immediately before the State of Mizoram Act, 1986.\n24. Arunachal Pradesh: The territories comprised in the Union territory of Arunachal Pradesh immediately before 20th February, 1987.\n25. Goa: The territories comprised in the Goa district of the Union territory of Goa, Daman and Diu.\n26. Chhattisgarh: The territories specified in the Madhya Pradesh Reorganisation Act, 2000.\n27. Uttarakhand: The territories specified in the Uttar Pradesh Reorganisation Act, 2000.\n28. Jharkhand: The territories specified in the Bihar Reorganisation Act, 2000.\n29. Telangana: The territories specified in the Andhra Pradesh Reorganisation Act, 2014.\n\nII. THE UNION TERRITORIES\n\n1. Delhi: The territory which immediately before the commencement of this Constitution was comprised in the Chief Commissioner's Province of Delhi.\n2. Andaman and Nicobar Islands: The territory which immediately before the commencement of this Constitution was comprised in the Chief Commissioner's Province of the Andaman and Nicobar Islands.\n3. Lakshadweep: The territory comprised in the Laccadive, Minicoy and Amindivi Islands immediately before the Laccadive, Minicoy and Amindivi Islands (Alteration of Name) Act, 1973.\n4. Dadra and Nagar Haveli and Daman and Diu: The territory comprised in the respective former Union territories of Dadra and Nagar Haveli, and Daman and Diu, merged under Act 44 of 2019.\n5. Puducherry: The territories which immediately before 16th August, 1962, were comprised in the French Establishments in India known as Pondicherry, Karikal, Mahe and Yanam.\n6. Chandigarh: The territories specified in the Punjab Reorganisation Act, 1966.\n7. Jammu and Kashmir: The territories specified in the Jammu and Kashmir Reorganisation Act, 2019.\n8. Ladakh: The territories specified in the Jammu and Kashmir Reorganisation Act, 2019, comprising Kargil and Leh districts."
  },
  {
    number: "Second Schedule",
    title: "Salaries and Emoluments",
    content: "PART A: Provisions as to the President and the Governors of States\n- There shall be paid to the President and to the Governors of the States such emoluments, allowances, and privileges as are determined by Parliament.\n- Emoluments of the President of India: Rs. 5,00,000 per month (as amended).\n- Emoluments of Governors of States: Rs. 3,50,000 per month (as amended).\n\nPART B: [Repealed by the Constitution (Seventh Amendment) Act, 1956]\n\nPART C: Provisions as to the Speaker/Deputy Speaker of Lok Sabha, Chairman/Deputy Chairman of Rajya Sabha, and their State counterparts\n- There shall be paid to these officers such salaries and allowances as may be respectively fixed by Parliament or the State Legislature by law.\n\nPART D: Provisions as to the Judges of the Supreme Court and of the High Courts\n- Chief Justice of India: Rs. 2,80,000 per month (as amended).\n- Judges of the Supreme Court: Rs. 2,50,000 per month.\n- Chief Justices of High Courts: Rs. 2,50,000 per month.\n- Judges of High Courts: Rs. 2,25,000 per month.\n- Judges are also entitled to rent-free official residence, travel allowance, and other pensionary/retirement privileges.\n\nPART E: Provisions as to the Comptroller and Auditor-General of India\n- The CAG shall be paid a salary equal to that of a Judge of the Supreme Court (Rs. 2,50,000 per month)."
  },
  {
    number: "Third Schedule",
    title: "Forms of Oaths and Affirmations",
    content: "Contains the forms of oaths or affirmations to be made by candidates, ministers, and judicial officers:\n\nForm I: Oath of Office for a Minister for the Union:\n\"I, A.B., do swear in the name of God/solemnly affirm that I will bear true faith and allegiance to the Constitution of India as by law established, that I will uphold the sovereignty and integrity of India, that I will faithfully and conscientiously discharge my duties as a Minister for the Union and that I will do right to all manner of people in accordance with the Constitution and the law, without fear or favour, affection or ill-will.\"\n\nForm II: Oath of Secrecy for a Minister for the Union:\n\"I, A.B., do swear in the name of God/solemnly affirm that I will not directly or indirectly communicate or reveal to any person or persons any matter which shall be brought under my consideration or shall become known to me as a Minister for the Union except as may be required for the due discharge of my duties as such Minister.\"\n\nForm III: Oath/Affirmation by candidate for election to Parliament:\nOath taken before an authorized officer to uphold the sovereignty and integrity of India and bear true faith and allegiance to the Constitution.\n\nForm IV: Oath/Affirmation by Member of Parliament:\nOath taken by elected MPs before taking their seat in the Lok Sabha or Rajya Sabha.\n\nForm V: Oath or Affirmation for Supreme Court Judges and CAG:\n\"I, A.B., having been appointed Chief Justice (or a Judge) of the Supreme Court of India / Comptroller and Auditor-General of India do swear in the name of God/solemnly affirm that I will bear true faith and allegiance to the Constitution of India... that I will perform the duties of my office without fear or favour, affection or ill-will and that I will uphold the Constitution and the laws.\"\n\nForm VI: Oath of Office for a Minister for a State (similar to Union Minister).\n\nForm VII: Oath or Affirmation by candidate for election to a State Legislature.\n\nForm VIII: Oath or Affirmation for High Court Judges (similar to Supreme Court Judges)."
  },
  {
    number: "Fourth Schedule",
    title: "Allocation of Rajya Sabha Seats",
    content: "Allocation of seats in the Council of States (Rajya Sabha) to each State and Union Territory:\n\n1. Andhra Pradesh — 11 seats\n2. Arunachal Pradesh — 1 seat\n3. Assam — 7 seats\n4. Bihar — 16 seats\n5. Chhattisgarh — 5 seats\n6. Goa — 1 seat\n7. Gujarat — 11 seats\n8. Haryana — 5 seats\n9. Himachal Pradesh — 3 seats\n10. Jammu and Kashmir — 4 seats\n11. Jharkhand — 6 seats\n12. Karnataka — 12 seats\n13. Kerala — 9 seats\n14. Madhya Pradesh — 11 seats\n15. Maharashtra — 19 seats\n16. Manipur — 1 seat\n17. Meghalaya — 1 seat\n18. Mizoram — 1 seat\n19. Nagaland — 1 seat\n20. Odisha — 10 seats\n21. Punjab — 7 seats\n22. Rajasthan — 10 seats\n23. Sikkim — 1 seat\n24. Tamil Nadu — 18 seats\n25. Telangana — 7 seats\n26. Tripura — 1 seat\n27. Uttar Pradesh — 31 seats\n28. Uttarakhand — 3 seats\n29. West Bengal — 16 seats\n30. Delhi (National Capital Territory) — 3 seats\n31. Puducherry — 1 seat\n32. Nominated by the President (under Article 80(1)(a)) — 12 seats\n\nTOTAL SEATS: 245"
  },
  {
    number: "Fifth Schedule",
    title: "Scheduled Areas and Scheduled Tribes",
    content: "Provisions as to the Administration and Control of Scheduled Areas and Scheduled Tribes (Articles 244(1)):\n\nPART A: GENERAL\n- The executive power of a State extends to the Scheduled Areas therein. The Governor of each State having Scheduled Areas shall annually, or whenever so required by the President, make a report to the President regarding the administration of the Scheduled Areas.\n\nPART B: ADMINISTRATION & CONTROL\n- Tribes Advisory Council (TAC): Established in each State having Scheduled Areas (and, if the President so directs, in any State having Scheduled Tribes but not Scheduled Areas) consisting of not more than 20 members, of whom three-fourths shall be representatives of Scheduled Tribes in the State Legislative Assembly.\n- Duties of the Council: To advise on such matters pertaining to the welfare and advancement of the Scheduled Tribes in the State as may be referred to them by the Governor.\n- Law applicable to Scheduled Areas: The Governor may by public notification direct that any particular Act of Parliament or of the Legislature of the State shall not apply to a Scheduled Area or shall apply subject to exceptions and modifications. The Governor may also make regulations for peace and good government, including restrictions on land transfer, regulating business of money-lenders, etc. All such regulations must be submitted to the President and receive assent.\n\nPART C: SCHEDULED AREAS\n- \"Scheduled Areas\" means such areas as the President may by order declare to be Scheduled Areas.\n\nPART D: AMENDMENT\n- Parliament may from time to time by law amend, alter, or repeal any of the provisions of this Schedule."
  },
  {
    number: "Sixth Schedule",
    title: "Tribal Areas in North-Eastern States",
    content: "Provisions as to the Administration of Tribal Areas in the States of Assam, Meghalaya, Tripura and Mizoram (Articles 244(2) and 275(1)):\n\n1. Autonomous Districts and Autonomous Regions:\n- The tribal areas in these four states are administered as autonomous districts. If there are different Scheduled Tribes in an autonomous district, the Governor may divide the area into autonomous regions.\n\n2. Constitution of District Councils and Regional Councils:\n- There shall be a District Council for each autonomous district consisting of not more than 30 members, of whom not more than 4 persons shall be nominated by the Governor and the rest shall be elected on the basis of adult suffrage.\n- There shall be a separate Regional Council for each area declared to be an autonomous region.\n- Each District and Regional Council is a body corporate with perpetual succession and common seal.\n\n3. Powers to make Laws:\n- Councils have legislative power to make laws for their areas regarding: allotment, occupation, use of land; management of forests (other than reserved forests); use of canal water; regulation of shifting cultivation (jhum); establishment of town committees; inheritance of property; marriage and divorce; social customs.\n- All laws made under this provision must be submitted to the Governor and receive assent.\n\n4. Administration of Justice:\n- Councils may constitute village councils or courts for the trial of suits and cases between members of Scheduled Tribes, to the exclusion of ordinary courts except where High Court/Supreme Court jurisdiction is specified.\n\n5. Revenue & Finance:\n- Councils have powers to establish school, dispensaries, markets, fisheries, roads, and waterways. They also have powers to assess and collect land revenue, impose taxes on professions, trades, animals, vehicles, and entry of goods into market."
  },
  {
    number: "Seventh Schedule",
    title: "Division of Powers (Three Lists)",
    content: "Defines the constitutional allocation of legislative subjects between the Union and the States under Article 246:\n\nLIST I — UNION LIST (Subjects of national importance. Central Parliament has exclusive power to make laws):\n1. Defence of India, naval, military, and air forces.\n2. Foreign affairs, diplomatic representation, treaties and agreements with foreign countries.\n3. Atomic energy and mineral resources necessary for its production.\n4. War and peace.\n5. Citizenship, naturalisation and aliens.\n6. Railways, national highways, maritime shipping, and major ports.\n7. Airways, aircraft, air navigation, aerodromes, and meteorological organisations.\n8. Currency, coinage, legal tender, and foreign exchange.\n9. Banking, insurance, stock exchanges, and futures markets.\n10. Patents, inventions, designs, copyright, trademarks.\n11. Census of India.\n12. Union Public Service Commission (UPSC).\n13. Taxes on income (other than agricultural income), customs duties, corporation tax, etc.\n\nLIST II — STATE LIST (Subjects of local importance. State Legislatures have exclusive power under ordinary circumstances):\n1. Public order (but not including the use of naval, military or air forces of the Union).\n2. Police (including railway and village police).\n3. Officers and servants of the High Court, prisons, reformatories, and other institutions.\n4. Local government (municipal corporations, district boards, mining settlement authorities, panchayats).\n5. Public health and sanitation, hospitals and dispensaries.\n6. Pilgrimages, other than pilgrimages to places outside India.\n7. Agriculture, including agricultural education and research, protection against pests and plant diseases.\n8. Land, rights in or over land, land tenures, transfer of agricultural land.\n9. Fisheries.\n10. Taxes on agricultural income, duties in respect of succession to agricultural land, land revenue, etc.\n\nLIST III — CONCURRENT LIST (Subjects of joint interest. Both Parliament and State Legislatures can make laws; Central law prevails in case of conflict):\n1. Criminal law, including all matters included in the Indian Penal Code (BNS) at the commencement of this Constitution.\n2. Criminal procedure, including all matters included in the Code of Criminal Procedure (BNSS).\n3. Preventive detention for reasons connected with the security of a State, the maintenance of public order.\n4. Marriage and divorce, infants and minors, adoption, wills, intestacy and succession, joint family and partition.\n5. Transfer of property other than agricultural land, registration of deeds and documents.\n6. Contracts, including partnership, agency, contracts of carriage, and other special forms of contracts.\n7. Civil procedure, including all matters in the Code of Civil Procedure.\n8. Education, including technical education, medical education and universities (added by 42nd Amendment, 1976).\n9. Forests and protection of wild animals and birds (added by 42nd Amendment, 1976).\n10. Trade unions, industrial and labour disputes.\n11. Population control and family planning (added by 42nd Amendment, 1976).\n12. Electricity, newspapers, books and printing presses."
  },
  {
    number: "Eighth Schedule",
    title: "Official Languages",
    content: "Recognises the 22 official languages of the Republic of India under Articles 344(1) and 351:\n\n1. Assamese\n2. Bengali\n3. Bodo (added by 92nd Amendment Act, 2003)\n4. Dogri (added by 92nd Amendment Act, 2003)\n5. Gujarati\n6. Hindi\n7. Kannada\n8. Kashmiri\n9. Konkani (added by 71st Amendment Act, 1992)\n10. Maithili (added by 92nd Amendment Act, 2003)\n11. Malayalam\n12. Manipuri (added by 71st Amendment Act, 1992)\n13. Marathi\n14. Nepali (added by 71st Amendment Act, 1992)\n15. Odia (spelling changed from Oriya by 96th Amendment Act, 2011)\n16. Punjabi\n17. Sanskrit\n18. Santali (added by 92nd Amendment Act, 2003)\n19. Sindhi (added by 21st Amendment Act, 1967)\n20. Tamil\n21. Telugu\n22. Urdu\n\nNote: Originally, the Constitution recognized 14 official languages in 1950. Subsequent amendments added 8 more languages to the Schedule to promote linguistic representation."
  },
  {
    number: "Ninth Schedule",
    title: "Validation of certain Acts (Land Reforms)",
    content: "Validation of certain Acts and Regulations (Article 31B):\n\n- Contains a list of central and state laws (principally concerning land reforms, tenure systems, and economic regulations) that cannot be challenged in a court of law on the ground that they violate any of the Fundamental Rights conferred by Part III of the Constitution.\n- Created by the 1st Amendment Act, 1951, to protect agricultural reform laws from constitutional challenges in courts.\n- Originally contained 13 items. Through subsequent constitutional amendments, the number of laws protected has grown to 284.\n\n*Important Landmark Case Rule (I.R. Coelho v. State of Tamil Nadu, AIR 2007 SC 861)*:\n- The Supreme Court ruled that all laws placed under the Ninth Schedule after 24th April, 1973 (the date of the Kesavananda Bharati judgment) are open to judicial review.\n- If a law placed in the Ninth Schedule violates the basic structure of the Constitution (specifically violating Articles 14, 19, and 21), it can be declared unconstitutional."
  },
  {
    number: "Tenth Schedule",
    title: "Anti-Defection Law",
    content: "Provisions as to disqualification on ground of defection (Articles 102(2) and 191(2)) — Added by the Constitution (Fifty-second Amendment) Act, 1985:\n\n1. Disqualification on Ground of Defection:\n- A member of a House belonging to any political party shall be disqualified for being a member of the House if:\n  (a) he has voluntarily given up his membership of such political party; or\n  (b) he votes or abstains from voting in such House contrary to any direction issued by the political party (whip) without obtaining prior permission, and such voting/abstention has not been condoned by the party within 15 days.\n- An independent member becomes disqualified if he joins any political party after election.\n- A nominated member becomes disqualified if he joins any political party after the expiry of 6 months from taking his seat.\n\n2. Exemptions:\n- Split and Merger: Disqualification does not apply in case of a merger of a political party. A merger is deemed to have taken place if not less than two-thirds of the members of the legislature party have agreed to the merger.\n\n3. Decision on Disqualification:\n- If any question arises as to whether a member of a House has become subject to disqualification, the question shall be referred to the Decision of the Chairman or, as the case may be, the Speaker of such House, whose decision shall be final.\n\n4. Judicial Review (Kihoto Hollohan v. Zachillhu, 1992):\n- The Supreme Court declared that the Speaker/Chairman acts as a tribunal when deciding defection cases. Therefore, their decision is subject to judicial review on grounds of infirmity, perversity, or mala fides."
  },
  {
    number: "Eleventh Schedule",
    title: "Panchayati Raj (Rural Local Government)",
    content: "Specifies the powers, authority and responsibilities of Panchayats (Article 243G) — Added by the Constitution (Seventy-third Amendment) Act, 1992. It contains 29 functional matters:\n\n1. Agriculture, including agricultural expansion.\n2. Land improvement, implementation of land reforms, land consolidation and soil conservation.\n3. Minor irrigation, water management and watershed development.\n4. Animal husbandry, dairying and poultry.\n5. Fisheries.\n6. Social forestry and farm forestry.\n7. Minor forest produce.\n8. Small scale industries, including food processing industries.\n9. Khadi, village and cottage industries.\n10. Rural housing.\n11. Drinking water.\n12. Fuel and fodder.\n13. Roads, culverts, bridges, ferries, waterways and other means of communication.\n14. Rural electrification, including distribution of electricity.\n15. Non-conventional energy sources.\n16. Poverty alleviation programme.\n17. Education, including primary and secondary schools.\n18. Technical training and vocational education.\n19. Adult and non-formal education.\n20. Libraries.\n21. Cultural activities.\n22. Markets and fairs.\n23. Health and sanitation, including hospitals, primary health centres and dispensaries.\n24. Family welfare.\n25. Women and child development.\n26. Social welfare, including welfare of the handicapped and mentally retarded.\n27. Welfare of the weaker sections, and in particular, of the Scheduled Castes and the Scheduled Tribes.\n28. Public distribution system (PDS).\n29. Maintenance of community assets."
  },
  {
    number: "Twelfth Schedule",
    title: "Municipalities (Urban Local Government)",
    content: "Specifies the powers, authority and responsibilities of Municipalities (Article 243W) — Added by the Constitution (Seventy-fourth Amendment) Act, 1992. It contains 18 functional matters:\n\n1. Urban planning including town planning.\n2. Regulation of land-use and construction of buildings.\n3. Planning for economic and social development.\n4. Roads and bridges.\n5. Water supply for domestic, industrial and commercial purposes.\n6. Public health, sanitation conservancy and solid waste management.\n7. Fire services.\n8. Urban forestry, protection of the environment and promotion of ecological aspects.\n9. Safeguarding the interests of weaker sections of society, including the handicapped and mentally retarded.\n10. Slum improvement and upgradation.\n11. Urban poverty alleviation.\n12. Provision of urban amenities and facilities such as parks, gardens, playgrounds.\n13. Promotion of cultural, educational and aesthetic aspects.\n14. Burials and burial grounds; cremations, cremation grounds and electric crematoriums.\n15. Cattle pounds; prevention of cruelty to animals.\n16. Vital statistics including registration of births and deaths.\n17. Public amenities including street lighting, parking lots, bus stops and public conveniences.\n18. Regulation of slaughter houses and tanneries."
  }
];

// Reassemble the object
const finalObj = {
  id: data.id,
  slug: data.slug,
  name: data.name,
  year: data.year,
  sectionCount: flatSections.length,
  category: data.category,
  description: data.description,
  lastUpdated: data.lastUpdated,
  isNew: data.isNew,
  replacedBy: data.replacedBy,
  replaces: data.replaces,
  transitionNote: data.transitionNote,
  chapters: newChapters,
  schedules: schedules
};

// Save JSON
fs.writeFileSync(jsonPath, JSON.stringify(finalObj, null, 2), 'utf8');
console.log('Successfully wrote restructured JSON to:', jsonPath);

// Save JS
const jsContent = `export const constitution = ${JSON.stringify(finalObj, null, 2)};\n`;
fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log('Successfully wrote restructured JS to:', jsPath);
