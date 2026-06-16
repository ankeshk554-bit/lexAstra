import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              Lex<span>Astra</span>
            </div>
            <p className="footer__tagline">
              &ldquo;Every Law. Every Case. Every Exam.&rdquo;
            </p>
            <p className="footer__tagline" style={{ marginTop: '4px' }}>
              India&apos;s Most Trusted Legal Study Platform
            </p>
          </div>

          <div>
            <h4 className="footer__heading">Navigate</h4>
            <ul className="footer__links">
              <li><Link href="/" className="footer__link">Home</Link></li>
              <li><Link href="/bare-acts" className="footer__link">Bare Acts</Link></li>
              <li><Link href="/case-law" className="footer__link">Case Law</Link></li>
              <li><Link href="/exams" className="footer__link">Exams</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Resources</h4>
            <ul className="footer__links">
              <li><Link href="/ai-assistant" className="footer__link">AI Assistant</Link></li>
              <li><Link href="/current-affairs" className="footer__link">Current Affairs</Link></li>
              <li><Link href="/exams/judiciary" className="footer__link">Judiciary Exam</Link></li>
              <li><Link href="/exams/clat-ug" className="footer__link">CLAT UG</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Connect</h4>
            <div className="footer__socials">
              <a href="#" className="footer__social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="footer__social-link" aria-label="Instagram">◎</a>
              <a href="#" className="footer__social-link" aria-label="YouTube">▶</a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__disclaimer">
            LexAstra is an educational platform. Content is for academic reference only
            and is not a substitute for professional legal advice. Always consult a
            qualified advocate for legal matters.
          </p>
          <p className="footer__copyright">
            © 2025 LexAstra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
