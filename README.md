# Yingjie Yang's personal website

个人主页，基于 Academic Pages / Minimal Mistakes，使用 Jekyll 发布到 GitHub Pages。

- 线上地址：[jayverse3.github.io](https://jayverse3.github.io/)
- 页面：Home、HTML CV、Terminal、404，附带 RSS、sitemap 和旧地址重定向。
- 代码助手先读：[AGENTS.md](AGENTS.md)。
- Terminal 专项说明：[_terminal/README.md](_terminal/README.md)。

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

打开 <http://localhost:4000/>、<http://localhost:4000/cv/>、<http://localhost:4000/terminal/>、<http://localhost:4000/404.html>。

按 Ctrl+C 停止预览。不要双击 Markdown / HTML 文件，也不要只启动 Vite：Terminal 需要 Jekyll 生成的布局和内容模板。无需为了本地预览修改 `_config.yml` 的线上 `url`。

若当前终端之前设置过生产环境，先恢复开发模式：

```powershell
$env:JEKYLL_ENV = 'development'
```

macOS / Linux 对应 `export JEKYLL_ENV=development`。Windows 文件修改未被监听时，在 serve 命令末尾添加 `--force_polling`。修改 `_config.yml` 后重启 Jekyll。本地预览原理见 [GitHub 官方指南](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)。

## 2. 日常开发：修改哪里

| 要修改的内容 | 源文件 |
| --- | --- |
| 站点地址、个人信息、发布排除规则 | [_config.yml](_config.yml) |
| 首页简介、News、Education、Experience、Publications | [_pages/home.md](_pages/home.md) |
| HTML CV 内容 | [_pages/cv.md](_pages/cv.md) |
| 可下载英文简历 | [files/yingjie-yang-cv.pdf](files/yingjie-yang-cv.pdf) |
| 导航项目 / 顶部图标 | [_data/navigation.yml](_data/navigation.yml)、[_includes/masthead.html](_includes/masthead.html) |
| 通用 / CV / Terminal 布局 | [_layouts/single.html](_layouts/single.html)、[_layouts/cv.html](_layouts/cv.html)、[_layouts/terminal.html](_layouts/terminal.html) |
| 侧栏个人信息 | [_includes/author-profile.html](_includes/author-profile.html) |
| 字体、断点、网格设置 | [_sass/_settings.scss](_sass/_settings.scss) |
| 浅深色配色 | [_sass/theme/_default_light.scss](_sass/theme/_default_light.scss)、[_sass/theme/_default_dark.scss](_sass/theme/_default_dark.scss) |
| 通用页面 / 首页卡片与欢迎语 / CV 样式 | [_sass/layout/_page.scss](_sass/layout/_page.scss)、[_sass/layout/_home.scss](_sass/layout/_home.scss)、[_sass/layout/_cv.scss](_sass/layout/_cv.scss) |
| GUI 导航、主题、Links 菜单 | [assets/js/src/](assets/js/src/) |
| 章节导航 / 返回顶部 / 欢迎语动画 | [assets/js/section-nav.js](assets/js/section-nav.js)、[assets/js/back-to-top.js](assets/js/back-to-top.js)、[assets/js/welcome.js](assets/js/welcome.js) |
| Terminal 命令、内容转换、格式化、输入 | [_terminal/src/](_terminal/src/)，详见其 README |
| 图片、图标及来源说明 | [images/](images/)；manifest 源码为 [images/manifest.liquid](images/manifest.liquid) |

HTML CV 和 PDF 不会自动同步。PDF 的 RenderCV 源码不在本仓库；编辑 PDF 内容前向维护者确认源码位置，不要从 PDF 猜测或重新编造源文件。

### 哪些修改需要重建

| 修改 | 操作 | 需要随源码提交的产物 |
| --- | --- | --- |
| Markdown、Liquid、SCSS、图片、直接加载的 JS | Jekyll 自动重建，刷新浏览器 | 不提交 `_site/` |
| `assets/js/src/*.js` | `npm run build:js` | `assets/js/main.min.js` |
| `_terminal/src/*` 或 Terminal 构建配置 | `npm --prefix _terminal run build` | `assets/terminal/terminal.js`、`terminal.css`、`THIRD_PARTY_NOTICES.md` |

Terminal 从 Jekyll 注入的 Home 内容模板读取简介等内容。只改 Home 文案时无需重建 Terminal JS；改标题 ID、卡片类名或 DOM 结构时，还要检查 `_terminal/src/content.ts`。

开发脚本时，在 Jekyll 预览之外另开终端运行所需监听器（均从根目录执行）：

```sh
npm run watch:js
```

```sh
npm --prefix _terminal run watch
```

两个监听器各自占用终端，Ctrl+C 停止。Terminal 的 watch 不替代提交前的类型检查和单元测试。

## 3. 提交前验证

涉及脚本或整体重构时：

```sh
npm run build:js
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

- Home/CV/404：浅深色、手机和桌面宽度；无横向溢出、破图，短页面页脚位于底部。
- Links 打开/外部点击关闭，缩放到桌面后链接可见；Feed 返回不残留触屏悬停色。
- 点击 About 显示完整欢迎语；滚动不跳过短章节；返回顶部正常。
- Terminal：内容命令、Tab 补全、历史、主题、`clear`、Ctrl+L、`gui`，以及浏览器返回后继续输入。
- PDF 下载、Feed、图标和 manifest 有效，产物没有 `localhost` 链接、未渲染 Liquid、开发依赖或私有文件。

已有 Terminal 的 Vitest 单元测试；目前没有纳入仓库的一键 GUI 浏览器回归脚本。上述浏览器检查需手动执行或使用当前可用工具，不要引用上一台机器临时目录里的测试脚本。

## 4. 部署到 GitHub Pages

本项目采用源码分支发布，约定为 **master → /(root)**，不是上传本地 `_site/`。首次配置：仓库 **Settings → Pages → Build and deployment → Deploy from a branch**，选择 `master` 与 `/(root)`。参见 [GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

仓库没有自定义部署 workflow。GitHub 会运行内置 Jekyll 构建，但不会执行本项目的 npm 构建，修改 JS 时必须先提交对应浏览器产物。不要添加 `.nojekyll`，也不要擅自切到 `docs/`、`gh-pages` 或自定义 Actions 发布方式。

发布步骤：

1. 完成验证，核对 `_config.yml` 的 `url`、`baseurl`、`repository`。当前 URL 为 `https://jayverse3.github.io`，`baseurl` 为空。
2. 用 `git status --short`、`git diff` 审阅改动和生成文件，留意未跟踪的新文件。
3. 用 `git add --` 明确选择本次文件，不盲目暂存所有已有改动；源码和编译产物一起提交。
4. 确认目标提交位于 `master` 后推送 `origin/master`。其他开发分支先按维护者要求合并，不用强制重置覆盖工作。
5. 在 GitHub Actions / Pages 状态中核对**目标提交**的构建和部署成功；push 成功不等于部署成功。
6. 验收线上 Home、CV、Terminal、PDF、Feed 及不存在的地址（如 `/cas`），确认主题和资源正常。

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
