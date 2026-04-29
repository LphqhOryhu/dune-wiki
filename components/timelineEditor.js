window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.TimelineEditor = (function() {
  function mount(container, initialEvents) {
    let events = (initialEvents || []).map(e => ({ ...e }));

    function renderRow(evt, i) {
      return `
        <div class="timeline-editor-row" data-idx="${i}">
          <div style="display:flex;flex-direction:column;gap:.3rem;flex:1">
            <div style="display:flex;gap:.4rem">
              <input class="date-input" type="text" placeholder="Date (ex: 10191 AG)" value="${_esc(evt.date || '')}" data-field="date">
              <input class="sort-input" type="number" placeholder="Tri" value="${evt.dateSortKey !== undefined ? evt.dateSortKey : ''}" data-field="dateSortKey" title="Entier pour tri (AG=positif, BG=négatif)">
            </div>
            <textarea placeholder="Résumé de l'événement…" data-field="summary">${_esc(evt.summary || '')}</textarea>
          </div>
          <button class="btn-ghost remove-evt" data-idx="${i}" title="Supprimer">✕</button>
        </div>`;
    }

    function render() {
      container.innerHTML = `
        <div class="timeline-editor">
          <div class="timeline-editor-list">
            ${events.map((e, i) => renderRow(e, i)).join('')}
          </div>
          <button id="add-evt-btn">+ Ajouter un événement</button>
        </div>`;

      container.querySelectorAll('.timeline-editor-row').forEach(row => {
        const idx = parseInt(row.dataset.idx);
        row.querySelectorAll('[data-field]').forEach(el => {
          el.addEventListener('input', () => {
            const field = el.dataset.field;
            let val = el.value;
            if (field === 'dateSortKey') {
              events[idx][field] = val === '' ? undefined : parseInt(val);
            } else {
              events[idx][field] = val;
              if (field === 'date') _autoSort(el, idx);
            }
          });
        });
      });

      container.querySelectorAll('.remove-evt').forEach(btn => {
        btn.addEventListener('click', () => {
          events.splice(parseInt(btn.dataset.idx), 1);
          render();
        });
      });

      container.querySelector('#add-evt-btn').addEventListener('click', () => {
        events.push({ id: window.DuneWiki.Store.generateId(), date: '', dateSortKey: undefined, summary: '' });
        render();
        const rows = container.querySelectorAll('.timeline-editor-row');
        const last = rows[rows.length - 1];
        if (last) last.querySelector('.date-input').focus();
      });
    }

    function _autoSort(input, idx) {
      const val = input.value.trim();
      const m = val.match(/^(-?\d+)\s*(AG|BG)?$/i);
      if (!m) return;
      let n = parseInt(m[1]);
      if (m[2] && m[2].toUpperCase() === 'BG') n = -Math.abs(n);
      events[idx].dateSortKey = n;
      const row = input.closest('.timeline-editor-row');
      if (row) {
        const sortInput = row.querySelector('.sort-input');
        if (sortInput) sortInput.value = n;
      }
    }

    render();
    return { getEvents: () => events.map(e => ({ ...e })) };
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { mount };
})();
