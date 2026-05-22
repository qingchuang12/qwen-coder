# Edge Sidebar Extension - AI Chat Launcher

一个 Edge 浏览器侧边栏扩展，用于快速访问和管理 AI 聊天网站。

## 功能特点

- 🚀 **快速启动** - 点击扩展图标打开侧边栏，一键在新标签页中打开选中的网站
- 📋 **下拉切换** - 通过顶部下拉菜单快速切换不同网站
- ➕ **自定义管理** - 添加、编辑、删除任意网站
- 💾 **自动同步** - 数据通过 Chrome Storage Sync 自动同步
- 🔖 **记忆功能** - 记住上次使用的网站，下次自动选中
- 🎨 **精美界面** - 现代化的卡片式设计，支持 hover 和选中效果

## 默认网站

- DeepSeek Chat (https://chat.deepseek.com/)
- Qwen Coder (https://coder.qwen.ai/)

## 安装方法

1. 打开 Edge 浏览器，访问 `edge://extensions/`
2. 开启右上角的"开发人员模式"
3. 点击"加载解压缩的扩展"
4. 选择本项目的文件夹 `/workspace/edge-sidebar-extension`
5. 扩展图标将出现在浏览器工具栏中

## 使用方法

### 打开侧边栏
- 点击浏览器工具栏中的扩展图标

### 选择网站
- 使用顶部的下拉菜单选择要访问的网站
- 或者点击下方的网站卡片进行选择（选中状态会高亮显示）

### 打开网站
- 点击底部的 "🚀 Open Selected Site" 按钮
- 网站将在新标签页中打开（由于大多数网站禁止在 iframe 中嵌入）

### 管理网站

#### 添加网站
1. 点击 "+ Add New Site" 按钮
2. 输入网站名称和 URL
3. 点击 "Save" 保存

#### 编辑网站
1. 点击网站卡片右侧的 "Edit" 按钮
2. 修改名称或 URL
3. 点击 "Save" 保存

#### 删除网站
1. 点击网站卡片右侧的 "Delete" 按钮
2. 确认删除

## 技术说明

### 为什么网站在新标签页打开？

大多数现代网站（包括 DeepSeek、Qwen 等）都设置了 `X-Frame-Options` 或 `Content-Security-Policy` 头部，禁止网站被嵌入到 iframe 中。这是为了防止点击劫持等安全攻击。

因此，本扩展采用在新标签页中打开网站的方式，确保所有网站都能正常访问。

### 权限说明

- `sidePanel` - 显示侧边栏面板
- `storage` - 存储用户配置的网站列表
- `tabs` - 在新标签页中打开网站
- `notifications` - 显示错误通知

## 文件结构

```
edge-sidebar-extension/
├── manifest.json      # 扩展配置文件
├── background.js      # 后台脚本，处理侧边栏打开和 URL 跳转
├── sidebar.html       # 侧边栏 UI 界面
├── sidebar.js         # 侧边栏逻辑
├── icons/             # 扩展图标
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md          # 说明文档
```

## 开发调试

1. 在 `edge://extensions/` 页面找到已加载的扩展
2. 点击 "检查视图 - background page" 打开开发者工具
3. 查看 Console 中的日志输出

## 许可证

MIT License
