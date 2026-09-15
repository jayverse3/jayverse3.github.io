import { plainText } from './shell';

export function safeLink(value: string): URL | undefined {
  if (value !== plainText(value)) return;
  try {
    const url = new URL(value);
    if (['https:', 'http:', 'mailto:'].includes(url.protocol)) return url;
  } catch { /* Invalid links remain plain text. */ }
}

export function hyperlink(text: string, href: string): string {
  const url = safeLink(href);
  const label = plainText(text);
  // OSC 8 keeps the target attached to the text, even when xterm wraps the line.
  return url ? `\x1b]8;;${url.href}\x1b\\${label}\x1b]8;;\x1b\\` : label;
}
