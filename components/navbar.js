window.DuneWiki = window.DuneWiki || {};

window.DuneWiki.Navbar = (function() {
  function render(container) {
    const SCHEMA = window.DuneWiki.SCHEMA;
    const catItems = Object.entries(SCHEMA).map(([type, def]) =>
      `<a href="#/category/${type}"><span>${def.icon}</span> ${def.label}s</a>`
    ).join('');

    container.innerHTML = `
      <nav class="navbar">
        <a class="navbar-brand" href="#/">✦ Dune Wiki <span>Encyclopédie</span></a>
        <div class="navbar-nav">
          <a href="#/">Accueil</a>
          <a href="#/timeline">Frise</a>
          <div class="dropdown">
            <span class="navbar-btn dropdown-toggle" id="cat-toggle">Catégories ▾</span>
            <div class="dropdown-menu" id="cat-menu">
              ${catItems}
            </div>
          </div>
        </div>
        <div class="navbar-search">
          <input type="text" id="navbar-search-input" placeholder="Rechercher…" />
          <button id="navbar-search-btn" class="btn-primary">Chercher</button>
        </div>
      </nav>`;

    const toggle = container.querySelector('#cat-toggle');
    const menu   = container.querySelector('#cat-menu');
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', () => menu.classList.remove('open'));

    const searchInput = container.querySelector('#navbar-search-input');
    const searchBtn   = container.querySelector('#navbar-search-btn');
    function doSearch() {
      const q = searchInput.value.trim();
      if (q) window.DuneWiki.Router.navigate('/search?q=' + encodeURIComponent(q));
    }
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }

  return { render };
})();
