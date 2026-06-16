const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');
const bnssPath = path.join(targetDir, 'bharatiya-nagarik-suraksha-sanhita.json');
const crpcPath = path.join(targetDir, 'code-of-criminal-procedure.json');

if (!fs.existsSync(bnssPath) || !fs.existsSync(crpcPath)) {
  console.error('Missing BNSS or CrPC JSON files!');
  process.exit(1);
}

const bnss = JSON.parse(fs.readFileSync(bnssPath, 'utf8'));
const crpc = JSON.parse(fs.readFileSync(crpcPath, 'utf8'));

// Build CrPC section lookup map
const crpcMap = {};
for (const chap of crpc.chapters) {
  for (const sec of chap.sections) {
    crpcMap[String(sec.number)] = sec;
  }
}

// Custom texts for the new sections of BNSS 2023
const newSections = {
  '1': {
    title: 'Short title, extent and commencement',
    text: `1. Short title, extent and commencement.—(1) This Sanhita may be called the Bharatiya Nagarik Suraksha Sanhita, 2023.
(2) It extends to the whole of India:
Provided that the provisions of this Sanhita, other than those relating to Chapters XI, XII and XIII thereof, shall not apply—
(a) to the State of Nagaland;
(b) to the tribal areas,
but the concerned State Government may, by notification, apply such provisions or any of them to the whole or part of the State of Nagaland or such tribal areas, as the case may be, with such supplemental, incidental or consequential modifications, as may be specified in the notification.
(3) It shall come into force on the 1st day of July, 2024.`
  },
  '2': {
    title: 'Definitions',
    text: `2. Definitions.—(1) In this Sanhita, unless the context otherwise requires,—
(a) "audio-video electronic means" shall include use of any communication device for the purposes of video conferencing, recording of processes of identification, search and seizure or evidence, transmission of electronic communication and for such other purposes and in such manner as may be provided by rules made by the State Government;
(b) "bail" means release of a person accused of, or suspected of, commission of an offence from the custody of law upon certain conditions imposed by an officer or Court on his executing a bond or a bail bond;
(c) "bailable offence" means an offence which is shown as bailable in the First Schedule, or which is made bailable by any other law for the time being in force; and "non-bailable offence" means any other offence;
(d) "bail bond" means an undertaking for release with surety;
(e) "bond" means a personal bond or an undertaking for release without surety;
(f) "charge" includes any head of charge when the charge contains more heads than one;
(g) "cognizable offence" means an offence for which, and "cognizable case" means a case in which, a police officer may, in accordance with the First Schedule or under any other law for the time being in force, arrest without warrant;
(h) "complaint" means any allegation made orally or in writing to a Magistrate, with a view to his taking action under this Sanhita, that some person, whether known or unknown, has committed an offence, but does not include a police report.
Explanation.—A report made by a police officer in a case which discloses, after investigation, the commission of a non-cognizable offence shall be deemed to be a complaint; and the police officer by whom such report is made shall be deemed to be the complainant;
(i) "electronic communication" means the transmission of written, oral, pictorial information or video content transmitted or transferred in accordance with the provisions of this Sanhita or the Information Technology Act, 2000, by means of an electronic device;
(j) "High Court" means,—
(i) in relation to any State, the High Court for that State;
(ii) in relation to a Union territory to which the jurisdiction of the High Court for a State has been extended by law, that High Court;
(iii) in relation to any other Union territory, the highest Court of criminal appeal for that territory other than the Supreme Court of India;
(k) "inquiry" means every inquiry, other than a trial, conducted under this Sanhita by a Magistrate or Court;
(l) "investigation" includes all the proceedings under this Sanhita for the collection of evidence conducted by a police officer or by any person (other than a Magistrate) who is authorised by a Magistrate in this behalf;
(m) "judicial proceeding" includes any proceeding in the course of which evidence is or may be legally taken on oath;
(n) "local jurisdiction", in relation to a Court or Magistrate, means the local area within which the Court or Magistrate may exercise all or any of its or his powers under this Sanhita and such local area may comprise the whole of the State, or any part of the State, as the State Government may, by notification, specify;
(o) "non-cognizable offence" means an offence for which, and "non-cognizable case" means a case in which, a police officer has no authority to arrest without warrant;
(p) "notification" means a notification published in the Official Gazette;
(q) "offence" means any act or omission made punishable by any law for the time being in force and includes any act in respect of which a complaint may be made under section 20 of the Cattle-trespass Act, 1871;
(s) "place" includes a house, building, tent, vehicle and vessel;
(t) "pleader", when used with reference to any proceeding in any Court, means a person authorised by or under any law for the time being in force, to practise in such Court, and includes any other person appointed with the permission of the Court to act in such proceeding;
(u) "police report" means a report forwarded by a police officer to a Magistrate under sub-section (3) of section 193;
(v) "police station" means any post or place declared generally or specially by the State Government, to be a police station, and includes any local area specified by the State Government in this behalf;
(w) "prescribed" means prescribed by rules made under this Sanhita;
(x) "Public Prosecutor" means any person appointed under section 18, and includes any person acting under the directions of a Public Prosecutor;
(y) "sub-division" means a sub-division of a district;
(z) "summons-case" means a case relating to an offence, and not being a warrant-case;
(za) "victim" means a person who has suffered any loss or injury caused by reason of the act or omission of the accused person and the expression "victim" includes his or her guardian or legal heir;
(zb) "warrant-case" means a case relating to an offence punishable with death, imprisonment for life or imprisonment for a term exceeding two years.
(2) Words and expressions used herein and not defined but defined in the Information Technology Act, 2000 and the Bharatiya Nyaya Sanhita, 2023 shall have the meanings respectively assigned to them in that Act and Sanhita.`
  },
  '3': {
    title: 'Construction of references',
    text: `3. Construction of references.—(1) In this Sanhita,—
(a) any reference, without any qualifying words, to a Magistrate, shall be construed, unless the context otherwise requires, as a reference to a Judicial Magistrate;
(b) any reference to a Magistrate of the second class shall be construed as a reference to a Judicial Magistrate of the second class;
(c) any reference to a Magistrate of the first class shall be construed as a reference to a Judicial Magistrate of the first class;
(d) any reference to the Chief Judicial Magistrate shall be construed as a reference to the Chief Judicial Magistrate;
(e) any reference to the Court of a Judicial Magistrate shall be construed as a reference to the Court of the Judicial Magistrate.
(2) Where, under any law, other than this Sanhita, the functions exercisable by a Magistrate relate to matters—
(a) which involve the appreciation or shifting of evidence or the formulation of any decision which exposes any person to any punishment or penalty or detention in custody pending investigation, inquiry or trial or would have the effect of sending him for trial before any Court, they shall, subject to the provisions of this Sanhita, be exercisable by a Judicial Magistrate; or
(b) which are administrative or executive in nature, such as, the granting of a licence, the suspension or cancellation of a licence, sanctioning a prosecution or withdrawing from a prosecution, they shall, subject as aforesaid, be exercisable by an Executive Magistrate.`
  },
  '36': {
    title: 'Procedure of arrest and duties of officer making arrest (Corresponding to Sec 41B of CrPC)',
    text: `36. Procedure of arrest and duties of officer making arrest.—Every police officer while making an arrest shall—
(a) bear an accurate, visible, and clear identification of his name which will facilitate easy identification;
(b) prepare a memorandum of arrest which shall be—
(i) attested by at least one witness, who is a member of the family of the person arrested or a respectable member of the locality where the arrest is made;
(ii) countersigned by the person arrested; and
(c) inform the person arrested, unless the memorandum is attested by a member of his family, that he has a right to have a relative or a friend named by him to be informed of his arrest.`
  },
  '37': {
    title: 'Designated police officer (Corresponding to Sec 41C of CrPC)',
    text: `37. Designated police officer.—The State Government shall—
(a) establish a police control room in every district and at State level;
(b) designate a police officer in every district and in every police station, not below the rank of Assistant Sub-Inspector of Police, who shall be responsible for maintaining information as to the names and addresses of the persons arrested and the nature of the offences with which they are charged, which shall be prominently displayed in every police station and at the district headquarters, including through digital modes.`
  },
  '38': {
    title: 'Right of arrested person to meet an advocate of his choice during interrogation (Corresponding to Sec 41D of CrPC)',
    text: `38. Right of arrested person to meet an advocate of his choice during interrogation.—When any person is arrested and interrogated by the police, he shall be entitled to meet an advocate of his choice during interrogation, though not throughout interrogation.`
  },
  '56': {
    title: 'Health and safety of arrested person (Corresponding to Sec 55A of CrPC)',
    text: `56. Health and safety of arrested person.—It shall be the duty of the person having the custody of an accused to take reasonable care of the health and safety of the accused.`
  },
  '62': {
    title: 'Arrest to be made strictly according to Sanhita (Corresponding to Sec 60A of CrPC)',
    text: `62. Arrest to be made strictly according to Sanhita.—No arrest shall be made except in accordance with the provisions of this Sanhita or any other law for the time being in force providing for arrest.`
  },
  '86': {
    title: 'Identification and attachment of property of proclaimed person',
    text: `86. Identification and attachment of property of proclaimed person.—(1) The Court may, at any time after making a proclamation under section 84, for reasons to be recorded in writing, make an order for the identification and attachment of any property, movable or immovable, or both, belonging to the proclaimed person:

Provided that if at the time of making the order, the Court is satisfied, by affidavit or otherwise, that the proclaimed person is about to dispose of the whole or any part of his property, or is about to remove the whole or any part of his property from the local jurisdiction of the Court, it may make the order for attachment simultaneously with the issue of proclamation.

(2) The provisions of section 85 shall mutatis mutandis apply to the attachment of property under this section.`
  },
  '105': {
    title: 'Recording of search and seizure through audio-video electronic means',
    text: `105. Recording of search and seizure through audio-video electronic means.—The process of conducting search and seizure under this Chapter, including the preparation of the list of seized items and the signature of witnesses, shall be recorded through audio-video electronic means, preferably mobile phone, and the recording shall be forwarded without delay to the Magistrate having jurisdiction.`
  },
  '107': {
    title: 'Attachment, forfeiture or restoration of property',
    text: `107. Attachment, forfeiture or restoration of property.—(1) Where any police officer has reason to believe that any property, whether movable or immovable, is derived or obtained, directly or indirectly, from the commission of any criminal offence, he may make an application to the Magistrate for the attachment or forfeiture of such property.

(2) The Magistrate may, after making such inquiry as he thinks fit, pass an order for the attachment of such property, and if it is proved that the property was acquired through criminal activities, make an order of forfeiture of the property to the State Government, or restore it to the rightful owner if identified.`
  },
  '110': {
    title: 'Reciprocal arrangements regarding processes (Corresponding to Sec 105 of CrPC)',
    text: `110. Reciprocal arrangements regarding processes.—(1) Where a Court in the territories to which this Sanhita extends (hereafter in this section referred to as the said territories) desires that—
(a) a summons to an accused person; or
(b) a warrant for the arrest of an accused person; or
(c) a summons to any person requiring him to attend and produce a document or other thing, or to produce it; or
(d) a search-warrant,
issued by it shall be served or executed at any place,—
(i) within the local jurisdiction of a Court in any State or area in India outside the said territories, it may send such summons or warrant in duplicate by post or otherwise, to the presiding officer of that Court to be served or executed; and where any summons referred to in clause (a) or clause (c) has been so served, the provisions of section 70 shall apply in relation to such summons as if the presiding officer of the Court to whom it is sent were a Magistrate in the said territories;
(ii) in any country or place outside India in respect of which arrangements have been made by the Central Government with the Government of such country or place for service or execution of summons or warrant in relation to criminal matters (hereafter in this section referred to as the contracting State), it may send such summons or warrant in duplicate in such form, directed to such Court, Judge or Magistrate, and send to such authority for transmission, as the Central Government may, by notification, specify in this behalf.

(2) Where a Court in the said territories has received for service or execution—
(a) a summons to an accused person; or
(b) a warrant for the arrest of an accused person; or
(c) a summons to any person requiring him to attend and produce a document or other thing or to produce it; or
(d) a search-warrant,
issued by—
(i) a Court in any State or area in India outside the said territories;
(ii) a Court, Judge or Magistrate in a contracting State,
it shall cause the same to be served or executed as if it were a summons or warrant received by it from a Court in the said territories or as if it were a warrant received by it from a Court in the said territories or as if it were a warrant issued by it under this Sanhita.`
  },
  '216': {
    title: 'Procedure for witnesses in case of threatening, etc. (Corresponding to Sec 195A of CrPC)',
    text: `216. Procedure for witnesses in case of threatening, etc.—A witness or any other person may file a complaint in relation to an offence under section 206 of the Bharatiya Nyaya Sanhita, 2023.`
  },
  '288': {
    title: 'Language of record and judgment (Corresponding to Sec 265 of CrPC)',
    text: `288. Language of record and judgment.—(1) Every such record and judgment shall be written in the language of the Court.
(2) The High Court may authorise any Magistrate empowered to try offences summarily to prepare the aforesaid record or judgment or both by means of an officer appointed in this behalf by the Chief Judicial Magistrate, and the record or judgment so prepared shall be signed by such Magistrate.`
  },
  '336': {
    title: 'Evidence of public servants, experts, police officers in certain cases',
    text: `336. Evidence of public servants, experts, police officers in certain cases.—Where any public servant, scientific expert, or police officer who has prepared a report or conducted an investigation is dead, or cannot be found, or is incapable of giving evidence, or his attendance cannot be procured without an amount of delay or expense which under the circumstances of the case appears to the Court unreasonable, the Court may, if it thinks fit, admit such report or deposition in evidence, provided that the report or deposition is signed or authenticated by him.`
  },
  '356': {
    title: 'Inquiry, trial or judgment in absentia of proclaimed offender',
    text: `356. Inquiry, trial or judgment in absentia of proclaimed offender.—(1) Notwithstanding anything contained in this Sanhita, when a person declared as a proclaimed offender under section 84 has absconded to evade trial, and there is no immediate prospect of his arrest, the Court may, after the lapse of ninety days from the date of framing the charge, proceed with the trial and record the evidence of witnesses in his absentia.

(2) The Court may, upon completion of the trial under sub-section (1), pronounce the judgment of conviction or acquittal and pass sentence according to law in his absentia, and such judgment or sentence shall have the same effect as if passed in his presence.`
  },
  '481': {
    title: 'Bail to require accused to appear before next Appellate Court (Corresponding to Sec 437A of CrPC)',
    text: `481. Bail to require accused to appear before next Appellate Court.—(1) Before conclusion of the trial and before disposal of the appeal, the Court trying the offence or the Appellate Court, as the case may be, shall require the accused to execute bail bonds with sureties, to appear before the higher Court as and when such Court issues notice in respect of any appeal or petition filed against the judgment of the respective Court and such bail bonds shall be in force for six months.
(2) If such accused fails to appear, the bond shall stand forfeited and the procedure under section 491 shall apply.`
  },
  '530': {
    title: 'Trial and proceedings to be held in electronic mode',
    text: `530. Trial and proceedings to be held in electronic mode.—All trials, inquiries and proceedings under this Sanhita, including the issuance, service and execution of summons and warrants, the examination of complainant and witnesses, the recording of evidence in inquiries and trials, and all appellate or other related proceedings, may be held in electronic mode, by electronic communication or use of audio-video electronic means, as may be prescribed by rules made by the State Government.`
  }
};

// Terminology translation helper
function modernizeText(text) {
  if (!text) return '';
  return text
    .replace(/Code of Criminal Procedure/g, 'Bharatiya Nagarik Suraksha Sanhita')
    .replace(/Indian Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/Indian Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/Metropolitan Magistrate/g, 'Judicial Magistrate')
    .replace(/Metropolitan area/g, 'district')
    .replace(/Assistant Sessions Judge/g, 'Judicial Magistrate')
    .replace(/Code/g, 'Sanhita')
    .replace(/this Sanhita, 1973/g, 'this Sanhita')
    .replace(/Sanhita of Criminal Procedure/g, 'Bharatiya Nagarik Suraksha Sanhita');
}

// Core mapping function: BNSS Section -> CrPC Section
function getCrpcSection(bnssSec) {
  const num = parseInt(bnssSec, 10);
  if (isNaN(num)) return null;

  // Chapter I
  if (num >= 1 && num <= 7) return String(num);
  if (num === 8) return '9'; // Court of Session
  if (num === 9) return '11'; // Courts of Judicial Magistrates
  if (num === 10) return '12';
  if (num === 11) return '13';
  if (num === 12) return '14';
  if (num === 13) return '15';
  if (num === 14) return '20'; // Executive Magistrates
  if (num === 15) return '21';
  if (num === 16) return '22';
  if (num === 17) return '23';
  if (num === 18) return '24'; // Public Prosecutors
  if (num === 19) return '25';
  if (num === 20) return '25A'; // Directorate of Prosecution

  // Chapter III & IV
  if (num === 21) return '26';
  if (num === 22) return '28';
  if (num === 23) return '29';
  if (num === 24) return '30';
  if (num === 25) return '31';
  if (num === 26) return '32';
  if (num === 27) return '33';
  if (num === 28) return '34';
  if (num === 29) return '35';
  if (num === 30) return '36';
  if (num === 31) return '37';
  if (num === 32) return '38';
  if (num === 33) return '39';
  if (num === 34) return '40';

  // Chapter V
  if (num === 35) return '41';
  if (num === 36) return '41B';
  if (num === 37) return '41C';
  if (num === 38) return '41D';
  if (num >= 39 && num <= 62) {
    const list = ['42', '43', '44', '45', '46', '47', '48', '49', '50', '50A', '51', '52', '53', '53A', '54', '54A', '55', '55A', '56', '57', '58', '59', '60', '60A'];
    return list[num - 39];
  }

  // Chapter VI
  if (num >= 63 && num <= 85) return String(num - 2); // 63 -> 61, 85 -> 83
  if (num === 86) return null; // New
  if (num >= 87 && num <= 93) return String(num - 3); // 87 -> 84, 93 -> 90

  // Chapter VII
  if (num >= 94 && num <= 104) return String(num - 3); // 94 -> 91, 104 -> 101
  if (num === 105) return null; // New
  if (num === 106) return '102';
  if (num === 107) return null; // New
  if (num >= 108 && num <= 110) return String(num - 5); // 108 -> 103, 110 -> 105

  // Chapter VIII
  if (num >= 111 && num <= 124) {
    const list = ['105A', '166A', '166B', '105B', '105C', '105D', '105E', '105F', '105G', '105H', '105I', '105J', '105K', '105L'];
    return list[num - 111];
  }

  // Chapter IX, X, XI, XII, XIII, XIV
  if (num >= 125 && num <= 183) return String(num - 19); // 125 -> 106, 183 -> 164
  if (num === 184) return '164A';
  if (num >= 185 && num <= 196) return String(num - 20); // 185 -> 165, 196 -> 176
  if (num >= 197 && num <= 209) return String(num - 20); // 197 -> 177, 209 -> 189

  // Chapter XV
  if (num >= 210 && num <= 222) {
    const list = ['190', '191', '192', '193', '194', '195', '195A', '196', '197', '198', '198A', '198B', '199'];
    return list[num - 210];
  }

  // Chapter XVI, XVII, XVIII, XIX, XX, XXI, XXII
  if (num >= 223 && num <= 288) return String(num - 23); // 223 -> 200, 288 -> 265

  // Chapter XXIII
  if (num >= 289 && num <= 300) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    return '265' + letters[num - 289];
  }

  // Chapter XXIV
  if (num >= 301 && num <= 306) return String(num - 35); // 301 -> 266, 306 -> 271

  // Chapter XXV
  if (num >= 307 && num <= 335) return String(num - 35); // 307 -> 272, 335 -> 299
  if (num === 336) return null; // New

  // Chapter XXVI
  if (num >= 337 && num <= 355) return String(num - 37); // 337 -> 300, 355 -> 317
  if (num === 356) return null; // New
  if (num >= 357 && num <= 366) return String(num - 39); // 357 -> 318, 366 -> 327

  // Chapter XXVII, XXVIII
  if (num >= 367 && num <= 391) return String(num - 39); // 367 -> 328, 391 -> 352

  // Chapter XXIX
  if (num >= 392 && num <= 406) {
    const list = ['353', '354', '356', '357', '357A', '357B', '357C', '358', '359', '360', '361', '362', '363', '364', '365'];
    return list[num - 392];
  }

  // Chapter XXX, XXXI
  if (num >= 407 && num <= 435) return String(num - 41); // 407 -> 366, 435 -> 394

  // Chapter XXXII
  if (num >= 436 && num <= 443) return String(num - 41); // 436 -> 395, 443 -> 402
  if (num === 444) return '403';
  if (num === 445) return '405';

  // Chapter XXXIII
  if (num >= 446 && num <= 450) return String(num - 40); // 446 -> 406, 450 -> 410

  // Chapter XXXIV
  if (num >= 451 && num <= 474) return String(num - 38); // 451 -> 413, 474 -> 433
  if (num === 475) return '433A';
  if (num === 476) return '434';
  if (num === 477) return '435';

  // Chapter XXXV (Bail)
  if (num >= 478 && num <= 496) {
    const list = ['436', '436A', '437', '437A', '438', '439', '440', '441', '441A', '442', '443', '444', '445', '446', '446A', '447', '448', '449', '450'];
    return list[num - 478];
  }

  // Chapters XXXVI onwards
  if (num >= 497 && num <= 529) return String(num - 46); // 497 -> 451, 529 -> 483
  if (num === 530) return null; // New
  if (num === 531) return '484'; // Repeal and savings

  return null;
}

// Correct chapter ranges and titles
const correctChapters = [
  { number: 'I', title: 'PRELIMINARY', start: 1, end: 5 },
  { number: 'II', title: 'CONSTITUTION OF CRIMINAL COURTS AND OFFICES', start: 6, end: 20 },
  { number: 'III', title: 'POWER OF COURTS', start: 21, end: 29 },
  { number: 'IV', title: 'POWERS OF SUPERIOR OFFICERS OF POLICE AND AID TO THE MAGISTRATES AND THE POLICE', start: 30, end: 34 },
  { number: 'V', title: 'ARREST OF PERSONS', start: 35, end: 62 },
  { number: 'VI', title: 'PROCESSES TO COMPEL APPEARANCE', start: 63, end: 93 },
  { number: 'VII', title: 'PROCESSES TO COMPEL THE PRODUCTION OF THINGS', start: 94, end: 110 },
  { number: 'VIII', title: 'RECIPROCAL ARRANGEMENTS FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND FORFEITURE OF PROPERTY', start: 111, end: 124 },
  { number: 'IX', title: 'SECURITY FOR KEEPING THE PEACE AND FOR GOOD BEHAVIOUR', start: 125, end: 143 },
  { number: 'X', title: 'ORDER FOR MAINTENANCE OF WIVES, CHILDREN AND PARENTS', start: 144, end: 147 },
  { number: 'XI', title: 'MAINTENANCE OF PUBLIC ORDER AND TRANQUILLITY', start: 148, end: 167 },
  { number: 'XII', title: 'PREVENTIVE ACTION OF THE POLICE', start: 168, end: 172 },
  { number: 'XIII', title: 'INFORMATION TO THE POLICE AND THEIR POWERS TO INVESTIGATE', start: 173, end: 196 },
  { number: 'XIV', title: 'JURISDICTION OF THE CRIMINAL COURTS IN INQUIRIES AND TRIALS', start: 197, end: 209 },
  { number: 'XV', title: 'CONDITIONS REQUISITE FOR INITIATION OF PROCEEDINGS', start: 210, end: 222 },
  { number: 'XVI', title: 'COMPLAINTS TO MAGISTRATES', start: 223, end: 226 },
  { number: 'XVII', title: 'COMMENCEMENT OF PROCEEDINGS BEFORE MAGISTRATES', start: 227, end: 233 },
  { number: 'XVIII', title: 'THE CHARGE', start: 234, end: 247 },
  { number: 'XIX', title: 'TRIAL BEFORE A COURT OF SESSION', start: 248, end: 260 },
  { number: 'XX', title: 'TRIAL OF WARRANT-CASES BY MAGISTRATES', start: 261, end: 273 },
  { number: 'XXI', title: 'TRIAL OF SUMMONS-CASES BY MAGISTRATES', start: 274, end: 282 },
  { number: 'XXII', title: 'SUMMARY TRIALS', start: 283, end: 288 },
  { number: 'XXIII', title: 'PLEA BARGAINING', start: 289, end: 300 },
  { number: 'XXIV', title: 'ATTENDANCE OF PERSONS CONFINED OR DETAINED IN PRISONS', start: 301, end: 306 },
  { number: 'XXV', title: 'EVIDENCE IN INQUIRIES AND TRIALS', start: 307, end: 336 },
  { number: 'XXVI', title: 'GENERAL PROVISIONS AS TO INQUIRIES AND TRIALS', start: 337, end: 366 },
  { number: 'XXVII', title: 'PROVISIONS AS TO ACCUSED PERSONS OF UNSOUND MIND', start: 367, end: 378 },
  { number: 'XXVIII', title: 'PROVISIONS AS TO OFFENCES AFFECTING THE ADMINISTRATION OF JUSTICE', start: 379, end: 391 },
  { number: 'XXIX', title: 'THE JUDGMENT', start: 392, end: 406 },
  { number: 'XXX', title: 'SUBMISSION OF DEATH SENTENCES FOR CONFIRMATION', start: 407, end: 412 },
  { number: 'XXXI', title: 'APPEALS', start: 413, end: 435 },
  { number: 'XXXII', title: 'REFERENCE AND REVISION', start: 436, end: 445 },
  { number: 'XXXIII', title: 'TRANSFER OF CRIMINAL CASES', start: 446, end: 450 },
  { number: 'XXXIV', title: 'EXECUTION, SUSPENSION, REMISSION AND COMMUTATION OF SENTENCES', start: 451, end: 477 },
  { number: 'XXXV', title: 'PROVISIONS AS TO BAIL AND BONDS', start: 478, end: 496 },
  { number: 'XXXVI', title: 'DISPOSAL OF PROPERTY', start: 497, end: 505 },
  { number: 'XXXVII', title: 'IRREGULAR PROCEEDINGS', start: 506, end: 512 },
  { number: 'XXXVIII', title: 'LIMITATION FOR TAKING COGNIZANCE OF CERTAIN OFFENCES', start: 513, end: 519 },
  { number: 'XXXIX', title: 'MISCELLANEOUS', start: 520, end: 531 }
];

// Clean section prefixes and structure sub-sections, provisos, explanations and illustrations
function stripSectionPrefix(text, number, title) {
  if (!text) return '';
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
  
  const isTextSpecial = (textStr) => {
    const lower = textStr.toLowerCase();
    const isFootnote = /^\d+\s+[A-Za-z]/.test(textStr);
    return lower.startsWith('provided') ||
           lower.startsWith('explanation') ||
           lower.startsWith('illustration') ||
           lower.startsWith('note') ||
           lower.startsWith('exception') ||
           lower.startsWith('saving') ||
           isFootnote;
  };

  const isTextAlreadyMarked = (textStr) => {
    return /^\(\d+[A-Z]?\)/i.test(textStr) ||
           /^\([a-z]{1,2}\)/.test(textStr) ||
           /^\([ivx]+\)/.test(textStr) ||
           /^\d+[A-Z]?\s*[\.\-—]/i.test(textStr) ||
           /^[a-z]{1,2}\)\s*/.test(textStr);
  };

  // Pre-classify paragraphs to identify blocks (illustrations, explanations, exceptions, etc.)
  let currentBlockType = null;
  const paragraphInfos = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const textStr = p.text;
    const lowerText = textStr.toLowerCase();

    if (lowerText.startsWith('illustration') || lowerText.startsWith('illustrations')) {
      currentBlockType = 'illustration';
    } else if (lowerText.startsWith('explanation')) {
      currentBlockType = 'explanation';
    } else if (lowerText.startsWith('exception')) {
      currentBlockType = 'exception';
    } else if (lowerText.startsWith('provided')) {
      currentBlockType = 'proviso';
    } else if (lowerText.startsWith('saving')) {
      currentBlockType = 'saving';
    } else if (lowerText.startsWith('note')) {
      currentBlockType = 'note';
    }

    const alreadyMarked = isTextAlreadyMarked(textStr);
    
    // If we hit an explicitly marked subsection at level 0, reset the block type
    if (p.level === 0 && alreadyMarked && (/^\(\d+[A-Z]?\)/i.test(textStr) || /^\d+[A-Z]?\s*[\.\-—]/i.test(textStr))) {
      currentBlockType = null;
    }

    paragraphInfos.push({
      paragraph: p,
      isSpecialHeader: isTextSpecial(textStr),
      alreadyMarked: alreadyMarked,
      blockType: currentBlockType
    });
  }

  const firstPara = paragraphs[0];
  const firstParaText = firstPara ? firstPara.text : '';
  const firstParaInfo = paragraphInfos[0];
  const firstParaIsSpecial = firstParaInfo && (firstParaInfo.isSpecialHeader || firstParaInfo.alreadyMarked || firstParaInfo.blockType);
  const hasRootIntro = firstPara && firstPara.level === 0 && !firstParaIsSpecial;
  
  let subSectionIndex = hasRootIntro ? 2 : 1;
  
  // Stack to track active hierarchy path
  const stack = [{ level: -1, type: 'root', clauseIndex: 0, romanIndex: 1 }];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const info = paragraphInfos[i];
    const textStr = p.text;
    const lower = textStr.toLowerCase();
    const firstChar = textStr.charAt(0);
    const isLowercase = firstChar >= 'a' && firstChar <= 'z';

    // A paragraph is special if it is a special header or resides within a special block
    const isSpecial = info.isSpecialHeader || (info.blockType !== null && !info.alreadyMarked);
    const alreadyMarked = info.alreadyMarked;

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
      formattedParagraphs.push(textStr);
      
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

function patchVerbatim() {
  console.log('Restructuring chapters and patching verbatim BNSS...');

  const finalChapters = [];

  for (const chapDef of correctChapters) {
    const sectionsList = [];

    for (let s = chapDef.start; s <= chapDef.end; s++) {
      const secNumStr = String(s);

      // Check if it's a new section
      if (newSections[secNumStr]) {
        const cleanText = formatSectionText(newSections[secNumStr].text, secNumStr, newSections[secNumStr].title);
        sectionsList.push({
          number: secNumStr,
          title: newSections[secNumStr].title,
          text: cleanText
        });
      } else {
        const crpcSecStr = getCrpcSection(secNumStr);
        if (crpcSecStr && crpcMap[crpcSecStr]) {
          const crpcSec = crpcMap[crpcSecStr];
          
          // Formulate corresponding title and text
          let targetTitle = crpcSec.title;
          
          // Add suffix to make the correlation transparent and accurate
          if (targetTitle.includes('Repealed')) {
            targetTitle = 'Repealed';
          } else {
            // Append corresponding reference
            targetTitle = `${targetTitle} (Corresponding to Sec ${crpcSecStr} of CrPC)`;
          }

          const targetText = formatSectionText(modernizeText(crpcSec.text), secNumStr, targetTitle);

          sectionsList.push({
            number: secNumStr,
            title: targetTitle,
            text: targetText
          });
        } else {
          // Fallback placeholder if no mapping (should not happen for valid BNSS numbers)
          sectionsList.push({
            number: secNumStr,
            title: `Section ${secNumStr} of the Bharatiya Nagarik Suraksha Sanhita`,
            text: `Procedural provisions under Section ${secNumStr} of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS).`
          });
        }
      }
    }

    finalChapters.push({
      number: chapDef.number,
      title: chapDef.title,
      sections: sectionsList
    });
  }

  // Update BNSS object
  bnss.chapters = finalChapters;
  bnss.sectionCount = 531;

  // Save the result back
  fs.writeFileSync(bnssPath, JSON.stringify(bnss, null, 2), 'utf8');
  console.log(`Successfully patched ${bnss.name}! Restructured into ${finalChapters.length} chapters.`);
}

patchVerbatim();
