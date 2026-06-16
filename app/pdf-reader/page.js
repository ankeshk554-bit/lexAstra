'use client';

import dynamic from 'next/dynamic';

const PDFReaderClient = dynamic(
  () => import('./PDFReaderClient'),
  { ssr: false }
);

export default function PDFReaderPage() {
  return <PDFReaderClient />;
}
