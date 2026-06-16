'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import FilterTabs from '@/components/FilterTabs';

export default function BareActsClient({ acts }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchResults, setSearchResults] = useState(null);

  const tabs = ['All', 'Constitutional', 'Criminal', 'Civil', 'Commercial', 'Labour', 'Family', 'Special Laws'];

  const filteredActs = (searchResults || acts).filter(
    (act) => activeTab === 'All' || act.category === activeTab
  );

  return (
    <div className="page-enter">
      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-4xl) var(--space-md)' }}>
        <div className="container text-center">
          <h1 className="hero__title" style={{ fontSize: 'var(--text-4xl)' }}>India&apos;s Complete Bare Acts Repository</h1>
          <p className="hero__subtitle">Search across 500+ updated legislations with chapter and section-level navigation.</p>
          
          <SearchBar 
            data={acts} 
            keys={[
              { name: 'name', weight: 2 },
              { name: 'description', weight: 1 },
              { name: 'category', weight: 0.5 }
            ]}
            onResults={setSearchResults}
            placeholder="Search by act name, category, or keyword..."
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <FilterTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          
          {filteredActs.length === 0 ? (
            <div className="no-results">
              <div className="no-results__icon">🔍</div>
              <h3>No acts found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredActs.map(act => (
                <div key={act.id} className="card">
                  <div className="act-card__header">
                    <h3 className="card__title">{act.name}</h3>
                    <span className="act-card__year">{act.year}</span>
                  </div>
                  {act.isNew && (
                    <span className="act-card__new-badge" style={{ marginBottom: '8px' }}>NEW</span>
                  )}
                  {act.transitionNote && (
                    <p style={{ fontSize: '12px', color: 'var(--alert-red)', fontStyle: 'italic', marginBottom: '8px' }}>
                      {act.transitionNote}
                    </p>
                  )}
                  <div>
                    <span className="card__tag">{act.category}</span>
                    <div className="act-card__sections">{act.sectionCount} Sections</div>
                  </div>
                  <p className="card__description" style={{ marginTop: '12px' }}>
                    {act.description.length > 120 ? act.description.substring(0, 120) + '...' : act.description}
                  </p>
                  <div className="act-card__actions">
                    <Link href={`/bare-acts/${act.slug}`} className="btn btn--primary btn--small">
                      Read Act
                    </Link>
                    <Link href="/ai-assistant" className="btn btn--ghost btn--small">
                      Ask AI
                    </Link>
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
