'use client';

/**
 * Application header with navigation.
 * Provides consistent navigation across all pages with responsive design.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/practice', label: 'Practice' },
  { href: '/study', label: 'Study' },
  { href: '/statistics', label: 'Statistics' }
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change (Issue #42)
  // Only close if the menu is currently open to avoid unnecessary state updates
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <span className="text-2xl">×</span>
            <span>Mental Math Mastery</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive(href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-1">
            {navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`
                  block px-4 py-2 rounded-md text-base font-medium transition-colors
                  ${
                    isActive(href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
