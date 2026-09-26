'use client';

import { useCallback, memo } from 'react';

// Memoized individual tab button to prevent re-renders
const FilterTab = memo(({ tab, activeTab, onTabChange }) => {
  const handleClick = useCallback(() => {
    onTabChange(tab);
  }, [tab, onTabChange]);

  const isActive = activeTab === tab;

  return (
    <button
      className={`filter-tab ${isActive ? 'filter-tab--active' : ''}`}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {tab}
    </button>
  );
});

FilterTab.displayName = 'FilterTab';

export default function FilterTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter categories">
      {tabs.map((tab) => (
        <FilterTab
          key={tab}
          tab={tab}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}
