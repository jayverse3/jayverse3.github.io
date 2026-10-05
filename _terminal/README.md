# Terminal homepage

浏览器内只读个人主页：TypeScript 命令层 + xterm.js，不是真实系统 Shell，没有服务端执行或可写文件系统。

环境、完整预览和发布见 [根 README](../README.md)，编码约定见 [AGENTS.md](../AGENTS.md)。

## 安装、开发和构建

推荐根 README 已验证的 Node 24 系列，最低约束以 [package.json](package.json) 的 engines 为准。从仓库根目录：

```sh
npm --prefix _terminal ci
npm --prefix _terminal test
npm --prefix _terminal run build
```

已经位于 `_terminal/` 时，对应 `npm ci`、`npm test`、`npm run build`。保留并提交 [package-lock.json](package-lock.json)，依赖变化时一起更新。

在一个终端从根目录启动 Jekyll：

```sh
bundle exec jekyll serve --host 127.0.0.1 --port 4000
```

另开终端，同样从根目录监听 Terminal 源码：

```sh
npm --prefix _terminal run watch
```

访问 <http://localhost:4000/terminal/>。不要只运行 Vite dev server，应用依赖 Jekyll 输出的 HTML、data 属性和 Home 模板。build 先进行 TypeScript 检查再构建；watch 不替代 test 和正式 build。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| [../_pages/terminal.md](../_pages/terminal.md) | 页面入口与 permalink |
| [../_layouts/terminal.html](../_layouts/terminal.html) | 布局、启动提示、站点链接、初始主题，固定注入英文 Home 内容 |
| [../_data/profile.yml](../_data/profile.yml)、[../_includes/home-content.html](../_includes/home-content.html) | 与主页共用的个人资料及首页内容模板 |
| [src/content.ts](src/content.ts) | 提取章节，保留加粗范围，拆分句子 |
| [src/shell.ts](src/shell.ts) | 命令注册、参数解析、补全、历史、执行结果；不操作 DOM |
| [src/formatting.ts](src/formatting.ts) | 可单测的 ANSI 颜色、链接标签、折行和加粗 |
| [src/main.ts](src/main.ts) | xterm 初始化、输入编辑、命令分派、滚动、主题和返回恢复 |
| [src/links.ts](src/links.ts) | 链接校验、OSC 8 超链接编码 |
| [src/banner.ts](src/banner.ts) | 预生成 ANSI Shadow 字样、窄屏回退和主题渐变 |
| [src/style.css](src/style.css) | Terminal 专属样式，其他页面不加载 |
| [vite.config.ts](vite.config.ts) | 库模式构建与发布文件名 |

主页和 Terminal 都由 Jekyll 调用 `home-content.html`。Terminal 显式指定 `lang="en"`，将结果放入 `#terminal-content`，再经 readContent 转换；不依赖其他页面的渲染顺序。只改 `_data/profile.yml` 的英文文字/加粗，不用重建 JS；改 DOM 或提取规则时要同时检查两端。主页的中文版本不会改变 Terminal 的语言。

## 修改命令

1. 在 src/shell.ts 注册名称与帮助文本，帮助/补全从同一注册表生成。
2. 纯展示内容由 src/content.ts 提供；UI 副作用先返回明确 action，再由 src/main.ts 处理。
3. 在相应 *.test.ts 覆盖正常输入、无效参数和边界，执行 test 与 build。
4. 浏览器检查浅深色、长行、加粗/链接、输入和页面返回，不仅凭单测判断渲染正常。

不用 eval 或系统命令执行来模拟 Shell。保留 plainText 对控制字符的处理和 safeLink 协议校验，避免输入/粘贴注入终端控制序列；粘贴换行不能自动执行命令。

## 交互约定

- 命令按字母序显示，保留 /command 别名、Tab 补全和 ↑/↓ 历史。
- About、News、卡片简介按句起行，长句自然折行，保留 Home 加粗。
- research 展示 Home 的 Research 卡片，包括论文、技术报告和研究型博客等成果。
- contact 提供 mailto，profiles 提供 GitHub / Scholar。
- home 返回英文主页 `/`；空输入时 Ctrl+D 同义。cv 链接英文网页 CV 与英文 PDF，不随进入 Terminal 前的 GUI 语言变化。前进/后退缓存恢复时保留会话并恢复输入；完整重载时历史不持久化。
- Ctrl+L 清屏但保留回看/草稿；clear 清屏并清除回看；二者均保留命令历史。
- theme 与主页/CV 共用本地存储键，system 取消显式偏好；历史和输入不写入持久存储。
- 滚动条在滚动/悬停/拖动时显示，闲置淡出，不禁用滚轮或触控板。
- welcome 使用预生成横幅，不在线下载 FIGlet 生成器；没有手机访问封禁。

## 产物与发布

以下生成文件必须随源码纳入 Git，不直接手改：

- [../assets/terminal/terminal.js](../assets/terminal/terminal.js)
- [../assets/terminal/terminal.css](../assets/terminal/terminal.css)
- [../assets/terminal/THIRD_PARTY_NOTICES.md](../assets/terminal/THIRD_PARTY_NOTICES.md)

_terminal 是源码目录，不作为网页发布。提交前执行正式构建；GitHub Actions 也会运行 Terminal 测试和构建，再将生成的静态站点发布到 Pages。完整流程见根 README。
