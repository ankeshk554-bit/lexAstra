'use client';

import dynamic from 'next/dynamic';

const AIAssistantClient = dynamic(
  () => import('./AIAssistantClient'),
  { ssr: false }
);

export default function AIAssistantPage() {
  return <AIAssistantClient />;
}
