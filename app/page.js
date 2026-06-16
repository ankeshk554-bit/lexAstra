'use client';

import Image from 'next/image';
import Link from 'next/link';
import Marquee from '@/components/Marquee';
import CountUpStats from '@/components/CountUpStats';

const features = [
  {
    icon: '📚',
    title: 'Bare Acts Library',
    description: 'Access 500+ bare acts including the new BNS 2023, BNSS 2023, and BSA 2023 with section-by-section navigation.',
  },
  {
    icon: '⚖️',
    title: 'Case Law Repository',
    description: '10,000+ case summaries with accurate AIR/SCC citations, ratio decidendi, and exam relevance tags.',
  },
  {
    icon: '🎯',
    title: 'Exam Prep Hub',
    description: 'Complete preparation for Judiciary, CLAT, CUET, and APO exams with syllabuses, PYQs, and strategy.',
  },
  {
    icon: '🤖',
    title: 'AI Legal Assistant',
    description: 'Get instant answers to legal questions powered by advanced AI, trained specifically for Indian law.',
  },
  {
    icon: '📝',
    title: 'Syllabus Tracker',
    description: 'Track your exam preparation progress with subject-wise syllabus breakdowns and recommended resources.',
  },
  {
    icon: '📰',
    title: 'Legal Current Affairs',
    description: 'Weekly updates on Supreme Court judgments, new legislation, and constitutional developments.',
  },
];

const examTiles = [
  {
    slug: 'judiciary',
    name: 'Judiciary Exam',
    description: 'Civil Judge / Judicial Magistrate',
    stats: { seats: '~2000/yr', difficulty: 'Very High', subjects: 'Civil + Criminal + Constitutional' },
  },
  {
    slug: 'apo',
    name: 'APO',
    description: 'Assistant Public Prosecutor',
    stats: { seats: 'Varies by state', difficulty: 'High', subjects: 'Criminal Law + Procedure' },
  },
  {
    slug: 'clat-ug',
    name: 'CLAT UG',
    description: 'Common Law Admission Test — Undergraduate',
    stats: { seats: '~3000+', difficulty: 'Moderate', subjects: 'English + GK + Legal Reasoning + Quantitative' },
  },
  {
    slug: 'clat-pg',
    name: 'CLAT PG',
    description: 'Common Law Admission Test — Postgraduate (LLM)',
    stats: { seats: '~800+', difficulty: 'High', subjects: 'Constitutional + Jurisprudence + All Core Law' },
  },
  {
    slug: 'cuet-ug',
    name: 'CUET UG',
    description: 'For Law Undergraduate Admissions',
    stats: { seats: 'University-wise', difficulty: 'Moderate', subjects: 'Domain + General Test + Language' },
  },
  {
    slug: 'cuet-pg',
    name: 'CUET PG',
    description: 'For LLM Admissions via CUET',
    stats: { seats: 'University-wise', difficulty: 'Moderate-High', subjects: 'Law Domain Knowledge' },
  },
];

const trendingCases = [
  {
    name: 'State of Punjab v. Davinder Singh',
    citation: '2024 SCC OnLine SC 1898',
    court: 'Supreme Court',
    subject: 'Constitutional',
    snippet: 'Sub-classification within Scheduled Castes for reservation purposes is permissible.',
  },
  {
    name: 'Association for Democratic Reforms v. Union of India',
    citation: '2024 SCC OnLine SC 150',
    court: 'Supreme Court',
    subject: 'Constitutional',
    snippet: 'Electoral Bonds Scheme struck down as unconstitutional.',
  },
  {
    name: 'Mineral Area Development Authority v. Steel Authority of India',
    citation: '2024 SCC OnLine SC 1935',
    court: 'Supreme Court',
    subject: 'Constitutional',
    snippet: 'States have power to levy tax on mineral-bearing lands.',
  },
  {
    name: 'Property Owners Association v. State of Maharashtra',
    citation: '2024 SCC OnLine SC 1907',
    court: 'Supreme Court',
    subject: 'Constitutional',
    snippet: 'Private property can be considered community resource under Article 39(b).',
  },
  {
    name: 'In Re: Article 370 of the Constitution',
    citation: '2023 SCC OnLine SC 1647',
    court: 'Supreme Court',
    subject: 'Constitutional',
    snippet: 'Abrogation of Article 370 upheld — J&K\'s special status was temporary.',
  },
];

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* ===== HERO SECTION ===== */}
      <section className="hero" id="hero">
        <Image
          src="/ashoka-chakra.svg"
          alt=""
          width={600}
          height={600}
          className="hero__chakra"
          priority
          aria-hidden="true"
        />
        <div className="hero__content">
          <h1 className="hero__title">
            {['Every', 'Bare', 'Act.', 'Every', 'Landmark', 'Case.', 'Every', 'Exam', '—', 'One', 'Platform.'].map(
              (word, i) => (
                <span
                  key={i}
                  className="hero__word"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {word}{' '}
                </span>
              )
            )}
          </h1>
          <p className="hero__subtitle">
            Built for Indian law students. Trusted for accuracy.
          </p>
          <div className="hero__actions">
            <Link href="/bare-acts" className="btn btn--primary" id="cta-explore">
              📚 Explore Library
            </Link>
            <Link href="/ai-assistant" className="btn btn--gold" id="cta-ai">
              ✦ Ask AI Anything
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <Marquee />

      {/* ===== STATS BAR ===== */}
      <CountUpStats />

      <hr className="gold-rule" />

      {/* ===== FEATURE CARDS ===== */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Your Complete Legal Arsenal</h2>
            <p>Everything you need to master Indian law, in one platform.</p>
          </div>
          <div className="feature-grid">
            {features.map((feat, i) => (
              <div key={i} className="card" id={`feature-${i}`}>
                <span className="card__icon">{feat.icon}</span>
                <h3 className="card__title">{feat.title}</h3>
                <p className="card__description">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gold-rule" />

      {/* ===== EXAM QUICK-ACCESS ===== */}
      <section className="section" id="exam-access">
        <div className="container">
          <div className="section-header">
            <h2>Exam Preparation</h2>
            <p>Choose your exam. Master the syllabus. Conquer the competition.</p>
          </div>
          <div className="exam-grid">
            {examTiles.map((exam) => (
              <div key={exam.slug} className="exam-tile" id={`exam-${exam.slug}`}>
                <div className="exam-tile__inner">
                  <div className="exam-tile__front">
                    <h3>{exam.name}</h3>
                    <p>{exam.description}</p>
                    <span className="card__tag">{exam.slug.replace(/-/g, ' ').toUpperCase()}</span>
                  </div>
                  <div className="exam-tile__back">
                    <h4>{exam.name}</h4>
                    <p><strong>Seats:</strong> {exam.stats.seats}</p>
                    <p><strong>Difficulty:</strong> {exam.stats.difficulty}</p>
                    <p><strong>Key Subjects:</strong> {exam.stats.subjects}</p>
                    <Link href={`/exams/${exam.slug}`} className="btn btn--gold btn--small">
                      View Syllabus →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gold-rule" />

      {/* ===== TRENDING CASES ===== */}
      <section className="section" id="trending-cases">
        <div className="container">
          <div className="section-header">
            <h2>Trending Cases</h2>
            <p>Recent landmark judgments every law student should know.</p>
          </div>
          <div className="scroll-strip">
            {trendingCases.map((c, i) => (
              <div key={i} className="card" id={`trending-${i}`}>
                <span className="card__tag">{c.subject}</span>
                <h3 className="card__title" style={{ marginTop: '12px', fontSize: '1.1rem' }}>
                  {c.name}
                </h3>
                <p className="section-number" style={{ margin: '8px 0' }}>
                  {c.citation}
                </p>
                <p className="card__meta">{c.court}</p>
                <p className="card__description" style={{ marginTop: '8px' }}>
                  {c.snippet}
                </p>
                <Link
                  href="/case-law"
                  className="btn btn--ghost btn--small"
                  style={{ marginTop: '12px' }}
                >
                  Read Summary →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="gold-rule" />

      {/* ===== AI ASSISTANT TEASER ===== */}
      <section className="section" id="ai-teaser">
        <div className="container">
          <div className="ai-teaser">
            <div className="ai-teaser__info">
              <span className="card__tag" style={{ marginBottom: '16px', display: 'inline-block' }}>
                AI-Powered
              </span>
              <h2>Your AI Legal Research Assistant</h2>
              <p>
                Ask any question about Indian law and get instant, well-cited answers.
                From bare act sections to landmark case analysis, from exam strategy
                to legal reasoning — LexAstra AI understands Indian law like no other tool.
              </p>
              <Link href="/ai-assistant" className="btn btn--gold-fill">
                Try the AI Legal Assistant →
              </Link>
            </div>
            <div className="ai-mock-chat">
              <div className="ai-mock-chat__header">LexAstra AI — Live Preview</div>
              <div className="ai-mock-msg ai-mock-msg--user">
                <div className="ai-mock-msg__bubble">
                  Explain Article 21 with landmark cases
                </div>
              </div>
              <div className="ai-mock-msg ai-mock-msg--ai">
                <div className="ai-mock-msg__bubble">
                  <strong>Article 21</strong> of the Constitution of India states:
                  &ldquo;No person shall be deprived of his life or personal liberty
                  except according to procedure established by law.&rdquo;
                  <br /><br />
                  <strong>Key Landmark Cases:</strong>
                  <br />
                  • <span className="section-number">Maneka Gandhi v. UOI (1978)</span> —
                  Right to life includes right to live with dignity
                  <br />
                  • <span className="section-number">Olga Tellis v. BMC (1985)</span> —
                  Right to livelihood under Art. 21
                  <br />
                  • <span className="section-number">Vishaka v. State of Rajasthan (1997)</span> —
                  Sexual harassment guidelines
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
