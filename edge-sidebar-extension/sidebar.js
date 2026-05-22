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

// Render the site list
async function renderSiteList() {
    const sites = await loadSites();
    const siteListEl = document.getElementById('siteList');
    
    if (sites.length === 0) {
        siteListEl.innerHTML = `
            <div class="empty-state">
                <p>No sites added yet</p>
                <p>Click "Add New Site" to get started</p>
            </div>
        `;
        return;
    }
    
    siteListEl.innerHTML = sites.map(site => `
        <div class="site-item" onclick="openSite('${site.url}')">
            <div class="site-info">
                <div class="site-icon">🌐</div>
                <div>
                    <div class="site-name">${escapeHtml(site.name)}</div>
                    <div class="site-url">${escapeHtml(site.url)}</div>
                </div>
            </div>
            <div class="site-actions">
                <button class="btn btn-edit" onclick="event.stopPropagation(); editSite('${site.id}')">Edit</button>
                <button class="btn btn-delete" onclick="event.stopPropagation(); deleteSite('${site.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open a site in a new tab or navigate to it
// Note: Many websites block iframe embedding via X-Frame-Options or CSP
// So we open the site in a new tab instead
function openSite(url) {
    // Send message to background script to open URL in current tab or new tab
    chrome.runtime.sendMessage({ type: 'openUrl', url: url }, (response) => {
        if (chrome.runtime.lastError) {
            // Fallback: open in new tab directly
            window.open(url, '_blank');
        }
    });
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
    renderSiteList();
}

// Delete site
async function deleteSite(siteId) {
    if (confirm('Are you sure you want to delete this site?')) {
        const sites = await loadSites();
        const filteredSites = sites.filter(s => s.id !== siteId);
        await saveSitesToStorage(filteredSites);
        renderSiteList();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', renderSiteList);
