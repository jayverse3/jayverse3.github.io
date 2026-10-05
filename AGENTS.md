# 本仓库的代码助手指南

适用于所有子目录。这里是 Yingjie Yang 的个人主页，不是 Academic Pages 上游模板。开始工作先读 [README.md](README.md)；涉及 Terminal 再读 [_terminal/README.md](_terminal/README.md)。

## 开始任务

1. 检查目录、分支、`git status --short`。可能存在大量未提交改动和新文件，它们不是待清理的垃圾。
2. 按 README 映射定位源码，读相关调用方和测试。不依赖历史聊天或其他机器的绝对路径。
3. 评审/诊断不授权改代码；未明确要求时不 commit、push、部署或修改 Pages 设置。
4. 缺依赖时按 README 安装，优先已验证的 Ruby 3.3.x / Node 24。不在普通任务里顺带升级依赖。

## 架构与内容来源

- 网站：Jekyll / Liquid / SCSS，Gemfile 的 github-pages 依赖用于与 Pages 构建保持兼容。
- 网站脚本：`assets/js/src/navigation.js`、`theme.js`、`profile-menu.js`，使用 jQuery，状态各自封装。
- `assets/js/welcome.js`、`section-nav.js`、`back-to-top.js` 直接加载，不经根 npm 编译。
- Terminal：`_terminal/` 的 TypeScript + xterm.js + Vite，独立只读页面，不是真实 Bash / Python / npm 执行环境。
- 主页与 Terminal 的内容、全站侧栏个人资料在 `_data/profile.yml`；网页 CV 正文独立维护在 `_data/cv.yml`，不读取或回退到主页经历。网页界面标签在 `_data/i18n.yml`。页面文件仅保留配置并调用各自的内容模板；每份数据内部的日期、链接等公共字段不放进语言分支，翻译正文放在对应的 `en` / `zh-Hans` 下。修改范围同时涉及主页和 CV 时，分别编辑两份数据，不自动同步文案。
- 主页和 Terminal 都调用 `_includes/home-content.html`；Terminal 显式传入 `lang="en"`，将结果注入 `#terminal-content` 后由 `_terminal/src/content.ts` 提取。不要依赖其他页面是否已渲染，也不要复制一份 Terminal 经历。
- GUI 提供英文 Home/CV（`_pages/home.md`、`_pages/cv.md`）与中文版本（`_pages/zh/`）；同类页面的中英文版本共用模板、样式和各自数据文件中的公共事实。页面使用 `lang: en` / `zh-Hans` 与 `translation_key: home` / `cv` 配对，同一语言下该键应唯一。顶部普通链接切换到对应页面，不加自动跳转或语言偏好存储。导航按 `translation_key` 查找当前语言页面，没有翻译时回退到配置的 `url`；普通页面无对应译文时不显示切换入口，文章页的例外规则见下文。Terminal 始终保留英文，其 `home` / `cv` 命令固定使用英文路径。顶部 Last updated 文案和日期也刻意保留英文，不按中文标签替换。
- SEO 由 `_includes/seo.html` 统一生成：英文默认标题/描述在 `_config.yml`，中文覆盖值与 Open Graph locale 在 `_data/i18n.yml` 的 `seo` 下，单页 `description` 优先。canonical 保留各语言自己的网址，hreflang 根据 `translation_key` 配对，英文页作为 `x-default`；无译文时不输出语言链接。不要把中文 canonical 指回英文，或给 Terminal 生成不存在的中文地址。
- 文章 SEO：`layout: post` 使用 `og:type: article` 与 `BlogPosting`，其他页面保持 `website`。文章的 `author` 是可选姓名字符串，默认 `site.name`；借用标题的 `preview_sample` 不输出作者、文章日期和结构化数据，不能误署名。`image` 是可选图片路径字符串，优先于 `_config.yml` 的 `og_image`；未配置时回退到默认个人分享图，仍保留文章自己的标题/摘要。默认图不写进 `BlogPosting.image`，不在正文自动插入图片；可选的 `image_alt` 提供图片说明。不新增在线图片生成服务。
- 文章修改日期：`_plugins/post_modified_at.rb` 在 `post_read` 读取各文章自己的最后一次 Git 提交时间，供模板、RSS、sitemap 使用；手写 `last_modified_at` 优先。不使用构建时间或文件 mtime，不回写 Markdown，不改首次发布日期、正文页头和顶部全站 Last updated。未跟踪文章、借用标题的示例或 Git 不可用时不伪造日期。部署 checkout 保持 `fetch-depth: 0`；不要为本地构建擅自修改全局 Git 信任设置。写作字段和发布检查见 README 的「文章发布与分享信息」。
- HTML CV 入口在 `_pages/cv.md`、`_pages/zh/cv.md`，内容模板为 `_includes/cv-content.html` / `cv-entry.html`；教育、经历、研究成果、奖项与技能均来自 `_data/cv.yml`。CV 摘要和详细条目使用普通 Markdown，不含主页的模型/Logo 占位符。侧栏、页脚个人资料和界面标签仍为全站共用，不属于 CV 正文。英文 PDF 在 `files/yingjie-yang-cv.pdf`，中文 PDF 在 `files/yingjie-yang-cv-zh.pdf`，由各页面的 `pdf` 字段指定，不与网页自动同步。只同步用于公开的通用简历，不上传定向投递版或 RenderCV 源文件；Terminal 保留英文 PDF。PDF 源码不在本仓库，不要假定存在历史聊天里的简历目录。
- Blog 入口在 `_pages/blog.md` / `_pages/zh/blog.md`，使用 `translation_key: blog`，复用 `single` 与 `_includes/blog-index.html`。列表按日期倒序，标签由 `assets/js/blog.js` 按 URL hash 筛选；无 JS 保留完整列表。文章使用 `_layouts/post.html` 与 `_sass/layout/_blog.scss`；正式文章放 `_posts/YYYY-MM-DD-slug.md`，无文章时显示 Coming soon / 敬请期待。两个列表共享文章、只翻译界面，文章不自动翻译。临时示例保存在 Git 忽略的 `_drafts/`，只用 `--drafts` 本地预览；不改全局 show_drafts，不移入正式文章目录，不提交。示例标明原作者与来源，正文为排版样稿，不转载全文。发布前删除示例并验证普通生产构建的列表、RSS、sitemap 和输出路径均不包含示例。
- Blog 公式与目录入口为 `assets/js/blog-post.js`：公式交给 KaTeX 官方 auto-render，目录读取二、三级标题。代码块由 `_plugins/expressive_code.rb` 在 Jekyll post_write 后调用 `scripts/render-code-blocks.mjs`，使用 Expressive Code（内含 Shiki）构建 GitHub Light / GitHub Dark（不带 Default）静态高亮，输出本地哈希 CSS/JS；不在浏览器加载高亮器。作者直接在围栏语言名后写官方参数（如 `python title="hello.py" showLineNumbers {2}`），不要求额外属性行或花括号转义。该 Ruby 插件内的 `GFMWithCodeMeta` 继承现有 GFM，仅扩展代码围栏的参数读取；`_config.yml` 的 `kramdown.input` 选择它，其余 Markdown 规则仍由 GFM 处理。`data-ec-meta` 仅作为构建步骤间的内部传递，不是推荐写作语法。不要用全篇正则替换破坏嵌套代码或代码示例；修改后运行 `npm run test:code-blocks`，包含 Ruby/Jekyll 真实解析测试。默认不显示行号，无标题不留空标题栏，复制保留 Shell 注释；行号、标记、折叠按需开启。主题跟随公共 `data-theme`，不改变首页/CV/Terminal。组件中文提示使用 EC 官方 locale API，不重复维护自制复制按钮。KaTeX 与 CV 共用固定版本，文章额外加载 auto-render，主页/列表不加载。本地样稿和功能演示均在忽略的 `_drafts/`；修改后检查完整 Markdown 构建、窄屏长公式/代码、复制、折叠、目录、无 JS 回退及生产构建隔离。
- 公开页面路径为 `/`、`/blog/`、`/cv/`、`/zh/`、`/zh/blog/`、`/zh/cv/`、`/terminal/`；保留 `/feed.xml`、`/images/manifest.json` 及旧 About/CV 地址的 front matter 重定向。
- Blog 阅读时长由 `_plugins/reading_time.rb` 与 `_includes/reading-time.html` 在构建时估算；列表和详情共用算法，中文字符与其他单词分别计数，不从摘要估算或手写固定分钟数。`blog-post.js` 的阅读进度只跟随正文，不包含导航和页脚，不记录访客阅读行为；按滚动事件合并到动画帧更新，不用持续计时器。修改后验证中英混排、列表/详情一致、短文章、无 JS、动态内容尺寸与返回恢复。
- Blog 卡片和正文页头统一显示带标签的发布日期与预计阅读时长，不显示作者；SEO 作者与预览样稿来源署名继续保留。每篇文章末尾始终以小字显示更新时间，使用 `last_modified_at`，缺失或早于发布日期时显示发布日期；首次发布时两个日期相同，更新只改变文末日期。不要把更新日期挤进顶部元信息，也不按更新时间重排列表。预览样稿的日期仅用于排版，不当作原文更新记录。
- Blog 文章语言入口始终显示：文章在 `site.posts` 中按共享 `translation_key` 与不同 `lang` 配对，导航和 SEO 使用同一规则；普通页面仍用 `site.pages`。有译文时使用原生链接，没有时显示按钮，由 `blog-post.js` 展示 3.5 秒非阻塞轻提示（重复点击重新计时，Escape 关闭，离开页面清空）。不跳回列表、不使用 alert、不存储语言偏好、不自动翻译。无 JS 时缺译文按钮可见但禁用，title 解释原因；读屏提示用 role=status。文章译文需要独立网址，键在每种语言内唯一；没有真实译文时不生成 hreflang。两种列表目前仍展示全部文章，语言筛选或配对去重属于另一个任务。

## 编辑边界与规范

- 编辑源码，用项目命令重建；不手改压缩 JS、Terminal bundle 或 `_site/`。
- JS/TS 使用明确的 camelCase，文件按职责命名，状态限定在组件作用域；不引入全局可变变量或含义不清的缩写。
- 网页字体及字体资源统一在 `_data/typography.yml` 配置，组件使用共享的字体变量；Terminal 和 PDF 的字体独立。SCSS 字号/布局设置在 `_sass/_settings.scss`，颜色在 `_sass/theme/`，通用页面/Home/CV 分别在 `_page.scss`、`_home.scss`、`_cv.scss`。
- 重复按下/悬停样式复用 `interactive-state` mixin，保留键盘焦点；不为手机浏览器正常的边缘触摸容错增加 JS 拦截。
- Home/Blog 卡片共用 `card-interaction` mixin 管理悬停和减少动态效果，具体布局留在各自样式中。
- 本站资源使用 `relative_url`，canonical/分享地址使用 `absolute_url`；不另建全局路径变量或依赖模板渲染顺序。
- 菜单模式依据 CSS 中按钮是否显示，不把同一断点再次硬编码进 JS。不要为一次性逻辑引入新框架或通用配置层。
- 标题 ID、卡片类名、DOM 结构同时服务样式、导航和 Terminal 提取；改名要一起检查调用方。
- 改路径或构建入口时，同步更新 imports/includes、package scripts、发布 exclude 和文档。
- 使用 UTF-8。不批量格式化无关文件，不改第三方库命名，不清掉版权声明。

## 已确定的交互约定

除非用户明确要求重新设计，重构时保持：

- 主页/CV 与 Terminal 共用 theme 存储偏好，无偏好时跟随系统，首次绘制前初始化；存储不可用不阻断基本交互。
- CDN、懒加载、独立浅深色 SVG 仍在使用，不擅自改成全本地或全量预加载，不删除另一主题资源。
- 手机 Links 点击打开，再次点击或点击外部关闭；触摸高亮与键盘可见焦点要区分。
- About 跳转显示完整欢迎语；其他章节保留上下文留白与短页面滚动规则，不退回“上个标题离开就高亮下个”的逻辑。
- 卡片淡出、欢迎语颜色、分隔线切换、页脚底部位置已有设计，不借重构改变视觉效果。
- Terminal 命令按字母序显示，文字/加粗与 Home 同步，按句起行，长句按终端宽度折行。
- clear 清除屏幕及滚动回看内容，Ctrl+L 保留回看和当前输入；二者都保留命令历史。
- contact 显示 mailto，profiles 显示外部主页；home 返回主页，浏览器返回后必须能继续输入。
- 已授权 GoatCounter 页面访问统计：通过 `_includes/analytics.html` 共用于主页/CV 与 Terminal，只在生产域名记录页面访问及共用的 `site-visit` 事件；不采集 Terminal 输入或点击事件。所有常规网页通过公共页脚显示 `site-visit` 的会话去重计数，Terminal 参与统计但不显示数字；不用各页面相加的 `TOTAL`，保持后台 Sessions 开启。本地预览只读，不提供本地上报开关；不在前端放 API Key。修改统计逻辑后运行 `npm run test:analytics`。
- 不额外引入服务端执行、持久化访客文件或其他遥测。扩展这些能力前先确认范围。

## 验证

从仓库根目录：

```sh
npm run build:js
npm run test:analytics
npm run test:theme
npm run test:code-blocks
npm --prefix _terminal test
npm --prefix _terminal run build
git diff --check
```

按 README 设置 `JEKYLL_ENV=production` 后运行 `bundle exec jekyll build --strict_front_matter`。不要使用 `--safe`，否则 Expressive Code 本地插件被禁用。Ruby 与 Node 都需要在 PATH 中。用户刚清理过构建目录时，优先用 `--destination` 输出到新建的独立临时目录，避免重新污染仓库。

根据修改范围选择检查；整体重构必须完成相关构建和浏览器回归。根目录没有 npm test，Vitest 位于 `_terminal/`。常规网页没有已提交的一键浏览器测试脚本，不假定临时 Playwright 脚本存在。

- 样式/网页：中英文 Home/Blog/CV、英文 404，浅深色、手机/桌面；菜单、Feed 返回、主题、章节导航、返回顶部、对应语言 PDF 下载。检查对应页面语言切换、语言内导航、刷新/前进/后退，以及键盘/无 JS 的链接回退。
- 双语/SEO：检查标题、描述、自指 canonical、互相对应的 hreflang 和 sitemap；Terminal 保持英文。计数事件及读取路径不能随语言改变，测试需模拟或拦截统计请求。
- 主题：`npm run test:theme` 覆盖偏好、系统变化、存储不可用及页面缓存恢复；修改主题同步时同时做 GUI/Terminal 往返检查。
- DOM/Terminal：单测、类型检查、内容/加粗同步、补全/历史/清屏、home 和浏览器返回，必要时检查缩放及长行。
- 构建/清理：有效资源路径，无未渲染 Liquid/本地 URL，不发布开发目录或私有文件。
- 文档：文件链接、命令、工作目录与实际配置一致，不把没执行的检查写成已通过。

临时测试脚本、截图、浏览器配置目录和测试构建放在系统临时目录，不引入生产页面的测试开关。浏览器移动视口模拟不等于手机真机/Safari 验证；交付时写明覆盖范围。

## 源码、产物与发布

- 根源码生成 `assets/js/main.min.js`；Terminal 生成 `assets/terminal/terminal.js`、`terminal.css`、`THIRD_PARTY_NOTICES.md`，产物必须随源码提交。
- 根目录与 `_terminal/package-lock.json` 均纳入 Git，各自使用 npm ci；修改依赖时一起更新对应锁文件。
- `_site/`、`.sass-cache/`、`node_modules/`、`vendor/`、`.bundle/` 为本地输出/依赖/配置，不提交；清理前确认目标和相关进程。
- exclude 控制发布，gitignore 控制版本管理；新增开发目录和文档时分别检查。
- `images/manifest.liquid` 是源码，公开地址依然是 `/images/manifest.json`。
- Pages 使用 `.github/workflows/pages.yml`：master 推送/手动触发部署，PR 只构建；执行 npm 测试与 GUI/Terminal 构建，再运行 Jekyll 和 Expressive Code，发布 Pages artifact。首次迁移须由维护者将 Pages Source 设置为 GitHub Actions；不得把本地新增 workflow 当成已完成线上配置或部署。不使用 --safe/--drafts，不增加 .nojekyll。
- 保留素材来源、LICENSE、第三方声明；无需向 Academic Pages 上游提交个人主页改动。

交付说明改动、已执行检查和未验证项，不承诺绝对无 bug。只有明确授权后才提交/推送/部署，部署成功需核对目标提交的 Pages 状态及线上页面，不能仅凭 push 成功判断。
