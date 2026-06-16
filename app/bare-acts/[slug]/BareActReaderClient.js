'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import cpcRules from '@/data/bare-acts/cpc-rules.json';

// Detailed Subheaders and ranges for Code of Civil Procedure (CPC)
const cpcSubheaders = {
  "Preliminary": [
    { title: "Preliminary", start: 1, end: 8 }
  ],
  "I": [
    { title: "Jurisdiction of Courts & Res Judicata", start: 9, end: 14 },
    { title: "Place of Suing", start: 15, end: 25 },
    { title: "Institution of Suits", start: 26, end: 26 },
    { title: "Summons and Discovery", start: 27, end: 32 },
    { title: "Judgment and Decree", start: 33, end: 33 },
    { title: "Interest", start: 34, end: 34 },
    { title: "Costs", start: 35, end: "35B" }
  ],
  "II": [
    { title: "General", start: 36, end: 37 },
    { title: "Courts by which Decrees may be Executed", start: 38, end: 46 },
    { title: "Questions to be Determined by Court", start: 47, end: 47 },
    { title: "Transferees and Legal Representatives", start: 49, end: 50 },
    { title: "Procedure in Execution", start: 51, end: 54 },
    { title: "Arrest and Detention", start: 55, end: 59 },
    { title: "Attachment", start: 60, end: 64 },
    { title: "Sale", start: 65, end: 73 },
    { title: "Distribution of Assets", start: 74, end: 74 }
  ],
  "III": [
    { title: "Commissions", start: 75, end: 78 }
  ],
  "IV": [
    { title: "Suits by or against Government or Public Officers", start: 79, end: 82 },
    { title: "Suits by Aliens and or against Foreign Rulers", start: 83, end: "87A" },
    { title: "Suits against Rulers of Former Indian States", start: "87B", end: "87B" },
    { title: "Interpleader", start: 88, end: 88 }
  ],
  "V": [
    { title: "Arbitration", start: 89, end: 89 },
    { title: "Special Case", start: 90, end: 90 },
    { title: "Public Nuisances and Other Wrongful Acts", start: 91, end: 93 }
  ],
  "VI": [
    { title: "Supplemental Proceedings", start: 94, end: 95 }
  ],
  "VII": [
    { title: "Appeals from Original Decrees", start: 96, end: "99A" },
    { title: "Appeals from Appellate Decrees", start: 100, end: 103 },
    { title: "Appeals from Orders", start: 104, end: 106 },
    { title: "General Provisions Relating to Appeals", start: 107, end: 108 },
    { title: "Appeals to the Supreme Court", start: 109, end: 112 }
  ],
  "VIII": [
    { title: "Reference, Review and Revision", start: 113, end: 115 }
  ],
  "IX": [
    { title: "Special Provisions Relating to High Courts", start: 116, end: 120 }
  ],
  "X": [
    { title: "Rules", start: 121, end: 131 }
  ],
  "XI": [
    { title: "Miscellaneous", start: 132, end: 158 }
  ]
};

// Removed hardcoded cpcOrders list, replaced by importing cpc-rules.json.

// CPC Appendices
const cpcAppendices = [
  { code: "Appendix A", title: "Pleadings", description: "Standard templates and instructions for drafting Plaints (eviction, breach of contract, money recovery) and Written Statements under CPC rules." },
  { code: "Appendix B", title: "Process", description: "Official layouts for serving legal notices, including Summons to Defendants (Form 1) and Summons to Witnesses." },
  { code: "Appendix C", title: "Discovery, Inspection and Admission", description: "Templates for interrogatories, affidavits of documents, and formal admission notices under Orders XI and XII." },
  { code: "Appendix D", title: "Decrees", description: "Standard templates for framing Court Decrees (preliminary and final decrees for sale, foreclosure, or partition)." },
  { code: "Appendix E", title: "Execution", description: "Standard formats for execution proceedings (e.g. attachment warrants, orders for sale of attached property)." },
  { code: "Appendix F", title: "Supplemental Proceedings", description: "Formats for security bonds, arrest before judgment warrants, and temporary injunction mandates." },
  { code: "Appendix G", title: "Appeal, Reference and Review", description: "Standard formatting of Memorandum of Appeal, notice of appeal, and petitions for reference or review." },
  { code: "Appendix H", title: "Miscellaneous", description: "General forms, commissions formats, receiver appointments, and miscellaneous administrative templates." }
];

// CPC Forms
const cpcForms = [
  { id: "Form 1", title: "Summons to Defendant (Order V, Rule 1)", template: "IN THE COURT OF THE CIVIL JUDGE AT _____________\n\nCivil Suit No. ______ of 20____\n\n_________________________ Plaintiff\nversus\n_________________________ Defendant\n\nTo,\n[Name, Description and Place of Residence of Defendant]\n\nWHEREAS the plaintiff has instituted a suit against you for ____________________________, you are hereby summoned to appear in this Court in person, or by a pleader duly instructed, on the ____ day of _________ 20___, at ____ o'clock to answer the claim; and you are directed to produce on that day all the documents in your possession or power upon which you intend to rely in support of your defence.\n\nTAKE NOTICE that, in default of your appearance on the day before mentioned, the suit will be heard and determined in your absence.\n\nGIVEN under my hand and the seal of the Court, this ____ day of _________ 20___\n\n(Seal)\n\nJudge" },
  { id: "Form 2", title: "Plaint Template: Eviction Suit (Order VII, Rule 1)", template: "IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION) AT _____________\n\nCivil Suit No. ______ of 20____\n\nA.B. [Name & Address] ... Plaintiff\nversus\nC.D. [Name & Address] ... Defendant\n\nPLAINT FOR EVICTION AND RECOVERY OF ARREARS OF RENT\n\nThe Plaintiff states as follows:\n1. The Plaintiff is the owner and landlord of property situated at [Address], which was let out to the Defendant on rent under a lease deed dated ___________.\n2. The Defendant agreed to pay a monthly rent of Rs. _________ on or before the ____ day of each month.\n3. The Defendant has failed to pay the rent since [Date] and is in arrears of Rs. _________.\n4. The Plaintiff terminated the tenancy by serving a legal notice under Section 106 of the Transfer of Property Act on [Date], which was received by the Defendant on [Date].\n5. The Defendant has failed to vacate the premises despite the expiry of the notice period.\n6. The cause of action arose on [Date] when the notice period expired.\n7. The property is situated within the local limits of this Court's jurisdiction.\n8. The Plaintiff claims: (a) Eviction of the Defendant, (b) Arrears of rent of Rs. _________ with interest, (c) Mesne profits from [Date] until vacant possession is delivered.\n\nPlace:\nDate:\n\nPlaintiff / Advocate\n\nVERIFICATION\nI, A.B., verify that the contents of paragraphs 1 to 8 are true to my personal knowledge.\n\nPlaintiff" },
  { id: "Form 3", title: "Written Statement Template (Order VIII, Rule 1)", template: "IN THE COURT OF THE CIVIL JUDGE (SENIOR DIVISION) AT _____________\n\nCivil Suit No. ______ of 20____\n\nA.B. ... Plaintiff\nversus\nC.D. ... Defendant\n\nWRITTEN STATEMENT OF THE DEFENDANT\n\nThe Defendant states as follows in response to the Plaint:\n\nPRELIMINARY OBJECTIONS:\n1. The suit is not maintainable as the Plaintiff has not complied with the mandatory legal requirements of tenancy notice.\n2. This Court lacks pecuniary jurisdiction to try this suit.\n\nREPLY ON MERITS:\n3. Paragraph 1 of the plaint is admitted to the extent that the Plaintiff is the landlord. However, the lease terms are disputed.\n4. Paragraph 2 of the plaint is denied. The rent was Rs. _______ and not Rs. _______ as falsely claimed.\n5. Paragraph 3 is denied. The Defendant has paid all rents up to date, and receipts were withheld by the Plaintiff.\n6. Paragraph 4 is denied. No legal notice under Section 106 of the TPA was ever served upon the Defendant.\n7. In light of the above, it is prayed that the suit of the Plaintiff be dismissed with exemplary costs.\n\nPlace:\nDate:\n\nDefendant / Advocate\n\nVERIFICATION\nI, C.D., verify that the contents of paragraphs 1 to 7 are true to my knowledge and belief.\n\nDefendant" }
];

// Constitution 12 Schedules
const constitutionSchedules = [
  { number: "First Schedule", title: "States and Union Territories", content: "Lists the states and union territories of India, including any changes in their borders or names." },
  { number: "Second Schedule", title: "Salaries and Emoluments", content: "Details the salaries, allowances, and privileges of high officials including the President, Governors, Speaker, Deputy Speakers, Judges of Supreme Court and High Courts, and Comptroller and Auditor General (CAG)." },
  { number: "Third Schedule", title: "Forms of Oaths and Affirmations", content: "Forms of oaths and affirmations for Union Ministers, Candidates for Parliament, Members of Parliament, Supreme Court Judges, CAG, State Ministers, Candidates for State Legislature, Members of State Legislature, and High Court Judges." },
  { number: "Fourth Schedule", title: "Allocation of Rajya Sabha Seats", content: "Allocation of seats in the Rajya Sabha (Council of States) to each State and Union Territory based on population." },
  { number: "Fifth Schedule", title: "Scheduled Areas and Scheduled Tribes", content: "Provisions for the administration and control of Scheduled Areas and Scheduled Tribes in states other than Assam, Meghalaya, Tripura, and Mizoram." },
  { number: "Sixth Schedule", title: "Tribal Areas in North-Eastern States", content: "Provisions for the administration of Tribal Areas in the states of Assam, Meghalaya, Tripura, and Mizoram (Autonomous District Councils)." },
  { number: "Seventh Schedule", title: "Division of Powers (Three Lists)", content: "Defines the allocation of powers and functions between Union and States. It contains three lists:\n\n1. List I (Union List): subjects of national importance (defence, foreign affairs, railways, banking, etc.)\n2. List II (State List): subjects of state-level importance (police, public health, sanitation, agriculture, etc.)\n3. List III (Concurrent List): subjects under both (education, forests, criminal law, marriage, etc.)" },
  { number: "Eighth Schedule", title: "Official Languages", content: "Recognises 22 official languages of India (including Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, and Urdu)." },
  { number: "Ninth Schedule", title: "Validation of certain Acts (Land Reforms)", content: "Contains central and state laws which cannot be challenged in courts of law on grounds of violating Fundamental Rights. Created by 1st Amendment (1951) to protect land reform legislations. (Subject to Judicial Review post-2007 under I.R. Coelho case)." },
  { number: "Tenth Schedule", title: "Anti-Defection Law", content: "Provisions regarding disqualification of members of Parliament and State Legislatures on grounds of defection from one political party to another. Added by 52nd Amendment (1985)." },
  { number: "Eleventh Schedule", title: "Panchayati Raj (Rural Local Government)", content: "Lists 29 subjects under the purview of Panchayats, defining their powers, authority, and responsibilities. Added by 73rd Amendment (1992)." },
  { number: "Twelfth Schedule", title: "Municipalities (Urban Local Government)", content: "Lists 18 subjects under the purview of Municipalities, defining their powers, authority, and responsibilities. Added by 74th Amendment (1992)." }
];

// CrPC/BNSS Schedules & Forms
const criminalSchedules = [
  { number: "Schedule I", title: "Classification of Offences", content: "Provides a comprehensive table listing all criminal offences, clarifying whether they are cognizable or non-cognizable, bailable or non-bailable, and which Court has trial jurisdiction (e.g. Court of Session, Judicial Magistrate First Class)." },
  { number: "Schedule II", title: "Forms (Standard Legal Templates)", content: "Contains standard legal forms (like arrest warrants, summons, bond forms, commitment to prison) used in the day-to-day administration of criminal justice." }
];
const criminalForms = [
  { number: "Form 1", title: "Summons to an Accused Person", content: "Official summons requiring an accused person to appear before a Magistrate on a specific date and time to answer a charge." },
  { number: "Form 2", title: "Warrant of Arrest", content: "Directs a police officer to arrest the accused and produce them before the Court to answer the charge." },
  { number: "Form 3", title: "Bond and Bail-Bond after Arrest under a Warrant", content: "Format for a personal bond and surety bond to release an arrested person on bail." },
  { number: "Form 5", title: "Warrant of Commitment on a Sentence of Imprisonment", content: "Directs the officer in charge of a jail to receive and detain the convicted prisoner to serve their sentence." },
  { number: "Form 12", title: "Warrant of Attachment in Execution of a Sentence of Fine", content: "Authorises the attachment and sale of movable property belonging to the offender to recover a fine." },
  { number: "Form 32", title: "Framing of Charge", content: "Standard format of a criminal charge detailing the offence committed, date, time, and law section." },
  { number: "Form 56", title: "Notice of Appeal", content: "Notice to the Appellate Court and the Respondent regarding the filing of a criminal appeal against conviction or acquittal." }
];

// Helper to convert section numbers like "35A" into numerical values for range checking
function getSectionNumericVal(numStr) {
  const clean = String(numStr).replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

export default function BareActReaderClient({ act }) {
  const isConstitution = act.id === 'constitution-of-india';
  const isCPC = act.id === 'code-of-civil-procedure';
  const isCriminal = act.id === 'code-of-criminal-procedure' || act.id === 'bharatiya-nagarik-suraksha-sanhita';

  const sectionLabel = isConstitution ? 'Article' : 'Section';
  const chapterLabel = isConstitution ? 'Part' : 'Chapter';

  // Determine available tabs
  const tabs = useMemo(() => {
    const defaultTabs = ['Sections', 'Act Details'];
    if (isCPC) {
      return ['Sections', 'Schedule', 'Annexure', 'Appendix', 'Forms', 'Act Details'];
    }
    if (isConstitution) {
      return ['Articles', 'Schedule', 'Act Details'];
    }
    if (isCriminal) {
      return ['Sections', 'Schedule', 'Forms', 'Act Details'];
    }
    return defaultTabs;
  }, [isCPC, isConstitution, isCriminal]);

  // States
  const [activeTab, setActiveTab] = useState(isConstitution ? 'Articles' : 'Sections');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedSubheader, setSelectedSubheader] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedSection, setCopiedSection] = useState(null);

  // Special tab states
  const [selectedOrder, setSelectedOrder] = useState(cpcRules[0]);
  const [selectedAppendix, setSelectedAppendix] = useState(cpcAppendices[0]);
  const [selectedForm, setSelectedForm] = useState(cpcForms[0]);
  const [selectedCriminalForm, setSelectedCriminalForm] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedCrimSchedule, setSelectedCrimSchedule] = useState(null);

  // CPC rules states
  const [expandedRules, setExpandedRules] = useState({});
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');

  // Reset expanded rules when selected order changes (adjusted during render)
  const [prevSelectedOrderNum, setPrevSelectedOrderNum] = useState(selectedOrder ? selectedOrder.number : null);
  if ((selectedOrder ? selectedOrder.number : null) !== prevSelectedOrderNum) {
    setPrevSelectedOrderNum(selectedOrder ? selectedOrder.number : null);
    setExpandedRules({});
    setRuleSearchQuery('');
  }

  // Reset pagination when search, chapter, or subheader filters change (adjusted during render)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [prevSelectedChapter, setPrevSelectedChapter] = useState(selectedChapter);
  const [prevSelectedSubheader, setPrevSelectedSubheader] = useState(selectedSubheader);
  const [prevItemsPerPage, setPrevItemsPerPage] = useState(itemsPerPage);

  if (searchQuery !== prevSearchQuery || selectedChapter !== prevSelectedChapter || selectedSubheader !== prevSelectedSubheader || itemsPerPage !== prevItemsPerPage) {
    setPrevSearchQuery(searchQuery);
    setPrevSelectedChapter(selectedChapter);
    setPrevSelectedSubheader(selectedSubheader);
    setPrevItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  }

  // Toggle Accordion section
  const toggleSection = (secNum) => {
    setExpandedSections(prev => ({
      ...prev,
      [secNum]: !prev[secNum]
    }));
  };

  // Toggle Accordion rule
  const toggleRule = (ruleNum) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleNum]: !prev[ruleNum]
    }));
  };

  // Copy statutory text to clipboard
  const handleCopyText = (secNum, text) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(secNum);
    setTimeout(() => {
      setCopiedSection(null);
    }, 2000);
  };

  // Filtered Sections/Articles List
  const filteredSections = useMemo(() => {
    let list = [];
    if (selectedChapter) {
      const chap = act.chapters.find((c) => c.number === selectedChapter);
      if (chap) {
        list = chap.sections || [];
      }
    } else {
      list = act.chapters.reduce((acc, c) => acc.concat(c.sections || []), []);
    }

    // Filter by CPC Subheader
    if (isCPC && selectedSubheader) {
      const sub = Object.values(cpcSubheaders)
        .flatMap((groups) => groups)
        .find((g) => g.title === selectedSubheader);
      
      if (sub) {
        list = list.filter((sec) => {
          const numVal = getSectionNumericVal(sec.number);
          return numVal >= getSectionNumericVal(sub.start) && numVal <= getSectionNumericVal(sub.end);
        });
      }
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (sec) =>
          String(sec.number).toLowerCase().includes(q) ||
          String(sec.title).toLowerCase().includes(q) ||
          String(sec.text).toLowerCase().includes(q)
      );
    }

    return list;
  }, [act, selectedChapter, selectedSubheader, searchQuery, isCPC]);

  // Paginated Sections
  const paginatedSections = useMemo(() => {
    if (itemsPerPage === 'All') return filteredSections;
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredSections.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredSections, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (itemsPerPage === 'All') return 1;
    return Math.ceil(filteredSections.length / itemsPerPage) || 1;
  }, [filteredSections, itemsPerPage]);

  return (
    <div className="act-workspace">
      {/* Styles Block for Premium India Code Layout */}
      <style jsx>{`
        .act-workspace {
          --glass-bg: #0B1F3A;
          --glass-border: rgba(201, 168, 76, 0.25);
          --white: #ffffff;
          --white-dim: rgba(255, 255, 255, 0.75);
          --gold-bright: #C9A84C;
          --gold-glow: rgba(201, 168, 76, 0.3);
          --navy-deep: #060f1d;
          --navy-mid: #132d52;
          --navy-light: rgba(255, 255, 255, 0.05);

          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          width: 100%;
          color: var(--white);
        }

        .act-workspace p {
          color: inherit;
        }

        .act-header-strip h1 {
          color: var(--white) !important;
        }

        .act-header-strip .breadcrumb,
        .act-header-strip .breadcrumb a {
          color: var(--white-dim);
        }

        .act-header-strip .breadcrumb a:hover {
          color: var(--gold-bright);
        }

        .act-header-strip {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          backdrop-filter: blur(8px);
        }

        .act-tabs {
          display: flex;
          gap: var(--space-xs);
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 2px;
          overflow-x: auto;
        }

        .act-tab-btn {
          background: transparent;
          border: none;
          color: var(--white-dim);
          font-family: var(--font-primary);
          font-size: var(--text-sm);
          font-weight: 600;
          padding: var(--space-sm) var(--space-md);
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 6px 6px 0 0;
          position: relative;
          white-space: nowrap;
        }

        .act-tab-btn:hover {
          color: var(--white);
          background: rgba(255, 255, 255, 0.03);
        }

        .act-tab-btn--active {
          color: var(--gold-bright);
        }

        .act-tab-btn--active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gold-bright);
          box-shadow: 0 0 8px var(--gold-glow);
        }

        .dual-pane-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-xl);
          align-items: start;
        }

        @media (max-width: 992px) {
          .dual-pane-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Tree-view Sidebar */
        .workspace-sidebar {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: var(--space-md);
          max-height: 75vh;
          overflow-y: auto;
          backdrop-filter: blur(8px);
        }

        .sidebar-title {
          font-size: var(--text-sm);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--gold-bright);
          margin-bottom: var(--space-sm);
          font-weight: 700;
          padding-left: var(--space-xs);
        }

        .all-chapters-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: var(--space-sm);
          border-radius: 6px;
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          margin-bottom: var(--space-md);
          transition: all 0.2s;
        }

        .all-chapters-btn:hover, .all-chapters-btn--active {
          background: var(--gold-bright);
          color: var(--navy-deep);
          border-color: var(--gold-bright);
        }

        .chapter-group {
          margin-bottom: var(--space-sm);
        }

        .chapter-header-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--white);
          font-weight: 600;
          font-size: var(--text-xs);
          padding: var(--space-xs) var(--space-sm);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .chapter-header-btn:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .chapter-header-btn--active {
          color: var(--gold-bright);
          background: rgba(244, 162, 97, 0.05);
        }

        .subheaders-list {
          padding-left: var(--space-md);
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-left: 1px dashed var(--glass-border);
          margin-left: var(--space-sm);
        }

        .subheader-link-btn {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--white-dim);
          font-size: var(--text-xs);
          padding: 4px var(--space-xs);
          cursor: pointer;
          border-radius: 3px;
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .subheader-link-btn:hover {
          color: var(--white);
          background: rgba(255, 255, 255, 0.02);
        }

        .subheader-link-btn--active {
          color: var(--gold-bright);
          font-weight: 600;
          background: rgba(244, 162, 97, 0.05);
        }

        /* Right Panel Sections Grid */
        .workspace-content {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: var(--space-lg);
          backdrop-filter: blur(8px);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .limit-selector {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--text-sm);
          color: var(--white-dim);
        }

        .limit-select {
          background: var(--navy-mid);
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: 6px var(--space-sm);
          border-radius: 6px;
          font-family: var(--font-primary);
          cursor: pointer;
        }

        .search-wrapper {
          position: relative;
          min-width: 250px;
        }

        .search-input {
          width: 100%;
          background: var(--navy-mid);
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: var(--space-xs) var(--space-sm);
          padding-left: var(--space-lg);
          border-radius: 6px;
          font-family: var(--font-primary);
          font-size: var(--text-sm);
        }

        .search-icon {
          position: absolute;
          left: var(--space-xs);
          top: 50%;
          transform: translateY(-50%);
          color: var(--white-dim);
        }

        /* Accordion Row */
        .section-accordion {
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          margin-bottom: var(--space-xs);
          background: rgba(255, 255, 255, 0.02);
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .section-accordion:hover {
          border-color: rgba(244, 162, 97, 0.2);
        }

        .section-header-row {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: transparent;
          border: none;
          color: var(--white);
          text-align: left;
          cursor: pointer;
          font-family: var(--font-primary);
          font-weight: 500;
          font-size: var(--text-sm);
        }

        .section-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .section-badge-id {
          background: rgba(244, 162, 97, 0.1);
          border: 1px solid var(--gold-bright);
          color: var(--gold-bright);
          padding: 3px 8px;
          border-radius: 4px;
          font-family: var(--font-primary);
          font-weight: 700;
          font-size: var(--text-xs);
          min-width: 90px;
          text-align: center;
        }

        .section-body {
          padding: var(--space-md);
          border-top: 1px solid var(--glass-border);
          background: var(--navy-mid);
        }

        .section-text-container {
          color: var(--white-dim);
          font-size: var(--text-sm);
          line-height: 1.6;
          margin-bottom: var(--space-md);
        }

        .section-actions {
          display: flex;
          gap: var(--space-xs);
          justify-content: flex-end;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: var(--space-sm);
        }

        /* Pagination */
        .pagination-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-md);
          flex-wrap: wrap;
          gap: var(--space-md);
        }

        .pagination-info {
          font-size: var(--text-xs);
          color: var(--white-dim);
        }

        .pagination-controls {
          display: flex;
          gap: var(--space-xxs);
        }

        .page-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: var(--space-xs) var(--space-sm);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: var(--text-xs);
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--gold-bright);
        }

        .page-btn--active {
          background: var(--gold-bright);
          color: var(--navy-deep);
          border-color: var(--gold-bright);
          font-weight: 700;
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Order / Appendix Detail View */
        .split-details-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: var(--space-lg);
          backdrop-filter: blur(8px);
        }

        @media (max-width: 768px) {
          .split-details-layout {
            grid-template-columns: 1fr;
          }
        }

        .details-list-sidebar {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          max-height: 70vh;
          overflow-y: auto;
          padding: var(--space-xs);
        }

        .details-sidebar-item {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--white-dim);
          padding: var(--space-sm);
          border-radius: 6px;
          font-size: var(--text-xs);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .details-sidebar-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--white);
        }

        .details-sidebar-item--active {
          background: var(--gold-bright);
          color: var(--navy-deep);
        }

        .details-viewer-pane {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .parchment-sheet {
          background: #fdfbf7;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          padding: var(--space-xl);
          color: #2b2b2b;
          font-family: 'Georgia', serif;
          font-size: var(--text-sm);
          line-height: 1.6;
          white-space: pre-wrap;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.02);
          overflow-x: auto;
        }
      `}</style>

      {/* Act Header Banner */}
      <div className="act-header-strip">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb__separator">/</span>
          <Link href="/bare-acts">Bare Acts</Link>
          <span className="breadcrumb__separator">/</span>
          <span>{act.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>{act.name}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
              <span className="card__tag" style={{ background: 'var(--gold-bright)', color: 'var(--navy-deep)' }}>{act.category}</span>
              <span className="section-number">Enacted: {act.year}</span>
              <span className="section-number">Total Sections: {act.sectionCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* India Code Top Tabs */}
      <div className="act-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`act-tab-btn ${activeTab === t ? 'act-tab-btn--active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Workspace Body */}
      {/* 1. SECTIONS TAB */}
      {(activeTab === 'Sections' || activeTab === 'Articles') && (
        <div className="dual-pane-layout">
          {/* Sidebar tree-view */}
          <aside className="workspace-sidebar">
            <div className="sidebar-title">{chapterLabel}s List</div>
            <button
              onClick={() => {
                setSelectedChapter('');
                setSelectedSubheader('');
              }}
              className={`all-chapters-btn ${!selectedChapter && !selectedSubheader ? 'all-chapters-btn--active' : ''}`}
            >
              📚 All Chapters
            </button>
            {act.chapters.map((chapter) => {
              const isChapActive = selectedChapter === chapter.number;
              return (
                <div key={chapter.number} className="chapter-group">
                  <button
                    onClick={() => {
                      setSelectedChapter(isChapActive ? '' : chapter.number);
                      setSelectedSubheader('');
                    }}
                    className={`chapter-header-btn ${isChapActive ? 'chapter-header-btn--active' : ''}`}
                  >
                    <span>{chapter.number === 'Preamble' ? 'Preamble' : `${chapterLabel} ${chapter.number}`}</span>
                    <span>▾</span>
                  </button>

                  {/* Render Subheaders for CPC */}
                  {isCPC && isChapActive && cpcSubheaders[chapter.number] && (
                    <div className="subheaders-list">
                      {cpcSubheaders[chapter.number].map((sub) => (
                        <button
                          key={sub.title}
                          onClick={() => setSelectedSubheader(selectedSubheader === sub.title ? '' : sub.title)}
                          className={`subheader-link-btn ${selectedSubheader === sub.title ? 'subheader-link-btn--active' : ''}`}
                          title={`${sub.title} (Sec ${sub.start}-${sub.end})`}
                        >
                          ▫️ {sub.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* Right Pane Grid of Sections */}
          <div className="workspace-content">
            <div className="controls-row">
              {/* Items Per Page entries dropdown */}
              <div className="limit-selector">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItemsPerPage(val === 'All' ? 'All' : parseInt(val, 10));
                  }}
                  className="limit-select"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value="All">All</option>
                </select>
                <span>entries</span>
              </div>

              {/* Search Box */}
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${sectionLabel.toLowerCase()}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Sections List */}
            <div className="sections-accordion-list">
              {paginatedSections.length > 0 ? (
                paginatedSections.map((sec) => {
                  const isExpanded = !!expandedSections[sec.number];
                  return (
                    <div key={sec.number} className="section-accordion">
                      <button
                        onClick={() => toggleSection(sec.number)}
                        className="section-header-row"
                      >
                        <div className="section-header-left">
                          <span className="section-badge-id">{sectionLabel} {sec.number}</span>
                          <span style={{ color: isExpanded ? 'var(--gold-bright)' : '#ffffff' }}>{sec.title}</span>
                        </div>
                        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          ▼
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="section-body">
                          <div className="section-text-container">
                            {sec.text.split('\n').map((para, idx) => (
                              para.trim() ? (
                                <p key={idx} style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>{para}</p>
                              ) : null
                            ))}
                          </div>
                          <div className="section-actions">
                            <button
                              onClick={() => handleCopyText(sec.number, sec.text)}
                              className="btn btn--ghost btn--small"
                              style={{ border: '1px solid var(--glass-border)' }}
                            >
                              {copiedSection === sec.number ? '✔️ Copied!' : '📋 Copy Text'}
                            </button>
                            <Link
                              href={`/ai-assistant?prompt=${encodeURIComponent(`Analyze ${act.name}, ${sectionLabel} ${sec.number}: "${sec.title}" in a highly professional, legal manner suitable for law students and practitioners.`)}`}
                              className="btn btn--gold-fill btn--small"
                            >
                              ✦ Ask AI
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--white-dim)' }}>
                  🚫 No sections match your search or filters. Try resetting the filters or clearing the search box.
                </div>
              )}
            </div>

            {/* Pagination controls */}
            {itemsPerPage !== 'All' && totalPages > 1 && (
              <div className="pagination-row">
                <div className="pagination-info">
                  Showing {filteredSections.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredSections.length)} of {filteredSections.length} entries
                </div>
                <div className="pagination-controls">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="page-btn"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    // Render ellipsis if too many pages
                    if (totalPages > 8 && page > 3 && page < totalPages - 2 && Math.abs(currentPage - page) > 1) {
                      if (page === 4 || page === totalPages - 3) {
                        return <span key={page} style={{ color: 'var(--white-dim)', padding: '0 4px' }}>...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`page-btn ${currentPage === page ? 'page-btn--active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="page-btn"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SCHEDULE TAB (CPC Orders & Rules / Constitution Schedules / Criminal Schedules) */}
      {activeTab === 'Schedule' && (
        <>
          {/* CPC Orders Browser */}
          {isCPC && (
            <div className="split-details-layout">
              <aside className="details-list-sidebar">
                {cpcRules.map((ord) => (
                  <button
                    key={ord.number}
                    onClick={() => setSelectedOrder(ord)}
                    className={`details-sidebar-item ${selectedOrder.number === ord.number ? 'details-sidebar-item--active' : ''}`}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{ord.number}</span>
                    <span style={{ opacity: 0.9 }}>{ord.title}</span>
                  </button>
                ))}
              </aside>
              <div className="details-viewer-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)' }}>
                    {selectedOrder.number}: {selectedOrder.title}
                  </h3>
                  
                  {/* Rule Search Box */}
                  <div className="search-wrapper" style={{ minWidth: '200px' }}>
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search rules..."
                      value={ruleSearchQuery}
                      onChange={(e) => setRuleSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="rules-accordion-list" style={{ marginTop: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xxs)' }}>
                  {(() => {
                    const filteredRules = selectedOrder.rules.filter(r => 
                      String(r.number).toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
                      String(r.title).toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
                      String(r.text).toLowerCase().includes(ruleSearchQuery.toLowerCase())
                    );
                    return filteredRules.length > 0 ? (
                      filteredRules.map((rule) => {
                        const isExpanded = !!expandedRules[rule.number];
                        const ruleKey = `${selectedOrder.number}-${rule.number}`;
                        return (
                          <div key={rule.number} className="section-accordion">
                            <button
                              onClick={() => toggleRule(rule.number)}
                              className="section-header-row"
                            >
                              <div className="section-header-left">
                                <span className="section-badge-id" style={{ minWidth: '80px', textAlign: 'center' }}>Rule {rule.number}</span>
                                <span style={{ color: isExpanded ? 'var(--gold-bright)' : '#ffffff' }}>{rule.title}</span>
                              </div>
                              <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                ▼
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="section-body">
                                <div className="section-text-container" style={{ background: '#fdfbf7', color: '#2b2b2b', fontFamily: 'Georgia, serif', padding: 'var(--space-md)', borderRadius: '6px', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                  {rule.text.split('\n').map((para, idx) => (
                                    para.trim() ? (
                                      <p key={idx} style={{ marginBottom: '0.8rem', whiteSpace: 'pre-line', fontSize: 'var(--text-sm)' }}>{para}</p>
                                    ) : null
                                  ))}
                                </div>
                                <div className="section-actions" style={{ marginTop: 'var(--space-sm)' }}>
                                  <button
                                    onClick={() => handleCopyText(ruleKey, `Code of Civil Procedure, 1908 - ${selectedOrder.number}, Rule ${rule.number} (${rule.title}):\n\n${rule.text}`)}
                                    className="btn btn--ghost btn--small"
                                    style={{ border: '1px solid var(--glass-border)' }}
                                  >
                                    {copiedSection === ruleKey ? '✔️ Copied!' : '📋 Copy Rule'}
                                  </button>
                                  <Link
                                    href={`/ai-assistant?prompt=${encodeURIComponent(`Analyze CPC ${selectedOrder.number}, Rule ${rule.number}: "${rule.title}" in a highly professional, legal manner suitable for law students and practitioners.`)}`}
                                    className="btn btn--gold-fill btn--small"
                                  >
                                    ✦ Ask AI
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-xl)', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--white-dim)' }}>
                        🚫 No rules match your search.
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Constitution Schedules */}
          {isConstitution && (() => {
            const constitutionSchedulesList = act.schedules || constitutionSchedules;
            const currentSchedule = selectedSchedule || constitutionSchedulesList[0];
            return (
              <div className="split-details-layout">
                <aside className="details-list-sidebar">
                  {constitutionSchedulesList.map((sch) => (
                    <button
                      key={sch.number}
                      onClick={() => setSelectedSchedule(sch)}
                      className={`details-sidebar-item ${currentSchedule.number === sch.number ? 'details-sidebar-item--active' : ''}`}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{sch.number}</span>
                      <span style={{ opacity: 0.9 }}>{sch.title}</span>
                    </button>
                  ))}
                </aside>
                <div className="details-viewer-pane">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)' }}>
                      {currentSchedule.number}: {currentSchedule.title}
                    </h3>
                  </div>
                  <div className="parchment-sheet" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {currentSchedule.content}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                    <button
                      onClick={() => handleCopyText(currentSchedule.number, `${currentSchedule.number}: ${currentSchedule.title}\n\n${currentSchedule.content}`)}
                      className="btn btn--ghost btn--small"
                      style={{ border: '1px solid var(--glass-border)' }}
                    >
                      {copiedSection === currentSchedule.number ? '✔️ Copied!' : '📋 Copy Schedule'}
                    </button>
                    <Link
                      href={`/ai-assistant?prompt=${encodeURIComponent(`Analyze the ${currentSchedule.number} of the Constitution of India (${currentSchedule.title}) in a highly professional, legal manner suitable for law students and practitioners.`)}`}
                      className="btn btn--gold-fill btn--small"
                    >
                      ✦ Ask AI about this Schedule
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Criminal Procedure Schedules */}
          {isCriminal && (() => {
            const schedulesList = act.schedules || criminalSchedules;
            const currentSch = selectedCrimSchedule || schedulesList[0];
            return (
              <div className="split-details-layout">
                <aside className="details-list-sidebar">
                  {schedulesList.map((sch) => (
                    <button
                      key={sch.number}
                      onClick={() => setSelectedCrimSchedule(sch)}
                      className={`details-sidebar-item ${currentSch.number === sch.number ? 'details-sidebar-item--active' : ''}`}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{sch.number}</span>
                      <span style={{ opacity: 0.9 }}>{sch.title}</span>
                    </button>
                  ))}
                </aside>
                <div className="details-viewer-pane">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)' }}>
                      {currentSch.number}: {currentSch.title}
                    </h3>
                  </div>
                  <div className="parchment-sheet" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {currentSch.content}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                    <button
                      onClick={() => handleCopyText(currentSch.number, `${currentSch.number}: ${currentSch.title}\n\n${currentSch.content}`)}
                      className="btn btn--ghost btn--small"
                      style={{ border: '1px solid var(--glass-border)' }}
                    >
                      {copiedSection === currentSch.number ? '✔️ Copied!' : '📋 Copy Schedule'}
                    </button>
                    <Link
                      href={`/ai-assistant?prompt=${encodeURIComponent(`Analyze the ${currentSch.number} of ${act.name} (${currentSch.title}) in a highly professional, legal manner suitable for law students and practitioners.`)}`}
                      className="btn btn--gold-fill btn--small"
                    >
                      ✦ Ask AI about this Schedule
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* 3. ANNEXURE TAB (CPC specific) */}
      {activeTab === 'Annexure' && isCPC && (
        <div className="details-viewer-pane">
          <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)' }}>Annexure: Civil Pleadings & Court Decrees</h3>
          <p style={{ color: 'var(--white-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            In civil litigation, the Annexure covers standard notifications, jurisdictional values, and local High Court amendments to the CPC.
          </p>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: 'var(--space-md)', color: 'var(--white-dim)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
            💡 **High Court Amendments:** Each state&apos;s High Court has the power (under Section 122 of CPC) to amend, alter, or add to the rules of the First Schedule. Check local amendments for verification rules, electronic summons, and timeline changes in commercial disputes.
          </div>
          <div>
            <Link
              href={`/ai-assistant?prompt=${encodeURIComponent(`Explain how local High Court amendments modify the standard CPC rules for serving summons or filing pleadings, and how to verify them.`)}`}
              className="btn btn--gold-fill btn--small"
            >
              ✦ Ask AI about local Amendments
            </Link>
          </div>
        </div>
      )}

      {/* 4. APPENDIX TAB (CPC specific) */}
      {activeTab === 'Appendix' && isCPC && (
        <div className="split-details-layout">
          <aside className="details-list-sidebar">
            {cpcAppendices.map((app) => (
              <button
                key={app.code}
                onClick={() => setSelectedAppendix(app)}
                className={`details-sidebar-item ${selectedAppendix.code === app.code ? 'details-sidebar-item--active' : ''}`}
              >
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{app.code}</span>
                <span style={{ opacity: 0.9 }}>{app.title}</span>
              </button>
            ))}
          </aside>
          <div className="details-viewer-pane">
            <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)' }}>
              {selectedAppendix.code}: {selectedAppendix.title}
            </h3>
            <p style={{ color: 'var(--white-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
              {selectedAppendix.description}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-md)' }}>
              <Link
                href={`/ai-assistant?prompt=${encodeURIComponent(`Provide the standard pleading format and templates under ${selectedAppendix.code} (${selectedAppendix.title}) of the CPC, along with model draft clauses.`)}`}
                className="btn btn--gold-fill btn--small"
              >
                ✦ Ask AI to Draft templates
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. FORMS TAB (CPC & Criminal Forms) */}
      {activeTab === 'Forms' && (
        <>
          {/* CPC Forms */}
          {isCPC && (
            <div className="split-details-layout">
              <aside className="details-list-sidebar">
                {cpcForms.map((frm) => (
                  <button
                    key={frm.id}
                    onClick={() => setSelectedForm(frm)}
                    className={`details-sidebar-item ${selectedForm.id === frm.id ? 'details-sidebar-item--active' : ''}`}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{frm.id}</span>
                    <span style={{ opacity: 0.9 }}>{frm.title}</span>
                  </button>
                ))}
              </aside>
              <div className="details-viewer-pane">
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)' }}>
                  {selectedForm.title}
                </h3>
                <div className="parchment-sheet">
                  {selectedForm.template}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                  <button
                    onClick={() => handleCopyText(selectedForm.id, selectedForm.template)}
                    className="btn btn--ghost btn--small"
                  >
                    {copiedSection === selectedForm.id ? '✔️ Copied!' : '📋 Copy Template'}
                  </button>
                  <Link
                    href={`/ai-assistant?prompt=${encodeURIComponent(`Help me draft and customize the following CPC form: \n\n${selectedForm.template}`)}`}
                    className="btn btn--gold-fill btn--small"
                  >
                    ✦ Draft / Edit in AI Assistant
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Criminal Forms */}
          {isCriminal && (() => {
            const formsList = act.forms || criminalForms;
            const currentForm = selectedCriminalForm || formsList[0];
            const formKey = currentForm.number || currentForm.id;
            const formContent = currentForm.template || currentForm.content;
            return (
              <div className="split-details-layout">
                <aside className="details-list-sidebar">
                  {formsList.map((frm) => {
                    const k = frm.number || frm.id;
                    return (
                      <button
                        key={k}
                        onClick={() => setSelectedCriminalForm(frm)}
                        className={`details-sidebar-item ${(currentForm.number || currentForm.id) === k ? 'details-sidebar-item--active' : ''}`}
                      >
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{k}</span>
                        <span style={{ opacity: 0.9 }}>{frm.title}</span>
                      </button>
                    );
                  })}
                </aside>
                <div className="details-viewer-pane">
                  <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)', borderBottom: '1px solid var(--glass-border)', paddingBottom: 'var(--space-xs)' }}>
                    {formKey}: {currentForm.title}
                  </h3>
                  <div className="parchment-sheet" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {formContent}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-sm)' }}>
                    <button
                      onClick={() => handleCopyText(formKey, `${formKey}: ${currentForm.title}\n\n${formContent}`)}
                      className="btn btn--ghost btn--small"
                      style={{ border: '1px solid var(--glass-border)' }}
                    >
                      {copiedSection === formKey ? '✔️ Copied!' : '📋 Copy Form'}
                    </button>
                    <Link
                      href={`/ai-assistant?prompt=${encodeURIComponent(`Provide the complete official draft text and usage instructions for ${formKey} (${currentForm.title}) under ${act.name}.`)}`}
                      className="btn btn--gold-fill btn--small"
                    >
                      ✦ Ask AI to Draft Form
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* 6. ACT DETAILS TAB */}
      {activeTab === 'Act Details' && (
        <div className="details-viewer-pane">
          <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--gold-bright)' }}>Enactment Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', color: 'var(--white-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            <p><strong>Official Name:</strong> {act.name}</p>
            <p><strong>Enactment Year:</strong> {act.year}</p>
            <p><strong>Category:</strong> {act.category}</p>
            <p><strong>Description:</strong> {act.description}</p>
            {act.transitionNote && (
              <div style={{ padding: 'var(--space-md)', backgroundColor: 'rgba(178, 34, 34, 0.1)', borderLeft: '4px solid var(--alert-red)', borderRadius: '4px', marginTop: 'var(--space-sm)' }}>
                <strong>Transition Note:</strong> {act.transitionNote}
              </div>
            )}
            {act.replaces && (
              <p><strong>Replaces Act:</strong> <span className="card__tag" style={{ background: 'rgba(255, 0, 0, 0.1)', color: 'var(--alert-red)' }}>{act.replaces}</span></p>
            )}
            {act.replacedBy && (
              <p><strong>Replaced By Act:</strong> <span className="card__tag" style={{ background: 'rgba(244, 162, 97, 0.1)', color: 'var(--gold-bright)' }}>{act.replacedBy}</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
