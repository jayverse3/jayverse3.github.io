# Yingjie Yang's personal website

A Jekyll website based on Academic Pages. The current public pages are Home, CV, and 404, with RSS, an XML sitemap, and redirects from older About/CV URLs.

Production URL: https://jayverse3.github.io/

## Content and layout

| Edit | File |
| --- | --- |
| Personal information and production settings | `_config.yml` |
| Homepage, news, education, experience, publications | `_pages/about.md` |
| HTML CV | `_pages/cv.md` |
| Downloadable English CV | `files/yingjie-yang-cv.pdf` |
| Top navigation | `_data/navigation.yml` |
| Shared page / CV layout | `_layouts/single.html`, `_layouts/cv.html` |
| Sidebar profile | `_includes/author-profile.html` |
| Colors | `_sass/theme/_default_light.scss`, `_sass/theme/_default_dark.scss` |
| Cards and welcome spacing | `_sass/layout/_page.scss` |
| CV styling | `_sass/layout/_cv.scss` |
| Chapter navigation | `_includes/section-nav.html`, `_sass/layout/_section-nav.scss`, `assets/js/section-nav.js` |
| Back to top | `_includes/back-to-top.html`, `_sass/layout/_back-to-top.scss`, `assets/js/back-to-top.js` |

School, company, and model logos use separate color and white SVGs. Their source and license notes remain in `images/*-source.md`, which are excluded from the published site. Keep the root `LICENSE` and relevant asset notices.

## Local preview

Ruby and Bundler are required:

```sh
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

Open http://localhost:4000/ to match the origin used by Jekyll's generated asset URLs. On Windows, add `--force_polling` if file changes are not detected. Restart the preview after editing `_config.yml`.

Production-style validation:

```sh
bundle exec jekyll build --safe --strict_front_matter
```

Use `JEKYLL_ENV=production` for production builds (`$env:JEKYLL_ENV = 'production'` in PowerShell). Jekyll generates `_site/`; never edit that output directly.

## JavaScript

jQuery is still used by responsive navigation and the mobile profile menu. To rebuild the checked-in bundle after editing `assets/js/_main.js` or `assets/js/plugins/jquery.greedy-navigation.js`:

```sh
npm install
npm run build:js
```

`npm run watch:js` is available during development. Node.js is only needed to rebuild the bundle, not for Jekyll or GitHub Pages deployment. The welcome, section-navigation, and back-to-top scripts are loaded directly and need no npm rebuild.

Unused Plotly/Mermaid integrations are removed. Formula rendering is opt-in: add `math: true` to an article's front matter to load MathJax only there.

## Publishing

GitHub Pages uses **Deploy from a branch → master → /(root)**. Pushing this repository to `master` triggers GitHub's built-in Jekyll build and deployment. No custom deployment workflow is needed.

The repository contains source files; the published site contains the generated HTML/CSS and necessary static assets. `_config.yml` excludes dependencies, local checks, documentation, source-only scripts, and asset notes. `.gitignore` controls Git tracking separately.

Blog demos have been removed. When real posts are ready, create `_posts/YYYY-MM-DD-title.md`, remove `_posts` from `exclude`, and add a blog index/navigation entry. Basic article layout, code highlighting, tables, and RSS support are retained.

## Credits

Based on [Academic Pages](https://academicpages.github.io/) and [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/). See `LICENSE` for the MIT license and original copyright notices.
