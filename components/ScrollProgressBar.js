'use client';

import { useState, useEffect, useRef } from 'react';

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // Only update if scroll position changed significantly (reduces updates)
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;
      lastScrollY = currentScrollY;

      // Use requestAnimationFrame for smooth, non-blocking updates
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPosition = window.scrollY;
          const percentage = totalHeight > 0 ? (scrollPosition / totalHeight) * 100 : 0;
          setProgress(percentage);
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  );
}
