window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.LinksEditor = (function() {
  function mount(container, initialLinks, excludeId) {
    let links = (initialLinks || []).map(l => ({ ...l }));

    function render() {
      const chipsHtml = links.map((l, i) =>
        `<span class="link-edit-chip" data-idx="${i}">
          ${_esc(l.label)}
          <button data-remove="${i}" title="Supprimer">×</button>
        </span>`
      ).join('');

      container.innerHTML = `
        <div class="links-editor">
          <div class="links-chips">${chipsHtml}</div>
          <div class="links-search-wrap">
            <input type="text" id="links-search" placeholder="Rechercher une page à lier…" autocomplete="off">
            <div class="links-dropdown" id="links-dropdown" style="display:none"></div>
          </div>
        </div>`;

      container.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          links.splice(parseInt(btn.dataset.remove), 1);
          render();
        });
      });

      const input    = container.querySelector('#links-search');
      const dropdown = container.querySelector('#links-dropdown');
      let debounce;

      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          const q = input.value.trim();
          if (!q) { dropdown.style.display = 'none'; return; }
          const results = window.DuneWiki.Store.search(q)
            .filter(p => p.id !== excludeId && !links.some(l => l.pageId === p.id))
            .slice(0, 8);
          if (!results.length) { dropdown.style.display = 'none'; return; }
          const SCHEMA = window.DuneWiki.SCHEMA;
          dropdown.innerHTML = results.map(p =>
            `<div class="links-dropdown-item" data-id="${p.id}" data-title="${_esc(p.title)}">
              <span class="dd-icon">${(SCHEMA[p.type] || {}).icon || '📄'}</span>
              ${_esc(p.title)}
              <small style="color:var(--muted);margin-left:.3rem">${(SCHEMA[p.type] || {}).label || p.type}</small>
            </div>`
          ).join('');
          dropdown.style.display = 'block';

          dropdown.querySelectorAll('.links-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
              links.push({ pageId: item.dataset.id, label: item.dataset.title });
              input.value = '';
              dropdown.style.display = 'none';
              render();
            });
          });
        }, 200);
      });

      input.addEventListener('keydown', e => { if (e.key === 'Escape') { dropdown.style.display = 'none'; input.value = ''; } });
      document.addEventListener('click', e => {
        if (!container.contains(e.target)) dropdown.style.display = 'none';
      }, { once: false });
    }

    render();
    return { getLinks: () => links.map(l => ({ ...l })) };
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { mount };
})();
