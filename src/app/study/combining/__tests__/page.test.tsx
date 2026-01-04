import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CombiningTechniquesPage from '../page';

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

describe('CombiningTechniquesPage', () => {
  describe('page structure', () => {
    it('should render the page title', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', {
          name: /combining calculation techniques/i
        })
      ).toBeInTheDocument();
    });

    it('should render breadcrumb navigation', () => {
      render(<CombiningTechniquesPage />);

      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();
      expect(within(nav).getByText('Study')).toBeInTheDocument();
      expect(within(nav).getByText('Combining Techniques')).toBeInTheDocument();
    });

    it('should have a link back to study page in breadcrumb', () => {
      render(<CombiningTechniquesPage />);

      const studyLink = screen.getByRole('link', { name: /study/i });
      expect(studyLink).toHaveAttribute('href', '/study');
    });

    it('should display Advanced badge', () => {
      render(<CombiningTechniquesPage />);

      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
  });

  describe('when to combine section', () => {
    it('should render the when to combine section', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', { name: /when to combine methods/i })
      ).toBeInTheDocument();
    });

    it('should display combination patterns', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByText(/large numbers with structure/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/near-round with adjustment/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/symmetric requiring squaring/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/multi-step factorization/i)
      ).toBeInTheDocument();
    });
  });

  describe('common combinations section', () => {
    it('should render the common combinations section', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', { name: /common method combinations/i })
      ).toBeInTheDocument();
    });

    it('should display combination strategies', () => {
      render(<CombiningTechniquesPage />);

      // These are rendered as card titles
      expect(
        screen.getByRole('heading', { name: /factorization \+ distributive/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /near power of 10 \+ simple multiplication/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /difference of squares \+ squaring/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /near 100 \+ cross multiplication/i })
      ).toBeInTheDocument();
    });

    it('should show when to use and process for each combination', () => {
      render(<CombiningTechniquesPage />);

      expect(screen.getAllByText(/when to use/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('Process').length).toBeGreaterThan(0);
    });
  });

  describe('worked examples section', () => {
    it('should render the worked examples section', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', { name: /detailed worked examples/i })
      ).toBeInTheDocument();
    });

    it('should display example problems', () => {
      render(<CombiningTechniquesPage />);

      // Check for example problems - use getAllByText since they appear in multiple places
      expect(screen.getAllByText(/48 x 52/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/125 x 32/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/97 x 54/i).length).toBeGreaterThan(0);
    });

    it('should show expandable example cards', async () => {
      const user = userEvent.setup();
      render(<CombiningTechniquesPage />);

      // First example should be expanded by default
      const exampleButton = screen.getByRole('button', { name: /48 x 52/i });
      expect(exampleButton).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      await user.click(exampleButton);
      expect(exampleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should display step-by-step solutions when expanded', () => {
      render(<CombiningTechniquesPage />);

      // First example is expanded by default - check for step headings
      expect(screen.getByRole('heading', { name: /recognize the symmetric pattern/i })).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /apply difference of squares formula/i })
      ).toBeInTheDocument();
    });

    it('should show key insight for each example', () => {
      render(<CombiningTechniquesPage />);

      expect(screen.getByText(/key insight/i)).toBeInTheDocument();
    });

    it('should display method badges for combined methods', () => {
      render(<CombiningTechniquesPage />);

      // Method badges appear multiple times - use getAllByText
      expect(screen.getAllByText(/difference of squares/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/mental squaring/i).length).toBeGreaterThan(0);
    });
  });

  describe('mental strategies section', () => {
    it('should render the mental strategies section', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', { name: /mental strategies for combining/i })
      ).toBeInTheDocument();
    });

    it('should display strategy tips', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByText(/always scan for patterns first/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/know your anchor facts/i)).toBeInTheDocument();
      expect(screen.getByText(/chain small steps/i)).toBeInTheDocument();
      expect(
        screen.getByText(/validate intermediate results/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/practice method transitions/i)).toBeInTheDocument();
    });
  });

  describe('practice exercises section', () => {
    it('should render the practice exercises section', () => {
      render(<CombiningTechniquesPage />);

      expect(
        screen.getByRole('heading', { name: /practice combining methods/i })
      ).toBeInTheDocument();
    });

    it('should display practice problems', () => {
      render(<CombiningTechniquesPage />);

      expect(screen.getByText(/96 x 104/i)).toBeInTheDocument();
      expect(screen.getByText(/45 x 88/i)).toBeInTheDocument();
      expect(screen.getByText(/67 x 73/i)).toBeInTheDocument();
    });

    it('should have show hint buttons', () => {
      render(<CombiningTechniquesPage />);

      const hintButtons = screen.getAllByText(/show hint/i);
      expect(hintButtons.length).toBeGreaterThan(0);
    });

    it('should toggle hint visibility', async () => {
      const user = userEvent.setup();
      render(<CombiningTechniquesPage />);

      const hintButtons = screen.getAllByText(/show hint/i);
      const firstHintButton = hintButtons[0];

      // Initially no hint visible for first exercise
      expect(firstHintButton).toHaveTextContent(/show hint/i);

      // Click to show hint
      await user.click(firstHintButton);
      expect(firstHintButton).toHaveTextContent(/hide hint/i);

      // Click to hide hint
      await user.click(firstHintButton);
      expect(firstHintButton).toHaveTextContent(/show hint/i);
    });

    it('should have show answer buttons', () => {
      render(<CombiningTechniquesPage />);

      const answerButtons = screen.getAllByText(/show answer/i);
      expect(answerButtons.length).toBeGreaterThan(0);
    });

    it('should toggle answer visibility', async () => {
      const user = userEvent.setup();
      render(<CombiningTechniquesPage />);

      const answerButtons = screen.getAllByText(/show answer/i);
      const firstAnswerButton = answerButtons[0];

      // Click to show answer
      await user.click(firstAnswerButton);
      expect(firstAnswerButton).toHaveTextContent(/hide answer/i);

      // Should display the answer - shown as "Answer: 9984"
      expect(screen.getByText(/answer: 9984/i)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should have link to compare methods page', () => {
      render(<CombiningTechniquesPage />);

      const compareLink = screen.getByRole('link', {
        name: /compare individual methods/i
      });
      expect(compareLink).toHaveAttribute('href', '/study/compare');
    });

    it('should have link to practice page', () => {
      render(<CombiningTechniquesPage />);

      const practiceLink = screen.getByRole('link', {
        name: /practice mixed problems/i
      });
      expect(practiceLink).toHaveAttribute('href', '/practice');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<CombiningTechniquesPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/combining calculation techniques/i);

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have accessible expand/collapse buttons', async () => {
      const user = userEvent.setup();
      render(<CombiningTechniquesPage />);

      const exampleButton = screen.getByRole('button', { name: /48 x 52/i });

      // Should have aria-expanded
      expect(exampleButton).toHaveAttribute('aria-expanded');

      // Should be keyboard accessible
      exampleButton.focus();
      expect(document.activeElement).toBe(exampleButton);

      await user.keyboard('{Enter}');
      expect(exampleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have accessible hint and answer toggle buttons', () => {
      render(<CombiningTechniquesPage />);

      const buttons = screen.getAllByRole('button');
      // All buttons should have accessible text
      buttons.forEach((button) => {
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('mathematical correctness', () => {
    it('should display correct answers for practice problems', async () => {
      const user = userEvent.setup();
      render(<CombiningTechniquesPage />);

      // Show all answers
      const answerButtons = screen.getAllByText(/show answer/i);

      // Check first few problems have correct answers (format: "Answer: X")
      await user.click(answerButtons[0]); // 96 x 104
      expect(screen.getByText(/answer: 9984/i)).toBeInTheDocument();

      await user.click(answerButtons[1]); // 45 x 88
      expect(screen.getByText(/answer: 3960/i)).toBeInTheDocument();

      await user.click(answerButtons[2]); // 67 x 73
      expect(screen.getByText(/answer: 4891/i)).toBeInTheDocument();
    });

    it('should display correct answers for worked examples', () => {
      render(<CombiningTechniquesPage />);

      // Check worked example answers - these appear as "= XXXX" in the headers
      expect(screen.getByText(/= 2496/)).toBeInTheDocument(); // 48 x 52
      expect(screen.getByText(/= 4000/)).toBeInTheDocument(); // 125 x 32
      expect(screen.getByText(/= 5238/)).toBeInTheDocument(); // 97 x 54
    });
  });
});
