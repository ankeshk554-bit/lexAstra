import Link from 'next/link';

// Memoized footer link component to prevent unnecessary re-renders
const FooterLink = ({ href, children }) => (
  <li>
    <Link href={href} className="footer__link">
      {children}
    </Link>
  </li>
);

// Static data for footer sections
const FOOTER_SECTIONS = Object.freeze([
  {
    heading: 'Navigate',
    links: [
      { href: '/', label: 'Home' },
      { href: '/bare-acts', label: 'Bare Acts' },
      { href: '/case-law', label: 'Case Law' },
      { href: '/exams', label: 'Exams' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: '/ai-assistant', label: 'AI Assistant' },
      { href: '/current-affairs', label: 'Current Affairs' },
      { href: '/exams/judiciary', label: 'Judiciary Exam' },
      { href: '/exams/clat-ug', label: 'CLAT UG' },
    ],
  },
]);

const SOCIAL_LINKS = Object.freeze([
  { platform: 'Twitter', icon: '𝕏', url: '#' },
  { platform: 'LinkedIn', icon: 'in', url: '#' },
  { platform: 'Instagram', icon: '◎', url: '#' },
  { platform: 'YouTube', icon: '▶', url: '#' },
]);

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

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h4 className="footer__heading">{section.heading}</h4>
              <ul className="footer__links">
                {section.links.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="footer__heading">Connect</h4>
            <div className="footer__socials">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  className="footer__social-link"
                  aria-label={social.platform}
                >
                  {social.icon}
                </a>
              ))}
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
