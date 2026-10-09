# Yingjie Yang's personal website

个人主页，基于 Academic Pages / Minimal Mistakes，使用 Jekyll 发布到 GitHub Pages。

- 线上地址：[jayverse3.github.io](https://jayverse3.github.io/)
- 页面：中英文 Home / Blog / HTML CV、英文 Terminal / 404，附带两种语言的 PDF、RSS、sitemap 和旧地址重定向。Blog 无文章时显示 Coming soon。
- 代码助手先读：[AGENTS.md](AGENTS.md)。
- Terminal 专项说明：[_terminal/README.md](_terminal/README.md)。

### 中英文页面

主页、Blog 和 CV 使用独立语言网址，共用布局和样式；Terminal 仅提供英文。

| 页面 | 英文 | 简体中文 | `translation_key` |
| --- | --- | --- | --- |
| 首页 | `/` | `/zh/` | `home` |
| Blog | `/blog/` | `/zh/blog/` | `blog` |
| HTML CV | `/cv/` | `/zh/cv/` | `cv` |

顶部语言入口在英文页显示「中文」、中文页显示「EN」，跳转到另一语言的对应页面；首页/Blog/CV 导航保持当前语言。有译文时使用普通链接，不依赖 JavaScript，不自动检测语言、跳转或保存语言偏好。文章页始终保留语言入口：没有译文时使用按钮，点击显示 3.5 秒轻提示，重复点击重新计时，Escape 可关闭；不改变网址、正文或滚动位置，也不抢走按钮的焦点。无 JS 时该按钮保持可见但禁用，title 说明暂无译文。有译文时不启用提示交互。普通页面（如 404）没有对应译文时仍不显示入口，Terminal 保持英文独立页面。

桌面显示原有文字导航、更新时间和工具按钮。925px 及以下启用单行手机顶栏：左侧语言、RSS、主题按钮后接更新时间，右侧为双横线菜单按钮；Terminal 入口隐藏，但不限制直接访问其网址。菜单在按钮下方展开紧凑小弹窗，宽度随实际栏目文字自适应且不超出视口，仅放 Home / Blog / CV 等栏目，不遮盖整屏、不锁定页面滚动。再次点击按钮、点击外部、焦点移出、按 Escape 或选择栏目均会关闭；Escape 返回按钮焦点，切回桌面和离开页面时也会关闭。桌面与手机的栏目共用一份 Liquid 渲染结果，仍从 `_data/navigation.yml` 维护；禁用 JS 时保留直接导航链接作为回退。`assets/js/src/navigation.js` 同时维护固定页头与正文、侧栏的间距。缺译文提示仍在菜单外，仅用于顶栏语言按钮。

中英文 CV 分别下载对应语言的 PDF；Terminal 的 `home` / `cv` 命令仍使用英文主页、网页 CV 和英文 PDF。英文网址及旧地址重定向保持不变。顶部「Last updated in」在两种语言下均保留英文；页面内日期使用各语言的显示格式。

`_includes/seo.html` 统一生成页面标题、描述、canonical 和 Open Graph 信息。英文站点标题、默认描述和 locale 只在 `_config.yml` 定义，中文覆盖值配置在 `_data/i18n.yml` 的 `zh-Hans.seo` 下；单页描述用 front matter 的 `description` 覆盖。当前页与译文的 Open Graph locale 均回退到 `_config.yml` 的 `locale`，输出时将 `en-US` 转为 `en_US`，不重复维护英文值。每个语言版本的 canonical 指向自身；有对应译文时，按 `translation_key` 自动生成包含自身的 `en` / `zh-Hans` 链接，`x-default` 指向对应英文页。Terminal / 404 不输出译文链接。已有 sitemap 插件收录两种语言的 Home/CV，无需另写一套语言网址映射。

`_data/i18n.yml` 管理中英文网页界面标签，`_data/profile.yml` 管理全站侧栏个人资料与首页正文，`_data/cv.yml` 独立管理网页 CV 正文。主页与 CV 可以采用不同的摘要、条目和详细程度，不自动同步或相互回退；需要同时修改时分别编辑。每份数据内部的日期、链接等事实在中英文间共用，正文放在对应语言块中。同类页面的中英文版本使用同一模板，不复制另一套 HTML/CSS。研究成果标题、工具与算法名称保留原文。Terminal 直接复用英文首页内容模板，不读取 CV 正文。

## 1. 全新开发环境

以下命令除非特别说明，均在仓库根目录执行。无需后端、数据库、API Key 或 `.env`。

### 安装工具

2026-09-15 在 Windows 上验证过的基线如下；这是已验证组合，不是要求追踪所有工具的最新版本。

| 工具 | 版本 / 用途 |
| --- | --- |
| Git | 克隆、版本管理和推送 |
| Ruby | 已验证 3.3.12，建议使用 3.3.x 系列建立本项目环境 |
| Bundler | 已验证 2.5.22，用于安装 Gemfile 依赖 |
| Node.js / npm | 已验证 Node 24.21.0 / npm 11.19.0，用于编译浏览器脚本和构建博客代码块 |
| Jekyll | 已验证 3.10.0，由 Gemfile 的 `github-pages` 间接安装，不单独安装最新 Jekyll |

Windows：

1. 安装 Git，确保命令行能运行 `git`。
2. 安装 [RubyInstaller 的 Ruby+Devkit](https://rubyinstaller.org/downloads/)，优先选择上面的 Ruby 系列；随后运行 `ridk install`，安装 MSYS2 / MINGW 开发工具链，以便编译原生 gem。参见 [Jekyll Windows 指南](https://jekyllrb.com/docs/installation/windows/)。
3. 安装 [Node.js 24 LTS](https://nodejs.org/en/download)，安装包包含 npm。
4. 重新打开终端，使 PATH 生效。

macOS / Linux：按 [Ruby 安装指南](https://www.ruby-lang.org/en/documentation/installation/)安装 Ruby 和编译工具，建议通过版本管理器选择 3.3.x，避免改动系统自带 Ruby；再安装 Git 和 Node 24。之后使用相同的仓库命令。本机实测平台是 Windows，不把其他平台视为已完成验证。

检查工具：

```sh
git --version
ruby --version
gem --version
node --version
npm --version
```

PowerShell 若提示禁止执行 `npm.ps1`，将本文的 `npm` 换成 `npm.cmd` 即可，不必修改全局执行策略。

### 克隆与安装依赖

```sh
git clone https://github.com/jayverse3/jayverse3.github.io.git
cd jayverse3.github.io
gem install bundler -v 2.5.22
bundle config set --local path vendor/bundle
bundle install
npm ci
npm --prefix _terminal ci
```

需要能访问 GitHub、RubyGems 和 npm registry。换机器前先提交并推送要保留的工作，克隆不会带上原机器未提交的文件。

这里有两套独立的 npm 依赖，不能只装其中一套：

| 位置 | 安装方式 | 锁文件约定 |
| --- | --- | --- |
| 根目录 | `npm ci` | 根 `package-lock.json` 必须纳入 Git，与 package.json 同步 |
| `_terminal/` | `npm --prefix _terminal ci` | `_terminal/package-lock.json` 必须纳入 Git，与 package.json 同步 |
| Ruby | `bundle install` | 本地生成的 `Gemfile.lock` 当前被忽略 |

两套 npm 依赖均使用锁文件；Ruby 依赖尚未完全锁定，首次安装或显式更新后需要重新验证。不要把旧机器的 `node_modules`、`vendor`、`.bundle` 直接复制到另一个系统，也不要把依赖升级混在普通内容修改里。

### 首次构建与预览

```sh
npm run build:js
npm --prefix _terminal test
npm --prefix _terminal run build
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

打开英文首页 <http://localhost:4000/>、英文 CV <http://localhost:4000/cv/>、中文首页 <http://localhost:4000/zh/>、中文 CV <http://localhost:4000/zh/cv/>；另检查 Blog 占位页 <http://localhost:4000/blog/> / <http://localhost:4000/zh/blog/>、<http://localhost:4000/terminal/> 和 <http://localhost:4000/404.html>。

按 Ctrl+C 停止预览。不要双击 Markdown / HTML 文件，也不要只启动 Vite：Terminal 需要 Jekyll 生成的布局和内容模板。无需为了本地预览修改 `_config.yml` 的线上 `url`。

若当前终端之前设置过生产环境，先恢复开发模式：

```powershell
$env:JEKYLL_ENV = 'development'
```

macOS / Linux 对应 `export JEKYLL_ENV=development`。Windows 文件修改未被监听时，在 serve 命令末尾添加 `--force_polling`。修改 `_config.yml` 或 `_plugins/` 后重启 Jekyll。构建博客代码块需要 Node 在 PATH 中；不要使用 `--safe`，它会禁用本地插件。本地预览原理见 [GitHub 官方指南](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)。

## 2. 日常开发：修改哪里

| 要修改的内容 | 源文件 |
| --- | --- |
| 站点地址、联系链接、规范作者名、发布排除规则 | [_config.yml](_config.yml) |
| 全站侧栏个人资料、首页/Terminal 正文、日期、Logo、项目链接 | [_data/profile.yml](_data/profile.yml) |
| 网页 CV 的教育、经历、研究成果、奖项与技能 | [_data/cv.yml](_data/cv.yml) |
| 网页界面标签、章节名称、日期显示格式 | [_data/i18n.yml](_data/i18n.yml) |
| 页面标题、描述、canonical、语言对应链接 | [_includes/seo.html](_includes/seo.html)、[_data/i18n.yml](_data/i18n.yml) 的 `seo`、页面 front matter |
| 中英文页面配置 | [_pages/home.md](_pages/home.md)、[_pages/cv.md](_pages/cv.md)、[_pages/zh/](_pages/zh/) |
| 中英文 Blog 占位页 | [_pages/blog.md](_pages/blog.md)、[_pages/zh/blog.md](_pages/zh/blog.md) |
| 首页内容与卡片模板 | [_includes/home-content.html](_includes/home-content.html)、[_includes/profile-card.html](_includes/profile-card.html) |
| HTML CV 内容与条目模板 | [_includes/cv-content.html](_includes/cv-content.html)、[_includes/cv-entry.html](_includes/cv-entry.html) |
| 可下载英文简历 | [files/yingjie-yang-cv.pdf](files/yingjie-yang-cv.pdf) |
| 可下载中文简历 | [files/yingjie-yang-cv-zh.pdf](files/yingjie-yang-cv-zh.pdf) |
| 导航项目 / 顶部图标 | [_data/navigation.yml](_data/navigation.yml)、[_includes/masthead.html](_includes/masthead.html) |
| 通用 / CV / Terminal 布局 | [_layouts/single.html](_layouts/single.html)、[_layouts/cv.html](_layouts/cv.html)、[_layouts/terminal.html](_layouts/terminal.html) |
| 侧栏个人信息 | [_includes/author-profile.html](_includes/author-profile.html) |
| 网页中英文字体、欢迎语字体、网页字体资源地址 | [_data/typography.yml](_data/typography.yml) |
| 字号、断点、网格设置 | [_sass/_settings.scss](_sass/_settings.scss) |
| 浅深色配色 | [_sass/theme/_default_light.scss](_sass/theme/_default_light.scss)、[_sass/theme/_default_dark.scss](_sass/theme/_default_dark.scss) |
| 通用页面 / 首页卡片与欢迎语 / CV 样式 | [_sass/layout/_page.scss](_sass/layout/_page.scss)、[_sass/layout/_home.scss](_sass/layout/_home.scss)、[_sass/layout/_cv.scss](_sass/layout/_cv.scss) |
| 网页导航、主题、Links 菜单 | [assets/js/src/](assets/js/src/) |
| 章节导航 / 返回顶部 / 欢迎语动画 | [assets/js/section-nav.js](assets/js/section-nav.js)、[assets/js/back-to-top.js](assets/js/back-to-top.js)、[assets/js/welcome.js](assets/js/welcome.js) |
| Terminal 命令、内容转换、格式化、输入 | [_terminal/src/](_terminal/src/)，详见其 README |
| 图片、图标及来源说明 | [images/](images/)；manifest 源码为 [images/manifest.liquid](images/manifest.liquid) |

HTML CV 和 PDF 不会自动同步。PDF 的 RenderCV 源码不在本仓库；编辑 PDF 内容前向维护者确认源码位置，不要从 PDF 猜测或重新编造源文件。网页只存放已确认用于公开的通用简历：英文文件为 `files/yingjie-yang-cv.pdf`，中文文件为 `files/yingjie-yang-cv-zh.pdf`。更新时将对应语言的最终 PDF 同步到这些固定文件名，不上传定向投递版、YAML 或排版中间文件。Terminal 继续链接英文 PDF。

网页字体统一在 `_data/typography.yml` 配置：`family` 控制正文及默认继承的字体，`ui_family` 指定中文标题、导航、按钮、日期等界面文字的字体，`welcome_family` 单独控制欢迎语，未设置时继承英文欢迎语字体，也可以用 CSS 变量复用已有字体。中文页面的正文和界面字体栈会自动前置英文页的具体字体（去掉末尾的通用 `sans-serif`，避免它提前接管汉字），让英文和数字优先沿用英文页字体；中文欢迎语通过 `var(--ui-font-family)` 复用界面字体，汉字使用思源黑体，英文使用英文页的无衬线字体。自定义网页字体还需在 `stylesheets` 中提供 CSS 资源地址；只改字体名称无法为未安装字体的访客提供字体文件。资源仅在对应语言页面加载：中文正文用思源宋体，标题、界面文字和欢迎语用思源黑体，均采用分片网页字体；英文页配置保持不变。修改此数据文件后 Jekyll 自动重建，无需修改各组件或重启服务。Terminal 和 PDF 不受此配置影响。

CV 的 LaTeX 标志由 `assets/js/cv.js` 调用 KaTeX 渲染。固定版本的 KaTeX CSS/JS 由 CV 和博客文章共用，配置位于 `_includes/head.html`；博客文章另加载官方 auto-render 扩展。主页和博客列表不加载公式库。CDN 不可用时，CV 保留普通 `LaTeX` 文本，文章保留 TeX 源文本，不影响其余正文。

### 哪些修改需要重建

| 修改 | 操作 | 需要随源码提交的产物 |
| --- | --- | --- |
| Markdown、Liquid、SCSS、图片、直接加载的 JS | Jekyll 自动重建，刷新浏览器 | 不提交 `_site/` |
| `assets/js/src/*.js` | `npm run build:js` | `assets/js/main.min.js` |
| `_terminal/src/*` 或 Terminal 构建配置 | `npm --prefix _terminal run build` | `assets/terminal/terminal.js`、`terminal.css`、`THIRD_PARTY_NOTICES.md` |

Terminal 与主页共用 `home-content.html`，Terminal 固定读取 `_data/profile.yml` 的英文内容。只改数据文案时无需重建 Terminal JS；改标题 ID、卡片类名或 DOM 结构时，还要检查 `_terminal/src/content.ts`。语言分支尚未提供时，模板回退到英文。

主页经历的 `role` 和 `summary` 支持 Markdown 加粗。项目名称直接写入对应语言的 `role`，括号、空格和加粗由正文控制，例如 `Research Intern **(Top Internship Program)**`、`大模型算法研究员**（Top 实习计划）**`，不单独维护 `program` 字段。模型名称直接写在对应语言的正文中；`experience-summary.html` 仅将 `%MODEL_LOGO%` 替换为浅/深色 Logo。Logo 模板和样式不添加间距，两侧空格直接写在主页正文中，例如 `参与 %MODEL_LOGO% 文心基模`。网页 CV 不调用这个模板；在 `_data/cv.yml` 直接编写普通 Markdown 摘要（例如 `参与文心基模的后训练……`），详细工作内容使用 `cv_groups`，没有详细条目时显示 CV 自己的 `summary`。主页中的 Logo、措辞或间距修改不会改变 CV 正文。PDF 下载地址仍由各 CV 页面的 `pdf` 字段控制，不因新增中文页面自动公开其他 PDF。

主页教育与实习卡片的 `url` 指向学校或公司官网：有独立语言入口时分别放在 `en.url` / `zh-Hans.url`，否则使用条目公共 `url`（如 UniPat AI）；模板优先读取当前语言的地址，再回退公共地址。仅名称链接在新标签页打开，Logo、描述和卡片留白不参与跳转。名称默认沿用标题颜色，悬停或键盘聚焦时显示链接颜色与下划线；未配置地址时仍显示普通标题。Terminal 继续提取名称文本，不额外输出官网地址。

主页研究成果可在 `_data/profile.yml` 的条目公共字段中设置 `image`（如 `/images/seed21-cover.png`），中英文共用本地封面。卡片可用宽度达到 700px 时左图右文，较窄时上下排列；图片完整等比显示，使用 6px 轻微圆角，不裁剪。封面仅作展示，不参与跳转；访问项目主页和 Model Card 使用下方文字链接。未配置图片时仍为纯文字卡片。Terminal 只提取原有文字和资源链接，不显示封面。

### Blog 与本地草稿预览

图片、字体与设计方案先放在 `_drafts/` 的临时博客中，以 HTML/CSS/SVG 直接预览，不另行导出封面截图；专用样式留在草稿内，定稿后删除草稿，再将确认的组件接入正式页面。图标、标志等优先使用原生 SVG；官方只提供位图且需保留原样时使用原始素材，不用 SVG 外壳包装 PNG 冒充矢量图。

列表采用与主页一致的单列卡片：默认背景、边框透明，鼠标悬停时显示淡背景与柔和阴影，其余卡片轻微淡出；触屏不启用悬停效果。点击卡片正文或留白进入详情页，标签独立点击筛选。链接使用原生 HTML 和 CSS 扩展点击区域，不以 JavaScript 模拟跳转；键盘可聚焦标题链接。目前没有正式文章，预览样稿已清理，中英文列表分别显示 Coming soon / 敬请期待；博客阅读功能和测试保留。

顶部导航为 Home / Blog / CV。`/blog/` 与 `/zh/blog/` 通过 `_includes/blog-index.html` 显示相同文章列表，界面标签随语言切换，不自动翻译文章。没有文章时显示 Coming soon / 敬请期待；有文章时显示日期、摘要和标签筛选。筛选保存在 URL 的 `#tag=...` 中，支持刷新、前进和后退；禁用 JavaScript 时保留完整文章列表，不显示筛选工具栏。详情页使用 `_layouts/post.html`，样式为 `_sass/layout/_blog.scss`，筛选脚本为 `assets/js/blog.js`，无需新框架或插件。

正式文章放在 `_posts/YYYY-MM-DD-slug.md`，包含 `title`、`lang`、`description`、`tags` 等 front matter；默认文章路径为 `/blog/:title/`，例如 `_posts/2026-10-05-post-training-notes.md` 对应 `/blog/post-training-notes/`。网址使用文件名中日期后面的简短英文名称（也可显式设置 `slug`），页面标题仍由 `title` 决定，两者独立维护。日期保留在文件名和页面元信息中，不放进网址；不同日期的文章也不能重复使用同一个 slug。发布后尽量保持网址不变，中英文译文使用不同 slug。临时预览稿可继续显式指定 `/blog/preview/…/`。

#### 文章发布与分享信息

例如 `_posts/2026-10-05-post-training-notes.md` 的开头可以这样写，日期与内容换成真实信息：

```yaml
---
title: "大语言模型后训练学习笔记"
date: 2026-10-05T10:00:00+08:00
lang: zh-Hans
translation_key: post-training-notes # 同一文章的中英文版本共用；不要使用列表页的 blog 键
description: "这篇文章讨论的具体问题、实验范围和主要结论。"
tags: [LLM, Post-Training]
# author: "Yingjie Yang"          # 可省略，默认使用站点作者；这里只支持姓名字符串
# image: /images/my-post-cover.png # 可省略；填写前先将对应图片加入仓库
# image_alt: "文章分享图的文字说明"
---
```

`date` 是首次发布日期，建议显式填写时区；以后修改文章不改这个字段。`description` 应写文章自己的摘要，未填写时会使用正文摘录。`layout: post` 已由站点默认配置提供，无需每篇重复写。文章模板会输出 `og:type: article`、作者和发布时间，以及 `BlogPosting` 结构化数据；普通主页、列表、CV 和 Terminal 仍保持 `website`，不会混入文章字段。列表卡片和正文页头依次显示发布日期、字数与预计阅读时长，例如 `Date: October 5, 2026 | Word Count: 1,600 | Estimated Reading Time: 8 min`；中文字数显示「全文 1,600 字」，标签与日期格式在 `_data/i18n.yml`。窄屏逐项换行，不显示分隔线。不在这行展示作者，作者仍保留在 SEO 中；引用来源直接在正文中说明。

文章译文分别维护为两份 Markdown，设置相同的 `translation_key`、不同的 `lang: en` / `zh-Hans` 与不同网址（使用不同文件 slug 或明确的 `permalink`）。同一键在同一语言中只对应一篇文章；不要把不同文章配成译文。导航与 SEO 在文章集合 `site.posts` 中查找配对，普通页面仍在 `site.pages` 中查找。有配对时直接切换到对应文章，并生成双方的 hreflang；没有时只提供轻提示，不输出虚假的译文网址或跳回列表。本文不自动生成或在线翻译正文；仅预览的草稿不会进入生产构建的译文链接。两个博客列表目前仍显示全部文章，不自动按语言过滤或去重。

分享图：主页及未配图的页面使用 `_config.yml` 的 `og_image`（当前为 `images/social-preview.png`）；替换该图片即可更换默认设计。文章可在 front matter 设置 `image: /images/my-post-cover.png` 和可选的 `image_alt: 图片说明`，不填写或留空时回退到主页图；`image` 使用单个路径字符串或完整 HTTPS 地址。建议使用 1200 × 630 的 PNG/JPEG。分享标题和摘要仍使用当前页面内容，不因图片回退而变成个人简介；这项配置不在页面正文自动插入封面。仅文章自己指定的图片写入 `BlogPosting.image`，默认个人名片只用于分享预览，不作为文章内容插图。上线后可用分享预览工具检查；平台可能缓存旧图，改用新文件名并更新配置可区分新版本。

文章修改日期由 `_plugins/post_modified_at.rb` 在构建时读取该文章文件最后一次 Git 提交的时间，写入内存中的 `last_modified_at`，不回写 Markdown。手动填写的 `last_modified_at` 优先；没有提交记录的草稿或无法读取 Git 历史时不自动生成。它代表已提交版本的更新时间，不使用本地文件修改时间或构建时间；发布日仍使用文章的 `date`。部署的 checkout 必须保留 `fetch-depth: 0`，以便读取旧文章的历史。此日期供文章 SEO、RSS、sitemap 使用；每篇文章末尾始终用小字显示更新时间，英文标签为 `Last updated:`，中文为「本文最后更新于」（不加冒号），日期格式随文章语言，例如「本文最后更新于 2026年10月7日」。没有更新日期时回退到发布日期，也不显示早于发布日期的更新时间。因此首次发布时两个日期相同，后续更新只改变文末日期。列表与正文页头仍仅显示首次发布日期，列表继续按发布日期排序；不改变顶部全站 Last updated。重要内容更新可由作者在正文开头写明具体补充，不自动生成更新说明。

通常不填写 `last_modified_at`；需要手动覆盖时使用与 `date` 相同的带时区格式。本地未提交的正文编辑不会更新 Git 日期，提交并重新构建后才会更新；修改其他文件不会刷新这篇文章的日期。浅克隆、缺少 Git 或仓库无法被当前用户读取时，应先处理历史/权限问题，不要用构建时间伪装成修改时间。改 `_config.yml` 或日期插件后需要重启本地 Jekyll 才能应用新配置。

发布前检查：

1. 从自己的草稿创建正式文章，去掉仅用于预览的 `noindex`、`sitemap: false` 和 `/blog/preview/` 地址；正文中的正常引用仍保留。不要直接发布借用标题的排版示例。
2. 用不带 `--drafts` 的生产构建检查输出 HTML 的 `<head>`：标题/摘要属于该文章，canonical 是正式地址，`og:image` 是可访问的完整图片 URL，作者与日期准确，JSON-LD 可解析。图片未配置时应使用默认图；已填写但路径错误不会自动检测或回退，需要修正路径。
3. 检查中英文 Home/Blog/CV 的 canonical 与 hreflang 未改变；检查文章列表、`feed.xml`、`sitemap.xml` 和输出目录均无本地预览示例。文档、素材来源说明和临时测试不能进入发布产物。
4. 部署后，用 [Meta Tags](https://metatags.io/) 输入公开页面 URL 查看分享模拟，用 [Google Rich Results Test](https://search.google.com/test/rich-results) 检查文章结构化数据。本地也可以在工具中手动填标题/摘要并上传图片，但这只预览外观，不能验证线上是否正确接入；外部工具无法抓取 `localhost`。平台实际展示和搜索收录不由这些标签保证。

#### 文章正文与阅读功能

正文交给现有的 Kramdown 处理，构建后由 Expressive Code 替换文章内的代码块，所有文章自动获得以下阅读功能，不需要 `math: true` 或每篇复制脚本：

- **公式**：KaTeX 官方 auto-render 统一识别公式并跳过代码块。推荐 Kramdown 原生语法：正文内写 `$$x_i$$`，独立公式在上下各一行写 `$$`；也支持简单的 `$x$` 行内公式。复杂公式优先用双美元符号，避免 Markdown 把下划线或星号当作强调。公式只在自身区域横向滚动。
- **代码**：正常写带语言名的 Markdown 围栏代码块，Expressive Code 在构建时使用 GitHub Light / GitHub Dark（不带 Default）高亮并生成复制按钮。浏览器只加载本站生成的 CSS 和少量交互脚本，不下载高亮器；浅深切换沿用网站的 `data-theme`，无 JS 仍保留完整高亮。未指定或不支持的语言回退纯文本。默认不显示行号；无文件名的普通代码块不显示空标题栏。复制使用组件内置行为，保留缩进和 Shell 注释，不复制行号或增删标记。
- **目录**：自动读取二、三级标题生成章节链接；至少两个标题才显示目录。显示标题「Table of Contents / 目录」，导航的无障碍名称关联该标题。1536px 及以上始终展开，固定在正文左侧留白中，在顶部导航下方的可用区域内略高于居中位置（剩余空白按上 40%、下 60% 分配）；高度最多为视口的 60%，同时避开顶部导航与底部留白，超出时在内部独立滚动。目录滚动条默认低对比度，悬停或键盘聚焦时增强；支持自定义滚动条的浏览器去掉上下箭头和轨道背景，高对比度模式保留原生样式。更窄时放在正文上方，默认收起，点击带箭头的标题按钮或使用 Enter/空格键展开、收起；按钮通过 `aria-expanded` 和 `aria-controls` 表达状态与关联列表。展开后高度最多半屏、超出时内部滚动，不挤占正文宽度；点击章节不自动收起。缩放到桌面时始终展示列表，再缩回窄屏保留本页此前的展开状态，不存储到浏览器。普通目录项颜色稍淡，子标题缩进且字号略小，当前章节用强调色高亮。文章正文最大宽度为 45.5rem（当前桌面字号下约 820px）；1280px 及以上沿用主页内容列的左侧对齐线，使用同一 Susy 网格计算，不手写像素偏移；更窄时仍居中。标题、来源提示和文末与正文对齐，右侧留白，不改变首页、列表或 CV 布局。标题旁的 `#` 提供段落直达链接，不在滚动时修改网址。作者无需手写目录；可选的 `{:toc}` 保留为无 JS 回退，启用 JS 后由侧边目录替代，不重复展示。

  「Table of Contents / 目录」标题固定在目录顶部，只有下面的条目列表内部滚动。桌面目录在当前章节变化、窗口调整或页面恢复时，将高亮项尽量放在列表中部；接近首尾时自然停在列表起点或终点，不按正文的滚动百分比生硬映射。只滚动条目列表，不带动正文、不抢焦点；同一章节内不会持续拉回手动浏览的目录。窄屏正文上方的目录不自动跟随。

  普通点击或键盘激活目录时，只滚动并将焦点移到对应标题，不添加 `#章节名` 或浏览历史；滚动正文也不修改网址。目录及标题旁的链接仍保留真实锚点，右键复制、新标签页打开和外部章节直达链接继续有效；不删除传入网址已有的锚点。标题旁的 `#` 保留原生链接行为，不拦截正文其他链接。

- **字数、阅读时长与进度**：列表和文章页头在构建时自动生成字数与预计时长，无需手填，也不依赖浏览器 JS。`_plugins/reading_stats.rb` 解析全文一次，同时返回两项统计，由 `_includes/reading-stats.html` 显示。字数为中文字符数与其他单词数之和，使用逗号分隔千位；空白与独立标点不计入。时长按中文约 300 字/分钟、其他文字约 200 词/分钟相加并向上取整，最低 1 分钟；不计 HTML、脚本或重复目录，代码正文计入一次。这只是篇幅估算，不代表理解公式、图表或代码所需的时间。文章页的 2px 主题色进度线位于导航栏下方，只计算正文的滚动范围，正文末尾进入视口时达到 100%，不计页脚；整篇短文可见时直接完成。缩放、图片/公式加载、折叠内容和浏览器返回会更新进度，无 JS 或打印时不显示进度线。新增/修改 Ruby 插件后需重启 Jekyll。
- **其他排版**：支持 Markdown 表格、脚注和原生 `<details markdown="1">` 折叠补充内容。长表格/代码在内部滚动，打印时隐藏目录和复制按钮。

公式和目录在 `assets/js/blog-post.js`；代码块由 `_plugins/expressive_code.rb` 调用 `scripts/render-code-blocks.mjs` 构建，只处理文章正文。代码块主题、默认选项与组件中文提示在该 Node 脚本中，其他界面词条仍在 `_data/i18n.yml`。复制成功时按钮短暂显示对勾，不弹出文字浮层；`_sass/layout/_blog.scss` 复用组件的 `.feedback.show` 状态切换图标，保留读屏提示，不另写复制逻辑或定时器。对勾直接使用 `images/heroicons-check.svg`（Heroicons v2.2.0 原始图形，文件内保留来源和 MIT 许可），不需要安装图标库。生成的哈希资源位于构建目录的 `assets/expressive-code/`，不提交源码仓库。首页、CV 和 Terminal 不加载这套资源。归档和全文搜索仍按实际写作需要再加。

#### Expressive Code 写法速查

无标题、非终端的代码块会在右上角自动显示完整语言名，不强制大写或用省略号截断。构建脚本读取 Shiki 自带的语言与别名表，统一显示名称（`ts` / `typescript` → `TypeScript`、`js` / `javascript` → `JavaScript`、`cpp` / `c++` → `C++`）；未指定语言、纯文本与不支持的语言显示 `Plain Text`。Shiki 已是 Expressive Code 的高亮器，作为直接构建依赖声明以便读取这张表，不增加浏览器资源。构建时添加 `data-language-label`，样式在 `_sass/layout/_blog.scss`，不在浏览器识别语言。有文件名或终端标题时不重复显示；电脑端鼠标移入或键盘聚焦时标签隐藏，触屏端标签与复制按钮并排。语言别名、复制内容、代码标记与折叠由 `npm run test:code-blocks` 验证；需要检查视觉效果时，可自行创建本地草稿。

所有代码块都使用 Expressive Code。普通代码只写三个反引号和语言名即可；高级功能直接写在**开头的语言名后面**，与官网示例一致：

````markdown
```python title="hello.py" showLineNumbers {2}
def greet(name):
    return f"Hello, {name}"
```
````

使用 [Expressive Code 官方选项](https://expressive-code.com/key-features/text-markers/)，无需额外属性行，也无需转义 `{}`。语言名与各选项之间用空格分隔。

| 想要的效果 | 写在语言名后面的选项 |
| --- | --- |
| 文件名 | `title="train.py"` |
| 行号 / 从第 20 行开始 | `showLineNumbers` / `showLineNumbers startLineNumber=20` |
| 强调第 2–4 行 | `{2-4}` |
| 增加行 / 删除行 | `ins={2} del={1}` |
| 强调某个词 | `"verified"` |
| 折叠第 1–4 行，可再次收起 | `collapse={1-4}` |
| 长行自动换行 | `wrap` |
| 不显示外框标题 | `frame="none"` |

`bash` / `sh` 代码自动使用终端外框。选项可组合，日常只需普通代码，必要时加文件名与重点行。复制仍包含折叠的全部代码。安装了行号和折叠两个官方插件；其他插件（例如交互式编辑器）未默认引入。完整功能见 [官方文档](https://expressive-code.com/)。

实现上，`_plugins/expressive_code.rb` 中的 `GFMWithCodeMeta` 只扩展原有 GFM 解析器的代码围栏参数，保留引用、列表和其他 Markdown 规则；参数作为内部 HTML 属性交给 Expressive Code，不需要作者手写这些属性。`_config.yml` 的 `kramdown.input` 选择该扩展。运行 `npm run test:code-blocks` 会同时检查真实的 Jekyll Markdown 解析和代码块渲染，因此测试也需要先安装 Ruby / Bundler 依赖。

本地草稿可放在 `_drafts/`，该目录已被 Git 忽略；当前不附带预览样稿。**草稿只在显式开启预览时加载，不设置全局 `show_drafts: true`，也不要将临时排版示例移入 `_posts`**：

```sh
bundle exec jekyll serve --host 127.0.0.1 --port 4000 --drafts
```

新增临时排版样稿时，设置 `noindex: true` / `sitemap: false`，不提交；正式发布前移除临时示例，再用不带 `--drafts` 的生产构建确认 Blog、RSS、sitemap 与输出目录没有示例。原生草稿机制和 Git 忽略是发布隔离措施，不能仅依赖 noindex。引用他人内容时保留来源，不转载无授权全文，也不将样稿当成自己的研究内容。

### 维护双语内容

`_data/i18n.yml` 以 `en` 为完整默认词表，`zh-Hans` 只写需要翻译的字段；未定义的中文字段沿用英文，例如 `terminal`、`scholar`、`github`、`terminal_hint` 和 `last_updated` 都只在 `en` 定义。文章文末的 `blog_last_updated` 则分别提供英文和中文文案。沿用默认值时直接省略中文键，不用空值占位。`_plugins/i18n_defaults.rb` 在 Jekyll 读取数据后使用内置的深度合并补齐缺少的字段，嵌套标签也适用；模板直接读取当前语言的词表，不需要逐项添加回退逻辑。这只在构建时执行，不增加浏览器脚本、不回写 YAML，也不影响主页/CV 独立维护的正文数据。修改插件后需要重启本地服务，日常修改词表仍会自动重建。顶部文案与日期继续明确使用 `en.last_updated` / `en.month_format`，经历和文章日期保留当前语言的格式。

研究成果中需要翻译的标签放在各语言的 `research` 下：`types` 是成果类型，`links` 是资源链接名称。固定名称 `BibTeX`、`GitHub` 仅在英文词表中定义，中文自动继承；`BibTeX` 位于 `en.research.links.bibtex`，目前仅保留文案，不生成引用入口。论文标题、团队署名、会议名称和年份仍在内容文件中维护。主页和网页 CV 共用词表，但各自的成果内容仍独立维护；Terminal 读取英文标签。

论文统一使用 `type: paper`，不再区分会议论文、期刊论文和预印本。主页与网页 CV 的成果条目均支持可选的公共 `tag` 字符串，与 `type` 同级，例如 `tag: NeurIPS 2026`、`tag: ACL 2027`、`tag: Preprint` 或 `tag: arXiv`。奖项和报告形式也直接写入 `tag`，例如 `tag: "NeurIPS 2027 · Best Paper"`、`tag: "ICLR 2027 · Oral"`，不单独维护枚举词表。填写时直接显示该文字，中英文保持一致；未填写或为空时回退到本语言的类型名称（如 Paper / 论文、Technical Report / 技术报告）。`tag` 中的年份由作者填写，不从发布日期推断；它是展示标签，不是博客的 `tags` 筛选列表。会议名、期刊名和年份不放入翻译词表。Terminal 从英文主页标签自动提取，无需维护另一份。

主页 `_data/profile.yml` 的研究成果中，`team`（团队署名）为中英文共用字段，与 `title`、`date`、`type` 同级；可选的公共字段 `model_card_url` 提供官方 Model Card 全文链接，中英文共用同一份全文。各语言分支维护项目主页 `url`、`summary` 和 `link_label`。`link_label` 是项目主页链接的 `aria-label` 无障碍描述，需要随页面语言翻译；链接可见文字仍取自上述界面词表，不由 `link_label` 控制。网页 CV 在独立的 `_data/cv.yml` 中维护自己的语言版 `url`、`link_label` 和可选公共 `model_card_url`，同样先显示项目主页，再显示 Model Card；不读取主页数据，也不显示封面。

词表只是可选文案，不会自动生成标签、链接或占位按钮。主页成果卡片使用条目的 `type` 和项目主页 `url`；配置 `model_card_url` 时，在项目主页链接之后显示 Model Card，未配置则不显示。该链接名称在英文 `research.links.model_card` 定义，中文自动继承，保留官方叫法；`paper` 词条仍作为普通论文链接的预留名称。Terminal 通过共用的英文内容模板自动提取两个链接；网页 CV 的数据和模板仍独立维护。其他资源名称先作为备用词条，后续使用时再接入对应内容字段和模板。相同资源不要同时用不同名称重复展示。

网页 CV 的 `awards` 条目将平台与奖项分开：`platform` 是可选的平台名称（如 Kaggle），`competition` 是比赛名称，`year` 是年份，`label` 指向通用奖项词条（如 `silver_medal`）。可选的 `url` 仅为比赛名称添加链接，未填写时显示普通文字。词表只翻译奖项名称，不组合平台名，也不包含分隔标点；模板按页面语言添加冒号，省略平台时不留前导空格。其他平台的银牌复用同一词条，新的奖项名称按实际需要添加。

1. **改正文**：主页/Terminal 编辑 `_data/profile.yml`，网页 CV 编辑 `_data/cv.yml`，在相应条目的 `en` / `zh-Hans` 下修改文案。每份数据内的公共字段在中英文间只改一处；同时涉及主页和 CV 的日期或内容变更，需要分别维护，不能假定修改一份会自动同步另一份。只改中文不会影响英文 Terminal。部分模板有同一数据文件内的英文回退，但正式中文页面应补齐译文。
2. **改界面和搜索信息**：通用标签、日期格式及中文 SEO 默认值在 `_data/i18n.yml`；单页标题/描述在页面 front matter，英文 SEO 默认值仍在 `_config.yml`。
3. **新增一对页面**：设置不同的 `permalink` 与 `lang: en` / `zh-Hans`，共用同一个 `translation_key`。同一语言下该键只能对应一个页面；复用布局和内容模板，不复制整套 HTML/CSS。页面标题/描述应使用对应语言，CV 下载还需设置对应 `pdf`。
4. **新增导航**：`_data/navigation.yml` 的 `label` 指向中英文界面文案键，`translation_key` 配对当前语言页面，`url` 用作无译文时的回退。语言切换和 SEO 对应链接自动读取页面配置，不另写 URL 映射或浏览器语言存储。

更新网页内容不会自动更新 PDF；需要更新时按上面的固定公开文件名分别同步两份通用简历。新增语言页面后按下一节的双语检查项验证，不仅检查英文入口。

开发脚本时，在 Jekyll 预览之外另开终端运行所需监听器（均从根目录执行）：

```sh
npm run watch:js
```

```sh
npm --prefix _terminal run watch
```

两个监听器各自占用终端，Ctrl+C 停止。Terminal 的 watch 不替代提交前的类型检查和单元测试。

### 访问统计（GoatCounter）

- `_config.yml` 的 `goatcounter_code` 填注册的账号名（不含域名），留空完全禁用。无需密码或 API Key。
- 在 GoatCounter 的站点设置开启 **Allow adding visitor counts on your website**，网页公共页脚才能读取并显示 `Total visits` / `访问总量`；后台不需要设为公开。
- 主页/CV 与 Terminal 共用 `_includes/analytics.html` / `assets/js/site-analytics.js`，仅在生产构建且当前域名与配置一致时启用统计。页面以 `location.pathname` 归类；官方脚本仍会发送查询参数及来源等默认统计字段。不记录 Terminal 命令或点击事件。
- 各页面保留原有浏览记录，并在页面可见时发送同一个 `site-visit` 事件。Home、CV、404 等常规网页共用页脚，统一读取该事件的累计计数，不读取相加各页面的 `TOTAL`；Terminal 参与统计但不显示计数。同一会话中首页 → CV → Terminal 或反复刷新，全站计数只增加 1。
- 保持 **Settings → Data collection → Sessions** 开启，由 GoatCounter 按约 8 小时窗口去重；不是永久去重的人数。更换网络或浏览器可能另算一次。机制见 [Sessions and visitors](https://www.goatcounter.com/help/sessions)。不额外使用 Cookie / localStorage 标识访客。
- 后台查看全站访问时选择 `site-visit` / `Site visits`；只查看各页面时用 `is:pageview` 过滤。不要把事件和页面数字相加当作人数。新口径从部署后开始累积，不将旧 `TOTAL` 当作历史去重人数。
- 公开数字可能缓存至多四小时，不是实时跳数。普通本地预览仅查询已有计数，不增加访问；接口明确返回缺失路径的 JSON `count: "0"` 时显示 0，未启用公开计数、接口超时或请求被拦截时隐藏该行，不填占位数字。
- 常规网页不等待计数：页脚初始隐藏该行，后台请求最多 5 秒，成功后直接显示，无需刷新页面。显示标签连同冒号、空格由 `_data/i18n.yml` 通过页脚 `data-label` 提供（`Total visits: ` / `访问总量：`），统计事件的 `site-visit` 标识及 `Site visits` 标题保持固定。Terminal 不请求公开计数，也不等待或显示数字；仅保留生产环境的访问记录。
- 排除自己的线上访问可在网站地址后加 `#toggle-goatcounter` 并按提示操作。说明见 [GoatCounter 文档](https://www.goatcounter.com/help/skip-dev)。
- 修改统计逻辑后运行 `npm run test:analytics`（Node 内置测试，所有请求均为模拟，不污染线上数据），再检查 Jekyll 构建与网页公共页脚。

## 3. 提交前验证

涉及脚本或整体重构时：

```sh
npm run build:js
npm run test:analytics
npm run test:theme
npm run test:code-blocks
npm --prefix _terminal test
npm --prefix _terminal run build
git diff --check
```

然后做一次生产模式 Jekyll 构建。

PowerShell：

```powershell
$env:JEKYLL_ENV = 'production'
bundle exec jekyll build --strict_front_matter
```

macOS / Linux：

```sh
JEKYLL_ENV=production bundle exec jekyll build --strict_front_matter
```

默认输出在 `_site/`。自动化检查可用 `--destination` 指定新建的独立临时目录，不能指向源码或已有用户文件目录。构建后还需检查：

- 英文与中文 Home/Blog/CV、英文 404：浅深色、手机和桌面宽度；无横向溢出、破图，短页面页脚位于底部。
- 语言切换对应当前页面，导航保持语言，刷新与前进/后退正常；键盘和禁用 JavaScript 时仍能使用语言链接。
- 各语言的标题、描述、canonical、hreflang 和 sitemap 对应正确；Terminal 不生成中文地址。
- Links 打开/外部点击关闭，缩放到桌面后链接可见；Feed 返回不残留触屏悬停色。
- 点击 About 显示完整欢迎语；滚动不跳过短章节；返回顶部正常。
- Terminal：内容命令、Tab 补全、历史、主题、`clear`、Ctrl+L、`home`，浏览器返回后继续输入；从中文 GUI 进入仍为英文，往返两种语言的 GUI 时主题保持同步。
- 两种语言的 CV 下载对应 PDF；Feed、图标和 manifest 有效，产物没有 `localhost` 链接、未渲染 Liquid、开发依赖或私有文件。
- 两种语言的 GUI 页脚显示同一个 `site-visit` 计数，仅标签翻译；延迟、失败或超时不阻塞页面，Terminal 不显示计数。自动化检查应模拟或拦截统计请求，不污染线上访问量。

已有 Terminal 的 Vitest 单元测试，以及 `npm run test:analytics`、`npm run test:theme` 和 `npm run test:code-blocks`（Node 内置测试）。主题测试包含系统偏好、存储不可用及从 Terminal 返回时的页面缓存恢复。目前没有纳入仓库的一键网页浏览器回归脚本；上述浏览器检查需手动执行或使用当前可用工具，不依赖历史临时脚本。临时测试脚本、截图、浏览器配置目录和测试构建应放在系统临时目录，不提交或发布。Chrome 移动视口模拟不等同于手机真机或 Safari 验证，应在交付时说明实际覆盖范围。

## 4. 部署到 GitHub Pages

发布流程在 [.github/workflows/pages.yml](.github/workflows/pages.yml)。首次启用需要将仓库 **Settings → Pages → Build and deployment → Source** 改成 **GitHub Actions**；本地代码不能替代这项仓库设置。参见 [GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

推送 `master` 或在该分支手动运行 workflow 后，Actions 安装 Node 24 / Ruby 3.3 依赖，执行测试与 GUI/Terminal 脚本构建，再运行 Jekyll（包括 Expressive Code 插件），最后把生成的 `_site/` 作为 Pages artifact 部署。PR 只构建验证，不部署。不使用 `--safe`、`--drafts`，不上传本地 `_site/`，也无需 `gh-pages` 分支或 `.nojekyll`。博客代码块需要本地插件，不能继续用原来 master / root 的内置 Jekyll 发布源。

发布步骤：

1. 完成验证，核对 `_config.yml` 的 `url`、`baseurl`、`repository`。当前 URL 为 `https://jayverse3.github.io`，`baseurl` 为空。
2. 用 `git status --short`、`git diff` 审阅改动和生成文件，留意未跟踪的新文件。
3. 用 `git add --` 明确选择本次文件，不盲目暂存所有已有改动；源码和编译产物一起提交。
4. 确认目标提交位于 `master` 后推送 `origin/master`。其他开发分支先按维护者要求合并，不用强制重置覆盖工作。
5. 在 GitHub Actions / Pages 状态中核对**目标提交**的构建和部署成功；push 成功不等于部署成功。
6. 验收线上 `/`、`/blog/`、`/cv/`、`/zh/`、`/zh/blog/`、`/zh/cv/`、`/terminal/`、两份 PDF、Feed 及不存在的地址（如 `/cas`），确认语言切换、主题和资源正常。新页面、数据文件、共用模板与中文 PDF 必须一同纳入提交，不仅提交已有文件的修改。

仅提交本文档的示例；其他任务请替换为实际改动文件：

```sh
git add -- README.md AGENTS.md _terminal/README.md
git diff --cached
git commit -m "Document development and deployment workflow"
git push origin master
```

Fork 或更换域名时，除了 Pages 设置和配置，还要检查 Terminal 当前固定的提示符主机名及其他个人链接。

## 5. 源码、产物与本地文件

- `_config.yml` 的 exclude 控制发布；`.gitignore` 只控制版本管理，两者不互相替代。
- `_site/`、`.sass-cache/` 是可重建的输出/缓存，不手工维护或提交；清理前停止相关进程。
- 两个 `node_modules/`、`vendor/bundle/` 是可重装依赖；`.bundle/` 是本机配置，不提交机器专用路径。
- `assets/js/main.min.js`、`assets/terminal/*` 仍按现有约定提交，供本地预览使用；Actions 发布前也会重建，不作为“冗余文件”删除。`assets/expressive-code/*` 仅生成在构建输出目录，不需要提交。
- `images/manifest.liquid` 输出为 `/images/manifest.json`；网页引用后者。
- `images/*-source.md` 留在 Git 保存素材出处和许可证，不作为网页发布；保留根 LICENSE 和第三方声明。
- Blog 支持文章列表、标签筛选和详情页；无正式文章时显示占位文案。`_drafts/` 仅用于本地写作和排版预览，不提交；发布正文放 `_posts/`。不要默认恢复 MathJax、Plotly、Mermaid 等集成。

## 6. 常见问题

| 现象 | 先检查 |
| --- | --- |
| 找不到 ruby / bundle / node / npm | 安装与 PATH，重新打开终端，使用已验证的工具系列 |
| 原生 gem 编译失败 | Windows 的 Ruby+Devkit / MSYS2；不要先随意升级所有 gem |
| 根目录 npm ci 失败 | Node、网络、package-lock.json 是否已提交且与 package.json 一致；依赖变更时才用 npm install 更新锁文件 |
| Terminal npm ci 失败 | Node、网络、锁文件是否缺失/失配；不要通过删锁文件绕过 |
| 修改脚本后仍是旧效果 | 源码路径、对应 npm 构建、产物是否提交，然后再检查浏览器缓存 |
| 配置修改未生效 | 重启 Jekyll，检查命令是否在仓库根目录执行 |
| Terminal 一直 Starting terminal | Console/Network、assets/terminal 产物和 Jekyll 内容模板 |
| 本地正常、线上缺文件 | Git 跟踪、exclude、文件名大小写、部署是否对应最新提交 |
| 4000 端口占用 | 改用 --port 4001 并访问对应端口，不随意关闭其他服务 |

## Credits

Based on [Academic Pages](https://academicpages.github.io/) and [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/). See [LICENSE](LICENSE) for the MIT license and original copyright notices.
