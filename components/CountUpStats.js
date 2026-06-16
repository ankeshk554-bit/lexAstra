'use client';

import { useEffect, useRef, useState } from 'react';

function CountUpNumber({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [hasStarted, end, duration]);

  return (
    <span ref={ref} className="stat__number">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { number: 500, suffix: '+', label: 'Bare Acts' },
  { number: 10000, suffix: '+', label: 'Case Summaries' },
  { number: 6, suffix: '', label: 'Major Exams Covered' },
  { number: 52, suffix: '/yr', label: 'Weekly Updates' },
];

export default function CountUpStats() {
  return (
    <section className="section" aria-label="Platform statistics">
      <div className="container">
        <div className="stats-bar">
          {stats.map((stat, i) => (
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
