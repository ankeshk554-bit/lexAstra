'use client';

export default function FilterTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter categories">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`filter-tab ${activeTab === tab ? 'filter-tab--active' : ''}`}
          onClick={() => onTabChange(tab)}
          role="tab"
          aria-selected={activeTab === tab}
          id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
