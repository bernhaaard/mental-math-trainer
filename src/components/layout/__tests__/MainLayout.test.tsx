import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainLayout } from '../MainLayout';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

describe('MainLayout', () => {
  describe('skip link accessibility', () => {
    it('should render skip link with correct href', () => {
      render(<MainLayout>Test Content</MainLayout>);

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have sr-only class by default for screen reader accessibility', () => {
      render(<MainLayout>Test Content</MainLayout>);

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have focus styles that make it visible when focused', () => {
      render(<MainLayout>Test Content</MainLayout>);

      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      // Check that focus styles are present
      expect(skipLink).toHaveClass('focus:not-sr-only');
      expect(skipLink).toHaveClass('focus:absolute');
    });
  });

  describe('main content landmark', () => {
    it('should render main element with correct id for skip link target', () => {
      render(<MainLayout>Test Content</MainLayout>);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have tabIndex -1 to allow programmatic focus', () => {
      render(<MainLayout>Test Content</MainLayout>);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });

    it('should render children content', () => {
      render(<MainLayout><div data-testid="child">Child Content</div></MainLayout>);

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should render header component', () => {
      render(<MainLayout>Test Content</MainLayout>);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(<MainLayout>Test Content</MainLayout>);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      const { container } = render(<MainLayout>Test Content</MainLayout>);

      // Check layout wrapper exists with min-height
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('min-h-screen');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
    });
  });
});
