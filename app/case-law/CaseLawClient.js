'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import FilterTabs from '@/components/FilterTabs';

export default function CaseLawClient({ cases }) {
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeCourt, setActiveCourt] = useState('All Courts');
  const [showOnlyLandmarks, setShowOnlyLandmarks] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const subjects = ['All', 'Constitutional', 'Criminal', 'Civil', 'Labour', 'IPR', 'Environmental', 'Family', 'Commercial'];
  const courts = ['All Courts', 'Supreme Court', 'High Court', 'Tribunal'];

  const filteredCases = (searchResults || cases).filter((c) => {
    const matchSubject = activeSubject === 'All' || c.subject === activeSubject;
    const matchCourt = activeCourt === 'All Courts' || c.court === activeCourt;
    const matchLandmark = showOnlyLandmarks ? c.isLandmark : true;
    return matchSubject && matchCourt && matchLandmark;
  });

  return (
    <div className="page-enter">
      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-4xl) var(--space-md)' }}>
        <div className="container text-center">
          <h1 className="hero__title" style={{ fontSize: 'var(--text-4xl)' }}>India&apos;s Case Law Repository</h1>
          <p className="hero__subtitle">Find accurate summaries and ratios for thousands of Indian court judgments.</p>
          
          <SearchBar 
            data={cases} 
            keys={[
              { name: 'name', weight: 2 },
              { name: 'citation', weight: 1.5 },
              { name: 'ratio', weight: 1 },
              { name: 'subject', weight: 0.5 }
            ]}
            onResults={setSearchResults}
            placeholder="Search by case name, citation, or legal concept..."
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <FilterTabs tabs={subjects} activeTab={activeSubject} onTabChange={setActiveSubject} />
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select 
              value={activeCourt} 
              onChange={(e) => setActiveCourt(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', fontFamily: 'var(--font-ui)' }}
            >
              {courts.map(court => <option key={court} value={court}>{court}</option>)}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>
              <input 
                type="checkbox" 
                checked={showOnlyLandmarks} 
                onChange={(e) => setShowOnlyLandmarks(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
              />
              Landmark Cases Only
            </label>
          </div>
          
          {filteredCases.length === 0 ? (
            <div className="no-results">
              <div className="no-results__icon">⚖️</div>
              <h3>No cases found</h3>
              <p>Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredCases.map(c => (
                <div key={c.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                    <span className="card__tag">{c.subject}</span>
                    {c.isLandmark && <span style={{ color: 'var(--gold)', fontSize: '18px' }} title="Landmark Judgment">⭐</span>}
                  </div>
                  
                  <h3 className="card__title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{c.name}</h3>
                  <div className="section-number" style={{ marginBottom: '8px' }}>{c.citation}</div>
                  
                  <div className="card__meta" style={{ marginBottom: '16px' }}>
                    {c.court} • {c.year}
                  </div>
                  
                  <div style={{ backgroundColor: 'rgba(201, 168, 76, 0.05)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--gold)', marginBottom: '16px' }}>
                    <strong style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold-dark)', display: 'block', marginBottom: '4px' }}>Ratio Decidendi</strong>
                    <p style={{ margin: 0, fontSize: '14px' }}>{c.ratio}</p>
                  </div>

                  <p className="card__description">
                    {c.summary.length > 150 ? c.summary.substring(0, 150) + '...' : c.summary}
                  </p>
                  
                  <div style={{ marginTop: '16px' }}>
                    <button className="btn btn--primary btn--small">
                      Read Full Summary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
