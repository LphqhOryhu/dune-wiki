window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Search = (function() {
  function render(container, params) {
    const { Store, SCHEMA } = window.DuneWiki;
    const q       = (params.q || '').trim();
    const results = q ? Store.search(q) : [];

    const resultHtml = results.length
      ? results.map(p => {
          const def     = SCHEMA[p.type] || { icon: '📄', label: p.type };
          const excerpt = _excerpt(p.description || '', q);
          return `<a href="#/page/${p.slug}" class="search-result-item">
            <div class="sr-title">${def.icon} ${_highlight(_esc(p.title), q)}</div>
            <div class="sr-type">${_esc(def.label)}</div>
            ${excerpt ? `<div class="sr-excerpt">${excerpt}</div>` : ''}
          </a>`;
        }).join('')
      : q
        ? `<div class="empty-state">
            <div class="es-icon">🔍</div>
            <h3>Aucun résultat pour "${_esc(q)}"</h3>
          </div>`
        : `<div class="empty-state">
            <div class="es-icon">🔍</div>
            <h3>Entrez un terme de recherche</h3>
          </div>`;

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/">Accueil</a> <span>›</span> Recherche</div>
      <h1>Recherche${q ? ' : ' + _esc(q) : ''}</h1>
      ${q ? `<p style="color:var(--muted);margin-bottom:1rem">${results.length} résultat${results.length !== 1 ? 's' : ''}</p>` : ''}
      <div class="search-results">${resultHtml}</div>`;
  }

  function _excerpt(html, q) {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const idx  = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return '';
    const start = Math.max(0, idx - 60);
    const end   = Math.min(text.length, idx + q.length + 80);
    let excerpt = (start > 0 ? '…' : '') + _esc(text.slice(start, end)) + (end < text.length ? '…' : '');
    return _highlight(excerpt, q);
  }

  function _highlight(str, q) {
    if (!q) return str;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return str.replace(new RegExp('(' + safe + ')', 'gi'), '<mark style="background:var(--accent-dim);color:var(--text)">$1</mark>');
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
