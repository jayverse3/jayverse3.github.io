# Yingjie Yang's personal website

个人主页，基于 Academic Pages / Minimal Mistakes，使用 Jekyll 发布到 GitHub Pages。

- 线上地址：[jayverse3.github.io](https://jayverse3.github.io/)
- 页面：中英文 Home / HTML CV、英文 Terminal / 404，附带两种语言的 PDF、RSS、sitemap 和旧地址重定向。
- 代码助手先读：[AGENTS.md](AGENTS.md)。
- Terminal 专项说明：[_terminal/README.md](_terminal/README.md)。

### 中英文页面

主页和 CV 使用独立语言网址，共用布局和样式；Terminal 仅提供英文。

| 页面 | 英文 | 简体中文 | `translation_key` |
| --- | --- | --- | --- |
| 首页 | `/` | `/zh/` | `home` |
| HTML CV | `/cv/` | `/zh/cv/` | `cv` |

顶部语言入口在英文页显示「中文」、中文页显示「EN」，跳转到另一语言的对应页面；首页/CV 导航保持当前语言。切换使用普通链接，不依赖 JavaScript，不自动检测语言、跳转或保存语言偏好。没有对应译文的页面（如 404）不显示切换入口，Terminal 保持英文独立页面。

中英文 CV 分别下载对应语言的 PDF；Terminal 的 `home` / `cv` 命令仍使用英文主页、网页 CV 和英文 PDF。英文网址及旧地址重定向保持不变。顶部「Last updated in」在两种语言下均保留英文；页面内日期使用各语言的显示格式。

`_includes/seo.html` 统一生成页面标题、描述、canonical 和 Open Graph 信息。英文站点标题/默认描述取自 `_config.yml`，中文覆盖值与 Open Graph locale 配置在 `_data/i18n.yml` 的 `seo` 下；单页描述用 front matter 的 `description` 覆盖。每个语言版本的 canonical 指向自身；有对应译文时，按 `translation_key` 自动生成包含自身的 `en` / `zh-Hans` 链接，`x-default` 指向对应英文页。Terminal / 404 不输出译文链接。已有 sitemap 插件收录两种语言的 Home/CV，无需另写一套语言网址映射。

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
| Node.js / npm | 已验证 Node 24.21.0 / npm 11.19.0，用于编译浏览器脚本 |
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
npm install
npm --prefix _terminal ci
```

需要能访问 GitHub、RubyGems 和 npm registry。换机器前先提交并推送要保留的工作，克隆不会带上原机器未提交的文件。

这里有两套独立的 npm 依赖，不能只装其中一套：

| 位置 | 安装方式 | 锁文件约定 |
| --- | --- | --- |
| 根目录 | `npm install` | 根 `package-lock.json` 被忽略，不使用 `npm ci` |
| `_terminal/` | `npm --prefix _terminal ci` | `_terminal/package-lock.json` 必须纳入 Git，与 package.json 同步 |
| Ruby | `bundle install` | 本地生成的 `Gemfile.lock` 当前被忽略 |

根 npm 和 Ruby 依赖不是完全锁定的，首次安装或显式更新后需要重新验证。不要把旧机器的 `node_modules`、`vendor`、`.bundle` 直接复制到另一个系统，也不要把依赖升级混在普通内容修改里。

### 首次构建与预览

```sh
npm run build:js
npm --prefix _terminal test
npm --prefix _terminal run build
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

打开英文首页 <http://localhost:4000/>、英文 CV <http://localhost:4000/cv/>、中文首页 <http://localhost:4000/zh/>、中文 CV <http://localhost:4000/zh/cv/>；另检查 <http://localhost:4000/terminal/> 和 <http://localhost:4000/404.html>。

按 Ctrl+C 停止预览。不要双击 Markdown / HTML 文件，也不要只启动 Vite：Terminal 需要 Jekyll 生成的布局和内容模板。无需为了本地预览修改 `_config.yml` 的线上 `url`。

若当前终端之前设置过生产环境，先恢复开发模式：

```powershell
$env:JEKYLL_ENV = 'development'
```

macOS / Linux 对应 `export JEKYLL_ENV=development`。Windows 文件修改未被监听时，在 serve 命令末尾添加 `--force_polling`。修改 `_config.yml` 后重启 Jekyll。本地预览原理见 [GitHub 官方指南](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)。

## 2. 日常开发：修改哪里

| 要修改的内容 | 源文件 |
| --- | --- |
| 站点地址、联系链接、规范作者名、发布排除规则 | [_config.yml](_config.yml) |
| 全站侧栏个人资料、首页/Terminal 正文、日期、Logo、项目链接 | [_data/profile.yml](_data/profile.yml) |
| 网页 CV 的教育、经历、研究成果、奖项与技能 | [_data/cv.yml](_data/cv.yml) |
| 网页界面标签、章节名称、日期显示格式 | [_data/i18n.yml](_data/i18n.yml) |
| 页面标题、描述、canonical、语言对应链接 | [_includes/seo.html](_includes/seo.html)、[_data/i18n.yml](_data/i18n.yml) 的 `seo`、页面 front matter |
| 中英文页面配置 | [_pages/home.md](_pages/home.md)、[_pages/cv.md](_pages/cv.md)、[_pages/zh/](_pages/zh/) |
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

CV 的 LaTeX 标志由 `assets/js/cv.js` 调用 KaTeX 渲染；固定版本的 CSS/JS 仅在 CV 页面加载，配置位于 `_includes/head.html`。CDN 不可用时保留普通 `LaTeX` 文本，不影响阅读。

### 哪些修改需要重建

| 修改 | 操作 | 需要随源码提交的产物 |
| --- | --- | --- |
| Markdown、Liquid、SCSS、图片、直接加载的 JS | Jekyll 自动重建，刷新浏览器 | 不提交 `_site/` |
| `assets/js/src/*.js` | `npm run build:js` | `assets/js/main.min.js` |
| `_terminal/src/*` 或 Terminal 构建配置 | `npm --prefix _terminal run build` | `assets/terminal/terminal.js`、`terminal.css`、`THIRD_PARTY_NOTICES.md` |

Terminal 与主页共用 `home-content.html`，Terminal 固定读取 `_data/profile.yml` 的英文内容。只改数据文案时无需重建 Terminal JS；改标题 ID、卡片类名或 DOM 结构时，还要检查 `_terminal/src/content.ts`。语言分支尚未提供时，模板回退到英文。

主页经历的 `summary` 支持 Markdown 加粗；`experience-summary.html` 将 `%MODEL%` 替换为对应语言的模型名，将 `%MODEL_LOGO%` 替换为浅/深色 Logo。Logo 模板和样式不添加间距，两侧空格直接写在主页正文中，例如 `参与 %MODEL_LOGO% %MODEL%基模`。网页 CV 不调用这个模板；在 `_data/cv.yml` 直接编写普通 Markdown 摘要（例如 `参与文心基模的后训练……`），详细工作内容使用 `cv_groups`，没有详细条目时显示 CV 自己的 `summary`。主页中的 Logo、措辞或间距修改不会改变 CV 正文。PDF 下载地址仍由各 CV 页面的 `pdf` 字段控制，不因新增中文页面自动公开其他 PDF。

### 维护双语内容

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
- 在 GoatCounter 的站点设置开启 **Allow adding visitor counts on your website**，网页公共页脚才能读取并显示 `Site visits`；后台不需要设为公开。
- 主页/CV 与 Terminal 共用 `_includes/analytics.html` / `assets/js/site-analytics.js`，仅在生产构建且当前域名与配置一致时启用统计。页面以 `location.pathname` 归类；官方脚本仍会发送查询参数及来源等默认统计字段。不记录 Terminal 命令或点击事件。
- 各页面保留原有浏览记录，并在页面可见时发送同一个 `site-visit` 事件。Home、CV、404 等常规网页共用页脚，统一读取该事件的累计计数，不读取相加各页面的 `TOTAL`；Terminal 参与统计但不显示计数。同一会话中首页 → CV → Terminal 或反复刷新，全站计数只增加 1。
- 保持 **Settings → Data collection → Sessions** 开启，由 GoatCounter 按约 8 小时窗口去重；不是永久去重的人数。更换网络或浏览器可能另算一次。机制见 [Sessions and visitors](https://www.goatcounter.com/help/sessions)。不额外使用 Cookie / localStorage 标识访客。
- 后台查看全站访问时选择 `site-visit` / `Site visits`；只查看各页面时用 `is:pageview` 过滤。不要把事件和页面数字相加当作人数。新口径从部署后开始累积，不将旧 `TOTAL` 当作历史去重人数。
- 公开数字可能缓存至多四小时，不是实时跳数。普通本地预览仅查询已有计数，不增加访问；接口明确返回缺失路径的 JSON `count: "0"` 时显示 0，未启用公开计数、接口超时或请求被拦截时隐藏该行，不填占位数字。
- 常规网页不等待计数：页脚初始隐藏该行，后台请求最多 5 秒，成功后直接显示，无需刷新页面。显示标签由 `_data/i18n.yml` 通过页脚 `data-label` 提供，统计事件的 `site-visit` 标识及 `Site visits` 标题保持固定。Terminal 不请求公开计数，也不等待或显示数字；仅保留生产环境的访问记录。
- 排除自己的线上访问可在网站地址后加 `#toggle-goatcounter` 并按提示操作。说明见 [GoatCounter 文档](https://www.goatcounter.com/help/skip-dev)。
- 修改统计逻辑后运行 `npm run test:analytics`（Node 内置测试，所有请求均为模拟，不污染线上数据），再检查 Jekyll 构建与网页公共页脚。

## 3. 提交前验证

涉及脚本或整体重构时：

```sh
npm run build:js
npm run test:analytics
npm --prefix _terminal test
npm --prefix _terminal run build
git diff --check
```

然后做一次生产模式 Jekyll 构建。

PowerShell：

```powershell
$env:JEKYLL_ENV = 'production'
bundle exec jekyll build --safe --strict_front_matter
```

macOS / Linux：

```sh
JEKYLL_ENV=production bundle exec jekyll build --safe --strict_front_matter
```

默认输出在 `_site/`。自动化检查可用 `--destination` 指定新建的独立临时目录，不能指向源码或已有用户文件目录。构建后还需检查：

- 英文与中文 Home/CV、英文 404：浅深色、手机和桌面宽度；无横向溢出、破图，短页面页脚位于底部。
- 语言切换对应当前页面，导航保持语言，刷新与前进/后退正常；键盘和禁用 JavaScript 时仍能使用语言链接。
- 各语言的标题、描述、canonical、hreflang 和 sitemap 对应正确；Terminal 不生成中文地址。
- Links 打开/外部点击关闭，缩放到桌面后链接可见；Feed 返回不残留触屏悬停色。
- 点击 About 显示完整欢迎语；滚动不跳过短章节；返回顶部正常。
- Terminal：内容命令、Tab 补全、历史、主题、`clear`、Ctrl+L、`home`，浏览器返回后继续输入；从中文 GUI 进入仍为英文，往返两种语言的 GUI 时主题保持同步。
- 两种语言的 CV 下载对应 PDF；Feed、图标和 manifest 有效，产物没有 `localhost` 链接、未渲染 Liquid、开发依赖或私有文件。
- 两种语言的 GUI 页脚显示同一个 `site-visit` 计数，仅标签翻译；延迟、失败或超时不阻塞页面，Terminal 不显示计数。自动化检查应模拟或拦截统计请求，不污染线上访问量。

已有 Terminal 的 Vitest 单元测试和 `npm run test:analytics`（Node 内置测试）。目前没有纳入仓库的一键网页浏览器回归脚本；上述浏览器检查需手动执行或使用当前可用工具，不依赖历史临时脚本。临时测试脚本、截图、浏览器配置目录和测试构建应放在系统临时目录，不提交或发布。Chrome 移动视口模拟不等同于手机真机或 Safari 验证，应在交付时说明实际覆盖范围。

## 4. 部署到 GitHub Pages

本项目采用源码分支发布，约定为 **master → /(root)**，不是上传本地 `_site/`。首次配置：仓库 **Settings → Pages → Build and deployment → Deploy from a branch**，选择 `master` 与 `/(root)`。参见 [GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

仓库没有自定义部署 workflow。GitHub 会运行内置 Jekyll 构建，但不会执行本项目的 npm 构建，修改 JS 时必须先提交对应浏览器产物。不要添加 `.nojekyll`，也不要擅自切到 `docs/`、`gh-pages` 或自定义 Actions 发布方式。

发布步骤：

1. 完成验证，核对 `_config.yml` 的 `url`、`baseurl`、`repository`。当前 URL 为 `https://jayverse3.github.io`，`baseurl` 为空。
2. 用 `git status --short`、`git diff` 审阅改动和生成文件，留意未跟踪的新文件。
3. 用 `git add --` 明确选择本次文件，不盲目暂存所有已有改动；源码和编译产物一起提交。
4. 确认目标提交位于 `master` 后推送 `origin/master`。其他开发分支先按维护者要求合并，不用强制重置覆盖工作。
5. 在 GitHub Actions / Pages 状态中核对**目标提交**的构建和部署成功；push 成功不等于部署成功。
6. 验收线上 `/`、`/cv/`、`/zh/`、`/zh/cv/`、`/terminal/`、两份 PDF、Feed 及不存在的地址（如 `/cas`），确认语言切换、主题和资源正常。新页面、数据文件、共用模板与中文 PDF 必须一同纳入提交，不仅提交已有文件的修改。

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
- `assets/js/main.min.js`、`assets/terminal/*` 是本发布模式必须提交的生成资源，不作为“冗余文件”删除。
- `images/manifest.liquid` 输出为 `/images/manifest.json`；网页引用后者。
- `images/*-source.md` 留在 Git 保存素材出处和许可证，不作为网页发布；保留根 LICENSE 和第三方声明。
- 博客尚未启用，`_posts` 被排除；不要默认恢复已删除的博客布局、MathJax、Plotly、Mermaid 等集成。

## 6. 常见问题

| 现象 | 先检查 |
| --- | --- |
| 找不到 ruby / bundle / node / npm | 安装与 PATH，重新打开终端，使用已验证的工具系列 |
| 原生 gem 编译失败 | Windows 的 Ruby+Devkit / MSYS2；不要先随意升级所有 gem |
| 根目录 npm ci 失败 | 根目录没有纳入版本管理的锁文件，应运行 npm install |
| Terminal npm ci 失败 | Node、网络、锁文件是否缺失/失配；不要通过删锁文件绕过 |
| 修改脚本后仍是旧效果 | 源码路径、对应 npm 构建、产物是否提交，然后再检查浏览器缓存 |
| 配置修改未生效 | 重启 Jekyll，检查命令是否在仓库根目录执行 |
| Terminal 一直 Starting terminal | Console/Network、assets/terminal 产物和 Jekyll 内容模板 |
| 本地正常、线上缺文件 | Git 跟踪、exclude、文件名大小写、部署是否对应最新提交 |
| 4000 端口占用 | 改用 --port 4001 并访问对应端口，不随意关闭其他服务 |

## Credits

Based on [Academic Pages](https://academicpages.github.io/) and [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/). See [LICENSE](LICENSE) for the MIT license and original copyright notices.
