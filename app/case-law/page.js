import { caseLaw } from '@/data/caseLaw';
import CaseLawClient from './CaseLawClient';

export const metadata = {
  title: 'Case Law Repository',
  description: 'Browse comprehensive Indian case summaries, landmark judgments, and recent rulings.',
};

export default function CaseLawPage() {
  return <CaseLawClient cases={caseLaw} />;
}
