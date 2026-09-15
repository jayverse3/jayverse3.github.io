import type { Line, Section } from './shell';
import { plainText } from './shell';

const normalize = (value: string): string => plainText(value.replace(/\s+/g, ' '));
const text = (element: Element | null): string => normalize(element?.textContent ?? '').trim();

function contentLine(element: Element | null, stripPrefix?: RegExp): Line {
  if (!element) return { text: '' };
  const value = text(element);
  const offset = stripPrefix ? value.match(stripPrefix)?.[0].length ?? 0 : 0;
  const bold: NonNullable<Line['bold']> = [];
  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  for (const emphasis of element.querySelectorAll('strong, b')) {
    range.setEndBefore(emphasis);
    const leadingSpace = emphasis.textContent?.match(/^\s*/)?.[0] ?? '';
    const start = Math.max(0, normalize(range.toString() + leadingSpace).trimStart().length - offset);
    range.setEndAfter(emphasis);
    const end = normalize(range.toString()).trim().length - offset;
    if (start < end) bold.push({ start, end });
  }
  return { text: value.slice(offset), ...(bold.length ? { bold } : {}) };
}

export function sentenceLines(paragraphs: readonly Line[]): Line[] {
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const lines: Line[] = [];
  for (const paragraph of paragraphs) {
    for (const { segment, index } of segmenter.segment(paragraph.text)) {
      if (!segment.trim()) continue;
      const start = index + segment.length - segment.trimStart().length;
      const end = index + segment.trimEnd().length;
      const bold = (paragraph.bold ?? []).map(range => ({ start: Math.max(start, range.start) - start, end: Math.min(end, range.end) - start })).filter(range => range.start < range.end);
      lines.push({ text: segment.trim(), wrap: 'viewport', ...(bold.length ? { bold } : {}) });
    }
  }
  return lines;
}

export function aboutLines(paragraphs: readonly Line[]): Line[] {
  return [{ text: 'Hi there, my name is Yingjie Yang.', wrap: 'viewport' }, ...sentenceLines(paragraphs)];
}

export function contactSection(settings: DOMStringMap): Section {
  const email = settings.email ?? '';
  return {
    title: 'Contact',
    lines: [{ text: email, link: { label: 'Email', href: `mailto:${email}` } }],
  };
}

export function profilesSection(settings: DOMStringMap): Section {
  return {
    title: 'Profiles',
    lines: [
      { text: settings.github ?? '', link: { label: 'GitHub', href: settings.github ?? '' } },
      { text: settings.scholar ?? '', link: { label: 'Google Scholar', href: settings.scholar ?? '' } },
    ],
  };
}

export function readContent(source: DocumentFragment, settings: DOMStringMap): Record<string, Section> {
  function sectionNodes(id: string): Element[] {
    const nodes: Element[] = [];
    let node = source.querySelector(`h2#${id}`)?.nextElementSibling;
    while (node && node.tagName !== 'H2') { nodes.push(node); node = node.nextElementSibling; }
    return nodes;
  }

  function cards(id: string): Line[] {
    const lines: Line[] = [];
    for (const container of sectionNodes(id)) {
      for (const card of container.querySelectorAll('.profile-card')) {
        if (lines.length) lines.push({ text: '' });
        lines.push({ ...contentLine(card.querySelector('h3')), style: 'heading' });
        const date = contentLine(card.querySelector('.profile-card__dates'));
        if (date.text) lines.push({ ...date, style: 'muted' });
        const subtitle = contentLine(card.querySelector('.profile-card__subtitle'));
        if (subtitle.text) lines.push(subtitle);
        const description = contentLine(card.querySelector('.profile-card__description'));
        if (description.text) lines.push({ text: '' }, ...sentenceLines([description]));
        if (id === 'publications') {
          for (const detail of card.querySelectorAll('p.profile-card__detail')) lines.push({ ...contentLine(detail), style: 'muted' });
          lines.push(contentLine(card.querySelector('.profile-card__tag')));
          for (const link of card.querySelectorAll<HTMLAnchorElement>('.profile-card__links a')) {
            const label = link.cloneNode(true) as HTMLAnchorElement;
            label.querySelectorAll('[aria-hidden="true"]').forEach(icon => icon.remove());
            lines.push({ text: link.href, link: { label: text(label), href: link.href } });
          }
        }
      }
    }
    return lines;
  }

  const url = (value: string | undefined): string => new URL(value || '/', location.href).href;
  return {
    about: { title: 'About', lines: aboutLines(sectionNodes('about').filter(node => node.tagName === 'P').map(element => contentLine(element))) },
    news: { title: 'News', lines: sentenceLines(sectionNodes('news').flatMap(node => [...node.querySelectorAll('li')].map(item => contentLine(item, /^🔥\s*/)))) },
    education: { title: 'Education', lines: cards('education') },
    experience: { title: 'Experience', lines: cards('experience') },
    publications: { title: 'Publications', lines: cards('publications') },
    cv: { title: 'Curriculum Vitae', lines: [
      { text: url(settings.cv), link: { label: 'Web CV', href: url(settings.cv) } },
      { text: url(settings.pdf), link: { label: 'PDF', href: url(settings.pdf) } },
    ] },
    contact: contactSection(settings),
    profiles: profilesSection(settings),
  };
}
