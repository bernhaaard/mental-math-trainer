import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardKey, KeyboardShortcut } from '../KeyboardKey';

describe('KeyboardKey', () => {
  describe('rendering', () => {
    it('should render the key text', () => {
      render(<KeyboardKey>Enter</KeyboardKey>);
      expect(screen.getByText('Enter')).toBeInTheDocument();
    });

    it('should render as a kbd element', () => {
      render(<KeyboardKey>Escape</KeyboardKey>);
      const element = screen.getByText('Escape');
      expect(element.tagName.toLowerCase()).toBe('kbd');
    });

    it('should apply base styles', () => {
      render(<KeyboardKey>A</KeyboardKey>);
      const element = screen.getByText('A');
      expect(element).toHaveClass('font-mono');
      expect(element).toHaveClass('rounded-md');
    });
  });

  describe('sizes', () => {
    it('should apply small size styles', () => {
      render(<KeyboardKey size="sm">Ctrl</KeyboardKey>);
      const element = screen.getByText('Ctrl');
      expect(element).toHaveClass('h-5');
      expect(element).toHaveClass('text-xs');
    });

    it('should apply medium size styles by default', () => {
      render(<KeyboardKey>Shift</KeyboardKey>);
      const element = screen.getByText('Shift');
      expect(element).toHaveClass('h-6');
      expect(element).toHaveClass('text-sm');
    });

    it('should apply large size styles', () => {
      render(<KeyboardKey size="lg">Space</KeyboardKey>);
      const element = screen.getByText('Space');
      expect(element).toHaveClass('h-8');
      expect(element).toHaveClass('text-base');
    });
  });

  describe('custom className', () => {
    it('should apply additional classes', () => {
      render(<KeyboardKey className="test-class">Q</KeyboardKey>);
      const element = screen.getByText('Q');
      expect(element).toHaveClass('test-class');
    });
  });
});

describe('KeyboardShortcut', () => {
  describe('rendering', () => {
    it('should render a single key', () => {
      render(<KeyboardShortcut keys={['Enter']} />);
      expect(screen.getByText('Enter')).toBeInTheDocument();
    });

    it('should render multiple keys with separator', () => {
      render(<KeyboardShortcut keys={['Ctrl', 'Q']} />);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Q')).toBeInTheDocument();
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should render three keys with two separators', () => {
      render(<KeyboardShortcut keys={['Ctrl', 'Shift', 'S']} />);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getAllByText('+')).toHaveLength(2);
    });

    it('should return null for empty keys array', () => {
      const { container } = render(<KeyboardShortcut keys={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('sizes', () => {
    it('should pass size to KeyboardKey components', () => {
      render(<KeyboardShortcut keys={['Ctrl', 'A']} size="sm" />);
      const keys = screen.getAllByRole('generic').filter(el => el.tagName.toLowerCase() === 'kbd');
      keys.forEach(key => {
        expect(key).toHaveClass('h-5');
      });
    });
  });

  describe('custom className', () => {
    it('should apply className to container', () => {
      const { container } = render(
        <KeyboardShortcut keys={['Enter']} className="test-container" />
      );
      expect(container.firstChild).toHaveClass('test-container');
    });
  });
});
