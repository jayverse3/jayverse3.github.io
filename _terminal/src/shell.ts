export interface Line {
  text: string;
  style?: 'heading' | 'muted' | 'command' | 'error';
  wrap?: 'viewport';
  bold?: { start: number; end: number }[];
  link?: { label: string; href: string };
}

export interface Section {
  title: string;
  lines: Line[];
}

export type ThemeChoice = 'light' | 'dark' | 'system' | 'toggle';
export interface CommandResult {
  lines: Line[];
  action?: 'clear' | 'welcome' | 'home' | 'theme';
  theme?: ThemeChoice;
  exitCode: number;
}

export const commands = {
  help: 'Show all commands',
  about: 'Get to know me',
  news: 'See the latest updates',
  education: 'Explore my education',
  experience: 'Explore my experience',
  research: 'Explore my research',
  cv: 'View my CV and download the PDF',
  contact: 'Get in touch by email',
  profiles: 'Browse my online profiles',
  theme: 'Switch themes: light, dark, or system',
  history: 'Show commands from this visit',
  clear: 'Clear the terminal',
  welcome: 'Show the welcome banner',
  home: 'Return to the homepage',
} as const;

export type Command = keyof typeof commands;
export const commandNames = (Object.keys(commands) as Command[]).sort();

// Never let pasted text introduce terminal escape sequences or control codes.
export function stripControlCharacters(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
}

export function parseInput(input: string): string[] {
  const tokens: string[] = [];
  let value = '';
  let quote = '';
  let started = false;
  let escaped = false;
  for (const character of input.trim()) {
    if (escaped) { value += character; escaped = false; started = true; continue; }
    if (character === '\\' && quote !== "'") { escaped = true; started = true; continue; }
    if (quote) {
      if (character === quote) quote = '';
      else value += character;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; started = true; continue; }
    if ('|;&<>'.includes(character)) throw new Error('Pipes, redirection, and scripts are not supported. Try help.');
    if (/\s/.test(character)) {
      if (started) tokens.push(value);
      value = ''; started = false;
    } else { value += character; started = true; }
  }
  if (quote || escaped) throw new Error('Close the quote or finish the escape, then try again.');
  if (started) tokens.push(value);
  return tokens;
}

export function complete(input: string): Command[] {
  const prefix = input.trimStart().replace(/^\//, '').toLowerCase();
  if (/\s/.test(prefix)) return [];
  return commandNames.filter(name => name.startsWith(prefix));
}

export class CommandHistory {
  readonly entries: string[] = [];
  private cursor = 0;
  private draft = '';

  add(input: string): void {
    if (input && this.entries.at(-1) !== input) this.entries.push(input);
    if (this.entries.length > 100) this.entries.shift();
    this.cursor = this.entries.length;
    this.draft = '';
  }

  move(direction: -1 | 1, current: string): string {
    if (this.cursor === this.entries.length) this.draft = current;
    this.cursor = Math.max(0, Math.min(this.entries.length, this.cursor + direction));
    return this.entries[this.cursor] ?? this.draft;
  }
}

export function execute(input: string, sections: Record<string, Section>, history: readonly string[]): CommandResult {
  const fail = (text: string): CommandResult => ({ lines: [{ text, style: 'error' }], exitCode: 1 });
  let args: string[];
  try { args = parseInput(stripControlCharacters(input)); }
  catch (error) { return fail((error as Error).message); }
  if (!args.length) return { lines: [], exitCode: 0 };
  const name = args.shift()!.replace(/^\//, '').toLowerCase();
  if (!Object.hasOwn(commands, name)) return fail(`Command not found: ${name}. Type help to see what's available.`);
  if (name === 'theme') {
    const choice = args[0] ?? 'toggle';
    if (args.length > 1 || !['light', 'dark', 'system', 'toggle'].includes(choice)) return fail('Usage: theme [light | dark | system]');
    return { action: 'theme', theme: choice as ThemeChoice, lines: [], exitCode: 0 };
  }
  if (args.length) return fail(`${name} does not take arguments. Try ${name} on its own.`);
  if (name === 'help') return {
    lines: [{ text: 'Available commands', style: 'heading' }, { text: '' }, ...commandNames.map(command => ({ text: `  ${command.padEnd(16)}${commands[command]}`, style: 'command' as const })), { text: '' }, { text: 'Click a command, or type it below. A leading / also works.', style: 'muted' }], exitCode: 0,
  };
  if (name === 'clear' || name === 'welcome' || name === 'home') return { action: name, lines: [], exitCode: 0 };
  if (name === 'history') return { lines: history.map((text, index) => ({ text: `${String(index + 1).padStart(3)}  ${text}` })), exitCode: 0 };
  const section = sections[name];
  if (!section) return fail('This section is not available yet. You can still visit the homepage with home.');
  return { lines: [{ text: section.title, style: 'heading' }, { text: '' }, ...section.lines], exitCode: 0 };
}
