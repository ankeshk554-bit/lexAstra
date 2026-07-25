export const exams = [
  {
    id: 'judiciary',
    slug: 'judiciary',
    name: 'Judiciary Exam',
    fullName: 'Civil Judge / Judicial Magistrate Examination',
    description: 'The entry-level judicial service examination conducted by state public service commissions or high courts to recruit Civil Judges (Junior Division) and Judicial Magistrates.',
    eligibility: 'A Bachelor\'s degree in Law (LLB) from a university recognized by the Bar Council of India. Some states may require enrollment as an advocate or working knowledge of the local language.',
    pattern: {
      stages: ['Preliminary Exam (Objective)', 'Main Exam (Subjective/Written)', 'Interview / Viva-Voce'],
      details: 'Prelims act as a screening test. Mains usually consist of 4-6 papers covering substantive law, procedural law, and language. Interview assesses personality and practical legal knowledge.'
    },
    keyDates: {
      notification: 'Varies significantly by state (Usually state-specific notifications are released throughout the year)',
      exam: 'Multiple times a year across different states'
    },
    majorStates: ['Uttar Pradesh', 'Delhi', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Bihar'],
    syllabus: [
      {
        paper: 'Procedural Law',
        subjects: [
          {
            name: 'Code of Civil Procedure, 1908',
            topics: ['Jurisdiction of Civil Courts', 'Res Sub-Judice & Res Judicata', 'Place of Suing', 'Pleadings', 'Appearance and Non-appearance', 'Execution of Decrees', 'Injunctions', 'Appeals, Reference, Review and Revision'],
            relatedActs: ['code-of-civil-procedure'],
            relatedCases: []
          },
          {
            name: 'Code of Criminal Procedure, 1973 / BNSS 2023',
            topics: ['Constitution of Criminal Courts', 'Arrest of Persons', 'Process to Compel Appearance', 'Maintenance of Public Order', 'Information to the Police (FIR)', 'Investigation', 'Charges', 'Trials (Sessions, Warrant, Summons, Summary)', 'Appeals and Bail'],
            relatedActs: ['code-of-criminal-procedure', 'bharatiya-nagarik-suraksha-sanhita'],
            relatedCases: ['dk-basu-v-state-of-west-bengal', 'ar його-v-state-of-punjab']
          },
          {
            name: 'Indian Evidence Act, 1872 / BSA 2023',
            topics: ['Relevancy of Facts', 'Admissions and Confessions', 'Dying Declaration', 'Expert Opinion', 'Oral and Documentary Evidence', 'Burden of Proof', 'Estoppel', 'Competency of Witnesses', 'Examination of Witnesses'],
            relatedActs: ['indian-evidence-act', 'bharatiya-sakshya-adhiniyam'],
            relatedCases: ['pakala-narayana-swami-v-emperor']
          }
        ]
      },
      {
        paper: 'Substantive Law',
        subjects: [
          {
            name: 'Indian Penal Code, 1860 / BNS 2023',
            topics: ['General Exceptions', 'Right of Private Defence', 'Abetment and Criminal Conspiracy', 'Offences against the State', 'Offences affecting the Human Body (Murder, Culpable Homicide, Kidnapping, Rape)', 'Offences against Property (Theft, Extortion, Robbery, Dacoity, Cheating)', 'Defamation'],
            relatedActs: ['indian-penal-code', 'bharatiya-nyaya-sanhita'],
            relatedCases: ['km-nanavati-v-state-of-maharashtra']
          },
          {
            name: 'Indian Contract Act, 1872',
            topics: ['Formation of Contract', 'Consideration', 'Capacity to Contract', 'Free Consent', 'Void Agreements', 'Contingent Contracts', 'Performance of Contracts', 'Breach of Contract and Damages', 'Indemnity and Guarantee', 'Bailment and Pledge', 'Agency'],
            relatedActs: ['indian-contract-act'],
            relatedCases: ['carlill-v-carbolic-smoke-ball-co', 'mohori-bibee-v-dhurmodas-ghose']
          },
          {
            name: 'Transfer of Property Act, 1882',
            topics: ['Concept of Property', 'Transfer of Property by Act of Parties', 'Rule against Perpetuity', 'Vested and Contingent Interest', 'Doctrine of Election', 'Lis Pendens', 'Fraudulent Transfer', 'Part Performance', 'Sale, Mortgage, Lease, Exchange, Gift, Actionable Claims'],
            relatedActs: ['transfer-of-property-act'],
            relatedCases: []
          },
          {
            name: 'Constitution of India',
            topics: ['Preamble', 'Fundamental Rights (Articles 12-35)', 'Directive Principles of State Policy', 'Fundamental Duties', 'Union and State Executive', 'Union and State Judiciary (Supreme Court and High Courts)', 'Writ Jurisdiction', 'Emergency Provisions', 'Amendment of the Constitution'],
            relatedActs: ['constitution-of-india'],
            relatedCases: ['kesavananda-bharati', 'maneka-gandhi', 'ks-puttaswamy-v-union-of-india']
          }
        ]
      }
    ],
    pyq: [
      { year: 2023, state: 'UP', subject: 'Civil Law', question: 'Discuss the doctrine of Res Judicata under Section 11 of the Civil Procedure Code, 1908. How does it differ from Res Sub-Judice?', marks: 15 },
      { year: 2022, state: 'Delhi', subject: 'Criminal Law', question: 'What is a Dying Declaration? Explain the conditions under which it is admissible as evidence under Section 32(1) of the Indian Evidence Act.', marks: 20 },
      { year: 2023, state: 'MP', subject: 'Constitutional Law', question: 'Analyze the expansion of Article 21 of the Constitution of India in light of landmark judicial pronouncements.', marks: 10 }
    ],
    importantCases: ['kesavananda-bharati', 'maneka-gandhi', 'vishaka-v-state-of-rajasthan', 'dk-basu-v-state-of-west-bengal', 'lalita-kumari-v-govt-of-up'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'clat-ug',
    slug: 'clat-ug',
    name: 'CLAT UG',
    fullName: 'Common Law Admission Test - Undergraduate',
    description: 'National level entrance exam for admissions to undergraduate law programs (BA LLB, BBA LLB, B.Sc LLB, B.Com LLB) at 24 National Law Universities in India.',
    eligibility: '10+2 or equivalent examination with a minimum of 45% marks (40% for SC/ST categories). No upper age limit.',
    pattern: {
      stages: ['Single Objective Test'],
      details: '120 multiple-choice questions to be answered in 120 minutes. Negative marking of 0.25 marks for every wrong answer. Comprehension passage-based questions.'
    },
    keyDates: {
      notification: 'Usually July/August',
      exam: 'First Sunday of December (for the next academic year)'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'CLAT UG Paper',
        subjects: [
          {
            name: 'English Language',
            topics: ['Reading Comprehension', 'Inferences and Conclusions', 'Summary of passages', 'Vocabulary', 'Meaning of words and phrases'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Current Affairs & General Knowledge',
            topics: ['Contemporary events of significance from India and the world', 'Arts and culture', 'International affairs', 'Historical events of continuing significance'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Legal Reasoning',
            topics: ['General awareness of contemporary legal and moral issues', 'Application of legal principles or rules to factual situations', 'Understanding of legal terms and maxims'],
            relatedActs: ['constitution-of-india'],
            relatedCases: []
          },
          {
            name: 'Logical Reasoning',
            topics: ['Recognize an argument, its premises and conclusions', 'Read and identify the arguments set out in the passage', 'Critically analyze patterns of reasoning', 'Infer what follows from the passage', 'Apply these inferences to new situations'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Quantitative Techniques',
            topics: ['Derive, infer, and manipulate numerical information from short passages, graphs, or other representations', 'Apply 10th standard mathematical operations', 'Ratios and proportions, basic algebra, mensuration and statistical estimation'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2024, state: 'All India', subject: 'Legal Reasoning', question: 'Based on the passage regarding the Digital Personal Data Protection Act, what constitutes valid consent?', marks: 1 },
      { year: 2023, state: 'All India', subject: 'Current Affairs', question: 'Which Constitutional Amendment Act provided for the EWS reservation?', marks: 1 }
    ],
    importantCases: ['ks-puttaswamy-v-union-of-india', 'navtej-singh-johar', 'joseph-shine'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'clat-pg',
    slug: 'clat-pg',
    name: 'CLAT PG',
    fullName: 'Common Law Admission Test - Postgraduate',
    description: 'National level entrance exam for admissions to LL.M. programs at National Law Universities and for recruitment to legal posts in several Public Sector Undertakings (PSUs).',
    eligibility: 'LL.B. Degree or an equivalent examination with a minimum of 50% marks (45% for SC/ST categories). No upper age limit.',
    pattern: {
      stages: ['Single Objective Test'],
      details: '120 multiple-choice questions based on primary legal materials such as important court decisions in various fields of public and private law. 120 minutes duration. 0.25 negative marking.'
    },
    keyDates: {
      notification: 'Usually July/August',
      exam: 'First Sunday of December (for the next academic year)'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'CLAT PG Paper',
        subjects: [
          {
            name: 'Constitutional Law',
            topics: ['Fundamental Rights', 'Directive Principles', 'Judiciary', 'Executive and Legislature', 'Center-State Relations', 'Emergency Provisions', 'Amendment'],
            relatedActs: ['constitution-of-india'],
            relatedCases: ['kesavananda-bharati', 'minerva-mills', 'sr-bommai']
          },
          {
            name: 'Other Core Law Subjects',
            topics: ['Jurisprudence', 'Administrative Law', 'Law of Contract', 'Torts', 'Family Law', 'Criminal Law', 'Property Law', 'Company Law', 'Public International Law', 'Tax Law', 'Environmental Law', 'Labour & Industrial Law'],
            relatedActs: ['indian-penal-code', 'indian-contract-act', 'transfer-of-property-act'],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2024, state: 'All India', subject: 'Constitutional Law', question: 'Identify the ratio decidendi in the recent Supreme Court judgment on Electoral Bonds from the given excerpt.', marks: 1 },
      { year: 2023, state: 'All India', subject: 'Criminal Law', question: 'Apply the legal principles of culpable homicide not amounting to murder based on the provided Supreme Court case summary.', marks: 1 }
    ],
    importantCases: ['kesavananda-bharati', 'maneka-gandhi', 'ks-puttaswamy-v-union-of-india', 'navtej-singh-johar', 'shreya-singhal'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'apo',
    slug: 'apo',
    name: 'APO Exam',
    fullName: 'Assistant Public Prosecutor Officer Exam',
    description: 'State-level examination conducted to recruit Assistant Public Prosecutors who represent the State in criminal cases at the Magistrate Court level.',
    eligibility: 'A Bachelor\'s degree in Law (LLB). Some states may require prior experience as an advocate at the bar.',
    pattern: {
      stages: ['Preliminary Exam', 'Main Exam', 'Interview'],
      details: 'Prelims are objective, testing Law and General Knowledge. Mains consist of descriptive papers focusing heavily on Criminal Law, Procedure, and Evidence. Interview assesses suitability for the role.'
    },
    keyDates: {
      notification: 'State-specific, varies',
      exam: 'State-specific, varies'
    },
    majorStates: ['Uttar Pradesh', 'Rajasthan', 'Bihar', 'Uttarakhand', 'Haryana'],
    syllabus: [
      {
        paper: 'Law Paper',
        subjects: [
          {
            name: 'Substantive Criminal Law',
            topics: ['Indian Penal Code / BNS - Complete Act with focus on offences against body, property, and public tranquility', 'State-specific minor acts (e.g., UP Police Act)'],
            relatedActs: ['indian-penal-code', 'bharatiya-nyaya-sanhita'],
            relatedCases: []
          },
          {
            name: 'Procedural Law & Evidence',
            topics: ['Code of Criminal Procedure / BNSS - Complete Act', 'Indian Evidence Act / BSA - Complete Act'],
            relatedActs: ['code-of-criminal-procedure', 'bharatiya-nagarik-suraksha-sanhita', 'indian-evidence-act', 'bharatiya-sakshya-adhiniyam'],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2021, state: 'Bihar', subject: 'Substantive Criminal Law', question: 'In which Section of the Indian Penal Code, 1860 (and its corresponding BNS section) is the word "Act" defined? Explain the difference between single acts and series of acts.', marks: 5 },
      { year: 2021, state: 'Bihar', subject: 'Substantive Criminal Law', question: 'Detail the statutory definition and key components of "wrongful restraint" (Section 339/341 IPC, corresponding to BNS). What is the punishment provided?', marks: 5 },
      { year: 2021, state: 'Bihar', subject: 'Evidence', question: 'Discuss the admissibility of a dying declaration. What is the significance of the Latin maxim "Nemo moriturus praesumitur mentire" in this context?', marks: 10 },
      { year: 2021, state: 'Bihar', subject: 'Evidence', question: 'Who drafted the Indian Evidence Act, 1872? Describe its general division into parts and chapters, and contrast it with the structure of the new Bharatiya Sakshya Adhiniyam (BSA), 2023.', marks: 10 },
      { year: 2021, state: 'Bihar', subject: 'Substantive Criminal Law', question: 'Distinguish between "common intention" (Section 34 IPC / Section 3(5) BNS) and "similar intention" in light of landmark judgments such as Mahboob Shah v. King Emperor and Barendra Kumar Ghosh v. King Emperor.', marks: 15 },
      { year: 2021, state: 'Bihar', subject: 'Substantive Criminal Law', question: 'Discuss the case of Sarla Mudgal, President of Kalyani v. Union of India. Which specific offence under the IPC/BNS does this case deal with?', marks: 10 },
      { year: 2021, state: 'Bihar', subject: 'Evidence', question: 'Explain the admissibility of discovery statements under Section 27 of the Indian Evidence Act (Section 23 of BSA). What portions of information received from an accused are admissible?', marks: 15 }
    ],
    importantCases: ['dk-basu-v-state-of-west-bengal', 'lalita-kumari-v-govt-of-up', 'ar-antulay-v-rs-nayak'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'cuet-ug',
    slug: 'cuet-ug',
    name: 'CUET UG (Law)',
    fullName: 'Common University Entrance Test - Undergraduate',
    description: 'National level test conducted by NTA for admission to undergraduate programs, including 5-year integrated law courses in Central Universities and other participating institutions.',
    eligibility: 'Class 12th or equivalent examination. Percentage requirements vary by participating university.',
    pattern: {
      stages: ['Computer Based Test (CBT)'],
      details: 'Objective type questions. Structure includes Section I (Languages), Section II (Domain Specific Subjects - Legal Studies), and Section III (General Test).'
    },
    keyDates: {
      notification: 'February/March',
      exam: 'May'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Legal Studies Domain',
        subjects: [
          {
            name: 'Legal Studies (Class XII CBSE Syllabus)',
            topics: ['Judiciary', 'Topics of Law (Property, Contract, Tort, Criminal Law)', 'Arbitration, Tribunal Adjudication, and Alternative Dispute Resolution', 'Human Rights in India', 'Legal Profession in India', 'Legal Services', 'International Context'],
            relatedActs: ['constitution-of-india', 'indian-contract-act'],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2023, state: 'All India', subject: 'Legal Studies', question: 'Which article of the Constitution provides for the establishment of the Supreme Court of India?', marks: 5 }
    ],
    importantCases: [],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'cuet-pg',
    slug: 'cuet-pg',
    name: 'CUET PG (Law)',
    fullName: 'Common University Entrance Test - Postgraduate',
    description: 'National level test for admission to postgraduate programs (LLM) in Central Universities like DU, BHU, and other participating state and private universities.',
    eligibility: 'LLB or equivalent degree from a recognized university. Minimum percentage criteria vary by institution.',
    pattern: {
      stages: ['Computer Based Test (CBT)'],
      details: 'Objective test. 100 questions (75 domain knowledge + 25 general). Duration 120 minutes. +4 for correct answer, -1 for incorrect.'
    },
    keyDates: {
      notification: 'December/January',
      exam: 'March'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Law Domain',
        subjects: [
          {
            name: 'General Principles of Law',
            topics: ['Jurisprudence', 'Constitutional Law of India', 'Public International Law', 'Family Law', 'Law of Contracts', 'Law of Torts', 'Criminal Law', 'Labour Law', 'Environmental Law'],
            relatedActs: ['constitution-of-india', 'indian-penal-code', 'indian-contract-act'],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2023, state: 'All India', subject: 'Constitutional Law', question: 'The power of Judicial Review in India is vested in which courts?', marks: 4 }
    ],
    importantCases: ['kesavananda-bharati', 'maneka-gandhi'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'aibe',
    slug: 'aibe',
    name: 'AIBE',
    fullName: 'All India Bar Examination',
    description: 'Open-book certification exam conducted by the Bar Council of India that law graduates must clear to receive a Certificate of Practice and practice as an advocate in India.',
    eligibility: 'LLB degree from a BCI-recognized university and provisional enrollment with a State Bar Council.',
    pattern: {
      stages: ['Single Objective Paper (Open Book)'],
      details: '100 multiple-choice questions across core and allied laws, to be answered in 3.5 hours. Bare Acts and printed material are allowed on the desk. Qualifying exam (no ranking); passing percentage is fixed by BCI for the relevant cycle.'
    },
    keyDates: {
      notification: 'Cycle-based, usually 1-2 sittings per year',
      exam: 'Announced by BCI per cycle'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'AIBE Paper',
        subjects: [
          {
            name: 'Code of Civil Procedure, 1908',
            topics: ['Jurisdiction', 'Res Judicata', 'Pleadings', 'Execution', 'Appeals and Revisions', 'Interim Orders'],
            relatedActs: ['code-of-civil-procedure'],
            relatedCases: []
          },
          {
            name: 'Indian Penal Code, 1860 / BNS 2023',
            topics: ['General Exceptions', 'Offences against the Body', 'Offences against Property', 'Punishments'],
            relatedActs: ['indian-penal-code', 'bharatiya-nyaya-sanhita'],
            relatedCases: []
          },
          {
            name: 'Code of Criminal Procedure, 1973 / BNSS 2023',
            topics: ['FIR and Investigation', 'Arrest and Bail', 'Cognizable vs Non-Cognizable Offences', 'Trial Procedure'],
            relatedActs: ['code-of-criminal-procedure', 'bharatiya-nagarik-suraksha-sanhita'],
            relatedCases: []
          },
          {
            name: 'Indian Evidence Act, 1872 / BSA 2023',
            topics: ['Relevancy of Facts', 'Confessions', 'Burden of Proof', 'Documentary Evidence'],
            relatedActs: ['indian-evidence-act', 'bharatiya-sakshya-adhiniyam'],
            relatedCases: []
          },
          {
            name: 'Indian Contract Act, 1872',
            topics: ['Essentials of a Valid Contract', 'Breach of Contract', 'Indemnity and Guarantee', 'Bailment and Agency'],
            relatedActs: ['indian-contract-act'],
            relatedCases: []
          },
          {
            name: 'Constitution of India',
            topics: ['Fundamental Rights', 'Writ Jurisdiction', 'Directive Principles', 'Union and State Legislature'],
            relatedActs: ['constitution-of-india'],
            relatedCases: []
          },
          {
            name: 'Professional Ethics & Bar Council Rules',
            topics: ['Advocates Act, 1961', 'BCI Rules of Professional Conduct', 'Contempt of Courts Act', 'Misconduct and Disciplinary Proceedings'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2023, state: 'All India', subject: 'Civil Procedure', question: 'Under which Order and Rule of the CPC is a plaint rejected for want of cause of action?', marks: 1 },
      { year: 2023, state: 'All India', subject: 'Evidence', question: 'Which section of the Evidence Act deals with the relevancy of a dying declaration?', marks: 1 }
    ],
    importantCases: [],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'ugc-net-law',
    slug: 'ugc-net-law',
    name: 'UGC NET Law',
    fullName: 'National Eligibility Test (NET) — Law',
    description: 'Test conducted by NTA on behalf of UGC to determine eligibility for Assistant Professor positions (and, subject to score, Junior Research Fellowship) in Law at Indian universities and colleges.',
    eligibility: "Master's degree (LLM) or equivalent from a recognized university with the prescribed minimum aggregate marks (relaxation for reserved categories as per UGC norms).",
    pattern: {
      stages: ['Paper I (Teaching & Research Aptitude)', 'Paper II (Law — Subject Specific)'],
      details: 'Both papers are objective (MCQ), computer-based, held on the same day. Paper I is general and common to all subjects; Paper II tests law-specific knowledge across jurisprudence, constitutional law, and allied subjects.'
    },
    keyDates: {
      notification: 'Cycles are typically announced twice a year',
      exam: 'NTA-notified dates per cycle'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Paper II — Law',
        subjects: [
          {
            name: 'Jurisprudence',
            topics: ['Schools of Jurisprudence (Analytical, Historical, Sociological, Natural Law)', 'Austin, Kelsen, Hart, Salmond', 'Concept of Rights and Duties', 'Sources of Law'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Constitutional Law of India',
            topics: ['Fundamental Rights and Directive Principles', 'Centre-State Relations', 'Judicial Review', 'Constitutional Amendments'],
            relatedActs: ['constitution-of-india'],
            relatedCases: ['kesavananda-bharati', 'maneka-gandhi']
          },
          {
            name: 'Law of Crimes',
            topics: ['General Principles of Criminal Liability', 'Offences under IPC/BNS', 'Criminal Procedure Fundamentals'],
            relatedActs: ['indian-penal-code', 'bharatiya-nyaya-sanhita'],
            relatedCases: []
          },
          {
            name: 'International Law',
            topics: ['Sources of International Law', 'State Recognition', 'UN Charter', 'International Humanitarian Law'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Family Law, Labour Law & Environmental Law',
            topics: ['Hindu and Muslim Personal Law', 'Industrial Disputes Act', 'Environment Protection Act', 'Public Interest Litigation on Environment'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2023, state: 'All India', subject: 'Jurisprudence', question: "Explain Hart's concept of the 'Rule of Recognition' and how it differs from Austin's Command Theory.", marks: 2 }
    ],
    importantCases: ['kesavananda-bharati', 'maneka-gandhi'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'sebi-legal',
    slug: 'sebi-legal',
    name: 'SEBI Legal',
    fullName: 'SEBI Grade A Officer — Legal Stream',
    description: 'Recruitment examination conducted by the Securities and Exchange Board of India for Assistant Manager (Legal) posts, testing securities law, corporate regulation, and general legal knowledge.',
    eligibility: 'LLB degree from a recognized university, meeting the age and marks criteria specified in the relevant year\'s SEBI notification.',
    pattern: {
      stages: ['Phase I (Objective — General + Legal)', 'Phase II (Descriptive Legal Paper + English)', 'Interview'],
      details: 'Phase I screens on general awareness, quantitative aptitude, English, and legal aptitude/knowledge. Phase II tests in-depth knowledge of securities and corporate law through descriptive answers plus an English writing component.'
    },
    keyDates: {
      notification: 'Typically released early in the calendar year',
      exam: 'SEBI-notified dates per recruitment cycle'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Legal Stream Paper',
        subjects: [
          {
            name: 'SEBI Act, 1992 & Regulations',
            topics: ['Powers and Functions of SEBI', 'SEBI (LODR) Regulations', 'SEBI (PIT) Regulations — Insider Trading', 'SEBI (SAST) Regulations — Takeovers'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Companies Act, 2013',
            topics: ['Incorporation and Corporate Governance', 'Directors\' Duties', 'Oppression and Mismanagement', 'Winding Up Provisions'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Securities Contracts (Regulation) Act & Depositories Act',
            topics: ['Recognition of Stock Exchanges', 'Dematerialisation of Securities', 'Role of Depositories and DPs'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'IBC 2016 & FEMA',
            topics: ['Corporate Insolvency Resolution Process (CIRP)', 'Liquidation', 'Foreign Investment Regulations under FEMA'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2022, state: 'All India', subject: 'Securities Law', question: 'Discuss the powers of SEBI under Sections 11 and 11B of the SEBI Act, 1992 to protect investor interests.', marks: 10 }
    ],
    importantCases: [],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'upsc-law-optional',
    slug: 'upsc-law-optional',
    name: 'UPSC Law Optional',
    fullName: 'Civil Services (Main) Examination — Law Optional Subject',
    description: 'An optional subject within the UPSC Civil Services Mains examination, chosen mainly by law graduates, covering constitutional/administrative law, international law, crimes, torts, and mercantile law across two descriptive papers.',
    eligibility: 'Must first qualify UPSC Civil Services Preliminary Examination; any graduate is eligible to select Law as an optional subject for Mains.',
    pattern: {
      stages: ['Prelims (General Studies + CSAT)', 'Mains (Optional Paper I & II, 250 marks each)', 'Interview'],
      details: 'Both optional papers are long-form descriptive/analytical answers, testing depth, contemporary awareness, and the ability to connect legal doctrine to governance and policy.'
    },
    keyDates: {
      notification: 'Usually February',
      exam: 'Prelims around June, Mains around September'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Law Optional Paper I',
        subjects: [
          {
            name: 'Constitutional and Administrative Law',
            topics: ['Preamble and Basic Structure', 'Fundamental Rights and DPSPs', 'Emergency Provisions', 'Delegated Legislation', 'Administrative Tribunals'],
            relatedActs: ['constitution-of-india'],
            relatedCases: ['kesavananda-bharati', 'maneka-gandhi']
          },
          {
            name: 'International Law',
            topics: ['Sources and Subjects of International Law', 'UN and its Organs', 'Law of the Sea', 'International Humanitarian and Human Rights Law'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      },
      {
        paper: 'Law Optional Paper II',
        subjects: [
          {
            name: 'Law of Crimes',
            topics: ['General Principles of Criminal Liability under IPC/BNS', 'Offences against the State, Body and Property'],
            relatedActs: ['indian-penal-code', 'bharatiya-nyaya-sanhita'],
            relatedCases: []
          },
          {
            name: 'Law of Torts and Consumer Protection',
            topics: ['General Principles of Tortious Liability', 'Strict and Absolute Liability', 'Consumer Protection Act'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Law of Contracts and Mercantile Law',
            topics: ['Formation and Discharge of Contracts', 'Sale of Goods Act', 'Negotiable Instruments Act', 'Arbitration and Conciliation Act'],
            relatedActs: ['indian-contract-act'],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2022, state: 'All India', subject: 'Constitutional Law', question: 'Critically examine the doctrine of Basic Structure and its evolution since Kesavananda Bharati.', marks: 20 }
    ],
    importantCases: ['kesavananda-bharati', 'maneka-gandhi'],
    lastUpdated: '2024-06-01'
  },
  {
    id: 'ibps-so-law',
    slug: 'ibps-so-law',
    name: 'IBPS SO Law',
    fullName: 'IBPS Specialist Officer — Law Officer',
    description: 'Recruitment examination conducted by IBPS for Law Officer posts in participating Public Sector Banks, testing knowledge of banking-related legislation alongside general and professional knowledge.',
    eligibility: 'LLB degree and enrollment as an advocate with a Bar Council, along with any prior experience requirement specified in the year\'s notification.',
    pattern: {
      stages: ['Online Preliminary Exam', 'Online Main Exam (Professional Knowledge)', 'Interview'],
      details: 'Prelims covers reasoning, English, and quantitative aptitude (qualifying in nature). Mains has a dedicated Professional Knowledge (Law) paper focused on banking, recovery, and commercial legislation.'
    },
    keyDates: {
      notification: 'Usually released towards the end of the calendar year',
      exam: 'IBPS-notified dates per cycle'
    },
    majorStates: ['All India'],
    syllabus: [
      {
        paper: 'Professional Knowledge — Law',
        subjects: [
          {
            name: 'Banking Regulation Act & RBI Act',
            topics: ['Licensing and Regulation of Banks', 'RBI Powers and Directions', 'NPA Classification'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'Negotiable Instruments Act, 1881',
            topics: ['Cheques and Dishonour (Section 138)', 'Promissory Notes and Bills of Exchange', 'Holder in Due Course'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'SARFAESI Act & RDDBFI Act',
            topics: ['Securitisation and Asset Reconstruction', 'DRT Procedure', 'Enforcement of Security Interest without Court Intervention'],
            relatedActs: [],
            relatedCases: []
          },
          {
            name: 'IBC 2016 & PMLA',
            topics: ['Corporate Insolvency Resolution Process', 'Role of NCLT', 'Money Laundering Offences and Attachment'],
            relatedActs: [],
            relatedCases: []
          }
        ]
      }
    ],
    pyq: [
      { year: 2022, state: 'All India', subject: 'Banking Law', question: 'Explain the procedure for enforcement of security interest under Section 13 of the SARFAESI Act, 2002.', marks: 5 }
    ],
    importantCases: [],
    lastUpdated: '2024-06-01'
  }
];
