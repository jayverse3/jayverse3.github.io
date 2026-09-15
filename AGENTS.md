# 本仓库的代码助手指南

适用于所有子目录。这里是 Yingjie Yang 的个人主页，不是 Academic Pages 上游模板。开始工作先读 [README.md](README.md)；涉及 Terminal 再读 [_terminal/README.md](_terminal/README.md)。

## 开始任务

1. 检查目录、分支、`git status --short`。可能存在大量未提交改动和新文件，它们不是待清理的垃圾。
2. 按 README 映射定位源码，读相关调用方和测试。不依赖历史聊天或其他机器的绝对路径。
3. 评审/诊断不授权改代码；未明确要求时不 commit、push、部署或修改 Pages 设置。
4. 缺依赖时按 README 安装，优先已验证的 Ruby 3.3.x / Node 24。不在普通任务里顺带升级依赖。

## 架构与内容来源

- GUI：Jekyll / Liquid / SCSS，Gemfile 的 github-pages 依赖用于与 Pages 构建保持兼容。
- GUI 脚本：`assets/js/src/navigation.js`、`theme.js`、`profile-menu.js`，使用 jQuery，状态各自封装。
- `assets/js/welcome.js`、`section-nav.js`、`back-to-top.js` 直接加载，不经根 npm 编译。
- Terminal：`_terminal/` 的 TypeScript + xterm.js + Vite，独立只读页面，不是真实 Bash / Python / npm 执行环境。
- Home 内容只维护 `_pages/home.md`。Terminal 布局按 URL `/` 找到首页并注入 `#terminal-content`，由 `_terminal/src/content.ts` 提取；不要复制另一份个人经历。
- HTML CV 在 `_pages/cv.md`；PDF 在 `files/yingjie-yang-cv.pdf`，二者不自动同步。PDF 源码不在本仓库，不要假定存在历史聊天里的简历目录。
- 公开路径保持 `/`、`/cv/`、`/terminal/`、`/feed.xml`、`/images/manifest.json`；旧 About/CV 地址使用 front matter 重定向。

## 编辑边界与规范

- 编辑源码，用项目命令重建；不手改压缩 JS、Terminal bundle 或 `_site/`。
- JS/TS 使用明确的 camelCase，文件按职责命名，状态限定在组件作用域；不引入全局可变变量或含义不清的缩写。
- SCSS 设置在 `_sass/_settings.scss`，颜色在 `_sass/theme/`，通用页面/Home/CV 分别在 `_page.scss`、`_home.scss`、`_cv.scss`。
- 重复按下/悬停样式复用 `interactive-state` mixin，保留键盘焦点；不为手机浏览器正常的边缘触摸容错增加 JS 拦截。
- 菜单模式依据 CSS 中按钮是否显示，不把同一断点再次硬编码进 JS。不要为一次性逻辑引入新框架或通用配置层。
- 标题 ID、卡片类名、DOM 结构同时服务样式、导航和 Terminal 提取；改名要一起检查调用方。
- 改路径或构建入口时，同步更新 imports/includes、package scripts、发布 exclude 和文档。
- 使用 UTF-8。不批量格式化无关文件，不改第三方库命名，不清掉版权声明。

## 已确定的交互约定

除非用户明确要求重新设计，重构时保持：

- GUI/Terminal 共用 theme 存储偏好，无偏好时跟随系统，首次绘制前初始化；存储不可用不阻断基本交互。
- CDN、懒加载、独立浅深色 SVG 仍在使用，不擅自改成全本地或全量预加载，不删除另一主题资源。
- 手机 Links 点击打开，再次点击或点击外部关闭；触摸高亮与键盘可见焦点要区分。
- About 跳转显示完整欢迎语；其他章节保留上下文留白与短页面滚动规则，不退回“上个标题离开就高亮下个”的逻辑。
- 卡片淡出、欢迎语颜色、分隔线切换、页脚底部位置已有设计，不借重构改变视觉效果。
- Terminal 命令按字母序显示，文字/加粗与 Home 同步，按句起行，长句按终端宽度折行。
- clear 清屏及滚动回看，Ctrl+L 保留回看和当前输入；二者都保留命令历史。
- contact 显示 mailto，profiles 显示外部主页；gui 返回普通主页，浏览器返回后必须能继续输入。
- 不引入服务端执行、持久化访客文件、遥测或 API Key。扩展这些能力前先确认范围。

## 验证

从仓库根目录：

```sh
npm run build:js
npm --prefix _terminal test
npm --prefix _terminal run build
git diff --check
```

按 README 设置 `JEKYLL_ENV=production` 后运行 `bundle exec jekyll build --safe --strict_front_matter`。用户刚清理过构建目录时，优先用 `--destination` 输出到新建的独立临时目录，避免重新污染仓库。

根据修改范围选择检查；整体重构必须完成相关构建和浏览器回归。根目录没有 npm test，Vitest 位于 `_terminal/`。GUI 没有已提交的一键浏览器测试脚本，不假定临时 Playwright 脚本存在。

- 样式/GUI：Home、CV、404，浅深色、手机/桌面；菜单、Feed 返回、主题、章节导航、返回顶部、PDF 下载。
- DOM/Terminal：单测、类型检查、内容/加粗同步、补全/历史/清屏、gui 和浏览器返回，必要时检查缩放及长行。
- 构建/清理：有效资源路径，无未渲染 Liquid/本地 URL，不发布开发目录或私有文件。
- 文档：文件链接、命令、工作目录与实际配置一致，不把没执行的检查写成已通过。

## 源码、产物与发布

- 根源码生成 `assets/js/main.min.js`；Terminal 生成 `assets/terminal/terminal.js`、`terminal.css`、`THIRD_PARTY_NOTICES.md`，产物必须随源码提交。
- `_terminal/package-lock.json` 是根锁文件忽略规则的例外，必须保留并纳入 Git。
- `_site/`、`.sass-cache/`、`node_modules/`、`vendor/`、`.bundle/` 为本地输出/依赖/配置，不提交；清理前确认目标和相关进程。
- exclude 控制发布，gitignore 控制版本管理；新增开发目录和文档时分别检查。
- `images/manifest.liquid` 是源码，公开地址依然是 `/images/manifest.json`。
- Pages 使用 master / root 的内置 Jekyll 构建，不编译 npm 产物；不擅自新增部署方案或 .nojekyll。
- 保留素材来源、LICENSE、第三方声明；无需向 Academic Pages 上游提交个人主页改动。

交付说明改动、已执行检查和未验证项，不承诺绝对无 bug。只有明确授权后才提交/推送/部署，部署成功需核对目标提交的 Pages 状态及线上页面，不能仅凭 push 成功判断。
