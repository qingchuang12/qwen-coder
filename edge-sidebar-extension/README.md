# AI Chat Sidebar - Edge Extension

一个 Microsoft Edge 侧边栏插件，可以快速访问 AI 聊天网站，支持自定义增删网站和自定义显示名称。

## 功能特点

- ✅ 默认集成 DeepSeek Chat 和 Qwen Coder
- ✅ **点击扩展图标自动打开侧边栏并加载第一个网站**
- ✅ **顶部下拉菜单快速切换网站**
- ✅ **底部管理区域增删改网站**
- ✅ 自定义添加/删除网站
- ✅ 自定义网站显示名称
- ✅ 数据同步（使用 Chrome Storage Sync）
- ✅ 简洁美观的界面
- ✅ 记住上次使用的网站

## 安装步骤

### 方法一：开发者模式加载（推荐用于测试）

1. **下载扩展文件**
   - 克隆或下载此项目到本地

2. **打开 Edge 扩展管理页面**
   - 在 Edge 浏览器中访问：`edge://extensions/`
   - 或者点击菜单 → 扩展 → 管理扩展

3. **启用开发者模式**
   - 打开左侧的"开发人员模式"开关

4. **加载扩展**
   - 点击"加载解压缩的扩展"
   - 选择 `edge-sidebar-extension` 文件夹
   - 扩展将立即安装并启用

5. **使用扩展**
   - 点击浏览器工具栏中的扩展图标
   - 或在任意页面右键选择"Open AI Chat Sidebar"
   - 侧边栏将在右侧打开，自动加载第一个网站

### 方法二：打包成 .crx 文件安装

1. 在 Edge 扩展管理页面 (`edge://extensions/`)
2. 点击"打包扩展"
3. 选择 `edge-sidebar-extension` 文件夹
4. 生成 `.crx` 文件后拖入浏览器安装

## 使用方法

### 打开侧边栏
- 点击浏览器工具栏中的扩展图标
- 或在网页上右键 → 选择 "Open AI Chat Sidebar"
- **侧边栏打开时会自动加载列表中的第一个网站**

### 切换网站
- **使用顶部的下拉菜单快速切换不同网站**
- 选择后网站会立即在侧边栏的 iframe 中加载

### 添加新网站
1. 在底部管理区域点击 "+ Add New Site" 按钮
2. 输入网站名称（如：ChatGPT）
3. 输入网站 URL（如：https://chat.openai.com/）
4. 点击 "Save" 保存
5. 新网站会自动添加到下拉菜单中

### 编辑网站
1. 在底部管理区域点击网站的 "Edit" 按钮
2. 修改名称或 URL
3. 点击 "Save" 保存

### 删除网站
1. 在底部管理区域点击网站的 "Delete" 按钮
2. 确认删除
3. 如果删除的是当前网站，会自动切换到其他网站

### 快速选择网站
- 点击底部管理区域中的任意网站卡片，可快速选择并加载该网站
- 当前选中的网站会高亮显示

### 网站无法在侧边栏显示？
- 某些网站由于安全策略（X-Frame-Options/CSP）不允许在 iframe 中嵌入
- 此时会显示提示遮罩层，点击 "Open in New Tab" 按钮可在新标签页打开

## 文件结构

```
edge-sidebar-extension/
├── manifest.json      # 扩展配置文件
├── background.js      # 后台服务脚本
├── sidebar.html       # 侧边栏页面
├── sidebar.js         # 侧边栏逻辑
├── icons/             # 图标文件
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md          # 说明文档
```

## 自定义图标

如果需要替换图标：
1. 准备 PNG 格式的图标（16x16, 48x48, 128x128）
2. 放入 `icons/` 文件夹
3. 修改 `manifest.json` 中的图标路径
4. 重新加载扩展

## 注意事项

- 某些网站可能不允许在 iframe 中嵌入（X-Frame-Options 限制），此时会显示提示并提供在新标签页打开的选项
- 数据通过 Chrome Storage Sync 同步，需要登录 Microsoft 账户
- 首次加载可能需要授权侧边栏权限
- 扩展会记住你上次使用的网站，下次打开时自动加载

## 技术栈

- Manifest V3
- Chrome Extension APIs (sidePanel, storage, contextMenus, tabs)
- Vanilla JavaScript
- HTML5 & CSS3

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
