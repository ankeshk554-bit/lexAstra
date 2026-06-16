'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

export default function SearchBar({ data, keys, onResults, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: keys,
      threshold: 0.35,
      includeScore: true,
      includeMatches: true,
      ignoreFieldNorm: true,
    });
  }, [data, keys]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      const results = fuse.search(value);
      onResults(results.map((r) => r.item));
    } else {
      onResults(null); // null = show all
    }
  };

  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        className="search-bar__input"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        id="search-input"
      />
    </div>
  );
}
