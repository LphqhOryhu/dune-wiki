window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Timeline = (function() {
  function render(container, params) {
    const { Store, SCHEMA } = window.DuneWiki;
    let activeFilter = 'all';

    function draw() {
      const allEvents = Store.getAllEvents();
      const filtered  = activeFilter === 'all'
        ? allEvents
        : allEvents.filter(e => e.pageType === activeFilter);

      // Group by dateSortKey
      const groups = {};
      filtered.forEach(e => {
        const k = e.dateSortKey !== undefined ? e.dateSortKey : '?';
        if (!groups[k]) groups[k] = { display: e.date || '?', events: [] };
        groups[k].events.push(e);
      });

      const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a === '?') return 1;
        if (b === '?') return -1;
        return Number(a) - Number(b);
      });

      const typeFilters = ['all', ...Object.keys(SCHEMA)];
      const filterBtns  = typeFilters.map(t =>
        `<button class="filter-btn ${activeFilter === t ? 'active' : ''}" data-type="${t}">
          ${t === 'all' ? 'Tout' : (SCHEMA[t].icon + ' ' + SCHEMA[t].label + 's')}
        </button>`
      ).join('');

      const timelineHtml = sortedKeys.length
        ? sortedKeys.map(k => {
            const grp = groups[k];
            const items = grp.events.map(e => {
              const def = SCHEMA[e.pageType] || { icon: '📄' };
              return `<div class="global-timeline-item">
                <div class="evt-summary">${_esc(e.summary || '')}</div>
                <div class="evt-source">
                  ${def.icon} <a href="#/page/${e.pageSlug}">${_esc(e.pageTitle)}</a>
                </div>
              </div>`;
            }).join('');
            return `<div class="timeline-year-group">
              <div class="timeline-year">${_esc(grp.display)}</div>
              <div class="timeline-year-events">${items}</div>
            </div>`;
          }).join('')
        : `<div class="empty-state">
            <div class="es-icon">📅</div>
            <h3>Aucun événement enregistré</h3>
            <p>Ajoutez des événements dans les pages individuelles.</p>
          </div>`;

      const appRoot = container.querySelector('#timeline-inner') || container;
      const target  = container.querySelector('#timeline-inner');
      if (!target) {
        container.innerHTML = `
          <div class="breadcrumb"><a href="#/">Accueil</a> <span>›</span> Frise chronologique</div>
          <h1>📅 Frise chronologique</h1>
          <div class="filter-bar" id="filter-bar">${filterBtns}</div>
          <div class="global-timeline" id="timeline-inner">${timelineHtml}</div>`;
      } else {
        container.querySelector('#filter-bar').innerHTML = filterBtns;
        target.innerHTML = timelineHtml;
      }

      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.type;
          draw();
        });
      });
    }

    draw();
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
