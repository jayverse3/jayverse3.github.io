import { hyperlink } from './links';
import { plainText } from './shell';
import type { Line } from './shell';

export const ansi = { reset: '\x1b[0m', bold: '\x1b[1m', blue: '\x1b[34m', green: '\x1b[32m', muted: '\x1b[90m', error: '\x1b[31m' };
export const paintText = (text: string, color: string): string => color + plainText(text) + ansi.reset;

function wrapWords(text: string, width: number): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) { lines.push(line); line = ''; }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines;
}
export function formatLine(line: Line, columns: number): string {
  if (line.link) return paintText(line.link.label.padEnd(16), '') + ansi.blue + hyperlink(line.text, line.link.href) + ansi.reset;
  if (line.style === 'command') {
    const match = line.text.match(/^(\s*)(\w+)(\s+)(.*)$/);
    if (match) return match[1] + paintText(match[2], ansi.blue) + match[3] + paintText(match[4], ansi.muted);
  }
  const color = line.style === 'heading' ? ansi.bold : line.style === 'muted' ? ansi.muted : line.style === 'error' ? ansi.error : '';
  const width = line.wrap === 'viewport' ? columns - 2 : Math.min(100, columns - 2);
  const text = plainText(line.text);
  let offset = 0;
  return wrapWords(text, Math.max(20, width)).map(part => {
    const start = text.indexOf(part, offset);
    offset = start + part.length;
    const bold = (line.bold ?? []).map(range => ({ start: Math.max(start, range.start) - start, end: Math.min(offset, range.end) - start })).filter(range => range.start < range.end);
    if (!bold.length) return paintText(part, color);
    const boundaries = [...new Set([0, part.length, ...bold.flatMap(range => [range.start, range.end])])].sort((a, b) => a - b);
    return boundaries.slice(0, -1).map((from, index) => {
      const emphasized = bold.some(range => range.start <= from && from < range.end);
      return paintText(part.slice(from, boundaries[index + 1]), color + (emphasized ? ansi.bold : ''));
    }).join('');
  }).join('\r\n');
}
