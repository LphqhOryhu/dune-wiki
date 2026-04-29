window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Category = (function() {
  function render(container, params) {
    const { Store, SCHEMA } = window.DuneWiki;
    const type = params.type;
    const def  = SCHEMA[type];

    if (!def) {
      container.innerHTML = '<div class="empty-state"><div class="es-icon">🏜️</div><h3>Catégorie inconnue</h3><a href="#/">Retour</a></div>';
      return;
    }

    const pages = Store.getByType(type).sort((a, b) => a.title.localeCompare(b.title));

    const listHtml = pages.length
      ? pages.map(p => {
          const meta = _buildMeta(p, def);
          return `<a href="#/page/${p.slug}" class="page-list-item">
            <span class="item-icon">${def.icon}</span>
            <div>
              <div class="item-title">${_esc(p.title)}</div>
              ${meta ? `<div class="item-meta">${meta}</div>` : ''}
            </div>
          </a>`;
        }).join('')
      : `<div class="empty-state">
          <div class="es-icon">${def.icon}</div>
          <h3>Aucun(e) ${def.label} pour l'instant</h3>
          <a href="#/new/${type}" class="btn-primary" style="display:inline-block;margin-top:.8rem;padding:.4rem 1rem">+ Créer</a>
        </div>`;

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/">Accueil</a> <span>›</span> ${_esc(def.label)}s</div>
      <div class="clearfix">
        <div class="page-actions">
          <a href="#/new/${type}"><button class="btn-primary">+ Nouveau(elle) ${_esc(def.label)}</button></a>
        </div>
        <h1>${def.icon} ${_esc(def.label)}s <small style="font-size:.6em;color:var(--muted)">${pages.length}</small></h1>
      </div>
      <div class="page-list">${listHtml}</div>`;
  }

  function _buildMeta(page, def) {
    const f = page.fields || {};
    const parts = [];
    if (def.fields) {
      const first2 = def.fields.filter(fd => f[fd.key]).slice(0, 2);
      first2.forEach(fd => parts.push(_esc(String(Array.isArray(f[fd.key]) ? f[fd.key].join(', ') : f[fd.key]))));
    }
    return parts.join(' · ');
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
