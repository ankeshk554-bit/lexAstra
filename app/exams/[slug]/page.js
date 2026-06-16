import { exams } from '@/data/exams';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExamDetailClient from './ExamDetailClient';

export async function generateStaticParams() {
  return exams.map((exam) => ({
    slug: exam.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);
  if (!exam) return { title: 'Exam Not Found' };

  return {
    title: `${exam.name} Preparation | LexAstra`,
    description: exam.description,
  };
}

export default async function ExamPage({ params }) {
  const { slug } = await params;
  const exam = exams.find((e) => e.slug === slug);

  if (!exam) {
    notFound();
  }

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb__separator">/</span>
          <Link href="/exams">Exams</Link>
          <span className="breadcrumb__separator">/</span>
          <span>{exam.name}</span>
        </div>
      </div>

      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-2xl) var(--space-md)', background: 'var(--navy)' }}>
        <div className="container">
          <h1 className="hero__title" style={{ color: 'var(--parchment)', fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-sm)' }}>
            {exam.name}
          </h1>
          <p style={{ color: 'var(--gold)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-ui)' }}>
            {exam.fullName}
          </p>
          <p style={{ color: 'var(--parchment)', opacity: 0.8, maxWidth: '800px' }}>
            {exam.description}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Overview Section */}
          <div className="section-header" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
            <h2>Exam Overview</h2>
          </div>
          <div className="exam-overview">
            <div className="exam-overview__item">
              <h4>Eligibility</h4>
              <p>{exam.eligibility}</p>
            </div>
            <div className="exam-overview__item">
              <h4>Stages</h4>
              <ul style={{ paddingLeft: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
                {exam.pattern.stages.map((stage, i) => (
                  <li key={i}>{stage}</li>
                ))}
              </ul>
            </div>
            <div className="exam-overview__item">
              <h4>Key Dates</h4>
              <p><strong>Notification:</strong> {exam.keyDates.notification}</p>
              <p><strong>Exam:</strong> {exam.keyDates.exam}</p>
            </div>
          </div>

          <hr className="gold-rule" />

          {/* Syllabus Section */}
          <div className="syllabus-section">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
              <h2>Complete Syllabus</h2>
            </div>
            {exam.syllabus.map((paper, i) => (
              <div key={i} className="syllabus-paper">
                <div className="syllabus-paper__header">
                  {paper.paper}
                </div>
                <div className="syllabus-paper__body">
                  {paper.subjects.map((subject, j) => (
                    <div key={j} className="syllabus-subject">
                      <h4>{subject.name}</h4>
                      <ul className="syllabus-subject__topics">
                        {subject.topics.map((topic, k) => (
                          <li key={k}>{topic}</li>
                        ))}
                      </ul>
                      {subject.relatedActs && subject.relatedActs.length > 0 && (
                        <div style={{ marginTop: 'var(--space-sm)', paddingLeft: 'var(--space-lg)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '8px' }}>Related Acts:</span>
                          {subject.relatedActs.map(actSlug => (
                            <Link key={actSlug} href={`/bare-acts/${actSlug}`} className="card__tag" style={{ marginRight: '4px', textDecoration: 'none' }}>
                              {actSlug.replace(/-/g, ' ')}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <hr className="gold-rule" />

          {/* Interactive Client Component for PYQs and Cases */}
          <ExamDetailClient exam={exam} />
          
        </div>
      </section>
    </div>
  );
}
