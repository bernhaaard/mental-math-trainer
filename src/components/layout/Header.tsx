'use client';

/**
 * Application header with navigation.
 * Provides consistent navigation across all pages with responsive design.
 * Includes accessibility features like focus trap for mobile menu.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/practice', label: 'Practice' },
  { href: '/study', label: 'Study' },
  { href: '/statistics', label: 'Statistics' }
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for focus management
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  const lastMenuItemRef = useRef<HTMLAnchorElement>(null);

  // Close mobile menu on route change (Issue #42)
  // Only close if the menu is currently open to avoid unnecessary state updates
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle Escape key to close menu
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!mobileMenuOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMobileMenuOpen(false);
      // Return focus to menu button
      menuButtonRef.current?.focus();
    }

    // Focus trap: Tab and Shift+Tab handling
    if (event.key === 'Tab') {
      const focusableElements = mobileNavRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Guard against undefined elements
      if (!firstElement || !lastElement) return;

      if (event.shiftKey) {
        // Shift+Tab: if on first element, move to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, move to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [mobileMenuOpen]);

  // Set up keyboard event listener for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first menu item when menu opens
      // Use setTimeout to ensure the menu is rendered
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen, handleKeyDown]);

  // Handle menu close and return focus
  const handleMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

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
                      ? 'bg-primary/10 text-primary'
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
            ref={menuButtonRef}
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
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
          <nav
            ref={mobileNavRef}
            id="mobile-menu"
            className="md:hidden py-4 space-y-1"
            aria-label="Mobile navigation"
          >
            {navigationLinks.map(({ href, label }, index) => (
              <Link
                key={href}
                ref={
                  index === 0
                    ? firstMenuItemRef
                    : index === navigationLinks.length - 1
                    ? lastMenuItemRef
                    : undefined
                }
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={`
                  block px-4 py-2 rounded-md text-base font-medium transition-colors
                  ${
                    isActive(href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                onClick={handleMenuClose}
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
