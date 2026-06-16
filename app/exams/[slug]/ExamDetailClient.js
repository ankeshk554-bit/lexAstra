'use client';

import { useState } from 'react';
import Link from 'next/link';
import FilterTabs from '@/components/FilterTabs';

export default function ExamDetailClient({ exam }) {
  // Extract unique subjects for PYQ filtering
  const allSubjects = ['All', ...new Set(exam.pyq.map(q => q.subject))];
  const [activeTab, setActiveTab] = useState('All');

  const filteredPyq = exam.pyq.filter(
    (q) => activeTab === 'All' || q.subject === activeTab
  );

  return (
    <>
      <div className="section-header" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
        <h2>Previous Year Questions</h2>
        <p>Practice with real questions from past examinations.</p>
      </div>

      <FilterTabs tabs={allSubjects} activeTab={activeTab} onTabChange={setActiveTab} />

      <div>
        {filteredPyq.length > 0 ? (
          filteredPyq.map((q, i) => (
            <div key={i} className="pyq-card">
              <div className="pyq-card__meta" style={{ marginBottom: '12px' }}>
                <span className="card__tag" style={{ background: 'rgba(11, 31, 58, 0.05)', color: 'var(--navy)' }}>{q.year}</span>
                <span className="card__tag" style={{ background: 'rgba(11, 31, 58, 0.05)', color: 'var(--navy)' }}>{q.state}</span>
                <span className="card__tag">{q.subject}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>{q.marks} Marks</span>
              </div>
              <p className="pyq-card__question">{q.question}</p>
              <div style={{ marginTop: '16px' }}>
                <Link href="/ai-assistant" className="btn btn--ghost btn--small">
                  ✦ Ask AI for Model Answer
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)' }}>No questions available for this subject.</p>
        )}
      </div>

      <hr className="gold-rule" />

      {exam.importantCases && exam.importantCases.length > 0 && (
        <>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
            <h2>Important Case Laws</h2>
            <p>Must-read cases frequently tested in this exam.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
            {exam.importantCases.map((caseSlug) => (
              <Link 
                key={caseSlug} 
                href="/case-law" 
                className="card" 
                style={{ padding: 'var(--space-md)', flex: '1 1 300px', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ fontSize: '20px' }}>⚖️</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '600', color: 'var(--navy)' }}>
                    {caseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
