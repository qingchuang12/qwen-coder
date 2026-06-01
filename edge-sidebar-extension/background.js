// Background script for the Edge extension (Manifest V2)

// Headers to remove for iframe embedding
const headersToRemove = [
    'x-frame-options',
    'content-security-policy',
    'x-content-security-policy',
    'x-webkit-csp'
];

// Set up context menu for opening in new tab
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu item
    chrome.contextMenus.create({
        id: 'openInNewTab',
        title: 'Open AI Chat in New Tab',
        contexts: ['page']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openInNewTab') {
        // Open default site in new tab
        chrome.tabs.create({ url: 'https://chat.deepseek.com/' });
    }
});

// Use webRequest API to modify response headers and allow iframe embedding
// This is needed for both Edge MV2 and Firefox
chrome.webRequest.onHeadersReceived.addListener(
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
chrome.webRequest.onHeadersReceived.addListener(
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

// Listen for messages from sidebar (kept for compatibility, but no longer used)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openUrl') {
        // Open the URL in a new tab
        chrome.tabs.create({ url: message.url }, (newTab) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, tabId: newTab.id });
            }
        });
        return true; // Keep the message channel open for async response
    }
    return false;
});
