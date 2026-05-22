// sidebar.js
let sites = [];
let currentSiteIndex = -1;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSites();
  
  if (sites.length > 0) {
    // 恢复上次选择的索引，或默认为第一个
    const lastUsedIndex = parseInt(localStorage.getItem('lastUsedSiteIndex') || '0');
    currentSiteIndex = Math.min(lastUsedIndex, sites.length - 1);
  }
  
  renderSiteSelector();
  renderSiteList();
});

async function loadSites() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['sites'], (result) => {
      sites = result.sites || [
        { name: 'DeepSeek Chat', url: 'https://chat.deepseek.com/' },
        { name: 'Qwen Coder', url: 'https://coder.qwen.ai/' }
      ];
      resolve();
    });
  });
}

async function saveSites() {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ sites }, resolve);
  });
}

function renderSiteSelector() {
  const siteSelector = document.getElementById('siteSelector');
  siteSelector.innerHTML = '';
  
  if (sites.length === 0) {
    const option = document.createElement('option');
    option.textContent = 'No sites';
    option.disabled = true;
    siteSelector.appendChild(option);
    return;
  }

  sites.forEach((site, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = site.name;
    if (index === currentSiteIndex) {
      option.selected = true;
    }
    siteSelector.appendChild(option);
  });
  
  // 监听下拉选择变化
  siteSelector.addEventListener('change', (e) => {
    currentSiteIndex = parseInt(e.target.value);
    localStorage.setItem('lastUsedSiteIndex', currentSiteIndex);
    renderSiteList();
  });
}

function renderSiteList() {
  const siteList = document.getElementById('siteList');
  siteList.innerHTML = '';
  
  if (sites.length === 0) {
    siteList.innerHTML = '<div class="info-box"><p>No sites yet. Click "Add New Site" to get started.</p></div>';
    return;
  }

  sites.forEach((site, index) => {
    const card = document.createElement('div');
    card.className = `site-card ${index === currentSiteIndex ? 'active' : ''}`;
    card.onclick = (e) => {
      // 如果点击的是按钮，不切换选择
      if (e.target.classList.contains('btn')) return;
      selectSite(index);
    };
    
    // 获取网站的首字母作为图标
    const initial = site.name.charAt(0).toUpperCase();
    
    card.innerHTML = `
      <div class="site-icon">${initial}</div>
      <div class="site-info">
        <div class="site-name">${escapeHtml(site.name)}</div>
        <div class="site-url">${escapeHtml(site.url)}</div>
      </div>
      <div class="site-actions">
        <button class="btn btn-edit" onclick="editSite(${index})">Edit</button>
        <button class="btn btn-delete" onclick="deleteSite(${index})">Delete</button>
      </div>
    `;
    
    siteList.appendChild(card);
  });
}

function selectSite(index) {
  currentSiteIndex = index;
  localStorage.setItem('lastUsedSiteIndex', index);
  renderSiteSelector();
  renderSiteList();
}

function openSelectedSite() {
  if (currentSiteIndex === -1 || sites.length === 0) {
    alert('Please select a site first');
    return;
  }
  const site = sites[currentSiteIndex];
  chrome.runtime.sendMessage({ 
    action: 'openUrl', 
    url: site.url 
  });
}

function editSite(index) {
  const site = sites[index];
  document.getElementById('modalTitle').textContent = 'Edit Site';
  document.getElementById('siteName').value = site.name;
  document.getElementById('siteUrl').value = site.url;
  document.getElementById('siteId').value = index;
  document.getElementById('modalOverlay').classList.add('active');
}

function deleteSite(index) {
  if (confirm(`Are you sure you want to delete "${sites[index].name}"?`)) {
    sites.splice(index, 1);
    
    if (sites.length === 0) {
      currentSiteIndex = -1;
    } else if (index <= currentSiteIndex && currentSiteIndex > 0) {
      currentSiteIndex--;
    }
    
    localStorage.setItem('lastUsedSiteIndex', currentSiteIndex);
    saveSites();
    renderSiteSelector();
    renderSiteList();
  }
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add New Site';
  document.getElementById('siteName').value = '';
  document.getElementById('siteUrl').value = '';
  document.getElementById('siteId').value = '-1';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function saveSite() {
  const name = document.getElementById('siteName').value.trim();
  let url = document.getElementById('siteUrl').value.trim();
  const siteId = parseInt(document.getElementById('siteId').value);
  
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
  
  if (siteId === -1) {
    // Add new site
    sites.push({ name, url });
    currentSiteIndex = sites.length - 1;
  } else {
    // Edit existing site
    sites[siteId] = { name, url };
    currentSiteIndex = siteId;
  }
  
  localStorage.setItem('lastUsedSiteIndex', currentSiteIndex);
  saveSites();
  closeModal();
  renderSiteSelector();
  renderSiteList();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
