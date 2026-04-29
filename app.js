window.DuneWiki = window.DuneWiki || {};

(function() {
  const { Router, Navbar, Store, Pages } = window.DuneWiki;

  function init() {
    Navbar.render(document.getElementById('navbar-root'));

    Router.onRoute(function({ route, params }) {
      const container = document.getElementById('app-root');
      container.innerHTML = '';

      switch (route) {
        case 'home':     Pages.Home.render(container, params);     break;
        case 'view':     Pages.View.render(container, params);     break;
        case 'edit':     Pages.Edit.render(container, params);     break;
        case 'new':      Pages.Edit.render(container, params, true); break;
        case 'category': Pages.Category.render(container, params); break;
        case 'timeline': Pages.Timeline.render(container, params); break;
        case 'search':   Pages.Search.render(container, params);   break;
        default:         Pages.Home.render(container, params);
      }
    });

    Router.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
