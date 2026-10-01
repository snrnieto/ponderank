import { describe, expect, it } from 'vitest';

import { parseDecimalText, sanitizeDecimalText } from './decimal-input';

describe('sanitizeDecimalText', () => {
  it('keeps a trailing separator so the user can keep typing decimals', () => {
    expect(sanitizeDecimalText('7.')).toBe('7.');
    expect(sanitizeDecimalText('7,')).toBe('7.');
    expect(sanitizeDecimalText('7,5')).toBe('7.5');
  });

  it('drops invalid characters, extra separators and inner minus signs', () => {
    expect(sanitizeDecimalText('1a2.3.4')).toBe('12.34');
    expect(sanitizeDecimalText('-4-2')).toBe('-42');
    expect(sanitizeDecimalText(' $ 10 ')).toBe('10');
  });
});

describe('parseDecimalText', () => {
  it('parses complete numbers and returns null for incomplete input', () => {
    expect(parseDecimalText('7.')).toBe(7);
    expect(parseDecimalText('0.25')).toBe(0.25);
    expect(parseDecimalText('-3')).toBe(-3);
    expect(parseDecimalText('')).toBeNull();
    expect(parseDecimalText('-')).toBeNull();
    expect(parseDecimalText('.')).toBeNull();
  });
});
