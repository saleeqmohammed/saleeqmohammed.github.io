/**
 * Portfolio Studio CMS Client
 * Handles live editing, GitHub repository importing, and dual-mode saving
 * (Local Python server or direct GitHub REST API for GitHub Pages).
 */

let contentData = null;
let isLocalServer = false;
let githubRepos = [];

// DOM Elements
const modeBadge = document.getElementById('mode-badge');
const toastEl = document.getElementById('toast');

// Initialize Studio
async function init() {
  setupNavigation();
  setupSettings();
  await checkServerMode();
  await loadContent();
  setupEventListeners();
}

// Show notification toast
function showToast(message, type = 'info') {
  toastEl.textContent = message;
  toastEl.className = `toast ${type}`;
  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 4000);
}

// Check if running on local python server or static browser
async function checkServerMode() {
  try {
    const res = await fetch('/api/status', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (data.mode === 'local_server') {
        isLocalServer = true;
        modeBadge.className = 'mode-pill local';
        modeBadge.textContent = '● Local Server Mode (Auto-Save)';
        return;
      }
    }
  } catch (e) {
    // Not on local server
  }
  isLocalServer = false;
  modeBadge.className = 'mode-pill browser';
  modeBadge.textContent = '● Browser Mode (GitHub REST API)';
}

// Load content.json
async function loadContent() {
  try {
    const url = isLocalServer ? '/api/content' : '../data/content.json?v=' + Date.now();
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not load data/content.json');
    contentData = await res.json();
    populateAllForms();
    showToast('Loaded portfolio content successfully', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to load portfolio content: ' + err.message, 'error');
  }
}

// Setup sidebar tab switching
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const tabId = item.getAttribute('data-tab');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// Populate all form fields from loaded contentData
function populateAllForms() {
  if (!contentData) return;

  // Project count badge
  document.getElementById('nav-project-count').textContent = contentData.projects ? contentData.projects.length : 0;

  // Profile
  const p = contentData.profile || {};
  document.getElementById('prof-name').value = p.name || '';
  document.getElementById('prof-headline').value = p.headline || '';
  document.getElementById('prof-subheadline').value = p.subheadline || '';
  document.getElementById('prof-email').value = p.email || '';
  document.getElementById('prof-location').value = p.location || '';
  document.getElementById('prof-cv-url').value = p.cv_url || '';
  document.getElementById('prof-avatar').value = p.avatar || '';
  document.getElementById('prof-about').value = p.about || '';
  document.getElementById('prof-linkedin').value = p.socials?.linkedin || '';
  document.getElementById('prof-github').value = p.socials?.github || '';
  if (p.github_username) {
    document.getElementById('gh-username').value = p.github_username;
  }

  // Current Position
  const pos = contentData.current_position || {};
  document.getElementById('pos-role').value = pos.role || '';
  document.getElementById('pos-institution').value = pos.institution || '';
  document.getElementById('pos-institution-url').value = pos.institution_url || '';
  document.getElementById('pos-group').value = pos.group || '';
  document.getElementById('pos-group-url').value = pos.group_url || '';
  document.getElementById('pos-project').value = pos.project || '';
  document.getElementById('pos-project-url').value = pos.project_url || '';
  document.getElementById('pos-period').value = pos.period || '';
  document.getElementById('pos-location').value = pos.location || '';
  document.getElementById('pos-description').value = pos.description || '';

  // Render Lists
  renderProjectsList();
  renderPublicationsList();
  renderExperienceList();
  renderSkills();
}

// Collect data from forms back into contentData object
function harvestFormData() {
  if (!contentData) contentData = {};

  // Profile
  contentData.profile = contentData.profile || {};
  contentData.profile.name = document.getElementById('prof-name').value.trim();
  contentData.profile.headline = document.getElementById('prof-headline').value.trim();
  contentData.profile.subheadline = document.getElementById('prof-subheadline').value.trim();
  contentData.profile.email = document.getElementById('prof-email').value.trim();
  contentData.profile.location = document.getElementById('prof-location').value.trim();
  contentData.profile.cv_url = document.getElementById('prof-cv-url').value.trim();
  contentData.profile.avatar = document.getElementById('prof-avatar').value.trim();
  contentData.profile.about = document.getElementById('prof-about').value.trim();
  contentData.profile.github_username = document.getElementById('gh-username').value.trim();

  contentData.profile.socials = contentData.profile.socials || {};
  contentData.profile.socials.linkedin = document.getElementById('prof-linkedin').value.trim();
  contentData.profile.socials.github = document.getElementById('prof-github').value.trim();
  contentData.profile.socials.email = 'mailto:' + contentData.profile.email;

  // Current Position
  contentData.current_position = contentData.current_position || {};
  contentData.current_position.role = document.getElementById('pos-role').value.trim();
  contentData.current_position.institution = document.getElementById('pos-institution').value.trim();
  contentData.current_position.institution_url = document.getElementById('pos-institution-url').value.trim();
  contentData.current_position.group = document.getElementById('pos-group').value.trim();
  contentData.current_position.group_url = document.getElementById('pos-group-url').value.trim();
  contentData.current_position.project = document.getElementById('pos-project').value.trim();
  contentData.current_position.project_url = document.getElementById('pos-project-url').value.trim();
  contentData.current_position.period = document.getElementById('pos-period').value.trim();
  contentData.current_position.location = document.getElementById('pos-location').value.trim();
  contentData.current_position.description = document.getElementById('pos-description').value.trim();

  // Skills
  contentData.skills = contentData.skills || {};
  contentData.skills.robotics_deliberation = parseCommaSeparated(document.getElementById('skills-robotics').value);
  contentData.skills.hardware_sensors = parseCommaSeparated(document.getElementById('skills-hardware').value);
  contentData.skills.simulation_cae = parseCommaSeparated(document.getElementById('skills-simulation').value);
  contentData.skills.ai_software = parseCommaSeparated(document.getElementById('skills-ai').value);
}

function parseCommaSeparated(val) {
  return val.split(',').map(s => s.trim()).filter(Boolean);
}

// ================= PROJECTS MANAGER =================
function renderProjectsList() {
  const container = document.getElementById('projects-list');
  container.innerHTML = '';

  const projects = contentData.projects || [];
  document.getElementById('nav-project-count').textContent = projects.length;

  if (projects.length === 0) {
    container.innerHTML = '<div class="empty-state">No projects added yet. Import from GitHub or click "Add New Project".</div>';
    return;
  }

  projects.forEach((proj, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <div class="item-info-title">
          <span>${escapeHtml(proj.title)}</span>
          <span class="badge ${proj.featured ? 'featured' : ''}">${proj.featured ? '★ Featured' : 'Standard'}</span>
          <span class="badge">${escapeHtml(proj.category || 'General')}</span>
        </div>
        <div class="item-info-meta">
          ⭐ ${proj.stars || 0} stars &bull; Tags: ${(proj.tags || []).slice(0, 4).join(', ')}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-secondary btn-icon" title="Move Up" onclick="moveProject(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn btn-secondary btn-icon" title="Move Down" onclick="moveProject(${idx}, 1)" ${idx === projects.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="btn btn-secondary" onclick="openProjectModal(${idx})">Edit</button>
        <button class="btn btn-danger btn-icon" title="Delete" onclick="deleteProject(${idx})">✕</button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.moveProject = function(index, dir) {
  const target = index + dir;
  if (target < 0 || target >= contentData.projects.length) return;
  const temp = contentData.projects[index];
  contentData.projects[index] = contentData.projects[target];
  contentData.projects[target] = temp;
  renderProjectsList();
};

window.deleteProject = function(index) {
  if (confirm(`Delete project "${contentData.projects[index].title}"?`)) {
    contentData.projects.splice(index, 1);
    renderProjectsList();
    showToast('Project deleted', 'info');
  }
};

// Modal for editing/adding projects
let activeProjectIndex = -1;

window.openProjectModal = function(index = -1) {
  activeProjectIndex = index;
  const modal = document.getElementById('modal-project');
  const titleEl = document.getElementById('modal-project-title');

  if (index >= 0) {
    const p = contentData.projects[index];
    titleEl.textContent = 'Edit Project: ' + p.title;
    document.getElementById('proj-edit-id').value = p.id || '';
    document.getElementById('proj-edit-title').value = p.title || '';
    document.getElementById('proj-edit-category').value = p.category || 'Robotics & Planning';
    document.getElementById('proj-edit-stars').value = p.stars || 0;
    document.getElementById('proj-edit-desc').value = p.description || '';
    document.getElementById('proj-edit-tags').value = (p.tags || []).join(', ');
    document.getElementById('proj-edit-github').value = p.github_url || '';
    document.getElementById('proj-edit-image').value = p.image || '';
    document.getElementById('proj-edit-highlights').value = (p.highlights || []).join('\n');
    document.getElementById('proj-edit-featured').checked = !!p.featured;
  } else {
    titleEl.textContent = 'Add New Project';
    document.getElementById('proj-edit-id').value = 'proj-' + Date.now();
    document.getElementById('proj-edit-title').value = '';
    document.getElementById('proj-edit-category').value = 'Robotics & Planning';
    document.getElementById('proj-edit-stars').value = 0;
    document.getElementById('proj-edit-desc').value = '';
    document.getElementById('proj-edit-tags').value = '';
    document.getElementById('proj-edit-github').value = '';
    document.getElementById('proj-edit-image').value = 'images/Kidnap_2.png';
    document.getElementById('proj-edit-highlights').value = '';
    document.getElementById('proj-edit-featured').checked = true;
  }

  modal.classList.remove('hidden');
};

function closeProjectModal() {
  document.getElementById('modal-project').classList.add('hidden');
  activeProjectIndex = -1;
}

function saveProjectModal() {
  const title = document.getElementById('proj-edit-title').value.trim();
  if (!title) {
    alert('Please enter a project title');
    return;
  }

  const projObj = {
    id: document.getElementById('proj-edit-id').value || ('proj-' + Date.now()),
    title: title,
    category: document.getElementById('proj-edit-category').value,
    featured: document.getElementById('proj-edit-featured').checked,
    stars: parseInt(document.getElementById('proj-edit-stars').value, 10) || 0,
    description: document.getElementById('proj-edit-desc').value.trim(),
    tags: parseCommaSeparated(document.getElementById('proj-edit-tags').value),
    github_url: document.getElementById('proj-edit-github').value.trim(),
    image: document.getElementById('proj-edit-image').value.trim(),
    highlights: document.getElementById('proj-edit-highlights').value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  };

  contentData.projects = contentData.projects || [];
  if (activeProjectIndex >= 0) {
    contentData.projects[activeProjectIndex] = projObj;
  } else {
    contentData.projects.unshift(projObj);
  }

  closeProjectModal();
  renderProjectsList();
  showToast('Project updated', 'success');
}

// ================= GITHUB LIVE IMPORTER =================
async function fetchGithubRepos() {
  const username = document.getElementById('gh-username').value.trim() || 'saleeqmohammed';
  const grid = document.getElementById('github-repos-grid');
  grid.innerHTML = '<div class="empty-state">Fetching public repositories from GitHub API...</div>';

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error(`GitHub API Error: ${res.statusText}`);
    const repos = await res.json();
    githubRepos = repos.filter(r => !r.fork);
    document.getElementById('nav-repo-count').textContent = githubRepos.length;

    renderGithubRepos();
    showToast(`Fetched ${githubRepos.length} public repos from @${username}`, 'success');
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="empty-state" style="color:#ef4444;">Error fetching repos: ${escapeHtml(err.message)}</div>`;
    showToast(err.message, 'error');
  }
}

function renderGithubRepos() {
  const grid = document.getElementById('github-repos-grid');
  grid.innerHTML = '';

  if (githubRepos.length === 0) {
    grid.innerHTML = '<div class="empty-state">No repositories found.</div>';
    return;
  }

  const existingGithubUrls = new Set((contentData.projects || []).map(p => (p.github_url || '').toLowerCase()));

  githubRepos.forEach(repo => {
    const isAdded = existingGithubUrls.has(repo.html_url.toLowerCase());
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.innerHTML = `
      <div class="repo-card-header">
        <span class="repo-title">${escapeHtml(repo.name)}</span>
        <span class="repo-stars">★ ${repo.stargazers_count}</span>
      </div>
      <p class="repo-desc">${escapeHtml(repo.description || 'No description provided.')}</p>
      <div class="repo-footer">
        <span class="repo-lang">${escapeHtml(repo.language || 'Code')}</span>
        ${isAdded ? 
          '<span class="badge featured">✓ Added</span>' : 
          `<button class="btn btn-primary" style="font-size:0.75rem; padding:0.3rem 0.6rem;" onclick="importGithubRepo('${escapeHtml(repo.name)}')">+ Add to Portfolio</button>`
        }
      </div>
    `;
    grid.appendChild(card);
  });
}

window.importGithubRepo = function(repoName) {
  const repo = githubRepos.find(r => r.name === repoName);
  if (!repo) return;

  // Infer category
  let category = 'Robotics & Planning';
  const nameLower = repo.name.toLowerCase();
  const descLower = (repo.description || '').toLowerCase();
  if (nameLower.includes('localis') || nameLower.includes('localiz') || descLower.includes('particle filter')) {
    category = 'Localization & State Estimation';
  } else if (nameLower.includes('thermal') || nameLower.includes('welding') || nameLower.includes('fatigue')) {
    category = 'Simulation & CAE';
  } else if (repo.language === 'TypeScript' || repo.language === 'HTML') {
    category = 'Systems & Full-Stack';
  }

  // Infer tags
  const tags = [];
  if (repo.language) tags.push(repo.language);
  if (descLower.includes('ros2')) tags.push('ROS2');
  if (descLower.includes('ros') && !tags.includes('ROS2')) tags.push('ROS');
  if (descLower.includes('coppelia')) tags.push('CoppeliaSim');
  if (descLower.includes('mpc')) tags.push('MPC');
  if (descLower.includes('cbs')) tags.push('CBS');
  if (descLower.includes('pomdp')) tags.push('POMDP');

  const newProj = {
    id: 'repo-' + repo.id,
    title: formatRepoTitle(repo.name),
    category: category,
    featured: true,
    stars: repo.stargazers_count,
    description: repo.description || 'Autonomous robotics software and planning implementation.',
    highlights: [
      `Open-source repository available on GitHub with complete source code.`,
      `Built with ${repo.language || 'Python'} focusing on verifiable algorithmic execution.`
    ],
    tags: tags.length ? tags : [repo.language || 'Robotics'],
    github_url: repo.html_url,
    image: 'images/Kidnap_2.png'
  };

  contentData.projects = contentData.projects || [];
  contentData.projects.unshift(newProj);
  renderProjectsList();
  renderGithubRepos();
  showToast(`Added "${repo.name}" to projects!`, 'success');
};

function formatRepoTitle(str) {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function syncAllStars() {
  if (!contentData.projects) return;
  showToast('Syncing star counts with GitHub...', 'info');

  let updatedCount = 0;
  for (const proj of contentData.projects) {
    if (proj.github_url && proj.github_url.includes('github.com/')) {
      const parts = proj.github_url.split('github.com/')[1].split('/');
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1];
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
          if (res.ok) {
            const data = await res.json();
            proj.stars = data.stargazers_count;
            updatedCount++;
          }
        } catch (e) {
          // Ignore rate limit or network error
        }
      }
    }
  }
  renderProjectsList();
  showToast(`Synced stars for ${updatedCount} projects`, 'success');
}

// ================= PUBLICATIONS =================
function renderPublicationsList() {
  const container = document.getElementById('publications-list');
  container.innerHTML = '';
  const pubs = contentData.publications || [];

  pubs.forEach((pub, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <div class="item-info-title">
          <span>${escapeHtml(pub.title)}</span>
          <span class="badge ${pub.status === 'In Preparation' ? 'featured' : ''}">${escapeHtml(pub.status || 'Published')}</span>
        </div>
        <div class="item-info-meta">
          ${escapeHtml(pub.venue || '')} &bull; ${pub.year || ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger btn-icon" onclick="deletePublication(${idx})">✕</button>
      </div>
    `;
    container.appendChild(row);
  });
}

window.deletePublication = function(idx) {
  if (confirm('Delete this publication entry?')) {
    contentData.publications.splice(idx, 1);
    renderPublicationsList();
  }
};

// ================= EXPERIENCE =================
function renderExperienceList() {
  const container = document.getElementById('experience-list');
  container.innerHTML = '';
  const exps = contentData.experience || [];

  exps.forEach((exp, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <div class="item-info-title">
          <span>${escapeHtml(exp.role)}</span>
          <span class="badge">${escapeHtml(exp.type || '')}</span>
        </div>
        <div class="item-info-meta">
          ${escapeHtml(exp.organization)} &bull; ${escapeHtml(exp.period || '')}
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

// ================= SKILLS =================
function renderSkills() {
  const s = contentData.skills || {};
  document.getElementById('skills-robotics').value = (s.robotics_deliberation || []).join(', ');
  document.getElementById('skills-hardware').value = (s.hardware_sensors || []).join(', ');
  document.getElementById('skills-simulation').value = (s.simulation_cae || []).join(', ');
  document.getElementById('skills-ai').value = (s.ai_software || []).join(', ');
}

// ================= SAVING & PUBLISHING =================
async function saveChanges() {
  harvestFormData();
  showToast('Saving portfolio changes...', 'info');

  if (isLocalServer) {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Saved to data/content.json successfully!', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      showToast('Error saving: ' + err.message, 'error');
    }
  } else {
    // In static browser mode: prompt to publish via GitHub PAT or download
    const pat = localStorage.getItem('gh_pat');
    if (pat) {
      publishToGitHub();
    } else {
      downloadJson();
      showToast('Downloaded content.json. To enable 1-click publishing, add your GitHub Token in Settings.', 'info');
    }
  }
}

// Direct GitHub REST API Commit for GitHub Pages
async function publishToGitHub() {
  harvestFormData();
  const pat = localStorage.getItem('gh_pat');
  const owner = localStorage.getItem('gh_owner') || 'saleeqmohammed';
  const repo = localStorage.getItem('gh_repo') || 'saleeqmohammed.github.io';
  const branch = localStorage.getItem('gh_branch') || 'master';

  if (!pat) {
    alert('Please enter your GitHub Personal Access Token in the "Settings" tab to enable direct publishing to GitHub Pages.');
    document.querySelector('[data-tab="tab-settings"]').click();
    return;
  }

  showToast('Publishing directly to GitHub Pages repository...', 'info');

  try {
    const filePath = 'data/content.json';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    // 1. Get current file SHA
    let sha = null;
    const getRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${pat}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // 2. Encode updated content in UTF-8 base64
    const contentString = JSON.stringify(contentData, null, 2);
    const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));

    // 3. Put commit
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: 'Update portfolio content via Portfolio Studio CMS',
        content: contentBase64,
        sha: sha,
        branch: branch
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      throw new Error(errData.message || 'GitHub commit failed');
    }

    showToast('🚀 Published to GitHub! Your live site will update in ~30 seconds.', 'success');
  } catch (err) {
    console.error(err);
    showToast('GitHub publish failed: ' + err.message, 'error');
  }
}

function downloadJson() {
  harvestFormData();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contentData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'content.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Settings & Local Storage
function setupSettings() {
  const tokenInput = document.getElementById('gh-token');
  const ownerInput = document.getElementById('gh-repo-owner');
  const repoInput = document.getElementById('gh-repo-name');
  const branchInput = document.getElementById('gh-repo-branch');

  const savedPat = localStorage.getItem('gh_pat');
  if (savedPat) tokenInput.value = savedPat;

  const savedOwner = localStorage.getItem('gh_owner');
  if (savedOwner) ownerInput.value = savedOwner;

  const savedRepo = localStorage.getItem('gh_repo');
  if (savedRepo) repoInput.value = savedRepo;

  const savedBranch = localStorage.getItem('gh_branch');
  if (savedBranch) branchInput.value = savedBranch;

  document.getElementById('btn-save-pat').addEventListener('click', () => {
    localStorage.setItem('gh_pat', tokenInput.value.trim());
    localStorage.setItem('gh_owner', ownerInput.value.trim());
    localStorage.setItem('gh_repo', repoInput.value.trim());
    localStorage.setItem('gh_branch', branchInput.value.trim());
    showToast('GitHub credentials saved safely in local browser storage', 'success');
  });

  document.getElementById('btn-clear-pat').addEventListener('click', () => {
    localStorage.removeItem('gh_pat');
    tokenInput.value = '';
    showToast('GitHub token cleared', 'info');
  });

  document.getElementById('btn-test-pat').addEventListener('click', async () => {
    const pat = tokenInput.value.trim();
    if (!pat) return alert('Enter a token first.');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${pat}` }
      });
      if (res.ok) {
        const u = await res.json();
        showToast(`Authenticated as @${u.login}! Write access ready.`, 'success');
      } else {
        throw new Error('Invalid token or insufficient scopes');
      }
    } catch (e) {
      showToast('Token test failed: ' + e.message, 'error');
    }
  });
}

function setupEventListeners() {
  document.getElementById('btn-save').addEventListener('click', saveChanges);
  document.getElementById('btn-publish-gh').addEventListener('click', publishToGitHub);
  document.getElementById('btn-download').addEventListener('click', downloadJson);
  document.getElementById('btn-fetch-github').addEventListener('click', fetchGithubRepos);
  document.getElementById('btn-sync-stars').addEventListener('click', syncAllStars);

  // Project Modal
  document.getElementById('btn-add-project').addEventListener('click', () => openProjectModal(-1));
  document.getElementById('modal-project-close').addEventListener('click', closeProjectModal);
  document.getElementById('modal-project-cancel').addEventListener('click', closeProjectModal);
  document.getElementById('modal-project-save').addEventListener('click', saveProjectModal);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
