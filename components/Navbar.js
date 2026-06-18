'use client';

import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInInput, setSignInInput] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('lexastra_google_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('lexastra_google_user');
      }
    }

    const handleSignInSync = () => {
      const stored = localStorage.getItem('lexastra_google_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('lexastra_google_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('google-signin', handleSignInSync);
    window.addEventListener('google-signout', handleSignInSync);

    return () => {
      window.removeEventListener('google-signin', handleSignInSync);
      window.removeEventListener('google-signout', handleSignInSync);
    };
  }, []);

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!signInInput.trim()) return;

    const trimmedInput = signInInput.trim();
    const isEmail = trimmedInput.includes('@');
    const name = isEmail ? trimmedInput.split('@')[0] : trimmedInput;
    const email = isEmail ? trimmedInput : `${trimmedInput.toLowerCase()}@local`;

    const profile = {
      name: name,
      email: email,
      picture: '', // Initials are drawn dynamically in JSX
      token: 'dummy-token-' + Math.random().toString(36).substring(2, 10)
    };

    localStorage.setItem('lexastra_google_user', JSON.stringify(profile));
    setUser(profile);
    setShowSignInModal(false);
    setSignInInput('');
    window.dispatchEvent(new Event('google-signin'));
  };

  const handleSignOut = () => {
    localStorage.removeItem('lexastra_google_user');
    setUser(null);
    window.dispatchEvent(new Event('google-signout'));
  };

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
          <li style={{ display: 'flex', alignItems: 'center' }}>
            {!user ? (
              <button 
                onClick={() => setShowSignInModal(true)} 
                className="btn btn--primary btn--small"
                style={{ padding: '4px 12px', fontSize: '12px' }}
              >
                Sign In
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <div 
                  style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: '#C9A84C', 
                    color: '#ffffff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    border: '1px solid var(--gold)' 
                  }} 
                  title={`Logged in as ${user.name} (${user.email})`}
                >
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <button 
                  onClick={handleSignOut} 
                  className="btn btn--ghost btn--small" 
                  style={{ padding: '2px 6px', fontSize: '10px', opacity: 0.7 }}
                >
                  Sign Out
                </button>
              </div>
            )}
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
          style={{ marginBottom: '16px' }}
        >
          ✦ Ask AI Assistant
        </Link>
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'center', width: '100%' }}>
          {!user ? (
            <button 
              onClick={() => { setShowSignInModal(true); setMobileOpen(false); }} 
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign In
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#C9A84C', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  border: '1px solid var(--gold)' 
                }} 
              >
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--navy)' }}>{user.name}</span>
              <button 
                onClick={() => { handleSignOut(); setMobileOpen(false); }} 
                className="btn btn--ghost btn--small"
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showSignInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 31, 58, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#F5F2EB',
            border: '1px solid #D1C4A5',
            borderRadius: '16px',
            padding: '24px 32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            color: '#0B1F3A',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSignInModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                fontSize: '18px'
              }}
            >
              ✕
            </button>
            
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '8px' }}>
              Create Local Profile
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: '1.4' }}>
              Enter your name or email to sync your textbook highlights, notes, and AI conversations locally.
            </p>
            
            <form onSubmit={handleSignInSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Name or Email:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Ankes or user@email.com"
                  value={signInInput}
                  onChange={(e) => setSignInInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #D1C4A5',
                    background: '#ffffff',
                    color: '#0B1F3A',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn--gold-fill" 
                style={{ width: '100%', justifyContent: 'center', padding: '10px', borderRadius: '8px' }}
              >
                Create Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
