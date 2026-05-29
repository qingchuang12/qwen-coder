// sidebar.js
let sites = [];
let currentIndex = -1;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    // Load sites from storage
    await loadSites();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Render dropdown and manage panel
    renderDropdown();
    renderManagePanel();
    
    // Load the first site (or last visited)
    if (sites.length > 0) {
        // Try to get last visited site index
        chrome.storage.sync.get(['lastVisitedIndex'], (result) => {
            let idx = result.lastVisitedIndex;
            if (idx === undefined || idx < 0 || idx >= sites.length) {
                idx = 0;
            }
            currentIndex = idx;
            document.getElementById('siteSelect').value = sites[currentIndex].url;
            loadSiteInIframe(currentIndex);
        });
    } else {
        showError('No sites configured. Click "Manage" to add sites.');
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Dropdown change
    const siteSelect = document.getElementById('siteSelect');
    if (siteSelect) {
        siteSelect.addEventListener('change', (e) => {
            const url = e.target.value;
            const idx = sites.findIndex(s => s.url === url);
            if (idx !== -1) {
                currentIndex = idx;
                loadSiteInIframe(currentIndex);
                // Save last visited
                chrome.storage.sync.set({ lastVisitedIndex: currentIndex });
            }
        });
    }
    
    // New Tab button
    const btnNewTab = document.getElementById('btnNewTab');
    if (btnNewTab) {
        btnNewTab.addEventListener('click', () => {
            if (currentIndex >= 0 && currentIndex < sites.length) {
                openInNewTab(currentIndex);
            }
        });
    }
    
    // Manage button
    const btnManage = document.getElementById('btnManage');
    if (btnManage) {
        btnManage.addEventListener('click', toggleManagePanel);
    }
    
    // Close manage panel button
    const btnCloseManage = document.getElementById('btnCloseManage');
    if (btnCloseManage) {
        btnCloseManage.addEventListener('click', () => {
            document.getElementById('managePanel').classList.remove('visible');
        });
    }
    
    // Add site button
    const btnAddSite = document.getElementById('btnAddSite');
    if (btnAddSite) {
        btnAddSite.addEventListener('click', openAddModal);
    }
    
    // Open external button (when iframe blocked)
    const btnOpenExternal = document.getElementById('btnOpenExternal');
    if (btnOpenExternal) {
        btnOpenExternal.addEventListener('click', () => {
            if (currentIndex >= 0 && currentIndex < sites.length) {
                openInNewTab(currentIndex);
            }
        });
    }
    
    // Modal cancel button
    const btnCancel = document.getElementById('btnCancel');
    if (btnCancel) {
        btnCancel.addEventListener('click', closeModal);
    }
    
    // Modal save button
    const btnSave = document.getElementById('btnSave');
    if (btnSave) {
        btnSave.addEventListener('click', saveSite);
    }
}

// Load sites from storage
async function loadSites() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['sites'], (result) => {
            sites = result.sites || [
                { name: 'DeepSeek Chat', url: 'https://chat.deepseek.com/' },
                { name: 'Qwen Coder', url: 'https://coder.qwen.ai/' },
                { name: 'Qwen Chat', url: 'https://chat.qwen.ai/' },
                { name: 'Kimi', url: 'https://www.kimi.com/' },
                { name: 'Grok', url: 'https://grok.com' },
                { name: 'GitHub Copilot', url: 'https://github.com/copilot' },
                { name: 'Microsoft Copilot', url: 'https://copilot.microsoft.com/' }
            ];
            resolve();
        });
    });
}

// Save sites to storage
async function saveSites() {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ sites }, resolve);
    });
}

// Render dropdown
function renderDropdown() {
    const select = document.getElementById('siteSelect');
    if (!select) return;
    
    select.innerHTML = '';
    sites.forEach((site, index) => {
        const option = document.createElement('option');
        option.value = site.url;
        option.textContent = site.name;
        select.appendChild(option);
    });
}

// Render manage panel list
function renderManagePanel() {
    const siteList = document.getElementById('siteList');
    if (!siteList) return;
    
    siteList.innerHTML = '';
    
    if (sites.length === 0) {
        siteList.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">No sites yet.</div>';
        return;
    }
    
    sites.forEach((site, index) => {
        const item = document.createElement('div');
        item.className = 'site-item';
        if (index === currentIndex) {
            item.classList.add('active');
        }
        
        const initial = site.name.charAt(0).toUpperCase();
        
        item.innerHTML = `
            <div class="site-item-icon">${initial}</div>
            <div class="site-item-info">
                <div class="site-item-name">${escapeHtml(site.name)}</div>
                <div class="site-item-url">${escapeHtml(site.url)}</div>
            </div>
            <div class="site-item-actions">
                <button class="btn-icon btn-icon-edit" data-index="${index}" title="Edit">✏️</button>
                <button class="btn-icon btn-icon-delete" data-index="${index}" title="Delete">🗑️</button>
            </div>
        `;
        
        siteList.appendChild(item);
    });
    
    // Add click listeners for edit/delete buttons
    setTimeout(() => {
        siteList.querySelectorAll('.btn-icon-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.dataset.index);
                editSite(idx);
            });
        });
        
        siteList.querySelectorAll('.btn-icon-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(e.target.dataset.index);
                deleteSite(idx);
            });
        });
    }, 50);
}

// Toggle manage panel visibility
function toggleManagePanel() {
    const panel = document.getElementById('managePanel');
    panel.classList.toggle('visible');
    if (panel.classList.contains('visible')) {
        renderManagePanel();
    }
}

// Load site in iframe
function loadSiteInIframe(index) {
    if (index < 0 || index >= sites.length) return;
    
    const site = sites[index];
    const iframe = document.getElementById('siteIframe');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const errorState = document.getElementById('errorState');
    
    // Show loading, hide error
    loadingOverlay.classList.remove('hidden');
    errorState.classList.remove('visible');
    
    // Set iframe src - use a direct approach
    // First hide the iframe to prevent flash of content
    iframe.style.visibility = 'hidden';
    iframe.src = site.url;
    
    // Update dropdown selection
    document.getElementById('siteSelect').value = site.url;
    
    // Reset error state
    errorState.classList.remove('visible');
    
    // Handle iframe load
    iframe.onload = () => {
        loadingOverlay.classList.add('hidden');
        iframe.style.visibility = 'visible';
        
        // Don't try to access iframe content - this will fail for cross-origin
        // The declarativeNetRequest rules should handle header removal
        console.log('Iframe loaded:', site.url);
    };
    
    iframe.onerror = () => {
        loadingOverlay.classList.add('hidden');
        iframe.style.visibility = 'visible';
        showError('Failed to load the website.');
    };
    
    // Show error state after timeout if still loading (likely blocked)
    // But also provide a quick button to open in new tab
    setTimeout(() => {
        if (!loadingOverlay.classList.contains('hidden')) {
            loadingOverlay.classList.add('hidden');
            iframe.style.visibility = 'visible';
            // Don't auto-show error - let user decide to open in new tab
            // The site may still be functional even if we can't detect load
        }
    }, 8000);
}

// Show error state
function showError(message) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    if (errorState && errorMessage) {
        errorMessage.textContent = message;
        errorState.classList.add('visible');
    }
}

// Open in new tab
function openInNewTab(index) {
    if (index < 0 || index >= sites.length) return;
    
    const site = sites[index];
    chrome.runtime.sendMessage({
        action: 'openUrl',
        url: site.url
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Message send error:', chrome.runtime.lastError);
        }
    });
}

// Edit site
function editSite(index) {
    const site = sites[index];
    document.getElementById('modalTitle').textContent = 'Edit Site';
    document.getElementById('siteName').value = site.name;
    document.getElementById('siteUrl').value = site.url;
    document.getElementById('siteId').value = index.toString();
    document.getElementById('modalOverlay').classList.add('active');
}

// Delete site
function deleteSite(index) {
    if (confirm(`Are you sure you want to delete "${sites[index].name}"?`)) {
        sites.splice(index, 1);
        
        // Adjust current index if needed
        if (index === currentIndex) {
            currentIndex = Math.min(currentIndex, sites.length - 1);
        } else if (index < currentIndex) {
            currentIndex--;
        }
        
        saveSites();
        renderDropdown();
        renderManagePanel();
        
        // Reload current site if we still have sites
        if (sites.length > 0 && currentIndex >= 0) {
            document.getElementById('siteSelect').value = sites[currentIndex].url;
            loadSiteInIframe(currentIndex);
        } else {
            showError('No sites remaining. Add a new site to continue.');
        }
    }
}

// Open add modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Site';
    document.getElementById('siteName').value = '';
    document.getElementById('siteUrl').value = '';
    document.getElementById('siteId').value = '-1';
    document.getElementById('modalOverlay').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Save site (add or edit)
function saveSite() {
    const name = document.getElementById('siteName').value.trim();
    let url = document.getElementById('siteUrl').value.trim();
    const siteIdStr = document.getElementById('siteId').value;
    const siteId = parseInt(siteIdStr, 10);
    
    if (!name) {
        alert('Please enter a site name');
        return;
    }
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    if (isNaN(siteId) || siteId === -1) {
        // Add new site
        sites.push({ name, url });
    } else {
        // Edit existing site
        sites[siteId] = { name, url };
    }
    
    saveSites();
    closeModal();
    renderDropdown();
    renderManagePanel();
    
    // If this is a new site and it's the first one, load it
    if (sites.length === 1) {
        currentIndex = 0;
        document.getElementById('siteSelect').value = sites[0].url;
        loadSiteInIframe(0);
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
