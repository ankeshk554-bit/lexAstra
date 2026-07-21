'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

// Memoized stats data to prevent re-creation on every render
const STATS_DATA = Object.freeze([
  { number: 500, suffix: '+', label: 'Bare Acts' },
  { number: 10000, suffix: '+', label: 'Case Summaries' },
  { number: 6, suffix: '', label: 'Major Exams Covered' },
  { number: 52, suffix: '/yr', label: 'Weekly Updates' },
]);

// Optimized CountUpNumber with useCallback and reduced re-renders
function CountUpNumber({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const countRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Single observer effect with cleanup
  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.disconnect(); // Disconnect once triggered
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Optimized animation with cancelAnimationFrame for cleanup
  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    // Cleanup animation frame on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasStarted, end, duration]);

  return (
    <span ref={countRef} className="stat__number">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Memoized component to prevent unnecessary re-renders
export default function CountUpStats() {
  return (
    <section className="section" aria-label="Platform statistics">
      <div className="container">
        <div className="stats-bar">
          {STATS_DATA.map((stat, i) => (
            <div key={i} className="stat">
              <CountUpNumber end={stat.number} suffix={stat.suffix} />
              <span className="stat__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
