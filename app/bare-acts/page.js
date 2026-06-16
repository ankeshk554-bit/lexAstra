import { bareActs } from '@/data/bareActs';
import BareActsClient from './BareActsClient';

export const metadata = {
  title: 'Bare Acts Library',
  description: 'India\'s most comprehensive and accurate Bare Acts repository, including BNS, BNSS, and BSA.',
};

export default function BareActsPage() {
  return <BareActsClient acts={bareActs} />;
}
