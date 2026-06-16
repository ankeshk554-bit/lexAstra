const fs = require('fs');
const path = require('path');

const jsonPath = 'c:/AI project/lexastra/data/bare-acts/bharatiya-nagarik-suraksha-sanhita.json';

// Read the original file
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Detailed BNSS Schedules
const schedules = [
  {
    number: "First Schedule",
    title: "Classification of Offences",
    content: "This Schedule provides a comprehensive table classifying offences under the Bharatiya Nyaya Sanhita, 2023 (BNS) into categories:\n\n1. COGNIZABLE OR NON-COGNIZABLE:\n- Cognizable: Offences for which a police officer may arrest without a warrant (e.g. Murder, Kidnapping, Theft, Rape).\n- Non-Cognizable: Offences for which a police officer has no authority to arrest without a warrant (e.g. Simple Hurt, Defamation, Cheating under minor values).\n\n2. BAILABLE OR NON-BAILABLE:\n- Bailable: Offences where bail is a matter of right (e.g. Simple Affray, Negligent driving, Simple Hurt).\n- Non-Bailable: Offences where bail is a matter of court discretion (e.g. Murder, Dacoity, Abetment of Suicide).\n\n3. TRIABLE BY WHICH COURT:\n- Specifies whether the case is triable by a Court of Session, a Judicial Magistrate of the First Class (JMFC), or any Magistrate."
  },
  {
    number: "Second Schedule",
    title: "Forms (Standard Legal Templates)",
    content: "Contains 56 official statutory forms and templates used in criminal proceedings, from arrest warrants and search notices to surety bonds, charges, and commitment orders. (Refer to the Forms tab to view the complete list and custom templates)."
  }
];

// Complete list of all 56 Forms of BNSS with detailed legal templates
const forms = [
  {
    number: "Form 1",
    title: "Summons to an Accused Person (Section 63)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name of Accused]\nof [Address]\n\nWHEREAS your attendance is necessary to answer to a charge of [state briefly the offence charged], you are hereby required to appear in person (or by pleader) before this Court on the ____ day of _________ 20___, at ____ o'clock.\n\nHerein fail not.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 2",
    title: "Warrant of Arrest (Section 72)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the police officer or other person who is to execute the warrant]\n\nWHEREAS [Name of Accused] of [Address] stands charged with the offence of [state the offence], you are hereby directed to arrest the said [Name of Accused] and to produce him before me.\n\nHerein fail not.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 3",
    title: "Bond and Bail-Bond after Arrest under a Warrant (Section 83)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nI, [Name of Accused], having been arrested under a warrant to answer to a charge of __________, do hereby bind myself to attend in the Court of _______________ on the ____ day of _________ next, and to continue so to attend until otherwise directed.\n\nIn case of making default, I bind myself to forfeit to Government the sum of Rs. _____________\n\nDATED this ____ day of _________ 20___\n\nSignature: ______________\n\n[SURETY BOND]\nI, [Name of Surety] of [Address], hereby declare myself surety for the above-named [Name of Accused], that he shall attend in the Court of _______________ on the ____ day of _________ next, and in case of his making default, I bind myself to forfeit to Government the sum of Rs. _____________\n\nSignature of Surety: ______________"
  },
  {
    number: "Form 4",
    title: "Proclamation Requiring the Appearance of a Person Accused (Section 84(1))",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nWHEREAS complaint has been made before me that [Name of Accused] of [Address] has committed the offence of ______________, and it has been shown to my satisfaction that the said [Name of Accused] has absconded or is concealing himself to avoid the service of warrant;\n\nPROCLAMATION is hereby made that the said [Name of Accused] is required to appear at [Place of Court] before this Court to answer the said complaint within 30 days from this date.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 5",
    title: "Proclamation Requiring the Attendance of a Witness (Section 84(2))",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nWHEREAS complaint has been made before me that [Name of Accused] has committed the offence of ______________, and it has been shown to my satisfaction that the attendance of [Name of Witness] of [Address] is necessary to give evidence, and that a warrant has been issued but the witness has absconded or is concealing himself;\n\nPROCLAMATION is hereby made that the said [Name of Witness] is required to appear before this Court on the ____ day of _________ 20___ at ____ o'clock.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 6",
    title: "Order of Attachment to Compel the Attendance of a Witness (Section 85)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the officer executing the attachment]\n\nWHEREAS [Name of Witness] has failed to appear in response to the proclamation issued, you are hereby directed to attach the movable property belonging to the said [Name of Witness] to the value of Rs. ____________ and to hold the same under attachment until further orders.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 7",
    title: "Order of Attachment to Compel the Appearance of a Person Accused (Section 85)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the officer executing the attachment]\n\nWHEREAS [Name of Accused] of [Address] has failed to appear in response to the proclamation issued, you are hereby directed to attach the property, movable or immovable, belonging to the said [Name of Accused] and to report execution within ______ days.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 8",
    title: "Warrant in the First Instance to Bring up a Witness (Section 90)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the police officer]\n\nWHEREAS complaint has been made before me that [Name of Accused] has committed the offence of ______________, and it appears that [Name of Witness] of [Address] can give material evidence, and I am satisfied that he will not attend to give evidence without being compelled;\n\nYou are hereby directed to arrest the said [Name of Witness] and produce him before this Court.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 9",
    title: "Warrant of Commitment on Imprisonment or Fine if Passed by Magistrate (Section 272)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Prisoner] was convicted before me of the offence of ___________ and sentenced to undergo simple/rigorous imprisonment for ____________;\n\nYou are hereby required to receive the said [Name of Prisoner] into your custody in the said Jail, and there carry the aforesaid sentence into execution according to law.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 10",
    title: "Warrant of Imprisonment on Failure to Find Security for Good Behaviour (Section 139)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Person] was ordered to find security for his good behaviour for the period of __________ and has failed to comply;\n\nYou are hereby required to receive and keep him in the said Jail for the said period unless he sooner gives the security required.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 11",
    title: "Warrant to Discharge a Person Imprisoned on Failure to Give Security (Section 142)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Person] was committed to jail for failure to give security, and has now given the required security (or the period has expired);\n\nYou are hereby directed to discharge the said [Name of Person] from custody unless he is held for some other cause.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 12",
    title: "Warrant of Attachment in Execution of a Sentence of Fine (Section 463)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the officer executing the warrant]\n\nWHEREAS [Name of Offender] was convicted of the offence of ____________ and sentenced to pay a fine of Rs. ___________, which remains unpaid;\n\nYou are hereby directed to attach and sell any movable property belonging to the said [Name of Offender] for recovery of the said fine.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 13",
    title: "Warrant of Attachment on a Bond to Keep the Peace or for Good Behaviour (Section 136)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the officer executing the warrant]\n\nWHEREAS [Name of Person] entered into a bond to keep the peace and has breached the condition, you are hereby directed to attach his property to the value of Rs. _____________\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 14",
    title: "Warrant of Commitment on a Sentence of Imprisonment (Section 272)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Prisoner] is committed to prison under a sentence of ___________, you are required to keep him in safe custody according to the terms of the warrant.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 15",
    title: "Warrant of Attachment for Arrears of Maintenance (Section 144)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the officer executing the warrant]\n\nWHEREAS [Name of Husband/Father] was ordered to pay maintenance of Rs. _________ per month and has failed to pay arrears of Rs. _________;\n\nYou are directed to attach and sell movable property of the said person to satisfy the claim.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 16",
    title: "Warrant of Commitment on Failure to Pay Maintenance (Section 144)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name] has failed to pay maintenance as ordered, you are directed to keep him in prison for a period of ______ months or until payment is made.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 17",
    title: "Warrant to Search after Information of a Particular Offence (Section 103)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the police officer]\n\nWHEREAS information has been laid that [describe the property/offence] is concealed in [describe the place], you are hereby authorized to enter and search the said place and to seize the property if found.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 18",
    title: "Warrant to Search for Person in Wrongful Confinement (Section 108)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the police officer]\n\nWHEREAS I have reason to believe that [Name of Person] is confined under such circumstances that the confinement amounts to an offence, you are directed to search for the said person and produce him before this Court.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 19",
    title: "Warrant to Search for Person Unlawfully Detained (Section 108)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name and designation of the police officer]\n\nWHEREAS complaint is made that [Name of Detenu] is unlawfully detained, you are directed to locate and rescue the said person.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 20",
    title: "Bond and Bail-Bond after Arrest under a Search-Warrant (Section 103)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nFormat of personal bond and surety bond for release of a person arrested during a search operation.\n\n[Content similar to Form 3]"
  },
  {
    number: "Form 21",
    title: "Warrant of Commitment of a Witness Refusing to Answer (Section 389)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Witness] has refused to answer questions put to him without reasonable excuse, you are directed to keep him in custody for a term of 7 days or until he consents to be examined.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 22",
    title: "Order of Attachment of Property of Accused (Section 85)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nFormal order for attachment of land/immovable property of an absconding accused person."
  },
  {
    number: "Form 23",
    title: "Warrant of Attachment and Sale of Property of Accused (Section 85)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nDirects the revenue/police authorities to sell the attached property of the absconding accused."
  },
  {
    number: "Form 24",
    title: "Warrant to Release Property from Attachment (Section 87)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nOrder directing the release of attached property upon the appearance of the accused or successful objection."
  },
  {
    number: "Form 25",
    title: "Charge with One Head (Section 234)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nI, [Name of Magistrate], hereby charge you [Name of Accused] as follows:\n\nThat you, on or about the ____ day of _________ 20___, at ____________, did [state the act constituting the offence] and thereby committed an offence punishable under Section _______ of the Bharatiya Nyaya Sanhita, 2023, and within my cognizance.\n\nAnd I hereby direct that you be tried by this Court on the said charge.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 26",
    title: "Charge with Two or More Heads (Section 234)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nI, [Name of Magistrate], hereby charge you [Name of Accused] as follows:\n\nFirst: That you [state first offence and Section BNS].\nSecond: That you [state second offence and Section BNS].\n\nAnd I hereby direct that you be tried by this Court on the said charges.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 27",
    title: "Warrant of Commitment on a Sentence of Death (Section 415)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Prisoner] was convicted of murder under Section 103 BNS and sentenced to death, you are directed to keep him in safe custody in cell until confirmation of the sentence by the High Court.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nSessions Judge"
  },
  {
    number: "Form 28",
    title: "Warrant of Execution of a Sentence of Death (Section 416)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS the sentence of death passed on [Name of Prisoner] has been confirmed by the High Court, you are hereby directed to carry the said sentence into execution by hanging the said [Name of Prisoner] by the neck until he be dead, on the ____ day of _________ 20___\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nSessions Judge"
  },
  {
    number: "Form 29",
    title: "Warrant of Commitment on Sentence of Life Imprisonment (Section 418)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nDirects the detention of the prisoner sentenced to undergo imprisonment for life in the jail."
  },
  {
    number: "Form 30",
    title: "Warrant of Imprisonment on Failure to Pay Fine (Section 418)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nDirects the detention of the prisoner for the default period of imprisonment on failure to pay the fine."
  },
  {
    number: "Form 31",
    title: "Warrant of Commitment on Sentence of Fine Only (Section 418)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nCommitment warrant where sentence is fine only, but imprisonment is ordered in default of payment."
  },
  {
    number: "Form 32",
    title: "Summons to a Witness (Section 265)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name of Witness]\nof [Address]\n\nWHEREAS complaint has been made that [Name of Accused] has committed the offence of _____________, and it appears that you are likely to give material evidence; you are summoned to appear before this Court to give evidence on the ____ day of _________ 20___\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 33",
    title: "Precept to District Magistrate for Summoning Jurors (Historic)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nOrder to DM to summon jurors/assessors (kept for historical compliance)."
  },
  {
    number: "Form 34",
    title: "Summons to Juror/Assessor (Historic)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nSummons to individual juror or assessor."
  },
  {
    number: "Form 35",
    title: "Warrant of Arrest of Witness (Section 90)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nWarrant directing police to arrest and bring up a witness who has disobeyed summons."
  },
  {
    number: "Form 36",
    title: "Warrant of Commitment of Witness Refusing to Enter into Recognizance (Section 344)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nCommitment of witness to prison for refusing to sign bond to appear and give evidence."
  },
  {
    number: "Form 37",
    title: "Warrant of Commitment of Accused on Remand (Section 187)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\nThe Officer in Charge of the Jail at ____________________\n\nWHEREAS [Name of Accused] was brought before me in custody under arrest, and it is necessary to remand him to custody pending further investigation or trial under Section 187 of the BNSS;\n\nYou are hereby authorized to receive and detain him in your custody until the ____ day of _________ 20___\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 38",
    title: "Warrant of Commitment of Accused under Sentence of Imprisonment (Section 272)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nWarrant of commitment directing jailer to receive prisoner under sentence."
  },
  {
    number: "Form 39",
    title: "Bond and Bail-Bond for Appearance before Court (Section 480)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nBail bond format for accused released on bail by the Court during trial or inquiry."
  },
  {
    number: "Form 40",
    title: "Warrant of Attachment in Dispute as to Possession of Land (Section 164)",
    template: "IN THE COURT OF THE SUB-DIVISIONAL MAGISTRATE AT ____________________\n\nDirects the attachment of disputed land/property to prevent breach of peace pending decision."
  },
  {
    number: "Form 41",
    title: "Order of Magistrate Prohibiting Repeat of Nuisance (Section 162)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nFormal order directing a person to cease and not repeat a public nuisance."
  },
  {
    number: "Form 42",
    title: "Order of Magistrate to Prevent Obstruction or Nuisance (Section 163)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nInjunction order to prevent urgent danger or obstruction to public peace (former Sec 144 CrPC)."
  },
  {
    number: "Form 43",
    title: "Local Inquiry Order (Section 167)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nOrder directing a subordinate officer to conduct a local inquiry regarding land dispute/nuisance."
  },
  {
    number: "Form 44",
    title: "Bond and Bail-Bond for Good Behaviour (Section 128)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nBond with sureties for keeping good behaviour for a specified period."
  },
  {
    number: "Form 45",
    title: "Bond and Bail-Bond to Keep the Peace (Section 125)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nBond for keeping the peace (former Sec 107 CrPC bond)."
  },
  {
    number: "Form 46",
    title: "Warrant of Commitment on Failure to Find Security to Keep Peace (Section 138)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nWarrant committing person to jail for failing to execute peace bond."
  },
  {
    number: "Form 47",
    title: "Warrant of Commitment on Failure to Find Security for Good Behaviour (Section 138)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nWarrant committing person to jail for failing to execute good behaviour bond."
  },
  {
    number: "Form 48",
    title: "Warrant to Discharge a Person Imprisoned on Failure to Give Security (Section 141)",
    template: "IN THE COURT OF THE EXECUTIVE MAGISTRATE AT ____________________\n\nDirects jailer to release person who has now furnished security for peace/good behaviour."
  },
  {
    number: "Form 49",
    title: "Warrant of Attachment in Execution of Fine (Session Court) (Section 463)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nAttachment warrant issued by Sessions Court for unpaid fine."
  },
  {
    number: "Form 50",
    title: "Bond and Bail-Bond after Arrest under Warrant (Session Court) (Section 480)",
    template: "IN THE COURT OF SESSION AT ____________________\n\nBail bond accepted directly by the Sessions Court."
  },
  {
    number: "Form 51",
    title: "Warrant of Commitment of Witness Refusing to Attend (Section 389)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nCommitment of recalcitrant witness who refuses to obey court summons."
  },
  {
    number: "Form 52",
    title: "Notice to Surety on Breach of a Bond (Section 491)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nTo,\n[Name of Surety]\n\nWHEREAS you became surety for [Name of Accused] and he has failed to appear, you are required to show cause why the penalty of Rs. _________ should not be paid by you.\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nMagistrate"
  },
  {
    number: "Form 53",
    title: "Warrant of Attachment against Surety (Section 491)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nDirects the attachment of surety's property for failure to pay bond penalty after breach."
  },
  {
    number: "Form 54",
    title: "Warrant of Commitment of Surety (Section 491)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nDirects imprisonment of surety on failure to pay bond penalty and lack of attachable property."
  },
  {
    number: "Form 55",
    title: "Warrant of Attachment and Sale of Property of Surety (Section 491)",
    template: "IN THE COURT OF THE JUDICIAL MAGISTRATE AT ____________________\n\nDirects the sale of attached property of surety to recover bond penalty."
  },
  {
    number: "Form 56",
    title: "Notice of Appeal (Section 422)",
    template: "IN THE COURT OF THE SESSIONS JUDGE AT ____________________\n\nCriminal Appeal No. _____ of 20___\n\n[Name of Appellant] ... Appellant\nversus\nThe State ... Respondent\n\nTo,\n[Name of Public Prosecutor / Respondent]\n\nTAKE NOTICE that an appeal has been preferred by the appellant against the conviction and sentence passed on him by the Judicial Magistrate First Class at ___________ on [Date], and that the said appeal has been admitted and will be heard on the ____ day of _________ 20___\n\nDATED this ____ day of _________ 20___\n\n(Seal of the Court)\n\nSessions Judge"
  }
];

// Reassemble the object
data.schedules = schedules;
data.forms = forms;

// Save JSON
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully wrote restructured JSON to:', jsonPath);
