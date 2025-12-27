import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}));

describe('Header', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('mobile menu button accessibility', () => {
    it('should have aria-expanded attribute set to false when menu is closed', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded attribute set to true when menu is open', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-controls pointing to mobile menu', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });

    it('should have accessible label', () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle navigation menu');
    });
  });

  describe('mobile menu navigation', () => {
    it('should render mobile menu with id matching aria-controls', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      const mobileMenu = document.getElementById('mobile-menu');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('should have aria-label on mobile navigation', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
      expect(mobileNav).toBeInTheDocument();
    });

    it('should mark current page with aria-current', async () => {
      mockUsePathname.mockReturnValue('/practice');
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      const currentLink = screen.getAllByRole('link', { name: 'Practice' }).find(
        link => link.getAttribute('aria-current') === 'page'
      );
      expect(currentLink).toBeInTheDocument();
    });
  });

  describe('focus management', () => {
    it('should have first menu item that can receive focus when menu opens', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      // First menu item should be Home and be focusable
      const mobileNav = document.getElementById('mobile-menu');
      const firstLink = mobileNav?.querySelector('a');

      expect(firstLink).toHaveTextContent('Home');
      expect(firstLink).toHaveAttribute('href', '/');
      // Verify the link is a valid focusable element
      expect(firstLink?.tagName.toLowerCase()).toBe('a');
    });

    it('should focus first menu item after setTimeout when menu opens', async () => {
      // Use real timers for this specific test
      vi.useRealTimers();

      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      await act(async () => {
        fireEvent.click(menuButton);
      });

      // Wait for setTimeout to execute
      await waitFor(() => {
        const mobileNav = document.getElementById('mobile-menu');
        const firstLink = mobileNav?.querySelector('a');
        expect(document.activeElement).toBe(firstLink);
      }, { timeout: 100 });
    });

    it('should return focus to menu button when menu closes via Escape', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      // Press Escape to close
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(document.activeElement).toBe(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('focus trap in mobile menu', () => {
    it('should close menu when Escape key is pressed', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Press Escape
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should trap Tab focus within menu - Tab from last item goes to first', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      const mobileNav = document.getElementById('mobile-menu');
      const links = mobileNav?.querySelectorAll('a');
      const lastLink = links?.[links.length - 1];
      const firstLink = links?.[0];

      // Focus the last link
      lastLink?.focus();
      expect(document.activeElement).toBe(lastLink);

      // Press Tab - should wrap to first
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab' });
      });

      expect(document.activeElement).toBe(firstLink);
    });

    it('should trap Tab focus within menu - Shift+Tab from first item goes to last', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      const mobileNav = document.getElementById('mobile-menu');
      const links = mobileNav?.querySelectorAll('a');
      const lastLink = links?.[links.length - 1];
      const firstLink = links?.[0];

      // Focus the first link
      firstLink?.focus();
      expect(document.activeElement).toBe(firstLink);

      // Press Shift+Tab - should wrap to last
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      });

      expect(document.activeElement).toBe(lastLink);
    });
  });

  describe('menu close on link click', () => {
    it('should close menu when a navigation link is clicked', async () => {
      render(<Header />);

      const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });

      // Open menu
      await act(async () => {
        fireEvent.click(menuButton);
        vi.runAllTimers();
      });

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Click a menu link
      const mobileNav = document.getElementById('mobile-menu');
      const practiceLink = mobileNav?.querySelector('a[href="/practice"]');

      await act(async () => {
        if (practiceLink) {
          fireEvent.click(practiceLink);
        }
      });

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('desktop navigation accessibility', () => {
    it('should mark current page with aria-current in desktop nav', () => {
      mockUsePathname.mockReturnValue('/study');
      render(<Header />);

      const desktopNav = screen.getByRole('navigation', { hidden: true });
      const currentLink = desktopNav.querySelector('a[aria-current="page"]');

      expect(currentLink).toHaveTextContent('Study');
    });

    it('should have proper link structure for screen readers', () => {
      render(<Header />);

      const homeLink = screen.getByRole('link', { name: /mental math mastery/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });
});
