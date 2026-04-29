window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.View = (function() {
  function render(container, params) {
    const { Store, Infobox, SCHEMA, Router } = window.DuneWiki;
    const page = Store.getBySlug(params.slug);

    if (!page) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">🏜️</div>
          <h3>Page introuvable</h3>
          <p>La page "<strong>${_esc(params.slug)}</strong>" n'existe pas.</p>
          <a href="#/">Retour à l'accueil</a>
        </div>`;
      return;
    }

    const def = SCHEMA[page.type] || { label: page.type, icon: '📄' };

    // Links section
    const linksHtml = _renderLinks(page.links || []);

    // Per-page timeline section
    const timelineHtml = _renderTimeline(page.timeline || []);

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/">Accueil</a> <span>›</span>
        <a href="#/category/${page.type}">${_esc(def.label)}s</a> <span>›</span>
        ${_esc(page.title)}
      </div>
      <div id="confirm-bar-slot"></div>
      <div class="wiki-layout">
        <div class="wiki-main">
          <div class="clearfix">
            <div class="page-actions">
              <button id="edit-btn" class="btn-primary">✎ Modifier</button>
              <button id="delete-btn" class="btn-danger">✕ Supprimer</button>
            </div>
            <div class="type-badge">${def.icon} ${_esc(def.label)}</div>
            <h1>${_esc(page.title)}</h1>
          </div>
          <div class="wiki-description">${page.description || '<p style="color:var(--muted)">Aucune description.</p>'}</div>
          ${linksHtml}
          ${timelineHtml}
        </div>
        <div class="wiki-sidebar">
          ${Infobox.render(page)}
        </div>
      </div>`;

    container.querySelector('#edit-btn').addEventListener('click', () => Router.navigate('/edit/' + page.id));
    container.querySelector('#delete-btn').addEventListener('click', () => showConfirm(container, page));
  }

  function showConfirm(container, page) {
    const slot = container.querySelector('#confirm-bar-slot');
    slot.innerHTML = `
      <div class="confirm-bar">
        <span>Supprimer <strong>${_esc(page.title)}</strong> ? Cette action est irréversible.</span>
        <button id="confirm-delete" class="btn-danger">Confirmer</button>
        <button id="cancel-delete" class="btn-ghost">Annuler</button>
      </div>`;
    slot.querySelector('#confirm-delete').addEventListener('click', () => {
      window.DuneWiki.Store.remove(page.id);
      window.DuneWiki.Router.navigate('/');
    });
    slot.querySelector('#cancel-delete').addEventListener('click', () => { slot.innerHTML = ''; });
  }

  function _renderLinks(links) {
    if (!links.length) return '';
    const SCHEMA = window.DuneWiki.SCHEMA;
    const Store  = window.DuneWiki.Store;
    const chips  = links.map(l => {
      const linked = Store.getById(l.pageId);
      if (!linked) {
        return `<span class="link-chip broken" title="Page supprimée">🔗 ${_esc(l.label)}</span>`;
      }
      const def = SCHEMA[linked.type] || { icon: '📄' };
      return `<a href="#/page/${linked.slug}" class="link-chip"><span class="chip-icon">${def.icon}</span>${_esc(linked.title)}</a>`;
    }).join('');

    return `
      <div class="wiki-links">
        <h2>Pages liées</h2>
        <div class="links-grid">${chips}</div>
      </div>`;
  }

  function _renderTimeline(events) {
    if (!events.length) return '';
    const sorted = events.slice().sort((a, b) => (a.dateSortKey || 0) - (b.dateSortKey || 0));
    const items = sorted.map(e => `
      <div class="timeline-item">
        <div class="timeline-date">${_esc(e.date || '?')}</div>
        <div class="timeline-summary">${_esc(e.summary || '')}</div>
      </div>`).join('');

    return `
      <div class="wiki-timeline">
        <h2>Frise chronologique</h2>
        <div class="timeline-list">${items}</div>
      </div>`;
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
