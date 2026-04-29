window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.Sync = (function() {
  const CFG_KEY  = 'dune_wiki_sync_config';
  const FILE     = 'dune-wiki-data.json';
  const API      = 'https://api.github.com';

  let _status    = 'unconfigured'; // unconfigured | ok | syncing | error
  let _statusEl  = null;

  /* ── Config ── */
  function getConfig() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || null; }
    catch(e) { return null; }
  }
  function setConfig(cfg) { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); }
  function clearConfig()  { localStorage.removeItem(CFG_KEY); }
  function isConfigured() { const c = getConfig(); return !!(c && c.token && c.gistId); }

  /* ── Status indicator ── */
  function setStatus(s) {
    _status = s;
    _statusEl = _statusEl || document.getElementById('sync-indicator');
    if (!_statusEl) return;
    const map = {
      unconfigured: { icon: '○', title: 'Sync non configuré — cliquer pour configurer', cls: 'sync-off'      },
      ok:           { icon: '●', title: 'Synchronisé avec GitHub Gist',                 cls: 'sync-ok'       },
      syncing:      { icon: '⟳', title: 'Synchronisation en cours…',                   cls: 'sync-busy'     },
      error:        { icon: '✕', title: 'Erreur de sync — cliquer pour réessayer',      cls: 'sync-err'      },
      offline:      { icon: '⊘', title: 'Hors ligne — données locales uniquement',      cls: 'sync-off'      },
    };
    const m = map[s] || map.unconfigured;
    _statusEl.textContent = m.icon;
    _statusEl.title       = m.title;
    _statusEl.className   = 'sync-indicator ' + m.cls;
  }

  /* ── GitHub API helpers ── */
  async function _fetch(method, path, body, token) {
    const opts = {
      method,
      headers: {
        'Authorization': 'token ' + token,
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err.message || res.status));
    }
    return res.json();
  }

  /* ── Create a new private Gist ── */
  async function createGist(token) {
    const data = await _fetch('POST', '/gists', {
      description: 'Dune Wiki — données',
      public: false,
      files: { [FILE]: { content: '[]' } }
    }, token);
    return data.id;
  }

  /* ── Test connection ── */
  async function testConnection(token, gistId) {
    await _fetch('GET', '/gists/' + gistId, null, token);
    return true;
  }

  /* ── Pull from Gist → overwrite localStorage ── */
  async function pull() {
    const cfg = getConfig();
    if (!cfg) return;
    setStatus('syncing');
    try {
      const gist    = await _fetch('GET', '/gists/' + cfg.gistId, null, cfg.token);
      const content = gist.files[FILE] && gist.files[FILE].content;
      if (content) {
        const pages = JSON.parse(content);
        localStorage.setItem('dune_wiki_pages', JSON.stringify(pages));
      }
      setStatus('ok');
    } catch(e) {
      console.warn('[Sync] pull failed:', e.message);
      setStatus(navigator.onLine ? 'error' : 'offline');
    }
  }

  /* ── Push localStorage → Gist ── */
  async function push(pages) {
    const cfg = getConfig();
    if (!cfg) return;
    setStatus('syncing');
    try {
      await _fetch('PATCH', '/gists/' + cfg.gistId, {
        files: { [FILE]: { content: JSON.stringify(pages) } }
      }, cfg.token);
      setStatus('ok');
    } catch(e) {
      console.warn('[Sync] push failed:', e.message);
      setStatus(navigator.onLine ? 'error' : 'offline');
    }
  }

  /* ── Init: pull on startup ── */
  async function init() {
    if (!isConfigured()) { setStatus('unconfigured'); return; }
    await pull();
  }

  /* ── Manual retry ── */
  async function retry() {
    const pages = JSON.parse(localStorage.getItem('dune_wiki_pages') || '[]');
    await push(pages);
  }

  /* ── Bind status element click ── */
  function bindIndicator(el) {
    _statusEl = el;
    setStatus(_status);
    el.addEventListener('click', () => {
      if (_status === 'error') { retry(); }
      else { window.DuneWiki.Router.navigate('/settings'); }
    });
  }

  window.addEventListener('online',  () => { if (_status === 'offline') retry(); });
  window.addEventListener('offline', () => setStatus('offline'));

  return { getConfig, setConfig, clearConfig, isConfigured, init, pull, push, retry, createGist, testConnection, bindIndicator, setStatus };
})();
