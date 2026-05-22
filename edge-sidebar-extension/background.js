// Background service worker for the extension

// Set up context menu for opening sidebar
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu item
    chrome.contextMenus.create({
        id: 'openSidebar',
        title: 'Open AI Chat Sidebar',
        contexts: ['page']
    });
    
    // Set default side panel behavior - keep panel open when enabled
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openSidebar') {
        openSidePanel(tab.id);
    }
});

// Handle action button click - this is a user gesture
chrome.action.onClicked.addListener(async (tab) => {
    await openSidePanel(tab.id);
});

// Function to open side panel - called in response to user gesture
async function openSidePanel(tabId) {
    try {
        // Ensure side panel is enabled with correct path
        await chrome.sidePanel.setOptions({ 
            path: 'sidebar.html', 
            enabled: true 
        });
        
        // This call must be in direct response to user gesture
        // The action.onClicked listener provides this context
        await chrome.sidePanel.open({ tabId: tabId });
    } catch (error) {
        console.error('Error opening side panel:', error);
        // Fallback: show notification to user
        chrome.notifications?.create({
            type: 'basic',
            iconUrl: 'icons/icon48.svg',
            title: 'AI Chat Sidebar',
            message: 'Please click the extension icon again to open the sidebar.'
        });
    }
}

// Listen for messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openUrl') {
        // Open the URL in a new tab
        chrome.tabs.create({ url: message.url }, () => {
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for async response
    }
    return false;
});
