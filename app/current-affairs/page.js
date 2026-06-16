import { currentAffairs } from '@/data/currentAffairs';
import CurrentAffairsClient from './CurrentAffairsClient';

export const metadata = {
  title: 'Legal Current Affairs',
  description: 'Weekly updates on Supreme Court judgments, new legislation, and constitutional developments for law students.',
};

export default function CurrentAffairsPage() {
  return <CurrentAffairsClient articles={currentAffairs} />;
}
