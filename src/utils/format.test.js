import { describe, expect, it } from 'vitest';
import { formatPosition, twoDigits } from './format';

describe('formatPosition', () => {
  it('uses 1-based row and column', () => {
    expect(formatPosition(0, 0)).toBe('Row 1, Column 1');
    expect(formatPosition(1, 2)).toBe('Row 2, Column 3');
  });
});

describe('twoDigits', () => {
  it('pads single digits with a zero', () => {
    expect(twoDigits(3)).toBe('03');
    expect(twoDigits(12)).toBe('12');
  });
});
