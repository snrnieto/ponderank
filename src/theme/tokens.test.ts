import { describe, expect, it } from 'vitest';

import { getTheme, tokens } from './tokens';

describe('theme tokens', () => {
  it('exposes a primary color string for light mode', () => {
    expect(typeof tokens.colors.light.primary).toBe('string');
    expect(tokens.colors.light.primary.length).toBeGreaterThan(0);
  });

  it('light and dark expose the same color keys', () => {
    expect(Object.keys(tokens.colors.light).sort()).toEqual(Object.keys(tokens.colors.dark).sort());
  });

  it('getTheme includes primary and text', () => {
    const theme = getTheme('light');
    expect(theme.colors.primary).toBe(tokens.colors.light.primary);
    expect(theme.colors.text).toBe(tokens.colors.light.text);
  });
});
