window.DuneWiki = window.DuneWiki || {};
window.DuneWiki.Pages = window.DuneWiki.Pages || {};

window.DuneWiki.Pages.Settings = (function() {
  function render(container) {
    const { Sync } = window.DuneWiki;
    const cfg = Sync.getConfig() || {};

    container.innerHTML = `
      <div class="breadcrumb"><a href="#/">Accueil</a> <span>›</span> Paramètres de sync</div>
      <h1>☁ Synchronisation GitHub Gist</h1>
      <p style="color:var(--muted);max-width:600px;margin-bottom:1.5rem">
        Tes données seront stockées dans un Gist privé GitHub, accessible depuis tous tes appareils.
        Le token n'est stocké que localement sur chaque appareil (localStorage).
      </p>

      <div class="edit-form" style="max-width:540px">
        <div class="form-group">
          <label>Personal Access Token GitHub <span style="color:var(--danger)">*</span></label>
          <input type="password" id="s-token" value="${_esc(cfg.token || '')}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off">
          <div class="form-hint">
            Créer sur
            <a href="https://github.com/settings/tokens/new?scopes=gist&description=Dune+Wiki+Sync" target="_blank" rel="noopener">
              github.com/settings/tokens
            </a>
            — scope requis : <strong>gist</strong> uniquement.
          </div>
        </div>

        <div class="form-group">
          <label>ID du Gist</label>
          <div style="display:flex;gap:.5rem">
            <input type="text" id="s-gist" value="${_esc(cfg.gistId || '')}" placeholder="Ex: a1b2c3d4e5f6…" style="flex:1" autocomplete="off">
            <button id="s-create-gist" class="btn-primary" title="Créer un nouveau Gist privé automatiquement">Créer</button>
          </div>
          <div class="form-hint">Laisse vide et clique "Créer" pour générer un nouveau Gist automatiquement.</div>
        </div>

        <div id="s-message" style="margin:.8rem 0;min-height:1.5rem;font-size:.9rem"></div>

        <div class="form-actions">
          <button id="s-test"       class="btn-ghost">Tester la connexion</button>
          <button id="s-save"       class="btn-primary">Enregistrer et synchroniser</button>
          ${cfg.token ? `<button id="s-disconnect" class="btn-danger">Déconnecter</button>` : ''}
        </div>

        ${cfg.gistId ? `
          <div style="margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border)">
            <h3>Synchronisation manuelle</h3>
            <div style="display:flex;gap:.6rem;margin-top:.7rem">
              <button id="s-pull" class="btn-ghost">⬇ Récupérer depuis Gist</button>
              <button id="s-push" class="btn-ghost">⬆ Envoyer vers Gist</button>
            </div>
            <div class="form-hint" style="margin-top:.4rem">
              Gist : <a href="https://gist.github.com/${cfg.gistId}" target="_blank" rel="noopener">${cfg.gistId}</a>
            </div>
          </div>` : ''}
      </div>`;

    const msg     = container.querySelector('#s-message');
    const tokenEl = container.querySelector('#s-token');
    const gistEl  = container.querySelector('#s-gist');

    function showMsg(text, type) {
      const colors = { ok: 'var(--success)', err: 'var(--danger)', info: 'var(--muted)' };
      msg.style.color = colors[type] || 'var(--muted)';
      msg.textContent = text;
    }

    container.querySelector('#s-create-gist').addEventListener('click', async () => {
      const token = tokenEl.value.trim();
      if (!token) { showMsg('Entre d\'abord ton token.', 'err'); return; }
      showMsg('Création du Gist…', 'info');
      try {
        const id = await Sync.createGist(token);
        gistEl.value = id;
        showMsg('Gist créé : ' + id, 'ok');
      } catch(e) { showMsg('Erreur : ' + e.message, 'err'); }
    });

    container.querySelector('#s-test').addEventListener('click', async () => {
      const token  = tokenEl.value.trim();
      const gistId = gistEl.value.trim();
      if (!token || !gistId) { showMsg('Token et Gist ID requis.', 'err'); return; }
      showMsg('Test en cours…', 'info');
      try {
        await Sync.testConnection(token, gistId);
        showMsg('✓ Connexion réussie.', 'ok');
      } catch(e) { showMsg('✕ Échec : ' + e.message, 'err'); }
    });

    container.querySelector('#s-save').addEventListener('click', async () => {
      const token  = tokenEl.value.trim();
      const gistId = gistEl.value.trim();
      if (!token || !gistId) { showMsg('Token et Gist ID requis.', 'err'); return; }
      showMsg('Vérification…', 'info');
      try {
        await Sync.testConnection(token, gistId);
        Sync.setConfig({ token, gistId });
        showMsg('✓ Config enregistrée. Synchronisation en cours…', 'ok');
        await Sync.pull();
        window.location.reload();
      } catch(e) { showMsg('✕ Erreur : ' + e.message, 'err'); }
    });

    const discBtn = container.querySelector('#s-disconnect');
    if (discBtn) {
      discBtn.addEventListener('click', () => {
        if (!confirm('Déconnecter ? Les données locales seront conservées.')) return;
        Sync.clearConfig();
        Sync.setStatus('unconfigured');
        window.DuneWiki.Router.navigate('/settings');
        window.location.reload();
      });
    }

    const pullBtn = container.querySelector('#s-pull');
    if (pullBtn) {
      pullBtn.addEventListener('click', async () => {
        showMsg('Récupération…', 'info');
        try { await Sync.pull(); showMsg('✓ Données récupérées.', 'ok'); window.location.reload(); }
        catch(e) { showMsg('✕ ' + e.message, 'err'); }
      });
    }

    const pushBtn = container.querySelector('#s-push');
    if (pushBtn) {
      pushBtn.addEventListener('click', async () => {
        showMsg('Envoi…', 'info');
        try { await Sync.retry(); showMsg('✓ Données envoyées.', 'ok'); }
        catch(e) { showMsg('✕ ' + e.message, 'err'); }
      });
    }
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { render };
})();
