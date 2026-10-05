import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from 'cheerio';
import { ExpressiveCode, loadShikiTheme, pluginFramesTexts } from 'expressive-code';
import { pluginCollapsibleSections, pluginCollapsibleSectionsTexts } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { toHtml } from 'hast-util-to-html';
import { bundledLanguagesInfo } from 'shiki/langs';

// Use the highlighter's own names and aliases instead of maintaining a second list.
const languageNames = new Map(bundledLanguagesInfo.flatMap(({ id, name, aliases = [] }) =>
  [id, ...aliases].map(alias => [alias, name])
));

pluginFramesTexts.addLocale('zh-Hans', {
  terminalWindowFallbackTitle: '终端',
  copyButtonTooltip: '复制代码',
  copyButtonCopied: '已复制'
});
pluginCollapsibleSectionsTexts.addLocale('zh-Hans', { collapsedLines: '已折叠 {lineCount} 行' });

export async function createCodeRenderer() {
  return new ExpressiveCode({
    themes: await Promise.all(['github-light', 'github-dark'].map(loadShikiTheme)),
    useDarkModeMediaQuery: false,
    themeCssSelector: theme => `[data-theme="${theme.type}"]`,
    plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
    defaultProps: { showLineNumbers: false, collapseStyle: 'collapsible-auto' },
    // Copy the actual snippet, including comments in shell examples.
    frames: { removeCommentsWhenCopyingTerminalFrames: false },
    styleOverrides: { codeFontSize: '0.8rem', codeLineHeight: '1.6' }
  });
}

export async function renderPost(html, renderer, { locale = 'en', assets = [] } = {}) {
  const $ = load(html);
  const blocks = $('.blog-post__body pre > code').filter((_, code) => !$(code).closest('.expressive-code').length);
  if (!blocks.length) return { html, count: 0 };
  const styles = new Set();

  for (const codeNode of blocks.toArray()) {
    const code = $(codeNode);
    const pre = code.parent();
    const wrapper = pre.closest('div.highlighter-rouge');
    const target = wrapper.length ? wrapper : pre;
    const languageClasses = code.closest('[class*="language-"]').attr('class') || '';
    const language = /(?:^|\s)language-([^\s]+)/.exec(languageClasses)?.[1] || 'text';
    const meta = code.closest('[data-ec-meta]').attr('data-ec-meta') || '';
    const result = await renderer.render({ code: code.text(), language, meta, locale });
    for (const style of result.styles) styles.add(style);
    const rendered = $(toHtml(result.renderedGroupAst));
    rendered.find('pre[data-language]').attr('data-language-label', languageNames.get(language) || 'Plain Text');
    target.replaceWith(rendered);
  }

  for (const asset of assets) {
    if (asset.endsWith('.css')) $('head').append($('<link>').attr({ rel: 'stylesheet', href: asset }));
    else $('body').append($('<script>').attr({ type: 'module', src: asset }));
  }
  // Per-block marker/collapse styles belong to the article, not a global cache.
  if (styles.size) $('head').append($('<style data-expressive-code>').text([...styles].join('\n')));
  return { html: $.html(), count: blocks.length };
}

export async function renderSite({ destination, baseUrl = '', posts }) {
  const root = path.resolve(destination);
  const renderer = await createCodeRenderer();
  const assetDirectory = path.join(root, 'assets', 'expressive-code');
  const assets = [];
  const license = await readFile(new URL('../node_modules/expressive-code/LICENSE', import.meta.url), 'utf8');
  async function emitAsset(content, extension) {
    content = `/*! Expressive Code\n${license.trim()}\n*/\n${content}`;
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
    const name = `${hash}.${extension}`;
    await mkdir(assetDirectory, { recursive: true });
    await writeFile(path.join(assetDirectory, name), content);
    assets.push(`${baseUrl.replace(/\/$/, '')}/assets/expressive-code/${name}`);
  }

  let count = 0;
  for (const post of posts) {
    const filename = path.resolve(post.path);
    const relative = path.relative(root, filename);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || !filename.endsWith('.html')) {
      throw new Error(`Article must be an HTML file inside the build destination: ${filename}`);
    }
    const html = await readFile(filename, 'utf8');
    if (!assets.length && html.includes('<pre')) {
      await emitAsset(`${await renderer.getBaseStyles()}\n${await renderer.getThemeStyles()}`, 'css');
      for (const script of await renderer.getJsModules()) await emitAsset(script, 'js');
    }
    const result = await renderPost(html, renderer, { locale: post.lang, assets });
    if (result.count) await writeFile(filename, result.html);
    count += result.count;
  }
  return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    console.log(`Rendered ${await renderSite(JSON.parse(input))} code blocks.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
