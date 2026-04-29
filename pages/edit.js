window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Edit = (function() {
  function render(container, params, isNew) {
    const { Store, SCHEMA, Router, LinksEditor, TimelineEditor } = window.DuneWiki;

    let page;
    if (isNew) {
      const type = params.type || 'character';
      page = {
        id: Store.generateId(),
        type,
        title: '',
        slug: '',
        fields: {},
        description: '',
        links: [],
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      page = Store.getById(params.id);
      if (!page) {
        container.innerHTML = '<div class="empty-state"><div class="es-icon">🏜️</div><h3>Page introuvable</h3><a href="#/">Retour</a></div>';
        return;
      }
    }

    const def = SCHEMA[page.type] || { label: page.type, icon: '📄', fields: [] };
    const typeOptions = Object.entries(SCHEMA).map(([t, d]) =>
      `<option value="${t}" ${page.type === t ? 'selected' : ''}>${d.icon} ${d.label}</option>`
    ).join('');

    const fieldsHtml = _buildFieldsHtml(def.fields, page.fields || {});

    container.innerHTML = `
      <div class="breadcrumb">
        <a href="#/">Accueil</a> <span>›</span>
        ${isNew ? 'Nouvelle page' : `<a href="#/page/${page.slug}">${_esc(page.title)}</a> › Modifier`}
      </div>
      <h1>${isNew ? 'Nouvelle page' : 'Modifier : ' + _esc(page.title)}</h1>
      <div class="edit-form">
        <div class="form-row">
          <div class="form-group" style="flex:2">
            <label>Titre *</label>
            <input type="text" id="f-title" value="${_esc(page.title)}" placeholder="Nom de la page" autocomplete="off">
            <div class="slug-preview" id="slug-preview">${page.slug ? '#/page/' + page.slug : ''}</div>
          </div>
          <div class="form-group" style="flex:1">
            <label>Type *</label>
            <select id="f-type">${typeOptions}</select>
          </div>
        </div>

        <div class="form-section-title">Informations spécifiques</div>
        <div id="specific-fields">${fieldsHtml}</div>

        <div class="form-section-title">Description</div>
        <div id="quill-editor" style="margin-bottom:1rem"></div>

        <div class="form-section-title">Pages liées</div>
        <div id="links-editor-slot"></div>

        <div class="form-section-title">Frise chronologique</div>
        <p class="form-hint">AG = entier positif, BG = entier négatif pour le tri.</p>
        <div id="timeline-editor-slot"></div>

        <div class="form-actions">
          <button id="save-btn" class="btn-primary">💾 Enregistrer</button>
          <button id="cancel-btn" class="btn-ghost">Annuler</button>
        </div>
      </div>`;

    // Quill editor
    const quill = new Quill('#quill-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'clean']
        ]
      }
    });
    if (page.description) quill.root.innerHTML = page.description;

    // Links editor
    const linksEditorApi = LinksEditor.mount(
      container.querySelector('#links-editor-slot'),
      page.links,
      page.id
    );

    // Timeline editor
    const timelineEditorApi = TimelineEditor.mount(
      container.querySelector('#timeline-editor-slot'),
      page.timeline
    );

    // Title → slug preview
    const titleInput = container.querySelector('#f-title');
    const slugPreview = container.querySelector('#slug-preview');
    titleInput.addEventListener('input', () => {
      const slug = Store.generateSlug(titleInput.value, page.id);
      slugPreview.textContent = titleInput.value ? '#/page/' + slug : '';
    });

    // Type change → re-render specific fields
    const typeSelect = container.querySelector('#f-type');
    typeSelect.addEventListener('change', () => {
      const newType = typeSelect.value;
      page.type = newType;
      const newDef = SCHEMA[newType] || { fields: [] };
      container.querySelector('#specific-fields').innerHTML = _buildFieldsHtml(newDef.fields, {});
    });

    // Cancel
    container.querySelector('#cancel-btn').addEventListener('click', () => {
      if (isNew) Router.navigate('/');
      else Router.navigate('/page/' + page.slug);
    });

    // Save
    container.querySelector('#save-btn').addEventListener('click', () => {
      const title = titleInput.value.trim();
      if (!title) { alert('Le titre est obligatoire.'); return; }

      const selectedType = typeSelect.value;
      const currentDef = SCHEMA[selectedType] || { fields: [] };
      const fields = {};
      currentDef.fields.forEach(f => {
        const el = container.querySelector('[data-fkey="' + f.key + '"]');
        if (!el) return;
        let val = el.value.trim();
        if (f.type === 'array') {
          val = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
        }
        if (val !== '' && !(Array.isArray(val) && !val.length)) fields[f.key] = val;
      });

      const updatedPage = {
        ...page,
        type:        selectedType,
        title,
        slug:        Store.generateSlug(title, page.id),
        fields,
        description: quill.root.innerHTML,
        links:       linksEditorApi.getLinks(),
        timeline:    timelineEditorApi.getEvents(),
        updatedAt:   new Date().toISOString()
      };

      Store.save(updatedPage);
      Router.navigate('/page/' + updatedPage.slug);
    });
  }

  function _buildFieldsHtml(fields, values) {
    if (!fields || !fields.length) return '<p style="color:var(--muted);font-size:.9rem">Aucun champ spécifique pour ce type.</p>';
    const rows = [];
    for (let i = 0; i < fields.length; i += 2) {
      const pair = fields.slice(i, i + 2);
      rows.push(`<div class="form-row">
        ${pair.map(f => `
          <div class="form-group">
            <label>${_esc(f.label)}${f.required ? ' *' : ''}</label>
            ${f.type === 'textarea'
              ? `<textarea data-fkey="${f.key}" placeholder="${_esc(f.placeholder || '')}">${_esc(String(values[f.key] || ''))}</textarea>`
              : `<input type="${f.type === 'number' ? 'number' : 'text'}" data-fkey="${f.key}" placeholder="${_esc(f.placeholder || '')}" value="${_esc(Array.isArray(values[f.key]) ? values[f.key].join(', ') : String(values[f.key] || ''))}">`
            }
            ${f.type === 'array' ? '<div class="form-hint">Séparer par des virgules</div>' : ''}
          </div>`).join('')}
      </div>`);
    }
    return rows.join('');
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
