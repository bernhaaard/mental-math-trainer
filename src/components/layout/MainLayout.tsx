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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
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
