"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { Search, ArrowRight } from "lucide-react";
export default function StudySearch({ items }) {
  const [query, setQuery] = useState("");
  const index = useMemo(
    () =>
      new Fuse(items, {
        keys: ["title", "keywords"],
        threshold: 0.35,
        ignoreFieldNorm: true,
      }),
    [items],
  );
  const results = query.trim()
    ? index
        .search(query.trim())
        .slice(0, 7)
        .map((r) => r.item)
    : [];
  return (
    <div className="study-search">
      <label htmlFor="study-search">Find your next study resource</label>
      <div className="study-search__field">
        <Search size={20} />
        <input
          id="study-search"
          type="search"
          placeholder="Search acts, cases or exams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      {query.trim() ? (
        <div className="study-search__results" aria-live="polite">
          {results.length ? (
            results.map((item) => (
              <Link href={item.href} key={item.href}>
                <span>
                  <small>{item.kind}</small>
                  {item.title}
                </span>
                <ArrowRight size={17} />
              </Link>
            ))
          ) : (
            <p>No resources found. Try an act name, citation or exam.</p>
          )}
        </div>
      ) : (
        <div className="study-search__suggestions">
          <span>Start with</span>
          {[
            ["/bare-acts/constitution-of-india", "Constitution"],
            ["/bare-acts/bharatiya-nyaya-sanhita", "BNS 2023"],
            ["/exams/judiciary", "Judiciary"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
