// Background script for the Firefox extension

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
