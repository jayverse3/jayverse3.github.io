import { describe, expect, it } from 'vitest';
import { ansi, formatLine, paintText } from './formatting';
import { hyperlink } from './links';

const unstyle = (text: string): string => text.replace(/\x1b\[[0-9;]*m/g, '');

describe('terminal output formatting', () => {
  it('keeps link labels plain and colors only the clickable address', () => {
    const href = 'mailto:hello@example.com';
    expect(formatLine({ text: 'hello@example.com', link: { label: 'Email', href } }, 80))
      .toBe(paintText('Email'.padEnd(16), '') + ansi.blue + hyperlink('hello@example.com', href) + ansi.reset);
  });

  it('colors help commands without losing column spacing', () => {
    expect(formatLine({ text: '  help            Show all commands', style: 'command' }, 80))
      .toBe('  ' + paintText('help', ansi.blue) + '            ' + paintText('Show all commands', ansi.muted));
  });

  it('keeps headings, metadata and errors in their existing styles', () => {
    for (const [style, color] of [['heading', ansi.bold], ['muted', ansi.muted], ['error', ansi.error]] as const) {
      expect(formatLine({ text: 'Example', style }, 80)).toBe(paintText('Example', color));
    }
  });

  it('preserves empty lines and strips injected terminal control characters', () => {
    expect(unstyle(formatLine({ text: '' }, 80))).toBe('');
    expect(paintText('\x1b[2Jhello\u009b', ansi.bold)).toBe(ansi.bold + '[2Jhello' + ansi.reset);
  });

  it('wraps ordinary output at 100 columns but lets prose use the viewport', () => {
    const text = Array(25).fill('word').join(' ');
    expect(unstyle(formatLine({ text }, 140)).split('\r\n')).toHaveLength(2);
    expect(unstyle(formatLine({ text, wrap: 'viewport' }, 140))).toBe(text);
    expect(unstyle(formatLine({ text, wrap: 'viewport' }, 40)).split('\r\n').every(line => line.length <= 38)).toBe(true);
  });

  it('preserves bold emphasis when it crosses a wrapped line', () => {
    const text = 'alpha beta gamma delta epsilon';
    expect(formatLine({ text, bold: [{ start: 11, end: 30 }] }, 22)).toBe(
      paintText('alpha beta ', '') + paintText('gamma', ansi.bold) + '\r\n' + paintText('delta epsilon', ansi.bold),
    );
  });

  it('emphasizes the selected occurrence rather than every matching word', () => {
    expect(formatLine({ text: 'Baidu then Baidu', bold: [{ start: 11, end: 16 }] }, 80))
      .toBe(paintText('Baidu then ', '') + paintText('Baidu', ansi.bold));
  });

  it('leaves long unbroken tokens intact for xterm to wrap', () => {
    const token = 'a'.repeat(120);
    expect(unstyle(formatLine({ text: token }, 40))).toBe(token);
  });
});
