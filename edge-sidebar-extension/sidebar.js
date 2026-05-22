// Default sites configuration
const defaultSites = [
    {
        id: 'deepseek',
        name: 'DeepSeek Chat',
        url: 'https://chat.deepseek.com/'
    },
    {
        id: 'qwen',
        name: 'Qwen Coder',
        url: 'https://coder.qwen.ai/'
    }
];

// Current active site index
let currentSiteIndex = 0;
let allSites = [];

// Load sites from storage or use defaults
async function loadSites() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['sites'], (result) => {
            if (result.sites && result.sites.length > 0) {
                resolve(result.sites);
            } else {
                resolve(defaultSites);
            }
        });
    });
}

// Save sites to storage
async function saveSitesToStorage(sites) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ sites: sites }, resolve);
    });
}

// Get current site index from storage
async function getCurrentSiteIndex() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['currentSiteIndex'], (result) => {
            resolve(result.currentSiteIndex !== undefined ? result.currentSiteIndex : 0);
        });
    });
}

// Save current site index to storage
async function saveCurrentSiteIndex(index) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ currentSiteIndex: index }, resolve);
    });
}

// Render the site selector dropdown
async function renderSiteSelector() {
    allSites = await loadSites();
    currentSiteIndex = await getCurrentSiteIndex();
    
    // Ensure currentSiteIndex is valid
    if (currentSiteIndex >= allSites.length) {
        currentSiteIndex = 0;
        await saveCurrentSiteIndex(0);
    }
    
    const selectorEl = document.getElementById('siteSelector');
    
    if (allSites.length === 0) {
        selectorEl.innerHTML = '<option value="">No sites added</option>';
        return;
    }
    
    selectorEl.innerHTML = allSites.map((site, index) => 
        `<option value="${index}" ${index === currentSiteIndex ? 'selected' : ''}>${escapeHtml(site.name)}</option>`
    ).join('');
    
    // Load the current site in iframe
    loadCurrentSite();
}

// Load current site in iframe
function loadCurrentSite() {
    if (allSites.length === 0 || currentSiteIndex >= allSites.length) {
        document.getElementById('siteFrame').src = '';
        document.getElementById('frameOverlay').classList.remove('active');
        return;
    }
    
    const site = allSites[currentSiteIndex];
    const iframe = document.getElementById('siteFrame');
    const overlay = document.getElementById('frameOverlay');
    
    // Set up iframe load listener to detect blocking
    iframe.onload = () => {
        // Try to access iframe content - if blocked, show overlay
        try {
            iframe.contentWindow.document;
            // If we can access it, hide overlay
            overlay.classList.remove('active');
        } catch (e) {
            // Cross-origin or blocked, show overlay
            overlay.classList.add('active');
        }
    };
    
    iframe.onerror = () => {
        overlay.classList.add('active');
    };
    
    // Load the site
    iframe.src = site.url;
    
    // Show overlay by default (will be hidden if iframe loads successfully)
    overlay.classList.add('active');
    
    // Update manage list highlighting
    renderManageList();
}

// Switch to a different site via dropdown
function switchSite() {
    const selector = document.getElementById('siteSelector');
    currentSiteIndex = parseInt(selector.value, 10);
    saveCurrentSiteIndex(currentSiteIndex);
    loadCurrentSite();
}

// Open current site in new tab
function openCurrentInNewTab() {
    if (allSites.length === 0 || currentSiteIndex >= allSites.length) {
        return;
    }
    
    const site = allSites[currentSiteIndex];
    chrome.runtime.sendMessage({ type: 'openUrl', url: site.url }, (response) => {
        if (chrome.runtime.lastError) {
            window.open(site.url, '_blank');
        }
    });
}

// Render the manage list
async function renderManageList() {
    allSites = await loadSites();
    const siteListEl = document.getElementById('siteList');
    
    if (allSites.length === 0) {
        siteListEl.innerHTML = '<p style="color:#888;font-size:12px;text-align:center;padding:10px;">No sites added yet</p>';
        return;
    }
    
    siteListEl.innerHTML = allSites.map((site, index) => `
        <div class="site-item ${index === currentSiteIndex ? 'active' : ''}" onclick="selectAndLoadSite(${index})">
            <div class="site-info">
                <div class="site-icon">🌐</div>
                <div class="site-name">${escapeHtml(site.name)}</div>
            </div>
            <div class="site-actions">
                <button class="btn btn-edit" onclick="event.stopPropagation(); editSite('${site.id}')">Edit</button>
                <button class="btn btn-delete" onclick="event.stopPropagation(); deleteSite('${site.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Select and load a site from manage list
function selectAndLoadSite(index) {
    currentSiteIndex = index;
    saveCurrentSiteIndex(currentSiteIndex);
    
    // Update dropdown
    const selector = document.getElementById('siteSelector');
    selector.value = index;
    
    loadCurrentSite();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open modal for adding new site
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Site';
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    document.getElementById('siteId').value = '';
    document.getElementById('modalOverlay').classList.add('active');
}

// Edit existing site
async function editSite(siteId) {
    const sites = await loadSites();
    const site = sites.find(s => s.id === siteId);
    
    if (site) {
        document.getElementById('modalTitle').textContent = 'Edit Site';
        document.getElementById('siteName').value = site.name;
        document.getElementById('siteUrl').value = site.url;
        document.getElementById('siteId').value = site.id;
        document.getElementById('modalOverlay').classList.add('active');
    }
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Save site (add or edit)
async function saveSite() {
    const name = document.getElementById('siteName').value.trim();
    const url = document.getElementById('siteUrl').value.trim();
    const siteId = document.getElementById('siteId').value;
    
    if (!name || !url) {
        alert('Please fill in both fields');
        return;
    }
    
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL');
        return;
    }
    
    const sites = await loadSites();
    
    if (siteId) {
        // Edit existing site
        const index = sites.findIndex(s => s.id === siteId);
        if (index !== -1) {
            sites[index] = { ...sites[index], name, url };
            // Update currentSiteIndex if editing current site
            if (index === currentSiteIndex) {
                // Refresh to update display
                await renderSiteSelector();
            }
        }
    } else {
        // Add new site
        const newSite = {
            id: 'site_' + Date.now(),
            name,
            url
        };
        sites.push(newSite);
    }
    
    await saveSitesToStorage(sites);
    closeModal();
    await renderSiteSelector();
    await renderManageList();
}

// Delete site
async function deleteSite(siteId) {
    if (confirm('Are you sure you want to delete this site?')) {
        const sites = await loadSites();
        const deletedIndex = sites.findIndex(s => s.id === siteId);
        const filteredSites = sites.filter(s => s.id !== siteId);
        
        await saveSitesToStorage(filteredSites);
        
        // Adjust currentSiteIndex if needed
        if (deletedIndex !== -1) {
            if (deletedIndex < currentSiteIndex) {
                currentSiteIndex--;
            } else if (deletedIndex === currentSiteIndex) {
                // If deleting current site, move to previous or first
                currentSiteIndex = Math.max(0, currentSiteIndex - 1);
                if (currentSiteIndex >= filteredSites.length) {
                    currentSiteIndex = 0;
                }
            }
            await saveCurrentSiteIndex(currentSiteIndex);
        }
        
        await renderSiteSelector();
        await renderManageList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await renderSiteSelector();
    await renderManageList();
});
