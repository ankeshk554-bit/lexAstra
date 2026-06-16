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
      { year: 2022, state: 'UP', subject: 'Criminal Procedure', question: 'What are the powers of a police officer to arrest without a warrant under CrPC?', marks: 10 },
      { year: 2021, state: 'Rajasthan', subject: 'Evidence', question: 'Discuss the evidentiary value of a confession made to a police officer.', marks: 10 }
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
  }
];
