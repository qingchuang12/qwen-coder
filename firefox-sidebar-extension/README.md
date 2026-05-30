# AI 聊天侧边栏 - Firefox 版

一个 Firefox 侧边栏扩展，让您可以在便捷的侧边栏面板中访问多个 AI 聊天网站。

## 功能特点

- 🤖 快速访问多种 AI 聊天服务（DeepSeek、Qwen Coder 等）
- 📌 侧边栏面板在浏览时保持打开状态
- ➕ 添加、编辑和删除自定义 AI 聊天网站
- 🚀 在当前标签页中打开网站
- 💾 记住您上次访问的网站
- 🎨 简洁现代的界面，带有流畅动画

## 安装方法

### 临时安装（用于开发/测试）

1. 打开 Firefox 并访问 `about:debugging`
2. 点击左侧边栏中的"此 Firefox"
3. 点击"加载临时附加组件..."
4. 导航到扩展文件夹并选择 `manifest.json`
5. 扩展将临时加载（Firefox 关闭后将自动移除）

### 永久安装

#### 方式一：使用 web-ext 签名（推荐）

1. **获取 API 凭证**：
   - 前往 [Firefox 附加组件开发者中心](https://addons.mozilla.org/developers/)
   - 进入"API 密钥"部分
   - 生成您的 JWT 凭证（颁发者和密钥）

2. **配置环境变量**：
   ```bash
   # 复制示例环境文件
   cp .env.example .env
   
   # 使用您的凭证编辑 .env 文件
   WEB_EXT_API_KEY=您的颁发者
   WEB_EXT_API_SECRET=您的密钥
   WEB_EXT_CHANNEL=unlisted  # 或使用 "listed" 用于 AMO 发布
   ```

3. **签名扩展**：
   ```bash
   # 如果尚未安装 web-ext，请先安装
   npm install -g web-ext
   # 构建扩展
   web-ext build
   # 签名扩展
   web-ext sign
   ```
   
   签名后的 `.xpi` 文件将下载到 `web-ext-artifacts/` 目录中。

4. **安装签名后的扩展**：
   - 打开 Firefox 并访问 `about:addons`
   - 点击齿轮图标 → "从文件安装附加组件"
   - 从 `web-ext-artifacts/` 目录中选择签名的 `.xpi` 文件

#### 方式二：通过网页界面手动签名

1. 将扩展打包为 `.xpi` 文件：
   ```bash
   cd firefox-sidebar-extension
   zip -r ../ai-chat-sidebar.xpi *
   ```
2. 通过 [Firefox 附加组件开发者中心](https://addons.mozilla.org/developers/) 上传并签名
3. 下载签名的 `.xpi` 文件并在 Firefox 中安装

## 使用方法

1. **打开侧边栏**：点击 Firefox 工具栏中的扩展图标
2. **选择网站**：使用顶部的下拉菜单选择 AI 聊天服务
3. **管理网站**：点击"⚙️ 管理"添加、编辑或删除网站
4. **新标签页**：点击"🚀 新标签页"在当前网站的完整浏览器标签页中打开

## 默认网站

- DeepSeek Chat：https://chat.deepseek.com/
- Qwen Coder：https://coder.qwen.ai/

您可以通过管理面板添加更多网站。

## 与 Edge 版的区别

此 Firefox 版本使用：
- Manifest V2（Firefox 侧边栏支持所需）
- `sidebar_action` 代替 `side_panel`
- `browser.*` API 代替 `chrome.*` API
- 本地存储代替同步存储
- `webRequest` API 代替 `declarativeNetRequest`，用于移除 iframe 阻止头

### 与 Edge 版功能对比

| 功能 | Edge | Firefox |
|---------|------|---------|
| 侧边栏面板/侧边栏 | ✅ `sidePanel` API | ✅ `sidebarAction` API |
| 右键菜单 | ✅ | ✅ |
| 请求头修改 | ✅ `declarativeNetRequest` | ✅ `webRequest` API |
| 存储 | ✅ `chrome.storage.sync` | ✅ `browser.storage.local` |
| 上次访问的网站 | ✅ | ✅ |
| 管理网站 | ✅ | ✅ |
| 在新标签页中打开 | ✅ | ✅ |
| iframe 沙箱 | ✅ 增强权限 | ✅ 增强权限 |

## 文件结构

```
firefox-sidebar-extension/
├── manifest.json      # 扩展配置文件
├── background.js      # 后台脚本
├── sidebar.html       # 侧边栏 UI
├── sidebar.js         # 侧边栏逻辑
└── icons/             # 扩展图标
    ├── icon16.svg
    ├── icon48.svg
    └── icon128.svg
```

## 开发说明

- Firefox 使用基于 Promise 的 `browser.*` API
- 存储使用 `browser.storage.local` 代替 `chrome.storage.sync`
- 侧边栏通过点击工具栏图标打开（Firefox 的限制）

## 许可证

MIT 许可证
