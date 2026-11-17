/**
 * Mohammed Saleeq Kolleth — Portfolio Interactive Logic
 * Dynamically loads and renders content from data/content.json,
 * manages project filtering, navigation tracking, and interactions.
 */

let portfolioData = null;
let currentProjectFilter = 'all';

async function initPortfolio() {
  setupNavScroll();
  setupMobileMenu();
  setupAdminShortcut();
  await loadPortfolioData();
}

// Fetch content.json
async function loadPortfolioData() {
  try {
    const res = await fetch('data/content.json?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load data/content.json');
    portfolioData = await res.json();
    renderAll();
  } catch (err) {
    console.warn('Could not load data/content.json dynamically:', err);
    // Static HTML fallback will be displayed automatically
  }
}

function renderAll() {
  if (!portfolioData) return;
  renderProfile();
  renderSpotlights();
  renderInterests();
  renderProjects();
  renderExperience();
  renderPublications();
  renderSkills();
}

// Profile & Hero
function renderProfile() {
  const p = portfolioData.profile || {};
  const pos = portfolioData.current_position || {};

  // Status pill
  const statusEl = document.getElementById('hero-status-text');
  if (statusEl && pos.role && pos.institution) {
    statusEl.textContent = `${pos.role} · ${pos.institution}`;
  }

  // Name & Headings
  const nameEl = document.getElementById('hero-name');
  if (nameEl && p.name) nameEl.textContent = p.name;

  const roleEl = document.getElementById('hero-role');
  if (roleEl && p.headline) roleEl.textContent = p.headline;

  const taglineEl = document.getElementById('hero-tagline');
  if (taglineEl && p.subheadline) taglineEl.textContent = p.subheadline;

  // CV Buttons
  if (p.cv_url) {
    const cvButtons = document.querySelectorAll('.cv-link-btn');
    cvButtons.forEach(btn => btn.setAttribute('href', p.cv_url));
  }

  // Metrics Bar
  const metricsContainer = document.getElementById('metrics-container');
  if (metricsContainer && p.highlights) {
    metricsContainer.innerHTML = p.highlights.map(h => `
      <div class="metric-card">
        <span class="metric-label">${escapeHtml(h.label)}</span>
        <span class="metric-value">${escapeHtml(h.value)}</span>
      </div>
    `).join('');
  }
}

// Spotlight (CAVECORE & CONVINCE)
function renderSpotlights() {
  const container = document.getElementById('spotlight-container');
  if (!container) return;

  const pos = portfolioData.current_position || {};
  const exps = portfolioData.experience || [];
  const convince = exps.find(e => (e.project || '').includes('CONVINCE')) || {};

  container.innerHTML = `
    <!-- CAVECORE Current PhD -->
    <div class="spotlight-card">
      <div class="spotlight-top">
        <span class="spotlight-badge">● Active PhD Research</span>
        <img src="${pos.logo || 'icons/bremen_logo_dark.png'}" alt="Bremen" class="spotlight-logo-thumb">
      </div>
      <div>
        <h3 class="spotlight-title">${escapeHtml(pos.project || 'CAVECORE Project')}</h3>
        <p class="spotlight-inst">${escapeHtml(pos.group || 'SECORO Group')} &bull; ${escapeHtml(pos.institution || 'Universität Bremen')}</p>
      </div>
      <p class="spotlight-desc">${escapeHtml(pos.description || '')}</p>
      <div class="spotlight-tags">
        <span class="tag-pill">MSCA Doctoral Network</span>
        <span class="tag-pill">RAG for Safety</span>
        <span class="tag-pill">Cognitive Robotics</span>
        <span class="tag-pill">HRC</span>
      </div>
      <div>
        <a href="${pos.project_url || 'https://cavecore.eu/'}" target="_blank" class="project-link">
          Visit CAVECORE Network &rarr;
        </a>
      </div>
    </div>

    <!-- CONVINCE Research Associate -->
    <div class="spotlight-card secondary">
      <div class="spotlight-top">
        <span class="spotlight-badge concluded">Horizon EU / UKRI Project</span>
        <img src="icons/uob_logo_dark.png" alt="University of Birmingham" class="spotlight-logo-thumb">
      </div>
      <div>
        <h3 class="spotlight-title">CONVINCE Project</h3>
        <p class="spotlight-inst">Intelligent Robotics Lab &bull; University of Birmingham</p>
      </div>
      <p class="spotlight-desc">Context-aware robotic deliberation and formal verification. Designed hierarchical planning pipelines with Behavior Trees (py_trees_ros) and symbolic TAMP (PDDLStream) on UR10e and Kinova Gen3 platforms.</p>
      <div class="spotlight-tags">
        <span class="tag-pill">ROS2</span>
        <span class="tag-pill">py_trees_ros</span>
        <span class="tag-pill">PDDLStream</span>
        <span class="tag-pill">UR10e</span>
        <span class="tag-pill">Kinova Gen3</span>
      </div>
      <div>
        <a href="${convince.link || 'https://convince-project.eu/'}" target="_blank" class="project-link">
          Visit CONVINCE Project &rarr;
        </a>
      </div>
    </div>
  `;
}

// Research Interests
function renderInterests() {
  const container = document.getElementById('interests-container');
  if (!container || !portfolioData.research_interests) return;

  const icons = {
    'shield-check': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`,
    'git-merge': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M6 9a9 9 0 0 1 9 9"></path></svg>`,
    'cpu': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
    'crosshair': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>`
  };

  container.innerHTML = portfolioData.research_interests.map(item => `
    <div class="interest-card">
      <div class="interest-icon">${icons[item.icon] || icons['cpu']}</div>
      <h3 class="interest-title">${escapeHtml(item.title)}</h3>
      <p class="interest-desc">${escapeHtml(item.desc)}</p>
    </div>
  `).join('');
}

// Projects Showcase
function renderProjects() {
  const container = document.getElementById('projects-container');
  if (!container || !portfolioData.projects) return;

  const filtered = portfolioData.projects.filter(p => {
    if (currentProjectFilter === 'all') return true;
    return (p.category || '').toLowerCase().includes(currentProjectFilter.toLowerCase());
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No projects found in this category.</div>`;
    return;
  }

  container.innerHTML = filtered.map(proj => {
    const highlightsHtml = (proj.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');
    const tagsHtml = (proj.tags || []).map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
    const imageSrc = proj.image || 'images/Kidnap_2.png';

    return `
      <article class="project-card">
        <div class="project-media">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(proj.title)}" class="project-img" loading="lazy">
          <span class="project-category-badge">${escapeHtml(proj.category || 'Robotics')}</span>
          ${proj.stars ? `<span class="project-stars-badge">★ ${proj.stars}</span>` : ''}
        </div>
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(proj.title)}</h3>
          <p class="project-desc">${escapeHtml(proj.description || '')}</p>
          ${highlightsHtml ? `<ul class="project-highlights">${highlightsHtml}</ul>` : ''}
          <div class="project-tags">${tagsHtml}</div>
        </div>
        <div class="project-footer">
          ${proj.github_url ? `
            <a href="${escapeHtml(proj.github_url)}" target="_blank" class="project-link">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub Code &rarr;
            </a>
          ` : '<span></span>'}
          ${proj.pdf_url ? `
            <a href="${escapeHtml(proj.pdf_url)}" target="_blank" class="project-link" style="color:var(--primary-light);">
              Report / PDF &rarr;
            </a>
          ` : ''}
          ${proj.demo_url ? `
            <a href="${escapeHtml(proj.demo_url)}" target="_blank" class="project-link" style="color:var(--accent-emerald);">
              Live Demo &rarr;
            </a>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

// Project filter buttons
window.filterProjects = function(category, btnElement) {
  currentProjectFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderProjects();
};

// Experience & Timeline
function renderExperience() {
  const container = document.getElementById('experience-timeline');
  if (!container || !portfolioData.experience) return;

  container.innerHTML = portfolioData.experience.map(exp => {
    const bulletsHtml = (exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
    const tagsHtml = (exp.tags || []).map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
    const logoSrc = exp.logo || 'icons/default_jouney.svg';

    return `
      <div class="timeline-card">
        <div class="timeline-logo-box">
          <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(exp.organization)}" loading="lazy">
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <div>
              <h3 class="timeline-role">${escapeHtml(exp.role)}</h3>
              <p class="timeline-org">${escapeHtml(exp.organization)} &bull; <span style="color:var(--text-dim);">${escapeHtml(exp.location || '')}</span></p>
            </div>
            <span class="timeline-period">${escapeHtml(exp.period)}</span>
          </div>
          ${bulletsHtml ? `<ul class="timeline-bullets">${bulletsHtml}</ul>` : ''}
          ${tagsHtml ? `<div class="project-tags" style="margin-top:0.4rem;">${tagsHtml}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Also render education
  const eduContainer = document.getElementById('education-timeline');
  if (eduContainer && portfolioData.education) {
    eduContainer.innerHTML = portfolioData.education.map(edu => `
      <div class="timeline-card">
        <div class="timeline-logo-box">
          <img src="${escapeHtml(edu.logo || 'icons/default_jouney.svg')}" alt="${escapeHtml(edu.institution)}" loading="lazy">
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <div>
              <h3 class="timeline-role">${escapeHtml(edu.degree)}</h3>
              <p class="timeline-org">${escapeHtml(edu.institution)} &bull; <span style="color:var(--text-dim);">${escapeHtml(edu.location || '')}</span></p>
            </div>
            <span class="timeline-period">${escapeHtml(edu.period)}</span>
          </div>
          ${edu.grade ? `<p style="font-size:0.88rem; color:#cbd5e1; margin-top:0.25rem;"><strong>${edu.period.includes('Present') ? 'Fellowship / Status:' : 'Grade / Honors:'}</strong> ${escapeHtml(edu.grade)}</p>` : ''}
          ${edu.thesis ? `<p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;"><strong>${edu.period.includes('Present') ? 'Research Focus:' : 'Thesis:'}</strong> ${escapeHtml(edu.thesis)}</p>` : ''}
        </div>
      </div>
    `).join('');
  }
}

// Publications & Preprints
function renderPublications() {
  const container = document.getElementById('publications-container');
  if (!container || !portfolioData.publications) return;

  container.innerHTML = portfolioData.publications.map(pub => `
    <article class="pub-card">
      <div class="pub-top">
        <h3 class="pub-title">${escapeHtml(pub.title)}</h3>
        <span class="pub-status">${escapeHtml(pub.status || 'Published')}</span>
      </div>
      <p class="pub-authors">${escapeHtml(pub.authors || '')}</p>
      <p class="pub-venue">${escapeHtml(pub.venue || '')} ${pub.year ? `(${pub.year})` : ''}</p>
      <p class="pub-summary">${escapeHtml(pub.summary || '')}</p>
      <div class="pub-links">
        ${pub.code_url ? `<a href="${escapeHtml(pub.code_url)}" target="_blank" class="project-link">View Code &rarr;</a>` : ''}
        ${pub.pdf_url ? `<a href="${escapeHtml(pub.pdf_url)}" target="_blank" class="project-link" style="color:var(--primary-light);">Download PDF &rarr;</a>` : ''}
      </div>
    </article>
  `).join('');
}

// Skills Matrix
function renderSkills() {
  const container = document.getElementById('skills-container');
  if (!container || !portfolioData.skills) return;

  const s = portfolioData.skills;
  const categories = [
    { title: 'Robotics & Deliberation', items: s.robotics_deliberation },
    { title: 'Manipulators & Hardware', items: s.hardware_sensors },
    { title: 'Simulation & CAE Tools', items: s.simulation_cae },
    { title: 'AI, Perception & Software', items: s.ai_software }
  ];

  container.innerHTML = categories.map(cat => `
    <div class="skill-category-card">
      <h3 class="skill-category-title">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        ${escapeHtml(cat.title)}
      </h3>
      <div class="skill-pill-list">
        ${(cat.items || []).map(item => `<span class="skill-pill">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Setup Nav Scroll Tracking
function setupNavScroll() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

// Mobile Menu
function setupMobileMenu() {
  const toggle = document.querySelector('.nav-mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });
}

// Quick shortcut to open Admin Studio (Ctrl+Shift+A or Cmd+Shift+A)
function setupAdminShortcut() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      window.location.href = 'admin/index.html';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', initPortfolio);
