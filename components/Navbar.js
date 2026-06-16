'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/bare-acts', label: 'Bare Acts' },
  { href: '/case-law', label: 'Case Law' },
  { href: '/exams', label: 'Exams' },
  { href: '/current-affairs', label: 'Current Affairs' },
  { href: '/pdf-reader', label: 'PDF Assistant' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar__inner">
        <Link href="/" className="navbar__brand" aria-label="LexAstra Home">
          Lex<span>Astra</span>
        </Link>

        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`navbar__link ${isActive(link.href) ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/ai-assistant" className="btn btn--ai btn--small" id="nav-ai-btn">
              ✦ Ask AI
            </Link>
          </li>
        </ul>

        <button
          className={`navbar__toggle ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`navbar__mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="navbar__mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/ai-assistant"
          className="btn btn--ai"
          onClick={() => setMobileOpen(false)}
        >
          ✦ Ask AI Assistant
        </Link>
      </div>
    </nav>
  );
}
