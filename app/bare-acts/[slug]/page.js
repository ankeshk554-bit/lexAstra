import { bareActs } from '@/data/bareActs';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import BareActReaderClient from './BareActReaderClient';

export async function generateStaticParams() {
  return bareActs.map((act) => ({
    slug: act.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const act = bareActs.find((a) => a.slug === slug);
  if (!act) return { title: 'Act Not Found' };

  return {
    title: `${act.name} | LexAstra`,
    description: act.description,
  };
}

export default async function ActPage({ params }) {
  const { slug } = await params;
  const actMeta = bareActs.find((a) => a.slug === slug);

  if (!actMeta) {
    notFound();
  }

  // Load full statutory details from JSON file
  let act;
  try {
    const filePath = path.join(process.cwd(), 'data', 'bare-acts', `${slug}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    act = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading bare act data for ${slug}:`, error);
    notFound();
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)' }}>
        <BareActReaderClient key={act.id} act={act} />
      </div>
    </div>
  );
}
