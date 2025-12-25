import { describe, it, expect } from 'vitest';

describe('Example test suite', () => {
  it('should pass basic arithmetic test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should pass string comparison', () => {
    expect('hello').toBe('hello');
  });
});
