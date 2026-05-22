# AI Chat Sidebar for Firefox

A Firefox sidebar extension that allows you to access multiple AI chat websites in a convenient sidebar panel.

## Features

- 🤖 Quick access to multiple AI chat services (DeepSeek, Qwen Coder, etc.)
- 📌 Persistent sidebar panel that stays open while browsing
- ➕ Add, edit, and delete custom AI chat sites
- 🚀 Open current site in a new tab
- 💾 Remembers your last visited site
- 🎨 Clean, modern UI with smooth animations

## Installation

### Temporary Installation (for development/testing)

1. Open Firefox and navigate to `about:debugging`
2. Click on "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the extension folder and select `manifest.json`
5. The extension will be loaded temporarily (will be removed when Firefox closes)

### Permanent Installation

1. Package the extension as a `.xpi` file:
   ```bash
   cd firefox-sidebar-extension
   zip -r ../ai-chat-sidebar.xpi *
   ```
2. Sign the extension through [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
3. Install the signed `.xpi` file in Firefox

## Usage

1. **Open the Sidebar**: Click the extension icon in the Firefox toolbar
2. **Select a Site**: Use the dropdown at the top to choose an AI chat service
3. **Manage Sites**: Click "⚙️ Manage" to add, edit, or remove sites
4. **New Tab**: Click "🚀 New Tab" to open the current site in a full browser tab

## Default Sites

- DeepSeek Chat: https://chat.deepseek.com/
- Qwen Coder: https://coder.qwen.ai/

You can add more sites through the Manage panel.

## Differences from Edge Version

This Firefox version uses:
- Manifest V2 (required for Firefox sidebar support)
- `sidebar_action` instead of `side_panel`
- `browser.*` API instead of `chrome.*` API
- Local storage instead of sync storage

## File Structure

```
firefox-sidebar-extension/
├── manifest.json      # Extension manifest
├── background.js      # Background script
├── sidebar.html       # Sidebar UI
├── sidebar.js         # Sidebar logic
└── icons/             # Extension icons
    ├── icon16.svg
    ├── icon48.svg
    └── icon128.svg
```

## Development Notes

- Firefox uses `browser.*` APIs which are Promise-based
- Storage uses `browser.storage.local` instead of `chrome.storage.sync`
- The sidebar is opened via toolbar icon click (Firefox limitation)

## License

MIT License
