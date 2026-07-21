'use client';

import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

export default function SearchBar({ data, keys, onResults, placeholder = 'Search...' }) {
  const [query, setQuery] = useState('');

  // Memoize Fuse instance to prevent re-creation on every render
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: keys,
      threshold: 0.35,
      includeScore: true,
      includeMatches: true,
      ignoreFieldNorm: true,
      minMatchCharLength: 2, // Optimize: don't search for single characters
    });
  }, [data, keys]);

  // Memoize change handler to prevent unnecessary re-renders
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      const results = fuse.search(value);
      onResults(results.map((r) => r.item));
    } else {
      onResults(null); // null = show all
    }
  }, [fuse, onResults]);

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
