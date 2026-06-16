'use client';

import { useState } from 'react';
import FilterTabs from '@/components/FilterTabs';

export default function CurrentAffairsClient({ articles }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Supreme Court', 'Parliament', 'New Legislation', 'Constitutional Developments', 'International Law'];

  const filteredArticles = articles.filter(
    (article) => activeCategory === 'All' || article.category === activeCategory
  );

  return (
    <div className="page-enter">
      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-4xl) var(--space-md)' }}>
        <div className="container text-center">
          <h1 className="hero__title" style={{ fontSize: 'var(--text-4xl)' }}>Legal Current Affairs</h1>
          <p className="hero__subtitle">Stay updated with the latest legal developments, summarized for exam preparation.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <FilterTabs tabs={categories} activeTab={activeCategory} onTabChange={setActiveCategory} />
          
          {filteredArticles.length === 0 ? (
            <div className="no-results">
              <div className="no-results__icon">📰</div>
              <h3>No articles found</h3>
              <p>Try selecting a different category.</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredArticles.map(article => (
                <article key={article.id} className="news-card">
                  <div className="news-card__date">{article.date}</div>
                  <h3 className="news-card__headline">{article.headline}</h3>
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <span className="card__tag" style={{ background: 'rgba(11, 31, 58, 0.08)', color: 'var(--navy)' }}>
                      {article.category}
                    </span>
                  </div>
                  <p className="news-card__summary">{article.summary}</p>
                  
                  {article.examTags && article.examTags.length > 0 && (
                    <div className="news-card__tags">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', alignSelf: 'center' }}>Relevant for:</span>
                      {article.examTags.map(tag => (
                        <span key={tag} className="card__tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="news-card__last-updated">
                    Last Updated: {article.lastUpdated}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
