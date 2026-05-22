// sidebar.js
let sites = [];

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSites();
  renderSiteList();
  // 自动打开第一个网站
  if (sites.length > 0) {
    setTimeout(() => openInNewTab(0), 300);
  }
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

function renderSiteList() {
  const siteList = document.getElementById('siteList');
  siteList.innerHTML = '';

  if (sites.length === 0) {
    siteList.innerHTML = `
      <div class="empty-state">
        <p>No sites yet.</p>
        <p>Click "Add New Site" to get started!</p>
      </div>
    `;
    return;
  }

  sites.forEach((site, index) => {
    const card = document.createElement('div');
    card.className = 'site-card';

    // 获取网站的首字母作为图标
    const initial = site.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <div class="site-header">
        <div class="site-icon">${initial}</div>
        <div class="site-info">
          <div class="site-name">${escapeHtml(site.name)}</div>
          <div class="site-url">${escapeHtml(site.url)}</div>
        </div>
      </div>
      <div class="site-actions-row">
        <button class="btn btn-view" id="viewBtn-${index}">👁️ View</button>
        <button class="btn btn-newtab" id="newTabBtn-${index}">🚀 New Tab</button>
        <button class="btn btn-edit" id="editBtn-${index}">✏️ Edit</button>
        <button class="btn btn-delete" id="deleteBtn-${index}">🗑️ Delete</button>
      </div>
    `;

    siteList.appendChild(card);
  });

  // 为所有按钮添加事件监听器 - 使用 setTimeout 确保 DOM 已渲染
  setTimeout(() => {
    sites.forEach((site, index) => {
      const viewBtn = document.getElementById(`viewBtn-${index}`);
      const newTabBtn = document.getElementById(`newTabBtn-${index}`);
      const editBtn = document.getElementById(`editBtn-${index}`);
      const deleteBtn = document.getElementById(`deleteBtn-${index}`);

      console.log(`Setting up listeners for site ${index}:`, { viewBtn, newTabBtn, editBtn, deleteBtn });

      if (viewBtn) viewBtn.addEventListener('click', () => { console.log('View clicked'); viewSite(index); });
      if (newTabBtn) newTabBtn.addEventListener('click', () => { console.log('NewTab clicked'); openInNewTab(index); });
      if (editBtn) editBtn.addEventListener('click', () => { console.log('Edit clicked'); editSite(index); });
      if (deleteBtn) deleteBtn.addEventListener('click', () => { console.log('Delete clicked'); deleteSite(index); });
    });
  }, 100);
}

// 在新标签页打开网站（主要功能）
function openInNewTab(index) {
  console.log('openInNewTab called with index:', index);
  if (index < 0 || index >= sites.length) {
    console.error('Invalid index:', index);
    return;
  }
  const site = sites[index];
  console.log('Opening site:', site);
  chrome.runtime.sendMessage({
    action: 'openUrl',
    url: site.url
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Message send error:', chrome.runtime.lastError);
    } else {
      console.log('Response:', response);
    }
  });
}

// 查看网站（同样在新标签页打开）
function viewSite(index) {
  openInNewTab(index);
}

function editSite(index) {
  console.log('editSite called with index:', index);
  const site = sites[index];
  document.getElementById('modalTitle').textContent = 'Edit Site';
  document.getElementById('siteName').value = site.name;
  document.getElementById('siteUrl').value = site.url;
  document.getElementById('siteId').value = index;
  document.getElementById('modalOverlay').classList.add('active');
}

function deleteSite(index) {
  console.log('deleteSite called with index:', index);
  if (confirm(`Are you sure you want to delete "${sites[index].name}"?`)) {
    sites.splice(index, 1);
    saveSites();
    renderSiteList();
  }
}

function openAddModal() {
  console.log('openAddModal called');
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
  } else {
    // Edit existing site
    sites[siteId] = { name, url };
  }

  saveSites();
  closeModal();
  renderSiteList();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
