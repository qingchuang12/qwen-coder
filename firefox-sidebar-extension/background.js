// Background script for the Firefox extension

// Headers to remove for iframe embedding
const headersToRemove = [
    'x-frame-options',
    'content-security-policy',
    'x-content-security-policy',
    'x-webkit-csp'
];

// Set up context menu for opening sidebar
browser.runtime.onInstalled.addListener(() => {
    // Create context menu item
    browser.contextMenus.create({
        id: 'openSidebar',
        title: 'Open AI Chat Sidebar',
        contexts: ['page']
    });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidebar') {
        // For Firefox, we just notify the user to click the toolbar icon
        // since programmatic sidebar opening is limited
        browser.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.svg',
            title: 'AI Chat Sidebar',
            message: 'Click the extension icon in the toolbar to open the sidebar.'
        });
    }
});

// Use webRequest API to modify response headers and allow iframe embedding
// This is the Firefox equivalent of Edge's declarativeNetRequest
browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        const modifiedHeaders = details.responseHeaders.filter(header => {
            const headerName = header.name.toLowerCase();
            return !headersToRemove.includes(headerName);
        });
        
        return { responseHeaders: modifiedHeaders };
    },
    {
        urls: ['<all_urls>'],
        types: ['sub_frame']
    },
    ['blocking', 'responseHeaders']
);

// Additional rule for specific AI chat domains (main_frame and sub_frame)
browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        const modifiedHeaders = details.responseHeaders.filter(header => {
            const headerName = header.name.toLowerCase();
            return !headersToRemove.includes(headerName);
        });
        
        return { responseHeaders: modifiedHeaders };
    },
    {
        urls: [
            '*://*.deepseek.com/*',
            '*://*.grok.com/*',
            '*://*.x.com/*',
            '*://*.twitter.com/*',
            '*://*.openai.com/*',
            '*://*.anthropic.com/*',
            '*://*.google.com/*',
            '*://*.claude.ai/*',
            '*://*.qwen.ai/*',
            '*://*.aliyun.com/*',
            '*://*.tencent.com/*',
            '*://*.baidu.com/*',
            '*://*.kimi.com/*',
            '*://github.com/*',
            '*://chatgpt.com/*',
            '*://poe.com/*',
            '*://perplexity.ai/*',
            '*://copilot.microsoft.com/*',
            '*://gemini.google.com/*',
            '*://bard.google.com/*',
            '*://huggingface.co/*',
            '*://mistral.ai/*',
            '*://cohere.com/*'
        ],
        types: ['main_frame', 'sub_frame']
    },
    ['blocking', 'responseHeaders']
);

// Listen for messages from sidebar
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openUrl') {
        // Open the URL in a new tab
        browser.tabs.create({ url: message.url }).then((newTab) => {
            sendResponse({ success: true, tabId: newTab.id });
        }).catch((error) => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep the message channel open for async response
    }
    return false;
});
