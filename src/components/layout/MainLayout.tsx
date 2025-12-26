/**
 * Main layout wrapper for the application.
 * Provides consistent structure with header, content area, and footer.
 */

import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
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
