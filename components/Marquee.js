'use client';

export default function Marquee() {
  const items = [
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
  ];

  // Duplicate for seamless loop
  const track = [...items, ...items];

  return (
    <div className="marquee" aria-label="Covered topics" role="marquee">
      <div className="marquee__track">
        {track.map((item, i) => (
          <span key={i} className="marquee__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
