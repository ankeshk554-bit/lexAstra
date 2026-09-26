'use client';

import { memo } from 'react';

// Memoized items array to prevent re-creation on every render
const ITEMS = Object.freeze([
  'Judiciary Exams',
  'APO',
  'CLAT UG',
  'CLAT PG',
  'CUET UG',
  'CUET PG',
  'Bare Acts',
  'Case Law',
  'Moot Problems',
  'Legal Drafting',
  'BNS 2023',
  'BNSS 2023',
  'BSA 2023',
  'Constitution',
  'Criminal Law',
  'Civil Law',
]);

// Memoized individual marquee item
const MarqueeItem = memo(({ item, index }) => (
  <span key={index} className="marquee__item">
    {item}
  </span>
));

MarqueeItem.displayName = 'MarqueeItem';

export default function Marquee() {
  // Duplicate for seamless loop - computed once
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="marquee" aria-label="Covered topics" role="marquee">
      <div className="marquee__track">
        {track.map((item, i) => (
          <MarqueeItem key={i} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
