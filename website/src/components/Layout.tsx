import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeContext';
import logoWhiteSrc from '../assets/logo-white.png';
import logoBlackSrc from '../assets/logo-black.png';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? logoWhiteSrc : logoBlackSrc;

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Our Work', path: '/our-work' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Memberships', path: '/memberships' },
    { name: 'About', path: '/about' },
    { name: 'More', path: '/hub' },
    { name: 'FAQ', path: '/faq' },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (revealNodes.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  // Theme Cycler
  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon size={18} />;
    if (theme === 'light') return <Sun size={18} />;
    return <Monitor size={18} />;
  };

  return (
    <div className="layout">
      {/* Navbar */}
      <header className="navbar glass-nav">
        <div className="navbar-inner">
          <Link to="/detailing" className="brand">
            <img
              src={logoSrc}
              alt="SignalSource logo"
              className="brand-logo"
              width={36}
              height={36}
            />
            <span className="brand-text">SIGNALSOURCE</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={location.pathname === link.path ? 'nav-link active' : 'nav-link'}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme} 
              aria-label={`Current theme: ${theme}. Click to switch.`}
              title={`Switch theme (Current: ${theme})`}
            >
              {getThemeIcon()}
              <span className="sr-only">{theme}</span>
            </button>


          </nav>

          {/* Mobile Actions */}
          <div className="mobile-actions">
            <button className="theme-toggle-btn mobile-only" onClick={toggleTheme}>
              {getThemeIcon()}
            </button>
            <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`mobile-nav glass-nav ${isMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      {/* Footer / Contact Bar (Matches bottom of flyer) */}
      <footer className="footer-bar">
        <div className="container footer-bar-container">
          <div className="footer-left">
            <h2 className="brand-text footer-brand-heading">SIGNALSOURCE</h2>
            
            <p className="serving-text mt-1">Serving Oak Harbor, NAS Whidbey & surrounding areas.</p>
            <p className="footer-hours">By appointment only • Monday–Saturday</p>
            <p className="footer-legal">Fully Licensed & Insured • Whidbey Island, WA</p>
            
            {/* Contact info - repositioned higher */}
            <div className="footer-contact-block mt-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <a href="tel:+19049937503" className="inline-link" style={{ padding: '0.5rem 0' }}>
                <span>(904) 993-7503</span>
              </a>
              <span className="contact-separator" style={{ padding: '0.5rem 0' }}> • </span>
              <a href="https://wa.me/19049937503" target="_blank" rel="noopener noreferrer" className="inline-link" style={{ padding: '0.5rem 0' }}>
                <span>Chat on WhatsApp</span>
              </a>
              <span className="contact-separator" style={{ padding: '0.5rem 0' }}> • </span>
              <a href="mailto:jcab@signaldatasource.com" className="inline-link" style={{ padding: '0.5rem 0' }}>
                <span>jcab@signaldatasource.com</span>
              </a>
            </div>
            
            {/* Social links */}
            <div className="footer-social-links mt-2">
              <a
                href="https://share.google/V0X0bd8dwXfPsFF5M"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="View us on Google"
              >
                {/* Google Map Marker icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>View us on Google</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100085398643282"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="SignalSource on Facebook"
              >
                {/* Facebook icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>SignalSource on Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/signal__source/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="SignalSource on Instagram"
              >
                {/* Instagram icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>SignalSource on Instagram</span>
              </a>
              <a
                href="https://nextdoor.com/page/signalsource-oak-harbor-wa"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="SignalSource on Nextdoor"
              >
                {/* Nextdoor icon (people/community) */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>SignalSource on Nextdoor</span>
              </a>
            </div>

            <p className="footer-copyright mt-2">© 2026 SignalSource. All rights reserved.</p>
            <div className="footer-legal-links mt-1">
              <Link to="/privacy">Privacy Policy</Link>
              <span className="separator">•</span>
              <Link to="/terms">Terms of Service</Link>
              <span className="separator">•</span>
              <Link to="/owner/schedule">Owner sign-in</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
