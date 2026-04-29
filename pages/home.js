window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Home = (function() {
  function render(container) {
    const { Store, SCHEMA } = window.DuneWiki;
    const stats  = Store.getStats();
    const recent = Store.getRecent(6);

    const statsHtml = Object.entries(SCHEMA).map(([type, def]) =>
      `<div class="home-stat">
        <span class="stat-num">${stats[type] || 0}</span>
        <span class="stat-label">${def.icon} ${def.label}s</span>
      </div>`
    ).join('');

    const catCards = Object.entries(SCHEMA).map(([type, def]) =>
      `<a href="#/category/${type}" class="category-card">
        <div class="cat-icon">${def.icon}</div>
        <div class="cat-name">${def.label}s</div>
        <div class="cat-count">${stats[type] || 0} page${(stats[type] || 0) !== 1 ? 's' : ''}</div>
      </a>`
    ).join('');

    const newPageOptions = Object.entries(SCHEMA).map(([type, def]) =>
      `<a class="dropdown-item-link" href="#/new/${type}">${def.icon} Nouveau ${def.label}</a>`
    ).join('');

    const recentHtml = recent.length
      ? recent.map(p => {
          const def = SCHEMA[p.type] || { icon: '📄', label: p.type };
          return `<a href="#/page/${p.slug}" class="recent-card">
            <div class="rc-title">${def.icon} ${_esc(p.title)}</div>
            <div class="rc-meta">${_esc(def.label)} · ${_relTime(p.updatedAt)}</div>
          </a>`;
        }).join('')
      : '<p style="color:var(--muted)">Aucune page encore.</p>';

    container.innerHTML = `
      <div class="home-hero">
        <h1>✦ Dune Wiki</h1>
        <p>Encyclopédie personnelle de l'univers de Dune</p>
        <div class="home-stats">${statsHtml}</div>
        <div class="dropdown" style="display:inline-block;margin-top:.5rem">
          <button class="btn-primary dropdown-toggle" id="new-page-toggle">+ Nouvelle page ▾</button>
          <div class="dropdown-menu" id="new-page-menu" style="left:50%;transform:translateX(-50%)">
            ${newPageOptions}
          </div>
        </div>
      </div>
      <div class="category-grid">${catCards}</div>
      <div class="recent-section">
        <h2>Pages récentes</h2>
        <div class="recent-list">${recentHtml}</div>
      </div>`;

    const toggle = container.querySelector('#new-page-toggle');
    const menu   = container.querySelector('#new-page-menu');
    toggle.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', () => menu.classList.remove('open'));
  }

  function _relTime(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'à l\'instant';
    if (m < 60) return `il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `il y a ${h}h`;
    const d = Math.floor(h / 24);
    return `il y a ${d}j`;
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
