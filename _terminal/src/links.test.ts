import { describe, expect, it } from 'vitest';
import { hyperlink, safeLink } from './links';

describe('terminal hyperlinks', () => {
  it('allows web links and mailto links', () => {
    for (const value of ['https://example.com/profile', 'http://example.com', 'mailto:hello@example.com']) expect(safeLink(value)?.href).toBe(new URL(value).href);
  });

  it('rejects unsupported protocols and terminal control sequences', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,test', 'file:///notes', 'not a URL', 'https://example.com/\x1b]8;;bad', 'mailto:hello@example.com\r\n']) expect(safeLink(value)).toBeUndefined();
  });

  it('makes the address clickable without displaying the mailto prefix', () => {
    expect(hyperlink('hello@example.com', 'mailto:hello@example.com')).toBe('\x1b]8;;mailto:hello@example.com\x1b\\hello@example.com\x1b]8;;\x1b\\');
  });

  it('sanitizes visible text and does not emit invalid hyperlinks', () => {
    expect(hyperlink('hello\x1b[2J', 'javascript:alert(1)')).toBe('hello[2J');
  });
});
