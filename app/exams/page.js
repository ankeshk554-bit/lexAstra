import { exams } from '@/data/exams';
import Link from 'next/link';

export const metadata = {
  title: 'Exam Preparation Hub',
  description: 'Comprehensive exam preparation for Judiciary, CLAT UG, CLAT PG, CUET UG, CUET PG, and APO exams.',
};

export default function ExamsPage() {
  return (
    <div className="page-enter">
      <section className="hero" style={{ minHeight: 'auto', padding: 'var(--space-4xl) var(--space-md)' }}>
        <div className="container text-center">
          <h1 className="hero__title" style={{ fontSize: 'var(--text-4xl)' }}>Exam Preparation Hub</h1>
          <p className="hero__subtitle">Master the syllabus, conquer the competition. Select your target exam to begin.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="exam-grid">
            {exams.map((exam) => (
              <div key={exam.slug} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="card__tag" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  {exam.slug.replace(/-/g, ' ').toUpperCase()}
                </span>
                <h3 className="card__title">{exam.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                  {exam.fullName}
                </p>
                <p className="card__description" style={{ flexGrow: 1 }}>
                  {exam.description}
                </p>
                
                <hr className="gold-rule" style={{ margin: 'var(--space-md) 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>Stages:</strong> {exam.pattern.stages.length}
                  </div>
                  <Link href={`/exams/${exam.slug}`} className="btn btn--primary btn--small">
                    View Complete Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
