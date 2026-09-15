import { Terminal } from '@xterm/xterm';
import type { IMarker } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { readContent } from './content';
import { bannerPalette, renderBanner } from './banner';
import { safeLink } from './links';
import { ansi, formatLine, paintText } from './formatting';
import { CommandHistory, commands, complete, execute, plainText } from './shell';
import type { ThemeChoice } from './shell';
import './style.css';

const app = document.querySelector<HTMLElement>('#terminal-app')!;
const output = document.querySelector<HTMLElement>('#terminal-output')!;
const state = document.querySelector<HTMLElement>('#terminal-state')!;
const source = document.querySelector<HTMLTemplateElement>('#terminal-content')!;
const sections = readContent(source.content, app.dataset);
const history = new CommandHistory();
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
let preference: string | null = null;
try { preference = localStorage.getItem('theme'); } catch { /* Storage is optional. */ }

function openLink(_event: MouseEvent, uri: string): void {
  const url = safeLink(uri);
  if (!url) return;
  if (url.protocol === 'mailto:') window.open(url.href, '_self');
  else window.open(url.href, '_blank', 'noopener,noreferrer');
}

const terminal = new Terminal({
  fontFamily: "Consolas, 'Liberation Mono', Menlo, monospace",
  fontSize: 16, lineHeight: 1, fontWeight: '400', fontWeightBold: '700',
  cursorStyle: 'block', cursorBlink: true, cursorInactiveStyle: 'outline',
  convertEol: true, scrollback: 2000, scrollOnEraseInDisplay: true, screenReaderMode: true, allowProposedApi: false,
  linkHandler: { activate: openLink, allowNonHttpProtocols: true },
});
const fit = new FitAddon();
terminal.loadAddon(fit);
let scrollIdleTimer = 0;
terminal.onScroll(() => {
  output.classList.add('is-scrolling');
  window.clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(() => output.classList.remove('is-scrolling'), 1000);
});
terminal.loadAddon(new WebLinksAddon(openLink));

function refreshTheme(): void {
  const theme = preference === 'light' || preference === 'dark' ? preference : systemTheme.matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => css.getPropertyValue('--terminal-' + name).trim();
  terminal.options.theme = {
    background: color('bg'), foreground: color('fg'), cursor: color('accent'), cursorAccent: color('bg'),
    selectionBackground: color('selection'), brightBlack: color('muted'),
    blue: color('accent'), brightBlue: color('accent'), green: color('green'), brightGreen: color('green'),
    red: color('error'), brightRed: color('error'), white: color('fg'), brightWhite: color('fg'),
    extendedAnsi: bannerPalette(theme),
  };
}
function changeTheme(choice: ThemeChoice): void {
  preference = choice === 'system' ? null : choice === 'toggle' ? document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark' : choice;
  try {
    if (preference) localStorage.setItem('theme', preference);
    else localStorage.removeItem('theme');
  } catch { /* The selected theme still works for this visit. */ }
  refreshTheme();
}

const prompt = () => paintText('visitor', ansi.green + ansi.bold) + '@' + paintText('jayverse3.github.io', ansi.blue + ansi.bold) + ':~$ ';
const write = (value: string): Promise<void> => new Promise(resolve => terminal.write(value, resolve));

async function welcome(): Promise<void> {
  const lines = ['', ...renderBanner(terminal.cols)];
  lines.push('', 'Welcome to my terminal portfolio.');
  lines.push('Type ' + paintText('help', ansi.blue) + ' to see available commands.');
  lines.push(paintText('Tab to complete · ↑/↓ for history · Ctrl+L to clear', ansi.muted), '');
  await write(lines.join('\r\n') + '\r\n');
}

let line = '';
let caret = 0;
let promptMarker: IMarker | undefined;
let queue = Promise.resolve();
let ready = false;
function enqueue(task: () => Promise<void>): void {
  queue = queue.then(task).catch(error => {
    console.error('Terminal error:', error);
    state.hidden = false;
    state.textContent = 'Terminal interrupted. Reload, or use the regular homepage.';
  });
}
async function beginPrompt(): Promise<void> {
  promptMarker?.dispose();
  promptMarker = terminal.registerMarker(0);
  await write(prompt());
}

// Markers follow scrollback/reflow. Let xterm measure cursor positions instead
// of guessing character widths, including for wrapped lines and CJK input.
async function redraw(clearScreen = false): Promise<void> {
  terminal.scrollToBottom();
  // Keep intermediate erases and cursor measurements off screen (DEC 2026).
  // xterm still updates its buffer, then paints the completed prompt at once.
  let start = '\x1b[?2026h';
  if (promptMarker && !promptMarker.isDisposed) {
    const up = terminal.buffer.active.baseY + terminal.buffer.active.cursorY - promptMarker.line;
    start += '\r' + (up > 0 ? '\x1b[' + up + 'A' : '') + '\x1b[0J';
  }
  // ED2 saves the existing output to scrollback; redraw the editable prompt at the top.
  if (clearScreen) start += '\x1b[2J\x1b[H';
  await write(start);
  try {
    promptMarker?.dispose();
    promptMarker = terminal.registerMarker(0);
    const characters = [...line];
    await write(prompt() + characters.slice(0, caret).join(''));
    if (terminal.buffer.active.cursorX >= terminal.cols) await write('\r\n');
    const column = terminal.buffer.active.cursorX;
    const marker = terminal.registerMarker(0);
    await write(characters.slice(caret).join('') + ' ');
    const up = terminal.buffer.active.baseY + terminal.buffer.active.cursorY - marker.line;
    await write((up > 0 ? '\x1b[' + up + 'A' : '') + '\x1b[' + (column + 1) + 'G');
    marker.dispose();
  } finally {
    await write('\x1b[?2026l');
  }
}
async function submit(value = line): Promise<void> {
  line = plainText(value).trim().slice(0, 512);
  caret = [...line].length;
  await redraw();
  await write('\r\n');
  const command = line;
  line = ''; caret = 0;
  promptMarker?.dispose(); promptMarker = undefined;
  if (!command) { await beginPrompt(); return; }
  history.add(command);
  const result = execute(command, sections, history.entries);
  if (result.action === 'gui') {
    // Leave a complete input state for browser back/forward-cache restoration.
    await beginPrompt();
    location.assign(app.dataset.home || '/');
    return;
  }
  if (result.action === 'clear') terminal.reset();
  else if (result.action === 'welcome') await welcome();
  else {
    if (result.action === 'theme') {
      changeTheme(result.theme!);
      result.lines.push({ text: 'Theme: ' + (result.theme === 'system' ? 'system' : document.documentElement.dataset.theme), style: 'muted' });
    }
    await write(result.lines.map(line => formatLine(line, terminal.cols)).join('\r\n') + '\r\n\r\n');
  }
  await beginPrompt();
  terminal.scrollToBottom();
}
async function handleInput(data: string): Promise<void> {
  const characters = [...line];
  if (data === '\r') { await submit(); return; }
  if (data === '\x03') {
    caret = characters.length; await redraw(); await write('^C\r\n');
    line = ''; caret = 0; await beginPrompt(); return;
  }
  if (data === '\x0c') { await redraw(true); return; }
  if (data === '\x04' && !line) { await submit('gui'); return; }
  if (data === '\t') {
    const matches = complete(line);
    if (matches.length === 1) { line = matches[0] + ' '; caret = line.length; await redraw(); }
    else if (matches.length > 1) {
      caret = characters.length; await redraw();
      await write('\r\n' + matches.map(name => paintText(name, ansi.blue)).join('  ') + '\r\n');
      promptMarker?.dispose(); promptMarker = undefined;
      await redraw();
    }
    return;
  }
  if (data === '\x1b[A' || data === '\x10' || data === '\x1b[B' || data === '\x0e') {
    line = history.move(data === '\x1b[A' || data === '\x10' ? -1 : 1, line);
    caret = [...line].length;
  } else if (data === '\x1b[D') caret = Math.max(0, caret - 1);
  else if (data === '\x1b[C') caret = Math.min(characters.length, caret + 1);
  else if (['\x01', '\x1b[H', '\x1b[1~', '\x1bOH'].includes(data)) caret = 0;
  else if (['\x05', '\x1b[F', '\x1b[4~', '\x1bOF'].includes(data)) caret = characters.length;
  else if (data === '\x7f' || data === '\b') { if (caret > 0) characters.splice(--caret, 1); line = characters.join(''); }
  else if (data === '\x1b[3~' || data === '\x04') { characters.splice(caret, 1); line = characters.join(''); }
  else if (data === '\x15') { line = characters.slice(caret).join(''); caret = 0; }
  else if (data === '\x0b') line = characters.slice(0, caret).join('');
  else if (data === '\x17') {
    const prefix = characters.slice(0, caret).join('').replace(/\S+\s*$/, '');
    line = prefix + characters.slice(caret).join(''); caret = [...prefix].length;
  } else if (data.startsWith('\x1b')) return;
  else {
    // Pasted newlines remain editable; they never execute commands.
    const inserted = [...plainText(data.replace(/[\r\n\t]+/g, ' '))].slice(0, 512 - characters.length);
    characters.splice(caret, 0, ...inserted);
    line = characters.join(''); caret += inserted.length;
  }
  await redraw();
}

terminal.onData(data => { if (ready) enqueue(() => handleInput(data)); });
terminal.attachCustomKeyEventHandler(event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && terminal.hasSelection()) return false;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') return false;
  if (event.shiftKey && event.key === 'Tab') return false;
  return true;
});
terminal.registerLinkProvider({
  provideLinks(lineNumber, callback) {
    const text = terminal.buffer.active.getLine(lineNumber - 1)?.translateToString(true) || '';
    const match = text.match(/^ {2}([a-z]+)(?= {2,})/);
    if (!match || !Object.hasOwn(commands, match[1])) { callback(undefined); return; }
    callback([{
      range: { start: { x: 3, y: lineNumber }, end: { x: 2 + match[1].length, y: lineNumber } },
      text: match[1],
      activate: () => { enqueue(() => submit(match[1])); terminal.focus(); },
    }]);
  },
});
systemTheme.addEventListener('change', () => { if (!preference) refreshTheme(); });
window.addEventListener('storage', event => { if (event.key === 'theme') { preference = event.newValue; refreshTheme(); } });
window.addEventListener('pageshow', event => {
  if (!event.persisted || !ready) return;
  enqueue(async () => {
    try { preference = localStorage.getItem('theme'); } catch { /* Keep the session preference. */ }
    refreshTheme();
    fit.fit();
    await redraw();
    terminal.focus();
  });
});

async function start(): Promise<void> {
  refreshTheme();
  terminal.open(output);
  terminal.textarea?.setAttribute('aria-label', 'Terminal command input. Type help for available commands.');
  await document.fonts.ready;
  fit.fit();
  state.hidden = true;
  await write(prompt() + 'welcome\r\n');
  await welcome();
  await beginPrompt();
  ready = true;
  app.dataset.ready = 'true';
  terminal.focus();
  let resizeFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => enqueue(async () => { fit.fit(); await redraw(); }));
  }).observe(output);
}
start().catch(error => { console.error('Terminal failed to start:', error); state.textContent = 'Unable to start. Reload or return to the regular homepage.'; });
