window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.Router = (function() {
  let _handler = null;

  function parse() {
    const raw = window.location.hash.slice(1) || '/';
    const [pathPart, queryPart] = raw.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const params = {};
    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = decodeURIComponent(v || '');
      });
    }

    if (segments.length === 0) return { route: 'home', params };
    if (segments[0] === 'page'     && segments[1]) return { route: 'view',     params: { slug: segments[1] } };
    if (segments[0] === 'edit'     && segments[1]) return { route: 'edit',     params: { id:   segments[1] } };
    if (segments[0] === 'new'      && segments[1]) return { route: 'new',      params: { type: segments[1] } };
    if (segments[0] === 'category' && segments[1]) return { route: 'category', params: { type: segments[1] } };
    if (segments[0] === 'timeline')                return { route: 'timeline', params };
    if (segments[0] === 'search')                  return { route: 'search',   params };
    return { route: 'home', params };
  }

  function dispatch() {
    if (_handler) _handler(parse());
  }

  function onRoute(fn) {
    _handler = fn;
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function init() {
    window.addEventListener('hashchange', dispatch);
    window.addEventListener('DOMContentLoaded', dispatch);
    if (document.readyState !== 'loading') dispatch();
  }

  return { onRoute, navigate, init };
})();
