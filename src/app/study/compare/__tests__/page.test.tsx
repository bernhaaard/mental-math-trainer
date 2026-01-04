import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MethodComparisonPage from '../page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe('MethodComparisonPage', () => {
  describe('page structure', () => {
    it('should render the page title', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /compare calculation methods/i })
      ).toBeInTheDocument();
    });

    it('should render breadcrumb navigation', () => {
      render(<MethodComparisonPage />);

      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
      expect(within(nav).getByText('Study')).toBeInTheDocument();
      expect(within(nav).getByText('Compare Methods')).toBeInTheDocument();
    });

    it('should have a link back to study page in breadcrumb', () => {
      render(<MethodComparisonPage />);

      const studyLink = screen.getByRole('link', { name: /study/i });
      expect(studyLink).toHaveAttribute('href', '/study');
    });
  });

  describe('comparison table', () => {
    it('should render the comparison table section', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /method comparison table/i })
      ).toBeInTheDocument();
    });

    it('should display all six methods in the table', () => {
      render(<MethodComparisonPage />);

      const methodNames = [
        'Distributive Property',
        'Difference of Squares',
        'Near Powers of 10',
        'Squaring',
        'Near 100',
        'Factorization'
      ];

      // Use getAllByText since method names appear multiple times on the page
      methodNames.forEach((name) => {
        expect(screen.getAllByText(name).length).toBeGreaterThan(0);
      });
    });

    it('should display table headers', () => {
      render(<MethodComparisonPage />);

      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Best For')).toBeInTheDocument();
      expect(screen.getByText('Complexity')).toBeInTheDocument();
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Example')).toBeInTheDocument();
    });

    it('should link each method to its study page', () => {
      render(<MethodComparisonPage />);

      const distributiveLink = screen.getByRole('link', {
        name: /distributive property/i
      });
      expect(distributiveLink).toHaveAttribute('href', '/study/distributive');
    });

    it('should display speed badges', () => {
      render(<MethodComparisonPage />);

      const fastBadges = screen.getAllByText('Fast');
      expect(fastBadges.length).toBeGreaterThan(0);
    });
  });

  describe('decision flowchart', () => {
    it('should render the decision flowchart section', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /method selection flowchart/i })
      ).toBeInTheDocument();
    });

    it('should render usage instructions', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByText(/how to use this flowchart/i)
      ).toBeInTheDocument();
    });

    it('should render mobile-friendly simplified list', () => {
      render(<MethodComparisonPage />);

      // The simplified mobile view should have ordered instructions
      expect(screen.getByText(/squaring:/i)).toBeInTheDocument();
      expect(screen.getByText(/difference of squares:/i)).toBeInTheDocument();
      expect(screen.getByText(/near power of 10:/i)).toBeInTheDocument();
    });
  });

  describe('method vs method comparisons', () => {
    it('should render the method vs method section', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /method vs method comparisons/i })
      ).toBeInTheDocument();
    });

    it('should display comparison cards', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByText(/difference of squares vs near 100/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/distributive vs factorization/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/squaring vs difference of squares/i)).toBeInTheDocument();
    });

    it('should show win scenarios for each method', () => {
      render(<MethodComparisonPage />);

      const winBadges = screen.getAllByText(/wins/i);
      expect(winBadges.length).toBeGreaterThan(0);
    });
  });

  describe('same problem different methods', () => {
    it('should render the section', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /same problem, different methods/i })
      ).toBeInTheDocument();
    });

    it('should display expandable problem cards', async () => {
      const user = userEvent.setup();
      render(<MethodComparisonPage />);

      // Find a problem card button
      const problemButton = screen.getByRole('button', {
        name: /48 x 52/i
      });
      expect(problemButton).toBeInTheDocument();

      // Click to expand
      await user.click(problemButton);

      // Should show solution details
      expect(screen.getByText(/difference of squares \(optimal\)/i)).toBeInTheDocument();
    });

    it('should toggle expansion state on click', async () => {
      const user = userEvent.setup();
      render(<MethodComparisonPage />);

      const problemButton = screen.getByRole('button', {
        name: /48 x 52/i
      });

      // Initially collapsed
      expect(problemButton).toHaveAttribute('aria-expanded', 'false');

      // Expand
      await user.click(problemButton);
      expect(problemButton).toHaveAttribute('aria-expanded', 'true');

      // Collapse
      await user.click(problemButton);
      expect(problemButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('quick pattern reference', () => {
    it('should render the quick reference section', () => {
      render(<MethodComparisonPage />);

      expect(
        screen.getByRole('heading', { name: /quick pattern reference/i })
      ).toBeInTheDocument();
    });

    it('should display pattern tips', () => {
      render(<MethodComparisonPage />);

      expect(screen.getByText(/numbers ending in 5/i)).toBeInTheDocument();
      expect(screen.getByText(/one number is 11/i)).toBeInTheDocument();
      expect(screen.getByText(/numbers summing to 100/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should have link to combining techniques page', () => {
      render(<MethodComparisonPage />);

      const combiningLink = screen.getByRole('link', {
        name: /learn to combine methods/i
      });
      expect(combiningLink).toHaveAttribute('href', '/study/combining');
    });

    it('should have link to practice page', () => {
      render(<MethodComparisonPage />);

      const practiceLink = screen.getByRole('link', {
        name: /practice with problems/i
      });
      expect(practiceLink).toHaveAttribute('href', '/practice');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MethodComparisonPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/compare calculation methods/i);

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have accessible complexity star ratings', () => {
      render(<MethodComparisonPage />);

      // Look for aria-label on complexity ratings
      const complexityRatings = screen.getAllByLabelText(/complexity: \d out of 5/i);
      expect(complexityRatings.length).toBeGreaterThan(0);
    });

    it('should have keyboard accessible expand buttons', async () => {
      const user = userEvent.setup();
      render(<MethodComparisonPage />);

      const problemButton = screen.getByRole('button', {
        name: /48 x 52/i
      });

      // Focus the button
      problemButton.focus();
      expect(document.activeElement).toBe(problemButton);

      // Press Enter to activate
      await user.keyboard('{Enter}');
      expect(problemButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
