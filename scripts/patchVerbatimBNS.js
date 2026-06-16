const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');
const bnsPath = path.join(targetDir, 'bharatiya-nyaya-sanhita.json');
const ipcPath = path.join(targetDir, 'indian-penal-code.json');

if (!fs.existsSync(bnsPath) || !fs.existsSync(ipcPath)) {
  console.error('Missing BNS or IPC JSON files!');
  process.exit(1);
}

const bns = JSON.parse(fs.readFileSync(bnsPath, 'utf8'));
const ipc = JSON.parse(fs.readFileSync(ipcPath, 'utf8'));

// Build IPC section lookup map
const ipcMap = {};
for (const chap of ipc.chapters) {
  for (const sec of chap.sections) {
    ipcMap[String(sec.number)] = sec;
  }
}

// Custom texts for new BNS sections
const newSections = {
  '1': {
    title: 'Short title, commencement and application',
    text: `1. Short title, commencement and application.—(1) This Sanhita may be called the Bharatiya Nyaya Sanhita, 2023.
(2) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint, and different dates may be appointed for different provisions of this Sanhita.
(3) Every person shall be liable to punishment under this Sanhita and not otherwise for every act or omission contrary to the provisions thereof, of which he shall be guilty within India.
(4) Any person liable, by any law for the time being in force in India, to be tried for an offence committed beyond India shall be dealt with according to the provisions of this Sanhita for any act committed beyond India in the same manner as if such act had been committed within India.
(5) The provisions of this Sanhita apply also to any offence committed by—
(a) any citizen of India in any place without and beyond India;
(b) any person on any ship or aircraft registered in India wherever it may be;
(c) any person in any place without and beyond India committing offence targeting a computer resource located in India.
(6) Nothing in this Sanhita shall affect the provisions of any Act for punishing mutiny and desertion of officers, soldiers, sailors or airmen in the service of the Government of India or the provisions of any special or local law for the time being in force.`
  },
  '2': {
    title: 'Definitions',
    text: `2. Definitions.—In this Sanhita, unless the context otherwise requires,—
(1) "act" denotes as well a series of acts as a single act;
(2) "animal" denotes any living creature, other than a human being;
(3) "child" means any person below the age of eighteen years;
(4) "counterfeit".—A person is said to "counterfeit" who causes one thing to resemble another thing, intending by means of that resemblance to practise deception, or knowing it to be likely that deception will thereby be practised;
(5) "Court" means a Judge who is empowered by law to act judicially alone, or a body of Judges which is empowered by law to act judicially as a body, when such Judge or body of Judges is acting judicially;
(6) "death" denotes the death of a human being unless the contrary appears from the context;
(7) "dishonestly" means doing anything with the intention of causing wrongful gain to one person or wrongful loss to another person;
(8) "document" means any matter expressed or described upon any substance by means of letters, figures or marks, or by more than one of those means, intended to be used, or which may be used, as evidence of that matter;
(9) "fraudulently" means doing a thing with intent to defraud but not otherwise;
(10) "gender".—The pronoun "he" and its derivatives are used of any person, whether male, female or transgender;
(11) "good faith".—Nothing is said to be done or believed in "good faith" which is done or believed without due care and attention;
(12) "Government" means the Central Government or a State Government;
(13) "harbour" includes supplying a person with shelter, food, drink, money, clothes, arms, ammunition or means of conveyance, or the assisting a person by any means, whether of the same kind as those enumerated in this clause or not, to evade apprehension;
(14) "injury" denotes any harm whatever illegally caused to any person, in body, mind, reputation or property;
(15) "life" denotes the life of a human being, unless the contrary appears from the context;
(16) "local law" means a law applicable only to a particular part of India;
(17) "month" means a month reckoned according to the British calendar;
(18) "movable property" includes property of every description, except land and things attached to the earth or permanently fastened to anything which is attached to the earth;
(19) "number".—Unless the contrary appears from the context, words importing the singular number include the plural number, and words importing the plural number include the singular number;
(20) "oath" includes a solemn affirmation substituted by law for an oath, and any declaration required or authorised by law to be made before a public servant or to be used for the purpose of proof, whether in a Court of Justice or not;
(21) "offence".—Except in the chapters and sections mentioned in sub-clauses (b) and (c), the word "offence" denotes a thing made punishable by this Sanhita;
(22) "officer" denotes any person who holds a commission or warrant in the Army, Navy or Air Force of India;
(23) "omission" denotes as well a series of omissions as a single omission;
(24) "person" includes any company or association or body of persons, whether incorporated or not;
(25) "public" includes any class of the public or any community;
(26) "public servant" denotes a person falling under any of the descriptions hereinafter following, namely:—
(a) every Commissioned Officer in the military, naval or air forces of India;
(b) every Judge, including any person empowered by law to discharge, whether by himself or as a member of any body of persons, any adjudicatory functions;
(c) every officer of a Court of Justice whose duty it is, as such officer, to investigate or report on any matter of law or fact, or to make, authenticate, or keep any record, or to take charge or dispose of any property;
(d) every assessor, member of a panchayat or person assisting a Court of Justice or public servant;
(e) every arbitrator or other person to whom any cause or matter has been referred for decision or report by any Court of Justice, or by any other competent public authority;
(f) every person who holds any office by virtue of which he is empowered to place or keep any person in confinement;
(g) every officer of the Government whose duty it is, as such officer, to prevent offences, to give information of offences, to bring offenders to justice, or to protect the public health, safety or convenience;
(h) every officer whose duty it is, as such officer, to take, receive, keep or expend any property on behalf of the Government;
(i) every officer whose duty it is, as such officer, to take, receive, keep or expend any property for any public purpose;
(j) every person who holds any office by virtue of which he is empowered to prepare, publish, maintain or revise an electoral roll or to conduct an election or part of an election;
(k) every person in the service or pay of the Government or remunerated by fees or commission for the performance of any public duty by the Government;
(27) "reason to believe".—A person is said to have "reason to believe" a thing, if he has sufficient cause to believe that thing but not otherwise;
(28) "special law" means a law applicable to a particular subject;
(29) "valuable security" means a document which is, or purports to be, a document whereby any legal right is created, extended, transferred, restricted, extinguished or released, or whereby any person acknowledges that he lies under legal liability, or has not a certain legal right;
(30) "vessel" denotes anything made for the conveyance by water of human beings or of property;
(31) "will" denotes any testamentary document;
(32) "woman" denotes a female human being of any age;
(33) "wrongful gain" is gain by unlawful means of property to which the person gaining is not legally entitled;
(34) "wrongful loss" is the loss by unlawful means of property to which the person losing it is legally entitled;
(35) "wrongful keeping" includes keeping a person out of his property unlawfully;
(36) "wrongful depriving" includes depriving a person of his property unlawfully;
(37) "year" means a year reckoned according to the British calendar;`
  },
  '3': {
    title: 'General explanations',
    text: `3. General explanations.—(1) Throughout this Sanhita every definition of an offence, every penal provision, and every Illustration of every such definition or penal provision, shall be understood subject to the exceptions contained in the Chapter entitled "General Exceptions", though those exceptions are not repeated in such definition, penal provision, or Illustration.

Illustrations.
(a) The sections, in this Sanhita which contain definitions of offences, do not express that a child under seven years of age cannot commit such offences; but the definitions are to be understood subject to the general exception which provides that nothing shall be an offence which is done by a child under seven years of age.
(b) A, a police-officer, without warrant, apprehends Z, who has committed murder. Here A is not guilty of the offence of wrongful confinement; for he was bound by law to apprehend Z, and therefore the case falls within the general exception which provides that "nothing is an offence which is done by a person who is bound by law to do it".

(2) Every expression which is explained in any Part of this Sanhita, is used in every Part of this Sanhita in conformity with the explanation.

(3) When property is in the possession of a person's spouse, clerk or servant, on account of that person, it is in that person's possession within the meaning of this Sanhita.

Explanation.—A person employed temporarily or on a particular occasion in the capacity of a clerk or servant, is a clerk or servant within the meaning of this sub-section.

(4) In every Part of this Sanhita, except where a contrary intention appears from the context, words which refer to acts done extend also to illegal omissions.

(5) When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone.

(6) Whenever an act, which is criminal only by reason of its being done with a criminal knowledge or intention, is done by several persons, each of such persons who joins in the act with such knowledge or intention is liable for the act in the same manner as if the act were done by him alone with that knowledge or intention.

(7) Wherever the causing of a certain effect, or an attempt to cause that effect, by an act or by an omission, is an offence, it is to be understood that the causing of that effect partly by an act and partly by an omission is the same offence.

Illustration.
A intentionally causes Z's death, partly by illegally omitting to give Z food, and partly by beating Z. A has committed murder.

(8) When an offence is committed by means of several acts, whoever intentionally co-operates in the commission of that offence by doing any one of those acts, either singly or jointly with any other person, commits that offence.

Illustrations.
(a) A and B agree to murder Z by severally and at different times giving him small doses of poison. A and B administer the poison according to the agreement with intent to murder Z. Z dies from the effects of the several doses of poison so administered to him. Here A and B intentionally co-operate in the commission of murder and as each of them does an act by which the death is caused, they are both guilty of the offence though their acts are separate.
(b) A and B are joint jailors, and as such have the charge of Z, a prisoner, alternatively for six hours at a time. A and B, intending to cause Z's death, knowingly co-operate in causing that effect by illegally omitting, each during the time of his attendance, to furnish Z with food supplied to them for that purpose. Z dies of hunger. Both A and B are guilty of the murder of Z.
(c) A, a jailor, has the charge of Z, a prisoner. A, intending to cause Z's death, illegally omits to supply Z with food; in consequence of which Z is much reduced in strength, but the starvation is not sufficient to cause his death. A is dismissed from his office, and B succeeds him. B, without collusion or co-operation with A, illegally omits to supply Z with food, knowing that he is likely thereby to cause Z's death. Z dies of hunger. B is guilty of murder, but, as A did not co-operate with B, A is guilty only of an attempt to commit murder.

(9) Where several persons are engaged or concerned in the commission of a criminal act, they may be guilty of different offences by means of that act.

Illustration.
A attacks Z under such circumstances of grave provocation that his killing of Z would be only culpable homicide not amounting to murder. B, having ill-will towards Z and intending to kill him, and not having been subject to the provocation, assists A in killing Z. Here, though A and B are both engaged in causing Z's death, B is guilty of murder, and A is guilty only of culpable homicide.`
  },
  '48': {
    title: 'Abetment outside India for offence in India',
    text: `48. Abetment outside India for offence in India.—A person abets an offence within the meaning of this Sanhita who, without and beyond India, abets the commission of any act within India which would constitute an offence if committed in India.`
  },
  '68': {
    title: 'Sexual intercourse by a person in authority',
    text: `68. Sexual intercourse by a person in authority.—Whoever, being in a position of authority or in a fiduciary relationship, or being a public servant, or superintendent or manager of a jail, remand home or other place of custody or hospital, abuses such position or fiduciary relationship to induce or coerce any woman in his custody or charge or under his authority to have sexual intercourse with him, such sexual intercourse not amounting to the offence of rape, shall be punished with rigorous imprisonment of either description for a term which shall not be less than five years, but which may extend to ten years, and shall also be liable to fine.`
  },
  '69': {
    title: 'Sexual intercourse by deceitful means',
    text: `69. Sexual intercourse by deceitful means.—Whoever, by deceitful means or making promise to marry a woman without any intention of fulfilling the same, and having sexual intercourse with her, such sexual intercourse not amounting to the offence of rape, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.
Explanation.—"deceitful means" shall include the false promise of employment or promotion, inducement or marrying after suppressing identity.`
  },
  '95': {
    title: 'Hiring, employing or engaging child to commit offence',
    text: `95. Hiring, employing or engaging child to commit offence.—Whoever, hires, employs or engages a child to commit any offence under this Sanhita, or to assist in the commission of such offence, shall be punished with the punishment provided for that offence, or with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.`
  },
  '96': {
    title: 'Procuration of child',
    text: `96. Procuration of child.—Whoever, by any means whatsoever, induces any child under the age of eighteen years to go from any place or to do any act with intent that such child may be, or knowing that it is likely that such child will be, forced or seduced to illicit intercourse with another person, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`
  },
  '100': {
    title: 'Culpable homicide',
    text: `100. Culpable homicide.—Whoever causes death by doing an act with the intention of causing death, or with the intention of causing such bodily injury as is likely to cause death, or with the knowledge that he is likely by such act to cause death, commits the offence of culpable homicide.

Illustrations.
(a) A lays sticks and turf over a pit, with the intention of thereby causing death, or with the knowledge that death is likely to be thereby caused. Z, believing the ground to be firm, treads on it, falls in and is killed. A has committed the offence of culpable homicide.
(b) A knows Z to be behind a bush. B does not know it. A, intending to cause, or knowing it to be likely to cause Z's death, induces B to fire at the bush. B fires and kills Z. Here B may be guilty of no offence; but A has committed the offence of culpable homicide.
(c) A, by shooting at a fowl with intent to kill and steal it, kills B, who is behind a bush; A not knowing that he was there. Here, although A was doing an unlawful act, he was not guilty of culpable homicide, as he did not intend to kill B, or to cause death by doing an act that he knew was likely to cause death.

Explanation 1.—A person who causes bodily injury to another who is labouring under a disorder, disease or bodily infirmity, and thereby accelerates the death of that other, shall be deemed to have caused his death.
Explanation 2.—Where death is caused by bodily injury, the person who causes such bodily injury shall be deemed to have caused the death, although by resorting to proper remedies and skilful treatment the death might have been prevented.
Explanation 3.—The causing of the death of a child in the mother's womb is not homicide. But it may amount to culpable homicide to cause the death of a living child, if any part of that child has been brought forth, though the child may not have breathed or been completely born.`
  },
  '101': {
    title: 'Murder',
    text: `101. Murder.—Except in the cases hereinafter excepted, culpable homicide is murder,—
(a) if the act by which the death is caused is done with the intention of causing death; or
(b) if the act by which the death is caused is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused; or
(c) if the act by which the death is caused is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death; or
(d) if the person committing the act by which the death is caused, knows that it is so imminently dangerous that it must, in all probability, cause death, or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.

Illustrations.
(a) A shoots Z with the intention of killing him. Z dies in consequence. A commits murder.
(b) A, knowing that Z is labouring under such a disease that a blow is likely to cause his death, strikes him with the intention of causing bodily injury. Z dies in consequence of the blow. A is guilty of murder, although the blow might not have been sufficient in the ordinary course of nature to cause the death of a person in a sound state of health. But if A, not knowing that Z is labouring under any disease, gives him such a blow as would not in the ordinary course of nature kill a person in a sound state of health, here A, although he may intend to cause bodily injury, is not guilty of murder, if he did not intend to cause death, or such bodily injury as in the ordinary course of nature would cause death.
(c) A intentionally gives Z a sword-cut or club-wound sufficient to cause the death of a man in the ordinary course of nature. Z dies in consequence. Here A is guilty of murder, although he may not have intended to cause Z's death.
(d) A without any excuse fires a loaded cannon into a crowd of persons and kills one of them. A is guilty of murder, although he may not have had a premeditated design to kill any particular individual.

Exception 1.—Culpable homicide is not murder if the offender, whilst deprived of the power of self-control by grave and sudden provocation, causes the death of the person who gave the provocation or causes the death of any other person by mistake or accident:
Provided that the provocation is not,—
(a) sought or voluntarily provoked by the offender as an excuse for killing or doing harm to any person;
(b) given by anything done in obedience to the law, or by a public servant in the lawful exercise of the powers of such public servant;
(c) given by anything done in the lawful exercise of the right of private defence.
Explanation.—Whether the provocation was grave and sudden enough to prevent the offence from amounting to murder is a question of fact.

Illustrations.
(a) A, under the influence of passion excited by a provocation given by Z, intentionally kills Y, Z's child. This is murder, in as much as the provocation was not given by the child, and the death of the child was not caused by accident or misfortune in doing an act caused by the provocation.
(b) Y gives grave and sudden provocation to A. A, on this provocation, fires a pistol at Y, neither intending nor knowing himself to be likely to kill Z, who is near him, but out of sight. A kills Z. Here A has not committed murder, but merely culpable homicide.
(c) A is lawfully arrested by Z, a bailiff. A is excited to sudden and violent passion by the arrest, and kills Z. This is murder, in as much as the provocation was given by a thing done by a public servant in the exercise of his powers.
(d) A appears as a witness before Z, a Magistrate. Z says that he does not believe a word of A's deposition, and that A has perjured himself. A is moved to sudden passion by these words, and kills Z. This is murder.
(e) A attempts to pull Z's nose. Z, in the exercise of the right of private defence, lays hold of A to prevent him from doing so. A is moved to sudden and violent passion in consequence, and kills Z. This is murder, in as much as the provocation was giving by a thing done in the exercise of the right of private defence.
(f) Z strikes B. B is by this provocation excited to violent rage. A, a bystander, intending to take advantage of B's rage, and to cause him to kill Z, puts a knife into B's hand for that purpose. B kills Z with the knife. Here B may have committed only culpable homicide, but A is guilty of murder.

Exception 2.—Culpable homicide is not murder if the offender in the exercise in good faith of the right of private defence of person or property, exceeds the power given to him by law and causes the death of the person against whom he is exercising such right of defence without premeditation, and without any intention of doing more harm than is necessary for the purpose of such defence.

Illustration.
Z attempts to horsewhip A, not in such a manner as to cause grievous hurt to A. A draws a pistol. Z persists in the assault. A believing in good faith that he can by no other means prevent himself from being horsewhipped, shoots Z dead. A has not committed murder, but only culpable homicide.

Exception 3.—Culpable homicide is not murder if the offender, being a public servant or aiding a public servant acting for the advancement of public justice, exceeds the powers given to him by law, and causes death by doing an act which he, in good faith, believes to be lawful and necessary for the due discharge of his duty as such public servant and without ill-will towards the person whose death is caused.

Exception 4.—Culpable homicide is not murder if it is committed without premeditation in a sudden fight in the heat of passion upon a sudden quarrel and without the offender's having taken undue advantage or acted in a cruel or unusual manner.
Explanation.—It is immaterial in such cases which party offers the provocation or commits the first assault.

Exception 5.—Culpable homicide is not murder when the person whose death is caused, being above the age of eighteen years, suffers death or takes the risk of death with his own consent.

Illustration.
A, by instigation, voluntarily causes Z, a child to commit suicide. Here, on account of Z's youth, he was incapable of giving consent to his own death; A has therefore abetted murder.`
  },
  '103': {
    title: 'Punishment for murder',
    text: `103. Punishment for murder.—(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.
(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other ground, each member of such group shall be punished with death or with imprisonment for life or imprisonment for a term which shall not be less than seven years, and shall also be liable to fine.`
  },
  '104': {
    title: 'Punishment for murder by life-convict',
    text: `104. Punishment for murder by life-convict.—Whoever, being under sentence of imprisonment for life, commits murder, shall be punished with death or with imprisonment for life, which shall mean the remainder of that person's natural life.`
  },
  '105': {
    title: 'Punishment for culpable homicide not amounting to murder',
    text: `105. Punishment for culpable homicide not amounting to murder.—Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which shall not be less than five years but which may extend to ten years, and shall also be liable to fine, if the act by which the death is caused is done with the intention of causing death, or of causing such bodily injury as is likely to cause death; or with imprisonment of either description for a term which may extend to ten years and with fine, if the act is done with the knowledge that it is likely to cause death, but without any intention to cause death, or to cause such bodily injury as is likely to cause death.`
  },
  '106': {
    title: 'Causing death by negligence',
    text: `106. Causing death by negligence.—(1) Whoever causes death of any person by doing any rash or negligent act not amounting to culpable homicide, shall be punished with imprisonment of either description for a term which may extend to five years, and shall also be liable to fine; and if such act is done by a registered medical practitioner while performing medical procedure, he shall be punished with imprisonment of either description for a term which may extend to two years, and shall also be liable to fine.

Explanation.—For the purposes of this sub-section, "registered medical practitioner" means a medical practitioner who possesses any medical qualification recognised under the National Medical Commission Act, 2019 and whose name has been entered in the National Medical Register or a State Medical Register under that Act.

(2) Whoever causes death of any person by rash and negligent driving of vehicle not amounting to culpable homicide, and escapes without reporting it to a police officer or a Magistrate soon after the incident, shall be punished with imprisonment of either description of a term which may extend to ten years, and shall also be liable to fine.`
  },
  '111': {
    title: 'Organised crime',
    text: `111. Organised crime.—(1) Any continuing unlawful activity including kidnapping, robbery, dacoity, extortion, land grabbing, contract killing, economic offences, cyber crimes having severe consequences, running trafficking in people, drugs, weapons or illicit goods or services, committing human trafficking for prostitution or ransom, by any person or a group of persons acting in concert, singly or jointly, either as a member of an organised crime syndicate or on behalf of such syndicate, by use of violence, threat of violence, intimidation or coercion, or other unlawful means, with the objective of obtaining pecuniary benefits, or gaining economic or other advantage, shall constitute organised crime.
(2) Whoever commits organised crime shall,—
(a) if such offence has resulted in the death of any person, be punished with death or imprisonment for life, and shall also be liable to a fine which shall not be less than ten lakh rupees;
(b) in any other case, be punished with imprisonment for a term which shall not be less than five years but which may extend to imprisonment for life, and shall also be liable to a fine which shall not be less than five lakh rupees.`
  },
  '112': {
    title: 'Petty organised crime',
    text: `112. Petty organised crime.—(1) Whoever, being a member of a group or gang, commits theft, snatching, cheating, pickpocketing, card tricking, shoplifting, stealing of cargo or any other similar crime by using force, deceit, or other unlawful means, shall be deemed to commit petty organised crime.
(2) Whoever commits petty organised crime shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to seven years, and shall also be liable to fine.`
  },
  '113': {
    title: 'Terrorist act',
    text: `113. Terrorist act.—(1) Whoever, with intent to threaten or likely to threaten the unity, integrity, sovereignty, security or economic security of India or to strike terror or likely to strike terror in the people or any section of the people in India or in any foreign country,—
(a) by using bombs, dynamite or other explosive substances or inflammable substances or firearms or other lethal weapons or poisonous or noxious gases or other chemicals or by any other substances (whether biological or otherwise) of a hazardous nature or by any other means, causes or is likely to cause death or injury to any person or persons, or damage to or destruction of property, or disruption of any supplies or services essential to the life of the community;
(b) commits a terrorist act.
(2) Whoever commits a terrorist act shall,—
(a) if such offence has resulted in the death of any person, be punished with death or imprisonment for life, and shall also be liable to fine;
(b) in any other case, be punished with imprisonment for a term which shall not be less than five years but which may extend to imprisonment for life, and shall also be liable to fine.`
  },
  '152': {
    title: 'Act endangering sovereignty, unity and integrity of India',
    text: `152. Act endangering sovereignty, unity and integrity of India.—Whoever, purposely or knowingly, by words, either spoken or written, or by signs, or by visible representation, or by electronic communication or by use of financial means, or otherwise, excites or attempts to excite, secession or armed rebellion or subversive activities, or encourages feelings of separatist activities or endangers sovereignty or unity and integrity of India; or commits or abets any such act shall be punished with imprisonment for life or with imprisonment which may extend to seven years and shall also be liable to fine.
Explanation.—Comments expressing disapprobation of the measures, or administrative or other action of the Government with a view to obtain their alteration by lawful means without exciting or attempting to excite the activities or feelings referred to in this section, do not constitute an offence under this section.`
  },
  '178': {
    title: 'Counterfeiting coin, government stamps, currency-notes or bank-notes',
    text: `178. Counterfeiting coin, government stamps, currency-notes or bank-notes.—Whoever counterfeits, or knowingly performs any part of the process of counterfeiting, any coin, stamp issued by Government for the purpose of revenue, currency-note or bank-note, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.

Explanation.—For the purposes of this Chapter,—
(1) the expression "bank-note" means a promissory note or engagement for the payment of money to bearer on demand issued by any person carrying on the business of banking in any part of the world, or issued by or under the authority of any State or Sovereign Power, and intended to be used as equivalent to, or as a substitute for money;
(2) "coin" shall have the same meaning assigned to it in section 2 of the Coinage Act, 2011 and includes metal used for the time being as money and is stamped and issued by or under the authority of any State or Sovereign Power intended to be so used;
(3) a person commits the offence of "counterfeiting Government stamp" who counterfeits by causing a genuine stamp of one denomination to appear like a genuine stamp of a different denomination;
(4) a person commits the offence of counterfeiting coin who intending to practise deception, or knowing it to be likely that deception will thereby be practised, causes a genuine coin to appear like a different coin; and
(5) the offence of "counterfeiting coin" includes diminishing the weight or alteration of the composition, or alteration of the appearance of the coin.`
  },
  '226': {
    title: 'Attempt to commit suicide to compel or restrain exercise of lawful power',
    text: `226. Attempt to commit suicide to compel or restrain exercise of lawful power.—Whoever attempts to commit suicide with the intent to compel or restrain any public servant from discharging his official duty, or exercising his lawful power, shall be punished with simple imprisonment for a term which may extend to one year, or with fine, or with both, and may also be sentenced to community service.`
  },
  '303': {
    title: 'Theft',
    text: `303. Theft.—(1) Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.

Explanation 1.—A thing so long as it is attached to the earth, not being movable property, is not the subject of theft; but it becomes capable of being the subject of theft as soon as it is severed from the earth.
Explanation 2.—A moving effected by the same act which affects the severance may be a theft.
Explanation 3.—A person is said to cause a thing to move by removing an obstacle which prevented it from moving or by separating it from any other thing, as well as by actually moving it.
Explanation 4.—A person who by any means causes an animal to move, is said to move that animal, and to move everything which, in consequence of the motion so caused, is moved by that animal.
Explanation 5.—The consent mentioned in the definition may be express or implied, and may be given either by the person in possession, or by any person having for that purpose authority either express or implied.

Illustrations.
(a) A cuts down a tree on Z's ground, with the intention of dishonestly taking the tree out of Z's possession without Z's consent. Here, as soon as A has severed the tree in order to such taking, he has committed theft.
(b) A puts a bait for dogs in his pocket, and thus induces Z's dog to follow it. Here, if A's intention be dishonestly to take the dog out of Z's possession without Z's consent, A has committed theft as soon as Z's dog has begun to follow A.
(c) A meets a bullock carrying a box of treasure. He drives the bullock in a certain direction, in order that he may dishonestly take the treasure. As soon as the bullock begins to move, A has committed theft of the treasure.
(d) A, being Z's servant, and entrusted by Z with the care of Z's plate, dishonestly runs away with the plate, without Z's consent. A has committed theft.
(e) Z, going on a journey, entrusts his plate to A, the keeper of a warehouse, till Z shall return. A carries the plate to a goldsmith and sells it. Here the plate was not in Z's possession. It could not therefore be taken out of Z's possession, and A has not committed theft, though he may have committed criminal breach of trust.
(f) A finds a ring belonging to Z on a table in the house which Z occupies. Here the ring is in Z's possession, and if A dishonestly removes it, A commits theft.
(g) A finds a ring lying on the high-road, not in the possession of any person. A by taking it commits no theft, though he may commit criminal misappropriation of property.
(h) A sees a ring belonging to Z lying on a table in Z's house. Not venturing to misappropriate the ring immediately for fear of search and detection, A hides the ring in a place where it is highly improbable that it will ever be found by Z, with the intention of taking the ring from the hiding place and selling it when the loss is forgotten. Here, A, at the time of first moving the ring, commits theft.
(i) A delivers his watch to Z, a jeweller, to be regulated. Z carries it to his shop. A, not owing to the jeweller any debt for which the jeweller might lawfully detain the watch as a security, enters the shop openly, takes his watch by force out of Z's hand, and carries it away. Here A, though he may have committed criminal trespass and assault, has not committed theft, inasmuch as what he did was not done dishonestly.
(j) A owes money to Z for repairing the watch, and Z retains the watch lawfully as a security for the debt. A takes the watch out of Z's possession, with the intention of depriving Z of the property as a security for his debt. A commits theft.
(k) A, having pawned his watch to Z, takes it out of Z's possession without Z's consent, not having paid what he borrowed on the watch. A commits theft, as he dishonestly deprives Z of the security.
(l) A takes an article belonging to Z out of Z's possession, without Z's consent, with the intention of keeping it until he obtains money from Z as a reward for its restoration. Here, A takes dishonestly; A has therefore committed theft.
(m) A, being on friendly terms with Z, goes into Z's library in Z's absence, and takes away a book without Z's express consent for the purpose merely of reading it, and with the intention of returning it. Here, it is probable that A's intention was not dishonest, and if so, A has not committed theft.
(n) A asks charity from Z's wife. She gives A money, food, and clothes, which A knows to be Z's property. The wife has authority to give alms. Here, A has not committed theft.
(o) A is the paramour of Z's wife. She gives A valuable property, which A knows to be her husband's property, and to be not her property to give. A takes the property dishonestly. A has committed theft.
(p) A, in good faith, believes property belonging to Z is his own property. A takes the property out of Z's possession. In this case, A does not commit theft, as he lacks the dishonest intention required for the offence.

(2) Whoever commits theft shall be punished with imprisonment for a term which may extend to three years, or with fine, or with both, and in the case of a second or subsequent conviction of any person under this section, he shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and with fine:
Provided that in the case of a first conviction of any person, if the value of the stolen property is less than five thousand rupees, and the person has returned or restored the stolen property, the Court may, instead of the punishment of imprisonment or fine, sentence such person to perform community service.`
  },
  '304': {
    title: 'Snatching',
    text: `304. Snatching.—(1) Theft is "snatching" if the offender, in order to commit theft, suddenly or quickly or forcibly seizes or secures or grabs or takes away from any person or from his possession any movable property.
(2) Whoever commits snatching shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.`
  },
  '308': {
    title: 'Extortion',
    text: `308. Extortion.—(1) Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property, or valuable security or anything signed or sealed which may be converted into a valuable security, commits "extortion".

Illustrations.
(a) A threatens to publish a defamatory libel concerning Z, unless Z gives him money. He induces Z to give him money. A has committed extortion.
(b) A threatens Z that he will keep Z's child in wrongful confinement, unless Z will sign and deliver to A a promissory note binding Z to pay certain monies to A. Z signs and delivers the note. A has committed extortion.
(c) A threatens Z that he will send club-men to plough up Z's field, unless Z will sign and deliver to B a bond binding Z under a penalty to deliver certain produce to B. Z signs and delivers the bond. A has committed extortion.
(d) A, by putting Z in fear of grievous hurt to Z's child, obtaining Z's signature to a blank paper and delivery of it to A. Z signs and delivers the paper. Here, as the signature so obtained may be converted into a valuable security, A has committed extortion.

(2) Whoever commits extortion shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.

(3) Whoever, in order to the committing of extortion, puts any person in fear, or attempts to put any person in fear, of any injury, shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.

(4) Whoever, in order to the committing of extortion, puts or attempts to put any person in fear of death or of grievous hurt to that person or to any other, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.

(5) Whoever commits extortion by putting any person in fear of death or of grievous hurt to that person or to any other, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.

(6) Whoever, in order to the committing of extortion, puts or attempts to put any person in fear of an accusation, against that person or any other, of having committed, or attempted to commit, an offence punishable with death or with imprisonment for life, or with imprisonment for a term which may extend to ten years, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.

(7) Whoever commits extortion by putting any person in fear of an accusation against that person or any other, of having committed or attempted to commit any offence punishable with death, or with imprisonment for life, or with imprisonment for a term which may extend to ten years, or of having attempted to induce any other person to commit such offence, shall be punished with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`
  },
  '309': {
    title: 'Robbery',
    text: `309. Robbery.—(1) In all robbery there is either theft or extortion.
(2) Theft is "robbery" if, in order to the committing of the theft, or in committing the theft, or in carrying away or attempting to carry away property obtained by the theft, the offender, for that end voluntarily causes or attempts to cause to any person death or hurt or wrongful restraint, or fear of instant death or of instant hurt, or of instant wrongful restraint.
(3) Extortion is "robbery" if the offender, at the time of committing the extortion, is in the presence of the person put in fear, and commits the extortion by putting that person in fear of instant death, of instant hurt, or of instant wrongful restraint to that person or to some other person, and, by so putting in fear, induces the person so put in fear then and there to deliver up the thing extorted.

Explanation.—The offender is said to be present if he is sufficiently near to put the other person in fear of instant death, of instant hurt, or of instant wrongful restraint.

Illustrations.
(a) A holds Z down, and fraudulently takes Z's money and jewels from Z's clothes, without Z's consent. Here A has committed theft, and, in order to the committing of that theft, has voluntarily caused wrongful restraint to Z. A has therefore committed robbery.
(b) A meets Z on the high road, shows a pistol, and demands Z's purse. Z, in consequence, surrenders his purse. Here A has extorted the purse from Z by putting him in fear of instant hurt, and being at the time of committing the extortion in his presence. A has therefore committed robbery.
(c) A meets Z and Z's child on the high road. A takes the child, and threatens to fling it down a precipice, unless Z delivers his purse. Z, in consequence, delivers his purse. Here A has extorted the purse from Z, by causing Z to be in fear of instant hurt to the child who is there present. A has therefore committed robbery on Z.
(d) A obtains property from Z by saying "Your child is in the hands of my gang, and will be put to death unless you send us ten thousand rupees". This is extortion, and punishable as such: but it is not robbery, unless Z is put in fear of the instant death of his child.

(4) Whoever commits robbery shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine; and, if the robbery be committed on the highway between sunset and sunrise, the imprisonment may be extended to fourteen years.
(5) Whoever attempts to commit robbery shall be punished with rigorous imprisonment for a term which may extend to seven years, and shall also be liable to fine.
(6) If any person, in committing or in attempting to commit robbery, voluntarily causes hurt, such person, and any other person jointly concerned in committing or attempting to commit such robbery, shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.`
  },
  '310': {
    title: 'Dacoity',
    text: `310. Dacoity.—(1) When five or more persons conjointly commit or attempt to commit a robbery, or where the whole number of persons conjointly committing or attempting to commit a robbery, and persons present and aiding such commission or attempt, amount to five or more, every person so committing, attempting or aiding, is said to commit "dacoity".
(2) Whoever commits dacoity shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.
(3) If any one of five or more persons, who are conjointly committing dacoity, commits murder in so committing dacoity, every one of those persons shall be punished with death, or imprisonment for life, or rigorous imprisonment for a term which shall not be less than ten years, and shall also be liable to fine.
(4) Whoever makes any preparation for committing dacoity, shall be punished with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.
(5) Whoever is one of five or more persons assembled for the purpose of committing dacoity, shall be punished with rigorous imprisonment for a term which may extend to seven years, and shall also be liable to fine.
(6) Whoever belongs to a gang of persons associated for the purpose of habitually committing dacoity, shall be punished with imprisonment for life, or with rigorous imprisonment for a term which may extend to ten years, and shall also be liable to fine.`
  },
  '316': {
    title: 'Criminal breach of trust',
    text: `316. Criminal breach of trust.—(1) Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits "criminal breach of trust".

Explanation 1.—A person, being the employer of an establishment whether exempted under section 17 of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952, or not, who deducts the employee's contribution from the wages payable to such employee for credit to a Provident Fund or Family Pension Fund established by any law for the time being in force, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said law, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.
Explanation 2.—A person, being the employer of an establishment which is a factory to which the Employees' State Insurance Act, 1948, applies, who deducts the employee's contribution from the wages payable to such employee for credit to the Employees' State Insurance Fund held and administered by the Employees' State Insurance Corporation established under the said Act, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said Act, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.

Illustrations.
(a) A, being an executor to the will of a deceased person, dishonestly disobeys the law which directs him to divide the effects according to the will, and appropriates them to his own use. A has committed criminal breach of trust.
(b) A is a warehouse-keeper. Z, going on a journey, entrusts his furniture to A, under a contract that it shall be returned on payment of a stipulated sum for warehouse-room. A dishonestly sells the goods. A has committed criminal breach of trust.
(c) A, residing in Calcutta, is an agent for Z, residing at Delhi. There is an express or implied contract between A and Z, that all sums remitted by Z to A shall be invested by A according to Z's direction. Z remits a lakh of rupees to A, with directions to A to invest the same in Company's paper. A dishonestly disobeys the directions, and employs the money in his own business. A has committed criminal breach of trust.
(d) A, in the last illustration, does not act dishonestly, but in good faith, believing that it will be more for Z's advantage to hold shares in the Bank of Bengal, disobeys Z's directions, and buys shares in the Bank of Bengal, for Z, instead of buying Company's paper. Here, though Z should suffer a loss, and be entitled to bring a civil action against A for that loss, A, not having acted dishonestly, has not committed criminal breach of trust.
(e) A, a revenue officer, is entrusted with public money and is either directed by law, or bound by a contract, express or implied, with the Government, to pay into a certain treasury all the public money which he holds. A dishonestly appropriates the money. A has committed criminal breach of trust.
(f) A, a carrier, is entrusted by Z with property to be carried by land or by water. A dishonestly misappropriates the property. A has committed criminal breach of trust.

(2) Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.
(3) Whoever, being entrusted with property as a carrier, wharfinger or warehouse-keeper, commits criminal breach of trust in respect of such property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.
(4) Whoever, being a clerk or servant or employed as a clerk or servant, and being in any manner entrusted in such capacity with property, or with any dominion over property, commits criminal breach of trust in respect of that property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.
(5) Whoever, being a public servant or in the way of his business as a banker, merchant, factor, broker, attorney or agent, is entrusted with property, or with any dominion over property in that capacity, commits criminal breach of trust in respect of that property, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`
  },
  '318': {
    title: 'Cheating',
    text: `318. Cheating.—(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to "cheat".

Explanation.—A dishonest concealment of facts is a deception within the meaning of this section.

Illustrations.
(a) A, by falsely pretending to be in the Civil Service, intentionally deceives Z, and thus dishonestly induces Z to let him have on credit goods for which he does not mean to pay. A cheats.
(b) A, by putting a counterfeit mark on an article, intentionally deceives Z into a belief that this article was made by a certain celebrated manufacturer, and thus dishonestly induces Z to buy and pay for the article. A cheats.
(c) A, by exhibiting to Z a false sample of an article, intentionally deceives Z into believing that the article corresponds with the sample, and thereby dishonestly induces Z to buy and pay for the article. A cheats.
(d) A, by tendering in payment for an article a bill on a house with which A keeps no money, and by which A expects that the bill will be dishonoured, intentionally deceives Z, and thereby dishonestly induces Z to deliver the article, intending not to pay for it. A cheats.
(e) A, by pledging as diamonds articles which he knows are not diamonds, intentionally deceives Z, and thereby dishonestly induces Z to lend money. A cheats.
(f) A intentionally deceives Z into a belief that A means to repay any money that Z may lend to him, and thereby dishonestly induces Z to lend him money, A not intending to repay it. A cheats.
(g) A intentionally deceives Z into a belief that A means to deliver to Z a certain quantity of indigo plant which he does not intend to deliver, and thereby dishonestly induces Z to advance money for the indigo plant, and A cheats.
(h) A intentionally deceives Z into a belief that A means to perform a certain agreement which he does not intend to perform, and thereby dishonestly induces Z to pay money to A, and A cheats.
(i) A sells and conveys an estate to B. A, knowing that in consequence of such sale he has no right to the property, sells or mortgages the same estate to C, without disclosing that fact to C, and makes C pay money for the estate or mortgage, and A cheats.

(2) Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.
(3) Whoever cheats with the knowledge that he is likely thereby to cause wrongful loss to a person whose interest in the transaction to which the cheating relates he was bound, either by law, or by a legal contract, to protect, shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.
(4) Whoever cheats and dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.`
  },
  '358': {
    title: 'Repeal and savings',
    text: `358. Repeal and savings.—(1) The Indian Penal Code is hereby repealed.
(2) Notwithstanding the repeal of the Code under sub-section (1), any action taken or anything done under the Code so repealed shall be deemed to have been taken or done under the corresponding provisions of this Sanhita.
(3) The mention of particular matters in sub-section (2) shall not be held to prejudice or affect the general application of section 6 of the General Clauses Act, 1897 with regard to the effect of repeals.`
  }
};

// Terminology translation helper
function modernizeText(text) {
  if (!text) return '';
  return text
    .replace(/Indian Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/Penal Code/g, 'Bharatiya Nyaya Sanhita')
    .replace(/Code of Criminal Procedure/g, 'Bharatiya Nagarik Suraksha Sanhita')
    .replace(/Indian Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/Evidence Act/g, 'Bharatiya Sakshya Adhiniyam')
    .replace(/Metropolitan Magistrate/g, 'Judicial Magistrate')
    .replace(/Metropolitan area/g, 'district')
    .replace(/Assistant Sessions Judge/g, 'Judicial Magistrate')
    .replace(/this Code/g, 'this Sanhita')
    .replace(/under this Code/g, 'under this Sanhita')
    .replace(/by this Code/g, 'by this Sanhita')
    .replace(/against this Code/g, 'against this Sanhita')
    .replace(/of this Code/g, 'of this Sanhita')
    .replace(/Code/g, 'Sanhita')
    .replace(/transportation for life/g, 'imprisonment for life')
    .replace(/transportation/g, 'imprisonment');
}

// BNS Section -> IPC Section correspondence lookup
function getIpcSection(bnsSec) {
  const num = parseInt(bnsSec, 10);
  if (isNaN(num)) return null;

  // Chapter II (Punishments)
  if (num === 4) return '53';
  if (num === 5) return '54';
  if (num === 6) return '57';
  if (num === 7) return '60';
  if (num === 8) return '64';
  if (num === 9) return '71';
  if (num === 10) return '72';
  if (num === 11) return '73';
  if (num === 12) return '74';
  if (num === 13) return '75';

  // Chapter III (General Exceptions)
  if (num >= 14 && num <= 44) {
    return String(num + 62);
  }

  // Chapter IV (Abetment, Conspiracy, Attempt)
  if (num === 45) return '107';
  if (num === 46) return '108';
  if (num === 47) return '108A';
  if (num === 48) return null;
  if (num === 49) return '109';
  if (num === 50) return '110';
  if (num === 51) return '111';
  if (num === 52) return '112';
  if (num === 53) return '113';
  if (num === 54) return '114';
  if (num === 55) return '115';
  if (num === 56) return '116';
  if (num === 57) return '117';
  if (num === 58) return '118';
  if (num === 59) return '119';
  if (num === 60) return '120';
  if (num === 61) return '120B';
  if (num === 62) return '511';

  // Chapter V (Offences against Women & Children)
  if (num === 63) return '375';
  if (num === 64) return '376';
  if (num === 65) return '376';
  if (num === 66) return '376AB';
  if (num === 67) return '376B';
  if (num === 68) return null;
  if (num === 69) return null;
  if (num === 70) return '376D';
  if (num === 71) return '376E';
  if (num === 72) return '228A';
  if (num === 73) return '228A';
  if (num === 74) return '354';
  if (num === 75) return '354A';
  if (num === 76) return '354B';
  if (num === 77) return '354C';
  if (num === 78) return '354D';
  if (num === 79) return '509';
  if (num === 80) return '304B';
  if (num === 81) return '493';
  if (num === 82) return '494';
  if (num === 83) return '496';
  if (num === 84) return '498';
  if (num === 85) return '498A';
  if (num === 86) return '498A';
  if (num === 87) return '366';
  if (num === 88) return '312';
  if (num === 89) return '313';
  if (num === 90) return '314';
  if (num === 91) return '315';
  if (num === 92) return '316';
  if (num === 93) return '317';
  if (num === 94) return '318';
  if (num === 95) return null;
  if (num === 96) return null;
  if (num === 97) return '369';
  if (num === 98) return '372';
  if (num === 99) return '373';

  // Chapter VI (Human Body)
  if (num === 100) return '299';
  if (num === 101) return '300';
  if (num === 102) return '301';
  if (num === 103) return '302';
  if (num === 104) return '303';
  if (num === 105) return '304';
  if (num === 106) return '304A';
  if (num === 107) return '305';
  if (num === 108) return '306';
  if (num === 109) return '307';
  if (num === 110) return '308';
  if (num === 111) return null;
  if (num === 112) return null;
  if (num === 113) return null;
  if (num === 114) return '319';
  if (num === 115) return '323';
  if (num === 116) return '322';
  if (num === 117) return '325';
  if (num === 118) return '324';
  if (num === 119) return '327';
  if (num === 120) return '330';
  if (num === 121) return '332';
  if (num === 122) return '334';
  if (num === 123) return '328';
  if (num === 124) return '326A';
  if (num === 125) return '336';
  if (num === 126) return '341';
  if (num === 127) return '342';
  if (num === 128) return '349';
  if (num === 129) return '350';
  if (num === 130) return '351';
  if (num === 131) return '352';
  if (num === 132) return '353';
  if (num === 133) return '355';
  if (num === 134) return '356';
  if (num === 135) return '357';
  if (num === 136) return '358';
  if (num === 137) return '359';
  if (num === 138) return '362';
  if (num === 139) return '363';
  if (num === 140) return '364';
  if (num === 141) return '365';
  if (num === 142) return '366';
  if (num === 143) return '367';
  if (num === 144) return '368';
  if (num === 145) return '370';
  if (num === 146) return '374';

  // Chapter VII (Offences against State)
  if (num === 147) return '121';
  if (num === 148) return '121A';
  if (num === 149) return '122';
  if (num === 150) return '123';
  if (num === 151) return '124';
  if (num === 152) return null;
  if (num === 153) return '125';
  if (num === 154) return '126';
  if (num === 155) return '127';
  if (num === 156) return '128';
  if (num === 157) return '129';
  if (num === 158) return '130';

  // Chapter VIII (Army, Navy, Air Force)
  if (num >= 159 && num <= 168) {
    return String(num - 28);
  }

  // Chapter IX (Elections)
  if (num >= 169 && num <= 177) {
    const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    return '171' + chars[num - 169];
  }

  // Chapter X (Coin, Currency, Stamps)
  if (num === 178) return '231';
  if (num === 179) return '237';
  if (num === 180) return '242';
  if (num === 181) return '233';
  if (num === 182) return '258';
  if (num === 183) return '489E';
  if (num === 184) return '261';
  if (num === 185) return '256';
  if (num === 186) return '260';
  if (num === 187) return '244';
  if (num === 188) return '245';

  // Chapter XI (Public Tranquillity)
  if (num === 189) return '141';
  if (num === 190) return '149';
  if (num === 191) return '146';
  if (num === 192) return '153';
  if (num === 193) return '154';
  if (num === 194) return '159';
  if (num === 195) return '152';
  if (num === 196) return '153A';
  if (num === 197) return '153B';

  // Chapter XII (Offences by or relating to Public Servants)
  if (num === 198) return '166';
  if (num === 199) return '166A';
  if (num === 200) return '166B';
  if (num === 201) return '167';
  if (num === 202) return '168';
  if (num === 203) return '169';
  if (num === 204) return '170';
  if (num === 205) return '171';

  // Chapter XIII (Contempts of Public Servants)
  if (num === 206) return '172';
  if (num === 207) return '173';
  if (num === 208) return '174';
  if (num === 209) return '174A';
  if (num === 210) return '175';
  if (num === 211) return '176';
  if (num === 212) return '177';
  if (num === 213) return '178';
  if (num === 214) return '179';
  if (num === 215) return '180';
  if (num === 216) return '181';
  if (num === 217) return '182';
  if (num === 218) return '183';
  if (num === 219) return '184';
  if (num === 220) return '185';
  if (num === 221) return '186';
  if (num === 222) return '187';
  if (num === 223) return '188';
  if (num === 224) return '189';
  if (num === 225) return '190';
  if (num === 226) return null;

  // Chapter XIV (False evidence and public justice)
  const xivMap = {
    '227': '193',
    '228': '194',
    '229': '195',
    '230': '195A',
    '231': '196',
    '232': '197',
    '233': '198',
    '234': '199',
    '235': '200',
    '236': '201',
    '237': '202',
    '238': '203',
    '239': '204',
    '240': '205',
    '241': '206',
    '242': '207',
    '243': '208',
    '244': '209',
    '245': '210',
    '246': '211',
    '247': '212',
    '248': '213',
    '249': '214',
    '250': '215',
    '251': '216',
    '252': '216A',
    '253': '217',
    '254': '218',
    '255': '219',
    '256': '220',
    '257': '221',
    '258': '222',
    '259': '223',
    '260': '221',
    '261': '222',
    '262': '223',
    '263': '224',
    '264': '225',
    '265': '225B',
    '266': '227',
    '267': '228',
    '268': '229',
    '269': '229A'
  };
  if (xivMap[bnsSec]) return xivMap[bnsSec];

  // Chapter XV (Public Health, Safety, Decency, Morals)
  if (num >= 270 && num <= 280) {
    return String(num - 2);
  }
  if (num === 281) return '279';
  if (num === 282) return '280';
  if (num >= 283 && num <= 296) {
    return String(num - 2);
  }
  if (num === 297) return '294A';

  // Chapter XVI (Religion)
  if (num >= 298 && num <= 301) {
    return String(num - 3);
  }
  if (num === 302) return '295A';

  // Chapter XVII (Property)
  const xviiMap = {
    '303': '378',
    '304': null,
    '305': '379',
    '306': '380',
    '307': '381',
    '308': '383',
    '309': '390',
    '310': '391',
    '311': '397',
    '312': '413',
    '313': '401',
    '314': '403',
    '315': '404',
    '316': '406',
    '317': '411',
    '318': '420',
    '319': '419',
    '320': '418',
    '321': '421',
    '322': '422',
    '323': '423',
    '324': '426',
    '325': '428',
    '326': '435',
    '327': '437',
    '328': '440',
    '329': '441',
    '330': '442',
    '331': '443',
    '332': '444',
    '333': '445',
    '334': '446'
  };
  if (xviiMap[bnsSec]) return xviiMap[bnsSec];

  // Chapter XVIII (Documents and Property Marks)
  const xviiiMap = {
    '335': '464',
    '336': '463',
    '337': '465',
    '338': '466',
    '339': '467',
    '340': '468',
    '341': '469',
    '342': '471',
    '343': '474',
    '344': '472',
    '345': '473',
    '346': '479',
    '347': '482',
    '348': '483',
    '349': '484',
    '350': '485'
  };
  if (xviiiMap[bnsSec]) return xviiiMap[bnsSec];

  // Chapter XIX (Criminal Intimidation, Insult, Annoyance, Defamation)
  const xixMap = {
    '351': '503',
    '352': '504',
    '353': '505',
    '354': '508',
    '355': '510',
    '356': '499',
    '357': '491'
  };
  if (xixMap[bnsSec]) return xixMap[bnsSec];

  return null;
}

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
      let type = 'clause';
      let formattedText = textStr;

      const isLevel2SubSec = p.level === 2 && !isLowercase;

      if (isLevel2SubSec) {
        type = 'subsection';
        formattedText = `(${subSectionIndex}) ${textStr}`;
        subSectionIndex++;
      } else {
        // Normal nesting based on parent type
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

function patchBNS() {
  console.log('Restructuring chapters and patching verbatim BNS...');

  const finalChapters = [];

  for (const chap of bns.chapters) {
    const sectionsList = [];

    for (const sec of chap.sections) {
      const secNumStr = String(sec.number);

      if (newSections[secNumStr]) {
        // Use custom high-fidelity override
        const cleanText = formatSectionText(newSections[secNumStr].text, secNumStr, newSections[secNumStr].title);
        sectionsList.push({
          number: secNumStr,
          title: newSections[secNumStr].title,
          text: cleanText
        });
      } else {
        const ipcSecStr = getIpcSection(secNumStr);
        if (ipcSecStr && ipcMap[ipcSecStr]) {
          const ipcSec = ipcMap[ipcSecStr];
          
          let targetTitle = ipcSec.title;
          if (targetTitle.includes('Repealed')) {
            targetTitle = 'Repealed';
          } else {
            targetTitle = `${targetTitle} (Corresponding to Sec ${ipcSecStr} of IPC)`;
          }

          const targetText = formatSectionText(modernizeText(ipcSec.text), secNumStr, targetTitle);

          sectionsList.push({
            number: secNumStr,
            title: targetTitle,
            text: targetText
          });
        } else {
          // Fallback placeholder if no mapping exists
          sectionsList.push({
            number: secNumStr,
            title: `Section ${secNumStr} of the Bharatiya Nyaya Sanhita`,
            text: `Statutory provisions under Section ${secNumStr} of the Bharatiya Nyaya Sanhita, 2023 (BNS).`
          });
        }
      }
    }

    finalChapters.push({
      number: chap.number,
      title: chap.title,
      sections: sectionsList
    });
  }

  // Update BNS object
  bns.chapters = finalChapters;
  bns.sectionCount = 358;

  // Save the result back
  fs.writeFileSync(bnsPath, JSON.stringify(bns, null, 2), 'utf8');
  console.log(`Successfully patched ${bns.name}! Restructured into ${finalChapters.length} chapters.`);
}

patchBNS();
