import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { load } from 'cheerio';
import { spawnSync } from 'node:child_process';
import { createCodeRenderer, renderPost, renderSite } from './render-code-blocks.mjs';

const renderer = await createCodeRenderer();
const snippet = 'def hello():\n    print("你好 <world> & friends")\n\nhello()\n';

test('official fence options survive the real Jekyll parser, including nested and literal fences', async () => {
  const examples = [
    ['```python title="hello.py" showLineNumbers {2} collapse={3-4}', snippet.trimEnd(), '```'].join('\n'),
    ['> ```python title="quote.py" {1}', '> print("quoted")', '> ```', '', '- Example:', '', '  ```python title="list.py" showLineNumbers', '  print("listed")', '  ```'].join('\n'),
    ['~~~python title="a & <b>.py" del={1} ins={2} "after"', 'before = 1', 'after = 2', '~~~~'].join('\r\n'),
    ['````markdown title="syntax.md"', '```python title="literal.py" {1}', 'print("literal")', '```', '````'].join('\n'),
    ['# Unchanged Markdown', '', '**Bold** and `inline`, $$x_i$$.', '', '| A | B |', '| - | - |', '| 1 | 2 |', '', '- [x] Done', '', '> A quote.', '', '```python', snippet.trimEnd(), '```', '', '    indented_code()', '', '```', 'plain text', '```'].join('\n'),
    ['````markdown', '```python title="example.py" showLineNumbers', 'print("example")', '```', '````'].join('\n')
  ];
  const result = spawnSync('ruby', ['-rbundler/setup', path.join(import.meta.dirname, 'code-blocks-markdown-fixture.rb')], {
    cwd: path.resolve(import.meta.dirname, '..'), input: JSON.stringify(examples), encoding: 'utf8', timeout: 30000
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  const render = async index => load((await renderPost(`<html><head></head><body><div class="blog-post__body">${parsed[index].html}</div></body></html>`, renderer)).html);

  const first = await render(0);
  assert.equal(first('.frame .title').text(), 'hello.py');
  assert.equal(first('.ec-line.mark').length, 1);
  assert.ok(first('.ln').length);
  assert.equal(first('.ec-section details').length, 1);
  assert.equal(first('.copy button').attr('data-code').replaceAll('\u007f', '\n'), snippet.trimEnd());

  const nested = await render(1);
  assert.equal(nested('blockquote .frame .title').text(), 'quote.py');
  assert.equal(nested('li .frame .title').text(), 'list.py');
  const escaped = await render(2);
  assert.equal(escaped('.frame .title').text(), 'a & <b>.py');
  assert.equal(escaped('.ec-line.ins').length, 1);
  assert.equal(escaped('.ec-line.del').length, 1);
  assert.equal(escaped('.frame .title b').length, 0);
  const literal = await render(3);
  assert.equal(literal('.expressive-code').length, 1);
  assert.equal(literal('.frame .title').text(), 'syntax.md');
  assert.match(literal('.copy button').attr('data-code'), /```python title="literal.py" \{1\}/);
  for (const index of [4, 5]) assert.equal(parsed[index].html, parsed[index].baseline, 'Ordinary GFM output must not change');
});

function article({ code = snippet, language = 'python', meta = '' } = {}) {
  const $ = load('<!doctype html><html><head><title>Article</title></head><body><div class="blog-post__body"><h2 id="math">Math</h2><p>Keep $$x_i$$ and <code>inline</code>.</p><div class="highlighter-rouge"><div class="highlight"><pre class="highlight"><code></code></pre></div></div></div><pre><code>outside article</code></pre></body></html>');
  $('.highlighter-rouge').addClass('language-' + language).attr('data-ec-meta', meta);
  $('.blog-post__body pre > code').text(code);
  return $.html();
}

test('renders static highlights, preserving prose, math, and original copy text', async () => {
  const result = await renderPost(article(), renderer);
  const $ = load(result.html);
  assert.equal(result.count, 1);
  assert.equal($('.expressive-code').length, 1);
  assert.equal($('.highlighter-rouge').length, 0);
  assert.equal($('.expressive-code .copy button').attr('data-code').replaceAll('\u007f', '\n'), snippet.trimEnd());
  assert.match($('.blog-post__body p').html(), /\$\$x_i\$\$/);
  assert.equal($('#math').text(), 'Math');
  assert.equal($('body > pre code').text(), 'outside article');
  assert.equal($('.expressive-code .ln').length, 0);
  assert.ok($('.expressive-code span[style*="--0:"]').length);
});

test('supports titles, line numbers, line markers, and collapsible sections', async () => {
  const { html } = await renderPost(article({ meta: 'title="hello.py" showLineNumbers {2} collapse={3-4}' }), renderer, { locale: 'zh-Hans' });
  const $ = load(html);
  assert.equal($('.frame .title').text(), 'hello.py');
  assert.ok($('.ln').length);
  assert.equal($('.ec-line.mark').length, 1);
  assert.equal($('.ec-section details').length, 1);
  assert.match($('details summary').text(), /已折叠 2 行/);
  assert.equal($('.copy button').attr('title'), '复制代码');
});

test('supports terminal frames without stripping shell comments from copying', async () => {
  const code = '# Keep this explanation\nprintf "done\\n"\n';
  const { html } = await renderPost(article({ code, language: 'bash' }), renderer);
  const $ = load(html);
  assert.equal($('.frame.is-terminal').length, 1);
  assert.equal($('.copy button').attr('data-code').replaceAll('\u007f', '\n'), code.trimEnd());
});

test('renders unknown languages as readable text', async () => {
  const { html } = await renderPost(article({ language: 'unknown-example-language' }), renderer);
  assert.equal(load(html)('.expressive-code').length, 1);
  assert.equal(load(html)('.expressive-code pre').attr('data-language-label'), 'Plain Text');
});

test('uses canonical language names for aliases and Plain Text for unspecified languages', async () => {
  for (const [expected, aliases] of [
    ['TypeScript', ['ts', 'typescript']],
    ['JavaScript', ['js', 'javascript']],
    ['C++', ['cpp', 'c++']],
    ['Python', ['py', 'python']],
    ['JSON', ['json']],
    ['Markdown', ['md', 'markdown']],
    ['Shell', ['bash', 'sh']],
    ['Plain Text', ['', 'text', 'txt', 'plaintext']]
  ]) {
    for (const language of aliases) {
      const { html } = await renderPost(article({ language, code: 'example' }), renderer);
      const $ = load(html);
      assert.equal($('.expressive-code pre').attr('data-language-label'), expected, language);
      assert.equal($('.copy button').attr('data-code'), 'example', 'The badge is not part of copied code');
    }
  }
  const bare = '<div class="blog-post__body"><pre><code>no language class</code></pre></div>';
  const { html } = await renderPost(bare, renderer);
  assert.equal(load(html)('.expressive-code pre').attr('data-language-label'), 'Plain Text');
});

test('does not touch pages without article code or process a block twice', async () => {
  const plain = '<html><body><pre><code>homepage example</code></pre></body></html>';
  assert.deepEqual(await renderPost(plain, renderer), { html: plain, count: 0 });
  const first = await renderPost(article(), renderer);
  assert.deepEqual(await renderPost(first.html, renderer), { html: first.html, count: 0 });
});

test('uses the existing data-theme switch, not OS media queries', async () => {
  const css = await renderer.getThemeStyles();
  assert.match(css, /data-theme[=\s"']+dark/);
  assert.doesNotMatch(css, /prefers-color-scheme/);
});

test('emits local assets with baseurl support and leaves source outside destination untouched', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'expressive-code-test-'));
  const filename = path.join(directory, 'article.html');
  await writeFile(filename, article());
  assert.equal(await renderSite({ destination: directory, baseUrl: '/portfolio', posts: [{ path: filename, lang: 'en' }] }), 1);
  const $ = load(await readFile(filename, 'utf8'));
  const urls = [...$('link[rel="stylesheet"]').map((_, element) => $(element).attr('href')).get(), ...$('script[type="module"]').map((_, element) => $(element).attr('src')).get()];
  assert.ok(urls.length >= 2);
  for (const url of urls) {
    assert.match(url, /^\/portfolio\/assets\/expressive-code\//);
    assert.match(await readFile(path.join(directory, url.slice('/portfolio/'.length)), 'utf8'), /Copyright \(c\) 2023 Tibor Schiemann/);
  }
  await assert.rejects(renderSite({ destination: directory, posts: [{ path: path.join(directory, '..', 'outside.html') }] }), /inside the build destination/);
});
