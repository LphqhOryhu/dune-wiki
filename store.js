window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.Store = (function() {
  const KEY = 'dune_wiki_pages';

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch(e) { return []; }
  }
  function _save(pages) {
    localStorage.setItem(KEY, JSON.stringify(pages));
    if (window.DuneWiki.Sync) window.DuneWiki.Sync.push(pages);
  }

  function generateId() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function _slugify(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function generateSlug(title, excludeId) {
    const pages = _load();
    const base = _slugify(title) || 'page';
    let slug = base, n = 2;
    while (pages.some(p => p.slug === slug && p.id !== excludeId)) {
      slug = base + '-' + n++;
    }
    return slug;
  }

  function getAll() { return _load(); }

  function getById(id) {
    return _load().find(p => p.id === id) || null;
  }

  function getBySlug(slug) {
    return _load().find(p => p.slug === slug) || null;
  }

  function getByType(type) {
    return _load().filter(p => p.type === type);
  }

  function search(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase();
    const pages = _load();
    const scored = pages.map(p => {
      let score = 0;
      const title = (p.title || '').toLowerCase();
      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 50;
      else if (title.includes(q)) score += 20;
      const fieldsText = Object.values(p.fields || {}).join(' ').toLowerCase();
      if (fieldsText.includes(q)) score += 10;
      const desc = (p.description || '').replace(/<[^>]+>/g, '').toLowerCase();
      if (desc.includes(q)) score += 5;
      return { page: p, score };
    }).filter(x => x.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.map(x => x.page);
  }

  function save(page) {
    const pages = _load();
    const now = new Date().toISOString();
    const idx = pages.findIndex(p => p.id === page.id);
    page.updatedAt = now;
    if (idx === -1) {
      page.createdAt = page.createdAt || now;
      pages.push(page);
    } else {
      pages[idx] = page;
    }
    _save(pages);
    return page;
  }

  function remove(id) {
    let pages = _load();
    pages = pages.filter(p => p.id !== id);
    // clean up dangling links
    pages = pages.map(p => ({
      ...p,
      links: (p.links || []).filter(l => l.pageId !== id)
    }));
    _save(pages);
  }

  function getAllEvents() {
    return _load().flatMap(p =>
      (p.timeline || []).map(evt => ({
        ...evt,
        pageId:    p.id,
        pageSlug:  p.slug,
        pageTitle: p.title,
        pageType:  p.type
      }))
    ).sort((a, b) => (a.dateSortKey || 0) - (b.dateSortKey || 0));
  }

  function getStats() {
    const pages = _load();
    const stats = {};
    const SCHEMA = window.DuneWiki.SCHEMA || {};
    Object.keys(SCHEMA).forEach(t => { stats[t] = 0; });
    pages.forEach(p => { if (stats[p.type] !== undefined) stats[p.type]++; });
    stats.total = pages.length;
    return stats;
  }

  function getRecent(n) {
    return _load()
      .slice()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, n || 6);
  }

  return { generateId, generateSlug, getAll, getById, getBySlug, getByType, search, save, remove, getAllEvents, getStats, getRecent };
})();
