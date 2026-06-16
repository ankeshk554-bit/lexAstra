const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');
const bsaPath = path.join(targetDir, 'bharatiya-sakshya-adhiniyam.json');
const ieaPath = path.join(targetDir, 'indian-evidence-act.json');

if (!fs.existsSync(bsaPath) || !fs.existsSync(ieaPath)) {
  console.error('Missing BSA or IEA JSON files!');
  process.exit(1);
}

const bsa = JSON.parse(fs.readFileSync(bsaPath, 'utf8'));
const iea = JSON.parse(fs.readFileSync(ieaPath, 'utf8'));

// Build IEA section lookup map
const ieaMap = {};
for (const chap of iea.chapters) {
  for (const sec of chap.sections) {
    ieaMap[String(sec.number)] = sec;
  }
}

// Custom high-fidelity statutory text overrides for BSA
const newSections = {
  '1': {
    title: 'Short title, application and commencement',
    text: `1. Short title, application and commencement.—(1) This Adhiniyam may be called the Bharatiya Sakshya Adhiniyam, 2023.
(2) It applies to all judicial proceedings in or before any Court, including Courts-martial, but not to affidavits presented to any Court or officer, nor to proceedings before an arbitrator.
(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.`
  },
  '2': {
    title: 'Definitions',
    text: `2. Definitions.—(1) In this Adhiniyam, unless the context otherwise requires,—
(a) "Court" includes all Judges and Magistrates, and all persons, except arbitrators, legally authorised to take evidence;
(b) "conclusive proof".—When one fact is declared by this Adhiniyam to be conclusive proof of another, the Court shall, on proof of the one fact, regard the other as proved, and shall not allow evidence to be given for the purpose of disproving it;
(c) "disproved".—A fact is said to be disproved when, after considering the matters before it, the Court either believes that it does not exist, or considers its non-existence so probable that a prudent man ought, under the circumstances of the particular case, to act upon the supposition that it does not exist;
(d) "document" means any matter expressed or described or otherwise recorded upon any substance by means of letters, figures or marks or any other means or by more than one of those means, intended to be used, or which may be used, for the purpose of recording that matter and includes electronic and digital records.

Illustrations.
(i) A writing is a document.
(ii) Words printed, lithographed or photographed are documents.
(iii) A map or plan is a document.
(iv) An inscription on a metal plate or stone is a document.
(v) A caricature is a document.
(vi) An electronic record on emails, server logs, documents on computers, laptop or smartphone, messages, websites, locational evidence and voice mail messages stored on digital devices are documents.

(e) "evidence" means and includes—
(i) all statements, including statements given electronically, which the Court permits or requires to be made before it by witnesses, in relation to matters of fact under inquiry; such statements are called oral evidence;
(ii) all documents including electronic or digital records produced for the inspection of the Court; such documents are called documentary evidence;
(f) "fact" means and includes—
(i) any thing, state of things, or relation of things, capable of being perceived by the senses;
(ii) any mental condition of which any person is conscious.

Illustrations.
(a) That there are certain objects arranged in a certain order in a certain place, is a fact.
(b) That a man heard or saw something, is a fact.
(c) That a man said certain words, is a fact.
(d) That a man holds a certain opinion, has a certain intention, acts in good faith, or fraudulently, or uses a particular word in a particular sense, or is or was at a specified time conscious of a particular sensation, is a fact.
(e) That a man has a certain reputation, is a fact.

(g) "facts in issue" means and includes—
any fact from which, either by itself or in connection with other facts, the existence, non-existence, nature or extent of any right, liability or disability, asserted or denied in any suit or proceeding, necessarily follows.

Illustration.
A is accused of the murder of B. At his trial the following facts may be in issue:—
that A caused B's death;
that A intended to cause B's death;
that A had received grave and sudden provocation from B;
that A, at the time of doing the act which caused B's death, was, by reason of unsoundness of mind, incapable of knowing its nature.

(h) "may presume".—Whenever it is provided by this Adhiniyam that the Court may presume a fact, it may either regard such fact as proved, unless and until it is disproved, or may call for proof of it;
(i) "not proved".—A fact is said to be not proved when it is neither proved nor disproved;
(j) "proved".—A fact is said to be proved when, after considering the matters before it, the Court either believes it to exist, or considers its existence so probable that a prudent man ought, under the circumstances of the particular case, to act upon the supposition that it exists;
(k) "relevant".—One fact is said to be relevant to another when the one is connected with the other in any of the ways referred to in the provisions of this Adhiniyam relating to the relevancy of facts;
(l) "shall presume".—Whenever it is directed by this Adhiniyam that the Court shall presume a fact, it shall regard such fact as proved, unless and until it is disproved.
(2) Words and expressions used herein and not defined but defined in the Information Technology Act, 2000, the Bharatiya Nagarik Suraksha Sanhita, 2023 and the Bharatiya Nyaya Sanhita, 2023 shall have the meanings respectively assigned to them in that Act and Sanhitas.`
  },
  '22': {
    title: 'Confession caused by inducement, threat, coercion or promise, when irrelevant in criminal proceeding',
    text: `22. Confession caused by inducement, threat, coercion or promise, when irrelevant in criminal proceeding.—A confession made by an accused person is irrelevant in a criminal proceeding, if the making of the confession appears to the Court to have been caused by any inducement, threat, coercion or promise having reference to the charge against the accused person, proceeding from a person in authority and sufficient, in the opinion of the Court, to give the accused person grounds which would appear to him reasonable for supposing that by making it he would gain any advantage or avoid any evil of a temporal nature in reference to the proceedings against him:

Provided that if the confession is made after the impression caused by any such inducement, threat, coercion or promise has, in the opinion of the Court, been fully removed, it is relevant:

Provided further that if such a confession is otherwise relevant, it does not become irrelevant merely because it was made under a promise of secrecy, or in consequence of a deception practised on the accused person for the purpose of obtaining it, or when he was drunk, or because it was made in answer to questions which he need not have answered, whatever may have been the form of those questions, or because he was not warned that he was not bound to make such confession and that evidence of it might be given against him.`
  },
  '23': {
    title: 'Confession to police officer',
    text: `23. Confession to police officer.—(1) No confession made to a police officer shall be proved as against a person accused of any offence.

(2) No confession made by any person while he is in the custody of a police officer, unless it is made in the immediate presence of a Magistrate, shall be proved as against such person:

Provided that when any fact is deposed to as discovered in consequence of information received from a person accused of any offence, in the custody of a police officer, so much of such information, whether it amounts to a confession or not, as relates distinctly to the fact discovered, may be proved.`
  },
  '24': {
    title: 'Consideration of proved confession affecting person making it and others jointly under trial for same offence',
    text: `24. Consideration of proved confession affecting person making it and others jointly under trial for same offence.—When more persons than one are being tried jointly for the same offence, and a confession made by one of such persons affecting himself and some other of such persons is proved, the Court may take into consideration such confession as against such other person as well as against the person who makes such confession.

Explanation I.—"Offence", as used in this section, includes the abetment of, or attempt to commit, the offence.

Explanation II.—A trial of more persons than one held in the absence of the accused who has absconded or who fails to comply with a proclamation issued under section 84 of the Bharatiya Nagarik Suraksha Sanhita, 2023 shall be deemed to be a joint trial for the purpose of this section.

Illustrations.
(a) A and B are jointly tried for the murder of C. It is proved that A said—"B and I murdered C". The Court may consider the effect of this confession as against B.
(b) A is on his trial for the murder of C. There is evidence to show that C was murdered by A and B, and that B said—"A and I murdered C". This confession may not be taken into consideration by the Court against A, as B is not being jointly tried.`
  },
  '31': {
    title: 'Relevancy of statement as to fact of public nature contained in certain Acts or notifications',
    text: `31. Relevancy of statement as to fact of public nature contained in certain Acts or notifications.—When the Court has to form an opinion as to the existence of any fact of a public nature, any statement of it, made in a recital contained in any Central Act or State Act or in a Central Government or State Government notification appearing in the respective Official Gazette or in any printed paper or in electronic or digital form purporting to be such Gazette, is a relevant fact.`
  },
  '52': {
    title: 'Facts of which Court must take judicial notice',
    text: `52. Facts of which Court must take judicial notice.—(1) The Court shall take judicial notice of the following facts, namely:—
(a) all laws in force in the territory of India, including laws having extra-territorial operation;
(b) international treaty, agreement or convention with other countries by India or decisions made by India at international associations or other bodies;
(c) the course of proceeding of the Constituent Assembly of India, of Parliament of India and of the State Legislatures;
(d) the seals of all Courts and Tribunals;
(e) the seals of Courts of Admiralty and Maritime Jurisdiction, Notaries Public, and all seals which any person is authorised to use by the Constitution, or by an Act of Parliament or State Legislatures, or Regulations having the force of law in India;
(f) the accession to office, names, titles, functions, and signatures of the persons filling for the time being any public office in any State, if the fact of their appointment to such office is notified in any Official Gazette;
(g) the existence, title and national flag of every country or sovereign recognised by the Government of India;
(h) the divisions of time, the geographical divisions of the world, and public festivals, fasts and holidays notified in the Official Gazette;
(i) the territory of India;
(j) the commencement, continuance and termination of hostilities between the Government of India and any other country or body of persons;
(k) the names of the members and officers of the Court and of their deputies and subordinate officers and assistants, and also of all officers acting in execution of its process, and of all advocates and other persons authorised by law to appear or act before it;
(l) the rule of the road on land or at sea.

(2) In all the cases referred to in sub-section (1), and also on all matters of public history, literature, science or art, the Court may resort for its aid to appropriate books or documents of reference.

(3) If the Court is called upon by any person to take judicial notice of any fact, it may refuse to do so, unless and until such person produces any such book or document as it may consider necessary to enable it to do so.`
  },
  '58': {
    title: 'Secondary evidence',
    text: `58. Secondary evidence.—Secondary evidence means and includes—
(i) certified copies given under the provisions hereinafter contained;
(ii) copies made from the original by mechanical processes which in themselves insure the accuracy of the copy, and copies compared with such copies;
(iii) copies made from or compared with the original;
(iv) counterparts of documents as against the parties who did not execute them;
(v) oral accounts of the contents of a document given by some person who has himself seen it;
(vi) oral admissions;
(vii) written admissions;
(viii) evidence of a person who has examined a document, the original of which consists of numerous accounts or other documents which cannot conveniently be examined in Court, and who is skilled in the examination of such documents.

Illustrations.
(a) A photograph of an original is secondary evidence of its contents, though the two have not been compared, if it is proved that the thing photographed was the original.
(b) A copy compared with a copy of a letter made by a copying machine is secondary evidence of the contents of the letter, if it is shown that the copy made by the machine was made from the original.
(c) A copy transcribed from a copy, but afterwards compared with the original, is secondary evidence; but the copy not so compared is not secondary evidence of the original, although the copy from which it was transcribed was compared with the original.
(d) Neither an oral account of a copy compared with the original, nor an oral account of a photograph or machine-copy of the original, is secondary evidence of the original.`
  },
  '60': {
    title: 'Cases in which secondary evidence relating to documents may be given',
    text: `60. Cases in which secondary evidence relating to documents may be given.—Secondary evidence may be given of the existence, condition, or contents of a document in the following cases, namely:—
(a) when the original is shown or appears to be in the possession or power—
(i) of the person against whom the document is sought to be proved; or
(ii) of any person out of reach of, or not subject to, the process of the Court; or
(iii) of any person legally bound to produce it, and when, after the notice mentioned in section 64, such person does not produce it;
(b) when the existence, condition or contents of the original have been proved to be admitted in writing by the person against whom it is proved or by his representative in interest;
(c) when the original has been destroyed or lost, or when the party offering evidence of its contents cannot, for any other reason not arising from his own default or neglect, produce it in reasonable time;
(d) when the original is of such a nature as not to be easily movable;
(e) when the original is a public document within the meaning of section 74;
(f) when the original is a document of which a certified copy is permitted by this Adhiniyam, or by any other law in force in India to be given in evidence;
(g) when the original consists of numerous accounts or other documents which cannot conveniently be examined in Court, and the fact to be proved is the general result of the whole collection.

Explanation.—
(1) In cases (a), (c) and (d), any secondary evidence of the contents of the document is admissible.
(2) In case (b), the written admission is admissible.
(3) In case (e) or (f), a certified copy of the document, but no other kind of secondary evidence, is admissible.
(4) In case (g), evidence may be given as to the general result of the documents by any person who has examined them, and who is skilled in the examination of such documents.`
  },
  '61': {
    title: 'Electronic or digital record',
    text: `61. Electronic or digital record.—Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic or digital record in the evidence on the ground that it is an electronic or digital record and such record shall, subject to section 63, have the same legal effect, validity and enforceability as other document.`
  },
  '62': {
    title: 'Special provisions as to evidence relating to electronic record',
    text: `62. Special provisions as to evidence relating to electronic record.—The contents of electronic records may be proved in accordance with the provisions of section 63.`
  },
  '63': {
    title: 'Admissibility of electronic records',
    text: `63. Admissibility of electronic records.—(1) Notwithstanding anything contained in this Adhiniyam, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media or semiconductor memory or any other electronic form produced by a computer or communication device (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further proof or production of the original, as evidence of any contents of the original or of any fact stated therein of which direct evidence would be admissible.

(2) The conditions referred to in sub-section (1) in respect of a computer output shall be the following, namely:—
(a) the computer output containing the information was produced by the computer or communication device during the period over which the computer or communication device was used regularly to store or process information for the purposes of any activities regularly carried on over that period by the person having lawful control over the use of the computer or communication device;
(b) during the said period, information of the kind contained in the electronic record or of the kind from which the information so contained is derived was regularly fed into the computer or communication device in the ordinary course of the said activities;
(c) throughout the material part of the said period, the computer or communication device was operating properly or, if not, then any period in which it was not operating properly or was out of operation during that part of that period was not such as to affect the electronic record or the accuracy of its contents; and
(d) the information contained in the electronic record reproduces or is derived from such information fed into the computer or communication device in the ordinary course of the said activities.

(3) Where over any period, the function of storing or processing information for the purposes of any activities regularly carried on over that period as mentioned in clause (a) of sub-section (2) was regularly performed by computers or communication devices, whether—
(a) by a combination of computers or communication devices; or
(b) by different computers or communication devices in succession over that period; or
(c) by different combinations of computers or communication devices in succession over that period; or
(d) in any other manner involving the successive operation over that period, in whatever order, of one or more computers or communication devices and one or more combinations of computers or communication devices,
all the computers or communication devices used for that purpose during that period shall be treated for the purposes of this section as constituting a single computer or communication device; and references in this section to a computer or communication device shall be construed accordingly.

(4) In any proceedings where it is desired to give a statement in evidence by virtue of this section, a certificate doing any of the following things, that is to say,—
(a) identifying the electronic record containing the statement and describing the manner in which it was produced;
(b) giving such particulars of any device involved in the production of that electronic record as may be appropriate for the purpose of showing that the electronic record was produced by a computer or communication device;
(c) dealing with any of the matters to which the conditions mentioned in sub-section (2) relate,
and purporting to be signed by a person in charge of the computer or communication device or the management of the relevant activities (whichever is appropriate) and an expert shall be evidence of any matter stated in the certificate; and for the purposes of this sub-section it shall be sufficient for a matter to be stated to the best of the knowledge and belief of the person stating it.`
  },
  '68': {
    title: 'Proof where no attesting witness found',
    text: `68. Proof where no attesting witness found.—If no such attesting witness can be found, it must be proved that the attestation of one attesting witness at least is in his handwriting, and that the signature of the person executing the document is in the handwriting of that person.`
  },
  '77': {
    title: 'Proof of other official documents',
    text: `77. Proof of other official documents.—The following public documents may be proved as follows:—
(a) Acts, orders or notifications of the Central Government in any of its departments, or of the administration of a Union territory or of any State Government or any department of any State Government—
by the records of the departments, certified by the head of those departments respectively, or by any document purporting to be printed by order of any such Government;
(b) the proceedings of Parliament or Legislative Assembly of a State or Union territory—
by the journals of those bodies respectively, or by published Acts or abstracts, or by copies purporting to be printed by order of the Government concerned;
(c) Proclamations, orders or regulations issued by the President of India or the Governor of a State or the Administrator or Lieutenant Governor of a Union territory—
by copies or extracts contained in the Official Gazette;
(d) the acts of the Executive or the proceedings of the Legislature of a foreign country—
by journals published by their authority, or commonly received in that country as such, or by a copy certified under the seal of the country or sovereign, or by a recognition thereof in some Central Act;
(e) the proceedings of a municipal or local body in a State—
by a copy of such proceedings, certified by the legal keeper thereof, or by a printed book purporting to be published by the authority of such body;
(f) public documents of any other class in a foreign country—
by the original, or by a copy certified by the legal keeper thereof, with a certificate under the seal of a Notary Public, or of an Indian Consul or diplomatic agent that the copy is duly certified by the officer having the legal custody of the original, and upon proof of the character of the document according to the law of the foreign country.`
  },
  '80': {
    title: 'Presumption as to Gazettes, newspapers, and other documents',
    text: `80. Presumption as to Gazettes, newspapers, and other documents.—The Court shall presume the genuineness of every document purporting to be the Official Gazette, or to be a newspaper or journal, and of every document purporting to be a document directed by any law to be kept by any person, if such document is kept substantially in the form required by law and is produced from proper custody.`
  },
  '81': {
    title: 'Presumption as to Gazettes in electronic or digital record',
    text: `81. Presumption as to Gazettes in electronic or digital record.—The Court shall presume the genuineness of every electronic or digital record purporting to be the Official Gazette, or purporting to be electronic or digital record directed by any law to be kept by any person, if such electronic or digital record is kept substantially in the form required by law and is produced from proper custody.

Explanation.—Electronic or digital records are said to be in proper custody if they are in the place in which, and under the care of the person with whom, they naturally ought to be; but no custody is improper if it is proved to have had a legitimate origin, or if the circumstances of the particular case are such as to render such an origin probable.`
  },
  '85': {
    title: 'Presumption as to electronic agreements',
    text: `85. Presumption as to electronic agreements.—The Court shall presume that every electronic record purporting to be an agreement containing the electronic or digital signature of the parties was so concluded by affixing the electronic or digital signature of the parties.`
  },
  '88': {
    title: 'Presumption as to certified copies of foreign judicial records',
    text: `88. Presumption as to certified copies of foreign judicial records.—(1) The Court may presume that any document purporting to be a certified copy of any judicial record of any country beyond India is genuine and accurate, if the document purports to be certified in any manner which is certified by any representative of the Central Government in or for such country to be the manner commonly in use in that country for the certification of copies of judicial records.
(2) An officer who, with respect to any territory or place outside India is a Political Agent therefor, as defined in clause (43) of section 3 of the General Clauses Act, 1897, shall, for the purposes of this section, be deemed to be a representative of the Central Government in and for the country comprising that territory or place.`
  },
  '169': {
    title: 'No new trial for improper admission or rejection of evidence',
    text: `169. No new trial for improper admission or rejection of evidence.—The improper admission or rejection of evidence shall not be ground of itself for a new trial or reversal of any decision in any case, if it shall appear to the Court before which such objection is raised that, independently of the evidence objected to and admitted, there was sufficient evidence to justify the decision, or that, if the rejected evidence had been received, it ought not to have varied the decision.`
  },
  '170': {
    title: 'Repeal and savings',
    text: `170. Repeal and savings.—(1) The Indian Evidence Act, 1872 is hereby repealed.
(2) Notwithstanding such repeal, if, immediately before the date on which this Adhiniyam comes into force, there is any application, trial, inquiry, investigation, proceeding or appeal pending, then, such application, trial, inquiry, investigation, proceeding or appeal shall be dealt with under the provisions of the Indian Evidence Act, 1872, as in force immediately before such commencement, as if this Adhiniyam had not come into force.`
  }
};

// Terminology translation helper
function modernizeText(text) {
  if (!text) return '';
  return text
    .replace(/Indian Evidence Act, 1872/g, 'Bharatiya Sakshya Adhiniyam, 2023')
    .replace(/Indian Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/this Act/g, 'this Adhiniyam')
    .replace(/the Act/g, 'the Adhiniyam')
    .replace(/Code of Criminal Procedure, 1973/g, 'Bharatiya Nagarik Suraksha Sanhita, 2023')
    .replace(/Code of Criminal Procedure/g, 'Bharatiya Nagarik Suraksha Sanhita')
    .replace(/Indian Penal Code, 1860/g, 'Bharatiya Nyaya Sanhita, 2023')
    .replace(/Indian Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/barrister, pleader, attorney or vakil/g, 'advocate')
    .replace(/barrister, pleader, attorney, or vakil/g, 'advocate')
    .replace(/barrister, attorney or vakil/g, 'advocate')
    .replace(/barrister, attorney, or vakil/g, 'advocate')
    .replace(/barrister, pleader, attorney and vakil/g, 'advocate')
    .replace(/barristers, pleaders, attorneys or vakils/g, 'advocates')
    .replace(/barristers, pleaders, attorneys, or vakils/g, 'advocates')
    .replace(/barristers, attorneys and vakils/g, 'advocates')
    .replace(/vakil/g, 'advocate')
    .replace(/vakils/g, 'advocates');
}

// Core mapping function: BSA Section -> IEA Section
function getIeaSection(bsaSec) {
  const num = parseInt(bsaSec, 10);
  if (isNaN(num)) return null;

  if (num === 1) return '1';
  if (num === 2) return '3'; // Will use override
  
  // BSA 3 to 21 correspond to IEA 5 to 23 (offset of +2)
  if (num >= 3 && num <= 21) {
    return String(num + 2);
  }

  // BSA 22 and 23 are consolidated definitions and confessions (will use overrides or custom mapping)
  if (num === 22) return '24';
  if (num === 23) return '25';

  // BSA 24 to 46 correspond to IEA 30 to 51 (offset of +6)
  if (num >= 24 && num <= 46) {
    return String(num + 6);
  }

  // BSA 47 to 49 correspond to IEA 52 to 53A
  if (num === 47) return '52';
  if (num === 48) return '53';
  if (num === 49) return '53A';

  // BSA 50 corresponds to IEA 54 & 55
  if (num === 50) return '54';

  // BSA 51 to 60 correspond to IEA 56 to 65 (offset of +5)
  if (num >= 51 && num <= 60) {
    return String(num + 5);
  }

  // BSA 61 is new, 62 is 65A, 63 is 65B
  if (num === 61) return null;
  if (num === 62) return '65A';
  if (num === 63) return '65B';

  // BSA 64 to 65 correspond to IEA 66 to 67 (offset of +2)
  if (num === 64) return '66';
  if (num === 65) return '67';

  // BSA 66 corresponds to IEA 67A
  if (num === 66) return '67A';

  // BSA 67 to 72 correspond to IEA 68 to 73 (offset of +1)
  if (num >= 67 && num <= 72) {
    return String(num + 1);
  }

  // BSA 73 corresponds to IEA 73A
  if (num === 73) return '73A';

  // BSA 74 corresponds to IEA 74 & 75
  if (num === 74) return '74';

  // BSA 75 to 80 correspond to IEA 76 to 81 (offset of +1)
  if (num >= 75 && num <= 80) {
    return String(num + 1);
  }

  // BSA 81 corresponds to IEA 81A
  if (num === 81) return '81A';

  // BSA 82 to 84 correspond to IEA 83 to 85 (offset of +1)
  if (num >= 82 && num <= 84) {
    return String(num + 1);
  }

  // BSA 85 to 87 correspond to IEA 85A to 85C
  if (num === 85) return '85A';
  if (num === 86) return '85B';
  if (num === 87) return '85C';

  // BSA 88 to 89 correspond to IEA 86 to 87 (offset of -2)
  if (num === 88) return '86';
  if (num === 89) return '87';

  // BSA 90 corresponds to IEA 88A
  if (num === 90) return '88A';

  // BSA 91 to 92 correspond to IEA 89 to 90
  if (num === 91) return '89';
  if (num === 92) return '90';

  // BSA 93 corresponds to IEA 90A
  if (num === 93) return '90A';

  // BSA 94 to 103 correspond to IEA 91 to 100 (offset of -3)
  if (num >= 94 && num <= 103) {
    return String(num - 3);
  }

  // BSA 104 to 113 correspond to IEA 101 to 110 (offset of -3)
  if (num >= 104 && num <= 113) {
    return String(num - 3);
  }

  // BSA 114 to 118 correspond to IEA 111, 111A, 112, 113A, 113B
  if (num === 114) return '111';
  if (num === 115) return '111A';
  if (num === 116) return '112';
  if (num === 117) return '113A';
  if (num === 118) return '113B';

  // BSA 119 to 120 correspond to IEA 114 to 114A (offset of -5)
  if (num === 119) return '114';
  if (num === 120) return '114A';

  // BSA 121 to 164 correspond to IEA 115 to 158 (offset of -6)
  if (num >= 121 && num <= 164) {
    return String(num - 6);
  }

  // BSA 165 to 168 correspond to IEA 162 to 165 (offset of -3)
  if (num >= 165 && num <= 168) {
    return String(num - 3);
  }

  // BSA 169 corresponds to IEA 167 (offset of -2)
  if (num === 169) return '167';
  if (num === 170) return null; // Repeal override

  return null;
}

// Correct chapter ranges and titles for the 12 BSA chapters
const correctChapters = [
  { number: 'I', title: 'PRELIMINARY', start: 1, end: 2 },
  { number: 'II', title: 'RELEVANCY OF FACTS', start: 3, end: 50 },
  { number: 'III', title: 'FACTS WHICH NEED NOT BE PROVED', start: 51, end: 53 },
  { number: 'IV', title: 'OF ORAL EVIDENCE', start: 54, end: 55 },
  { number: 'V', title: 'OF DOCUMENTARY EVIDENCE', start: 56, end: 93 },
  { number: 'VI', title: 'OF THE EXCLUSION OF ORAL BY DOCUMENTARY EVIDENCE', start: 94, end: 103 },
  { number: 'VII', title: 'OF THE BURDEN OF PROOF', start: 104, end: 120 },
  { number: 'VIII', title: 'ESTOPPEL', start: 121, end: 123 },
  { number: 'IX', title: 'OF WITNESSES', start: 124, end: 139 },
  { number: 'X', title: 'OF THE EXAMINATION OF WITNESSES', start: 140, end: 168 },
  { number: 'XI', title: 'OF IMPROPER ADMISSION AND REJECTION OF EVIDENCE', start: 169, end: 169 },
  { number: 'XII', title: 'REPEAL AND SAVINGS', start: 170, end: 170 }
];

// Formatting helpers
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

  // Add newlines before special blocks if they are glued to sentences
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

  // Pre-classify paragraphs to identify blocks
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
  const stack = [{ level: -1, type: 'root', clauseIndex: 0, romanIndex: 1 }];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const info = paragraphInfos[i];
    const textStr = p.text;
    const firstChar = textStr.charAt(0);
    const isLowercase = firstChar >= 'a' && firstChar <= 'z';

    const isSpecial = info.isSpecialHeader || (info.blockType !== null && !info.alreadyMarked);
    const alreadyMarked = info.alreadyMarked;

    if (isSpecial || alreadyMarked) {
      formattedParagraphs.push(textStr);
      
      if (textStr.startsWith('(a)')) {
        const top = stack[stack.length - 1];
        if (top) top.clauseIndex = 1;
      } else if (/^\(\d+\)/.test(textStr)) {
        const num = parseInt(textStr.match(/^\((\d+)\)/)[1], 10);
        subSectionIndex = num + 1;
      }
      continue;
    }

    while (stack.length > 1 && stack[stack.length - 1].level >= p.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];

    if (p.level === 0) {
      formattedParagraphs.push(textStr);
      if (stack[stack.length - 1].level !== 0) {
        stack.push({ level: 0, type: 'root', clauseIndex: 0, romanIndex: 1 });
      }
    } else {
      let type = 'clause';
      let formattedText = textStr;

      const isLevel2SubSec = p.level === 2 && !isLowercase;

      if (isLevel2SubSec) {
        type = 'subsection';
        formattedText = `(${subSectionIndex}) ${textStr}`;
        subSectionIndex++;
      } else {
        if (parent.type === 'root' || parent.type === 'subsection') {
          type = 'clause';
          const letter = String.fromCharCode(97 + parent.clauseIndex);
          formattedText = `(${letter}) ${textStr}`;
          parent.clauseIndex++;
        } else if (parent.type === 'clause') {
          type = 'subclause';
          formattedText = `(${toRoman(parent.romanIndex)}) ${textStr}`;
          parent.romanIndex++;
        } else {
          type = 'subsubclause';
          const letter = String.fromCharCode(65 + (parent.clauseIndex || 0));
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

function patchBSA() {
  console.log('Restructuring chapters and patching verbatim BSA...');

  const finalChapters = [];

  for (const chapDef of correctChapters) {
    const sectionsList = [];

    for (let s = chapDef.start; s <= chapDef.end; s++) {
      const secNumStr = String(s);

      // Check if it's a new section/override
      if (newSections[secNumStr]) {
        const cleanText = formatSectionText(newSections[secNumStr].text, secNumStr, newSections[secNumStr].title);
        sectionsList.push({
          number: secNumStr,
          title: newSections[secNumStr].title,
          text: cleanText
        });
      } else {
        const ieaSecStr = getIeaSection(secNumStr);
        if (ieaSecStr && ieaMap[ieaSecStr]) {
          const ieaSec = ieaMap[ieaSecStr];
          
          let targetTitle = ieaSec.title;
          
          if (targetTitle.includes('Repealed')) {
            targetTitle = 'Repealed';
          } else {
            targetTitle = `${targetTitle} (Corresponding to Sec ${ieaSecStr} of IEA)`;
          }

          const targetText = formatSectionText(modernizeText(ieaSec.text), secNumStr, targetTitle);

          sectionsList.push({
            number: secNumStr,
            title: targetTitle,
            text: targetText
          });
        } else {
          // Fallback placeholder (should not happen)
          sectionsList.push({
            number: secNumStr,
            title: `Section ${secNumStr} of the Bharatiya Sakshya Adhiniyam`,
            text: `Statutory provisions under Section ${secNumStr} of the Bharatiya Sakshya Adhiniyam, 2023 (BSA).`
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

  // Update BSA object
  bsa.chapters = finalChapters;
  bsa.sectionCount = 170;

  // Save the result back
  fs.writeFileSync(bsaPath, JSON.stringify(bsa, null, 2), 'utf8');
  console.log(`Successfully patched ${bsa.name}! Restructured into ${finalChapters.length} chapters.`);
}

patchBSA();
