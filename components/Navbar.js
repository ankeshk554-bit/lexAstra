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

    // Load Google GSI Client
    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleSignIn();
      };
      document.body.appendChild(script);
    } else {
      initGoogleSignIn();
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

  useEffect(() => {
    if (!user && window.google?.accounts?.id) {
      setTimeout(() => {
        const container = document.getElementById('google-signin-btn');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'medium',
            shape: 'pill'
          });
        }
        
        const mobileContainer = document.getElementById('google-signin-btn-mobile');
        if (mobileContainer) {
          window.google.accounts.id.renderButton(mobileContainer, {
            theme: 'outline',
            size: 'medium',
            shape: 'pill'
          });
        }
      }, 150);
    }
  }, [user, mobileOpen]);

  const initGoogleSignIn = () => {
    if (!window.google?.accounts?.id) return;

    const clientId = localStorage.getItem('lexastra_google_client_id') || '1048602693895-placeholder.apps.googleusercontent.com';

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        try {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          const profile = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            token: response.credential
          };
          localStorage.setItem('lexastra_google_user', JSON.stringify(profile));
          setUser(profile);
          window.dispatchEvent(new Event('google-signin'));
        } catch (e) {
          console.error('Error decoding credential:', e);
        }
      }
    });

    const container = document.getElementById('google-signin-btn');
    if (container) {
      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'medium',
        shape: 'pill'
      });
    }
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
              <div id="google-signin-btn" style={{ minHeight: '30px', display: 'flex', alignItems: 'center' }}></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--gold)' }} 
                  title={`Logged in as ${user.name} (${user.email})`}
                />
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
            <div id="google-signin-btn-mobile" style={{ minHeight: '32px' }}></div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={user.picture} 
                alt={user.name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--gold)' }} 
              />
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
    </nav>
  );
}
