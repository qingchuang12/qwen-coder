// Background service worker for the extension

// Set up context menu for opening sidebar
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu item
    chrome.contextMenus.create({
        id: 'openSidebar',
        title: 'Open AI Chat Sidebar',
        contexts: ['page']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidebar') {
        openSidePanel(tab.id);
    }
});

// Handle action button click
chrome.action.onClicked.addListener((tab) => {
    openSidePanel(tab.id);
});

// Function to open side panel
async function openSidePanel(tabId) {
    try {
        await chrome.sidePanel.setOptions({ tabId, path: 'sidebar.html', enabled: true });
        await chrome.sidePanel.open({ tabId });
    } catch (error) {
        console.error('Error opening side panel:', error);
    }
}

// Listen for messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'openUrl') {
        // Handle opening URLs if needed
        sendResponse({ success: true });
    }
    return true;
});
