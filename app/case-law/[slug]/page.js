import Link from "next/link";
import { notFound } from "next/navigation";
import { caseLaw } from "@/data/caseLaw";
export function generateStaticParams() {
  return caseLaw.map((c) => ({ slug: c.id }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = caseLaw.find((c) => c.id === slug);
  return { title: c?.name || "Case not found" };
}
export default async function CasePage({ params }) {
  const { slug } = await params;
  const c = caseLaw.find((c) => c.id === slug);
  if (!c) notFound();
  return (
    <article className="container case-detail section">
      <Link href="/case-law" className="back-link">
        ← All case summaries
      </Link>
      <p className="eyebrow">
        {c.subject} / {c.court} / {c.year}
      </p>
      <h1>{c.name}</h1>
      <p className="case-citation">{c.citation}</p>
      <div className="case-holding">
        <span className="eyebrow">THE HOLDING</span>
        <p>{c.ratio}</p>
      </div>
      <h2>Case summary</h2>
      <p className="case-detail__summary">{c.summary}</p>
      <dl className="case-facts">
        <div>
          <dt>Bench</dt>
          <dd>{c.judges}</dd>
        </div>
        <div>
          <dt>Related provisions</dt>
          <dd>{c.relatedSections.join(" · ")}</dd>
        </div>
        <div>
          <dt>Exam relevance</dt>
          <dd>{c.examRelevance.join(" · ")}</dd>
        </div>
      </dl>
      <h2>Read the related law</h2>
      <div className="study-code-links">
        {c.relatedActs.map((slug) => (
          <Link key={slug} href={`/bare-acts/${slug}`}>
            {slug.replaceAll("-", " ")} →
          </Link>
        ))}
      </div>
      <div className="case-detail__actions">
        <Link
          className="btn btn--primary"
          href={`/ai-assistant?prompt=${encodeURIComponent(`Explain the holding and exam relevance of ${c.name} (${c.citation}).`)}`}
        >
          Discuss with AI
        </Link>
        <p>
          Study summary, not the full judgment. Verify quotations and citations
          against the official judgment.
        </p>
      </div>
    </article>
  );
}
