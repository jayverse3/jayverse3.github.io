import { describe, expect, it } from 'vitest';
import { aboutLines, contactSection, profilesSection, sentenceLines } from './content';
import { execute } from './shell';

describe('terminal prose layout', () => {
  it('starts each sentence on a new line without adding the About greeting', () => {
    expect(sentenceLines([{ text: 'We build agents. We synthesize data! What comes next?' }])).toEqual([
      { text: 'We build agents.', wrap: 'viewport' },
      { text: 'We synthesize data!', wrap: 'viewport' },
      { text: 'What comes next?', wrap: 'viewport' },
    ]);
  });

  it('keeps long sentences intact for viewport wrapping instead of a 100-character limit', () => {
    const text = 'Collaborated with the Seed team to improve Seed models’ agentic coding and GUI capabilities by synthesizing high-quality mid-training and post-training data.';
    expect(text.length).toBeGreaterThan(100);
    expect(sentenceLines([{ text }])).toEqual([{ text, wrap: 'viewport' }]);
  });

  it('keeps dates, model versions, scores and degree abbreviations intact', () => {
    const sentences = ['[2026.06] We released Seed2.1.', 'The Terminal-Bench 2.1 score rose from 71.0 to 84.7.', 'I am an M.S. student.'];
    expect(sentenceLines([{ text: sentences.join(' ') }]).map(line => line.text)).toEqual(sentences);
  });

  it('preserves bold ranges across sentences and ignores empty paragraphs', () => {
    const text = '  First sentence. Second sentence.  ';
    expect(sentenceLines([{ text: '' }, { text, bold: [{ start: 2, end: text.length - 2 }] }, { text: ' ' }])).toEqual([
      { text: 'First sentence.', wrap: 'viewport', bold: [{ start: 0, end: 15 }] },
      { text: 'Second sentence.', wrap: 'viewport', bold: [{ start: 0, end: 16 }] },
    ]);
  });
});

describe('terminal about content', () => {
  it('adds the greeting and gives each sentence its own full-width line', () => {
    const sentences = [
      'I am a master’s student in the School of Computer Science at Peking University.',
      'My research interests include LLM post-training, agentic reinforcement learning, and data synthesis.',
      'I am currently a research intern at Baidu and previously interned at ByteDance.',
      'My long-term goal is to advance AI from assisting humans to autonomously solving problems through code.',
    ];
    expect(aboutLines([{ text: sentences.join(' ') }])).toEqual(
      ['Hi there, my name is Yingjie Yang.', ...sentences].map(text => ({ text, wrap: 'viewport' })),
    );
  });

  it('preserves abbreviations and supports multiple paragraphs', () => {
    expect(aboutLines(['I am an M.S. student. I build agents!', '', 'What comes next? More research.'].map(text => ({ text }))).map(line => line.text)).toEqual([
      'Hi there, my name is Yingjie Yang.',
      'I am an M.S. student.',
      'I build agents!',
      'What comes next?',
      'More research.',
    ]);
  });

  it('preserves the exact emphasized occurrence after splitting sentences', () => {
    const text = 'Baidu is mentioned. I work at Baidu.';
    const start = text.lastIndexOf('Baidu');
    expect(aboutLines([{ text, bold: [{ start, end: start + 'Baidu'.length }] }]).slice(1)).toEqual([
      { text: 'Baidu is mentioned.', wrap: 'viewport' },
      { text: 'I work at Baidu.', wrap: 'viewport', bold: [{ start: 10, end: 15 }] },
    ]);
  });

  it('keeps emphasis that spans sentence boundaries', () => {
    const text = 'First sentence. Second sentence.';
    const lines = aboutLines([{ text, bold: [{ start: 0, end: text.length }] }]).slice(1);
    expect(lines.map(line => line.bold)).toEqual([
      [{ start: 0, end: 'First sentence.'.length }],
      [{ start: 0, end: 'Second sentence.'.length }],
    ]);
  });
});

describe('terminal contact content', () => {
  const settings = { email: 'hello@example.com', github: 'https://github.com/example', scholar: 'https://scholar.google.com/citations?user=example' };

  it('shows only the email under contact', () => {
    expect(contactSection(settings)).toEqual({
      title: 'Contact',
      lines: [{ text: settings.email, link: { label: 'Email', href: 'mailto:hello@example.com' } }],
    });
  });

  it('shows only GitHub and Google Scholar under profiles', () => {
    expect(profilesSection(settings)).toEqual({
      title: 'Profiles',
      lines: [
        { text: settings.github, link: { label: 'GitHub', href: settings.github } },
        { text: settings.scholar, link: { label: 'Google Scholar', href: settings.scholar } },
      ],
    });
  });

  it('dispatches contact and profiles independently, including slash aliases', () => {
    const sections = { contact: contactSection(settings), profiles: profilesSection(settings) };
    for (const name of ['contact', 'profiles'] as const) {
      for (const prefix of ['', '/']) {
        const result = execute(prefix + name, sections, []);
        expect(result.code).toBe(0);
        expect(result.lines.slice(2)).toEqual(sections[name].lines);
      }
    }
  });
});
