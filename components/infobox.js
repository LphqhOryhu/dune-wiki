window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.Infobox = (function() {
  function render(page) {
    const SCHEMA = window.DuneWiki.SCHEMA;
    const def = SCHEMA[page.type] || { label: page.type, icon: '📄', fields: [] };
    const fields = page.fields || {};

    const rows = def.fields
      .filter(f => fields[f.key] && fields[f.key] !== '')
      .map(f => {
        let val = fields[f.key];
        if (f.type === 'array') {
          const items = Array.isArray(val) ? val : val.split(',').map(s => s.trim()).filter(Boolean);
          val = items.map(i => `<span class="tag">${_esc(i)}</span>`).join(' ');
        } else {
          val = _esc(String(val));
        }
        return `<tr><td>${_esc(f.label)}</td><td>${val}</td></tr>`;
      }).join('');

    if (!rows) return '<div class="infobox"><div class="infobox-header"><span class="type-icon">' + def.icon + '</span><div><div class="type-name">' + _esc(def.label) + '</div></div></div></div>';

    return `
      <div class="infobox">
        <div class="infobox-header">
          <span class="type-icon">${def.icon}</span>
          <div>
            <div class="type-label">Type</div>
            <div class="type-name">${_esc(def.label)}</div>
          </div>
        </div>
        <table><tbody>${rows}</tbody></table>
      </div>`;
  }

  function _esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
