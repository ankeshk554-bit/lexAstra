# LexAstra Quick Wins Implementation Plan
## Priority Features to Implement First (2-4 weeks)

---

## 🎯 PRIORITY 1: Add Related Cases to Bare Acts Pages

### Files to Modify:
- `/workspace/app/bare-acts/[slug]/BareActReaderClient.js`
- `/workspace/app/bare-acts/[slug]/page.js`

### Implementation Steps:

#### Step 1: Create Related Cases Component

```javascript
// /workspace/components/RelatedCases.js
'use client';

import Link from 'next/link';

export default function RelatedCases({ cases, actId, sectionNumber }) {
  if (!cases || cases.length === 0) return null;

  const landmarkCases = cases.filter(c => c.isLandmark);
  const regularCases = cases.filter(c => !c.isLandmark);

  return (
    <div className="related-cases-container" style={{ 
      marginTop: 'var(--space-xl)', 
      padding: 'var(--space-lg)',
      backgroundColor: 'rgba(201, 168, 76, 0.05)',
      borderRadius: 'var(--radius-md)',
      borderLeft: '4px solid var(--gold)'
    }}>
      <h3 style={{ 
        fontFamily: 'var(--font-heading)', 
        color: 'var(--navy)',
        marginBottom: 'var(--space-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ⚖️ Related Case Laws
        {sectionNumber && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal' }}>
          for {sectionNumber}
        </span>}
      </h3>

      {landmarkCases.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h4 style={{ 
            fontSize: 'var(--text-sm)', 
            textTransform: 'uppercase', 
            color: 'var(--gold-dark)',
            marginBottom: 'var(--space-sm)',
            letterSpacing: '0.5px'
          }}>
            ⭐ Landmark Judgments
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {landmarkCases.map(caseLaw => (
              <Link 
                key={caseLaw.id} 
                href={`/case-law?case=${caseLaw.id}`}
                className="case-card"
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ 
                      fontFamily: 'var(--font-heading)', 
                      color: 'var(--navy)',
                      margin: '0 0 4px 0',
                      fontSize: 'var(--text-base)'
                    }}>
                      {caseLaw.name}
                    </h5>
                    <p style={{ 
                      margin: '0 0 4px 0',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)'
                    }}>
                      {caseLaw.citation}
                    </p>
                    <p style={{ 
                      margin: 0,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)'
                    }}>
                      <strong>Ratio:</strong> {caseLaw.ratio}
                    </p>
                  </div>
                  <span style={{ color: 'var(--gold)', fontSize: '20px' }}>⭐</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {regularCases.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: 'var(--text-sm)', 
            textTransform: 'uppercase', 
            color: 'var(--gold-dark)',
            marginBottom: 'var(--space-sm)',
            letterSpacing: '0.5px'
          }}>
            Other Relevant Cases
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {regularCases.map(caseLaw => (
              <Link 
                key={caseLaw.id} 
                href={`/case-law?case=${caseLaw.id}`}
                className="case-card"
                style={{
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h5 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  color: 'var(--navy)',
                  margin: '0 0 4px 0',
                  fontSize: 'var(--text-base)'
                }}>
                  {caseLaw.name}
                </h5>
                <p style={{ 
                  margin: '0 0 4px 0',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  {caseLaw.citation} • {caseLaw.year}
                </p>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)'
                }}>
                  {caseLaw.ratio}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Step 2: Modify BareActReaderClient.js to Show Related Cases

Add this logic after loading the act data:

```javascript
// Import the new component
import RelatedCases from '@/components/RelatedCases';

// Inside BareActReaderClient component, after getting act data:
const relatedCases = useMemo(() => {
  if (!act || !act.chapters) return [];
  
  // Import caseLaw data
  import('@/data/caseLaw').then(({ caseLaw }) => {
    const currentSectionNumber = /* get current section number */;
    
    return caseLaw.filter(c => {
      // Filter by related acts
      const isRelatedToAct = c.relatedActs?.includes(actId);
      
      // Filter by specific section if viewing one
      const isRelatedToSection = currentSectionNumber 
        ? c.relatedSections?.some(rs => rs.includes(currentSectionNumber))
        : true;
      
      return isRelatedToAct && isRelatedToSection;
    });
  });
}, [act, selectedChapter]);

// In the JSX, after rendering section content:
{selectedSection && (
  <RelatedCases 
    cases={relatedCases} 
    actId={act.id} 
    sectionNumber={selectedSection.number}
  />
)}
```

---

## 🎯 PRIORITY 2: Create Exam Resource Collections

### New File: `/workspace/app/exam-resources/page.js`

```javascript
'use client';

import Link from 'next/link';
import { caseLaw } from '@/data/caseLaw';
import { exams } from '@/data/exams';

const resourceCollections = {
  judiciary: {
    name: 'Judiciary Services',
    icon: '⚖️',
    topCases: ['kesavananda-bharati', 'maneka-gandhi', 'dk-basu-v-state-of-west-bengal', 'lalita-kumari-v-govt-of-up'],
    mustKnowSections: {
      'Constitution': ['Article 14', 'Article 19', 'Article 21', 'Article 32', 'Article 226'],
      'IPC/BNS': ['Section 299-304 IPC (103-108 BNS)', 'Section 300 IPC', 'Section 34 IPC (3(5) BNS)'],
      'CrPC/BNSS': ['Section 154 CrPC (FIR)', 'Section 437-439 CrPC (Bail)', 'Section 161-162 CrPC'],
      'Evidence/BSA': ['Section 25-27 Evidence Act', 'Section 32 Evidence Act (Dying Declaration)', 'Section 101-114 Evidence Act']
    },
    importantArticles: ['Article 14', 'Article 19', 'Article 21', 'Article 32', 'Article 136', 'Article 226', 'Article 227']
  },
  'clat-pg': {
    name: 'CLAT PG',
    icon: '🎓',
    topCases: ['kesavananda-bharati', 'maneka-gandhi', 'ks-puttaswamy-v-union-of-india', 'navtej-singh-johar', 'shreya-singhal'],
    focusAreas: ['Constitutional Law', 'Jurisprudence', 'Administrative Law', 'Contract Law'],
    recentDevelopments: true
  },
  'clat-ug': {
    name: 'CLAT UG',
    icon: '📚',
    topCases: ['kesavananda-bharati', 'maneka-gandhi', 'vishaka-v-state-of-rajasthan', 'm.c.-mehta-v-union-of-india'],
    focusAreas: ['Legal Reasoning', 'Constitutional Law', 'Contract Law', 'Tort Law'],
    beginnerFriendly: true
  },
  apo: {
    name: 'APO Exam',
    icon: '👨‍⚖️',
    topCases: ['dk-basu-v-state-of-west-bengal', 'lalita-kumari-v-govt-of-up', 'pakala-narayana-swami-v-emperor'],
    mustKnowSections: {
      'IPC/BNS': ['Section 34 IPC', 'Section 103-108 BNS', 'Section 300-304 IPC'],
      'CrPC/BNSS': ['Complete Bail Provisions', 'Investigation Procedures', 'Trial Procedures'],
      'Evidence/BSA': ['Confessions', 'Dying Declaration', 'Discovery Statements (Sec 27 Evidence/23 BSA)']
    }
  }
};

export default function ExamResourcesPage() {
  return (
    <div className="page-enter">
      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-4xl) var(--space-md)' }}>
        <div className="container text-center">
          <h1 className="hero__title">Exam-Specific Resource Collections</h1>
          <p className="hero__subtitle">Curated lists of must-know cases, sections, and articles for each exam</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {Object.entries(resourceCollections).map(([examSlug, collection]) => (
            <div key={examSlug} style={{ 
              marginBottom: 'var(--space-3xl)',
              padding: 'var(--space-xl)',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)'
              }}>
                <span style={{ fontSize: '48px' }}>{collection.icon}</span>
                <div>
                  <h2 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    color: 'var(--navy)',
                    margin: 0
                  }}>
                    {collection.name}
                  </h2>
                  <Link 
                    href={`/exams/${examSlug}`}
                    style={{ 
                      color: 'var(--gold)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    View Full Exam Details →
                  </Link>
                </div>
              </div>

              {/* Top Cases Section */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  color: 'var(--navy)',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⭐ Top Landmark Cases
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)' }}>
                  {collection.topCases.map(caseId => {
                    const caseData = caseLaw.find(c => c.id === caseId);
                    if (!caseData) return null;
                    
                    return (
                      <Link 
                        key={caseId}
                        href={`/case-law?case=${caseId}`}
                        style={{
                          padding: 'var(--space-md)',
                          backgroundColor: 'rgba(201, 168, 76, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none',
                          border: '1px solid var(--gold)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <h4 style={{ 
                          fontFamily: 'var(--font-heading)', 
                          color: 'var(--navy)',
                          margin: '0 0 4px 0',
                          fontSize: 'var(--text-base)'
                        }}>
                          {caseData.name}
                        </h4>
                        <p style={{ 
                          margin: 0,
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)'
                        }}>
                          {caseData.citation}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Must-Know Sections */}
              {collection.mustKnowSections && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                  <h3 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    color: 'var(--navy)',
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📜 Must-Know Sections
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                    {Object.entries(collection.mustKnowSections).map(([subject, sections]) => (
                      <div 
                        key={subject}
                        style={{
                          padding: 'var(--space-md)',
                          backgroundColor: 'rgba(11, 31, 58, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <h4 style={{ 
                          fontFamily: 'var(--font-heading)', 
                          color: 'var(--navy)',
                          margin: '0 0 var(--space-sm) 0',
                          fontSize: 'var(--text-base)'
                        }}>
                          {subject}
                        </h4>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: 'var(--space-md)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-primary)'
                        }}>
                          {sections.map((section, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>
                              <Link 
                                href={`/bare-acts`}
                                style={{ color: 'var(--gold)', textDecoration: 'none' }}
                              >
                                {section}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Articles for Constitution-focused exams */}
              {collection.importantArticles && (
                <div>
                  <h3 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    color: 'var(--navy)',
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📋 Important Constitutional Articles
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 'var(--space-sm)' 
                  }}>
                    {collection.importantArticles.map(article => (
                      <Link
                        key={article}
                        href={`/bare-acts/constitution-of-india?article=${article}`}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--gold)',
                          color: 'white',
                          borderRadius: 'var(--radius-full)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {article}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## 🎯 PRIORITY 3: Basic MCQ Quiz Component

### New File: `/workspace/components/MCQQuiz.js`

```javascript
'use client';

import { useState } from 'react';

const sampleQuestions = {
  judiciary: [
    {
      id: 1,
      question: "Which of the following cases established the 'Basic Structure Doctrine'?",
      options: [
        "Golak Nath v. State of Punjab",
        "Kesavananda Bharati v. State of Kerala",
        "Minerva Mills v. Union of India",
        "I.R. Coelho v. State of Tamil Nadu"
      ],
      correctAnswer: 1,
      explanation: "Kesavananda Bharati v. State of Kerala (1973) was a landmark decision where a 13-judge bench held that Parliament cannot alter the basic structure of the Constitution while exercising its amending power under Article 368.",
      topic: "Constitutional Law",
      difficulty: "Medium"
    },
    {
      id: 2,
      question: "Under Section 300 IPC, culpable homicide amounts to murder if:",
      options: [
        "The act is done with the intention of causing death",
        "The act is done with the intention of causing such bodily injury as the offender knows to be likely to cause death",
        "The act is done with the intention of causing bodily injury which is sufficient in ordinary course of nature to cause death",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "Section 300 IPC defines murder. All the given conditions are covered under clauses (1), (2), and (3) of Section 300, making culpable homicide amount to murder.",
      topic: "Criminal Law",
      difficulty: "Hard"
    },
    {
      id: 3,
      question: "The doctrine of Res Judicata is embodied in which section of CPC?",
      options: [
        "Section 10",
        "Section 11",
        "Section 12",
        "Section 13"
      ],
      correctAnswer: 1,
      explanation: "Section 11 of CPC deals with Res Judicata. It prevents the same parties from litigating the same issue again once it has been finally decided by a competent court.",
      topic: "Civil Procedure Code",
      difficulty: "Easy"
    }
  ],
  'clat-pg': [
    {
      id: 1,
      question: "In K.S. Puttaswamy v. Union of India, the Supreme Court declared Right to Privacy as a fundamental right under:",
      options: [
        "Article 14",
        "Article 19",
        "Article 21",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "The nine-judge bench unanimously held that Right to Privacy is an intrinsic part of Article 21 (Right to Life and Personal Liberty) and also forms part of the freedoms guaranteed under Articles 14 and 19.",
      topic: "Constitutional Law",
      difficulty: "Medium"
    }
  ]
};

export default function MCQQuiz({ examSlug = 'judiciary', topic = 'all' }) {
  const questions = sampleQuestions[examSlug] || sampleQuestions.judiciary;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (optionIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswered([...answered, {
      questionId: questions[currentQuestion].id,
      selected: selectedAnswer,
      correct: questions[currentQuestion].correctAnswer,
      isCorrect
    }]);
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswered([]);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    
    return (
      <div style={{
        padding: 'var(--space-xl)',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          color: 'var(--navy)',
          marginBottom: 'var(--space-md)'
        }}>
          Quiz Completed! 🎉
        </h2>
        
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: percentage >= 70 ? 'var(--success)' : 'var(--warning)',
          marginBottom: 'var(--space-md)'
        }}>
          {score}/{questions.length} ({percentage}%)
        </div>
        
        <p style={{ 
          marginBottom: 'var(--space-lg)',
          color: 'var(--text-secondary)'
        }}>
          {percentage >= 80 ? "Excellent! You've mastered this topic." :
           percentage >= 60 ? "Good job! Keep practicing to improve." :
           "Keep studying! Practice makes perfect."}
        </p>
        
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
          <button 
            onClick={restartQuiz}
            className="btn btn--primary"
          >
            🔄 Retry Quiz
          </button>
          <button 
            className="btn btn--gold"
          >
            📊 View Detailed Analysis
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div style={{
      padding: 'var(--space-xl)',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Progress Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-lg)'
      }}>
        <span style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--text-secondary)' 
        }}>
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <span style={{ 
          fontSize: 'var(--text-sm)', 
          color: 'var(--gold)',
          fontWeight: '600'
        }}>
          Score: {score}
        </span>
      </div>
      
      <div style={{
        height: '4px',
        backgroundColor: 'var(--border-subtle)',
        borderRadius: '2px',
        marginBottom: 'var(--space-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          backgroundColor: 'var(--gold)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question Card */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-md)'
        }}>
          <span style={{
            padding: '4px 12px',
            backgroundColor: 'rgba(201, 168, 76, 0.1)',
            color: 'var(--gold-dark)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: '600'
          }}>
            {question.topic}
          </span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: question.difficulty === 'Easy' ? 'rgba(76, 175, 80, 0.1)' :
                             question.difficulty === 'Medium' ? 'rgba(255, 152, 0, 0.1)' :
                             'rgba(244, 67, 54, 0.1)',
            color: question.difficulty === 'Easy' ? 'var(--success)' :
                   question.difficulty === 'Medium' ? 'var(--warning)' :
                   'var(--error)',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)',
            fontWeight: '600'
          }}>
            {question.difficulty}
          </span>
        </div>
        
        <h3 style={{ 
          fontFamily: 'var(--font-heading)', 
          color: 'var(--navy)',
          fontSize: 'var(--text-lg)',
          lineHeight: '1.6',
          marginBottom: 'var(--space-lg)'
        }}>
          {question.question}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {question.options.map((option, index) => {
            let optionStyle = {
              padding: 'var(--space-md)',
              border: '2px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: showExplanation ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'var(--bg-card)'
            };

            if (showExplanation) {
              if (index === question.correctAnswer) {
                optionStyle = {
                  ...optionStyle,
                  borderColor: 'var(--success)',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)'
                };
              } else if (index === selectedAnswer && index !== question.correctAnswer) {
                optionStyle = {
                  ...optionStyle,
                  borderColor: 'var(--error)',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)'
                };
              }
            } else if (selectedAnswer === index) {
              optionStyle = {
                ...optionStyle,
                borderColor: 'var(--gold)',
                backgroundColor: 'rgba(201, 168, 76, 0.1)'
              };
            }

            return (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                style={optionStyle}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: selectedAnswer === index ? 'var(--gold)' : 'var(--border-subtle)',
                    color: selectedAnswer === index ? 'white' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={{ 
                    fontSize: 'var(--text-base)',
                    color: 'var(--text-primary)'
                  }}>
                    {option}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div style={{
          padding: 'var(--space-lg)',
          backgroundColor: selectedAnswer === question.correctAnswer 
            ? 'rgba(76, 175, 80, 0.05)' 
            : 'rgba(201, 168, 76, 0.05)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid selectedAnswer === question.correctAnswer ? var(--success) : var(--gold)',
          marginBottom: 'var(--space-lg)'
        }}>
          <h4 style={{ 
            fontFamily: 'var(--font-heading)', 
            color: 'var(--navy)',
            marginBottom: 'var(--space-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {selectedAnswer === question.correctAnswer ? '✅ Correct!' : '💡 Learn More'}
          </h4>
          <p style={{ 
            fontSize: 'var(--text-base)',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
        {!showExplanation ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="btn btn--primary"
            style={{ opacity: selectedAnswer === null ? 0.5 : 1 }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="btn btn--gold"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question →' : 'View Results'}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1:
- [ ] Create RelatedCases component
- [ ] Integrate related cases into BareActReaderClient
- [ ] Test with multiple acts and sections
- [ ] Add CSS styling for case cards

### Week 2:
- [ ] Create Exam Resources page
- [ ] Populate collections for all major exams
- [ ] Add navigation link from homepage
- [ ] Create shareable URLs for each collection

### Week 3:
- [ ] Build MCQ Quiz component
- [ ] Create question bank (start with 100 questions per exam)
- [ ] Add quiz to exam detail pages
- [ ] Implement score tracking in localStorage

### Week 4:
- [ ] Polish UI/UX based on user feedback
- [ ] Add performance analytics dashboard
- [ ] Implement search filters
- [ ] Documentation and testing

---

## 🎨 CSS ADDITIONS (globals.css)

```css
/* Related Cases Component Styles */
.case-card {
  transition: all 0.2s ease;
}

.case-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Quiz Component Styles */
.quiz-option {
  user-select: none;
}

.quiz-option:hover:not(.disabled) {
  border-color: var(--gold);
  background-color: rgba(201, 168, 76, 0.05);
}

/* Resource Collection Tags */
.resource-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

This implementation plan provides concrete, actionable steps to transform LexAstra from a passive reference library into an active learning platform. Each feature can be implemented independently and provides immediate value to users.
