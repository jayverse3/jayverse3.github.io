import { describe, expect, it } from 'vitest';
import { CommandHistory, commandNames, complete, execute, parseInput, plainText } from './shell';

describe('command parsing', () => {
  it('accepts quoted arguments and whitespace', () => {
    expect(parseInput('  theme "dark" ')).toEqual(['theme', 'dark']);
    expect(parseInput("theme 'light'")).toEqual(['theme', 'light']);
  });
  it('rejects unfinished quotes and shell operators', () => {
    for (const input of ['about | cat', 'about; gui', 'about > notes', 'about && gui', 'theme "dark']) expect(() => parseInput(input)).toThrow();
  });
  it('does not parse quoted operators as commands', () => {
    expect(parseInput('about "a|b"')).toEqual(['about', 'a|b']);
  });
  it('strips terminal control characters', () => {
    expect(plainText('\x1b[2Jhello\u009b')).toBe('[2Jhello');
  });
});

describe('commands', () => {
  it('lists help and completion candidates alphabetically', () => {
    const expected = ['about', 'clear', 'contact', 'cv', 'education', 'experience', 'gui', 'help', 'history', 'news', 'profiles', 'publications', 'theme', 'welcome'];
    expect(commandNames).toEqual(expected);
    expect(execute('help', {}, []).lines.filter(line => line.style === 'command').map(line => line.text.trim().split(/\s+/)[0])).toEqual(expected);
    expect(complete('')).toEqual(expected);
    expect(complete('h')).toEqual(['help', 'history']);
    expect(complete('g')).toEqual(['gui']);
    expect(complete('/g')).toEqual(['gui']);
    expect(complete('c')).toEqual(['clear', 'contact', 'cv']);
    expect(complete('p')).toEqual(['profiles', 'publications']);
    expect(complete('/pro')).toEqual(['profiles']);
  });
  it('returns homepage content', () => {
    expect(execute('about', { about: { title: 'About', lines: [{ text: 'Profile' }] } }, []).lines.at(-1)?.text).toBe('Profile');
  });
  it('supports CLI-style slash aliases', () => {
    expect(execute('/help', {}, []).code).toBe(0);
    expect(execute('/welcome', {}, []).action).toBe('welcome');
  });
  it('validates arguments without evaluating input', () => {
    for (const input of ['__proto__', 'constructor', 'about extra', 'theme blue', 'theme dark extra']) expect(execute(input, {}, []).code).toBe(1);
    expect(execute('theme dark', {}, []).theme).toBe('dark');
  });
  it('offers prefix completion only for command names', () => {
    expect(complete('ex')).toEqual(['experience']);
    expect(complete('/pub')).toEqual(['publications']);
    expect(complete('theme dark')).toEqual([]);
    expect(complete('toString')).toEqual([]);
  });
  it('shows the welcome banner without style arguments', () => {
    expect(execute('welcome', {}, [])).toMatchObject({ action: 'welcome', code: 0 });
    expect(execute('/welcome', {}, [])).toMatchObject({ action: 'welcome', code: 0 });
    expect(execute('welcome extra', {}, []).code).toBe(1);
  });
  it('returns to the GUI homepage with gui, including the slash alias', () => {
    for (const input of ['gui', '/gui', 'GUI']) expect(execute(input, {}, [])).toEqual({ action: 'gui', lines: [], code: 0 });
    expect(execute('gui extra', {}, []).code).toBe(1);
    expect(execute('home', {}, []).code).toBe(1);
    expect(execute('help', {}, []).lines.find(line => line.text.trimStart().startsWith('gui '))?.text).toContain('Return to the GUI homepage');
    expect(execute('about', {}, []).lines[0].text).toContain('with gui');
  });
});

describe('session history', () => {
  it('restores the draft after browsing history', () => {
    const history = new CommandHistory();
    history.add('about'); history.add('education');
    expect(history.move(-1, 'draft')).toBe('education');
    expect(history.move(-1, 'education')).toBe('about');
    expect(history.move(1, 'about')).toBe('education');
    expect(history.move(1, 'education')).toBe('draft');
  });
  it('bounds history and deduplicates consecutive entries', () => {
    const history = new CommandHistory();
    history.add('help'); history.add('help');
    expect(history.entries).toEqual(['help']);
    for (let i = 0; i < 150; i++) history.add(`command ${i}`);
    expect(history.entries).toHaveLength(100);
  });
});
