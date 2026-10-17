import { describe, it, expect } from 'vitest';
import { tsTheme } from '@statslib/mzts-theme.js';

// The DOM part of the theme is tested in tests/components/theme.test.js
describe('tsTheme without a DOM', () => {
  it('can be imported and has no system color scheme', () => {
    expect(typeof window).toBe('undefined');
    expect(tsTheme.media).toBeNull();
  });
});
