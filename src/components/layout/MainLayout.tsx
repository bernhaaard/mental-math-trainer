/**
 * Main layout wrapper for the application.
 * Provides consistent structure with header, content area, and footer.
 * Includes accessibility features like skip-to-content link.
 */

import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Mental Math Mastery - Train your mental calculation skills</p>
            <p className="mt-1">
              Built with mathematically rigorous calculation methods
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
