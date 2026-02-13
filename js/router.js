/**
 * Router - Simple hash-based SPA router
 * 
 * Usage:
 *   Router.register('/home', HomeView.render);
 *   Router.start();
 */
const Router = (() => {
  const routes = {};
  let currentRoute = null;
  let contentEl = null;

  /**
   * Register a route
   * @param {string} path - Route path (e.g. '/home')
   * @param {Function} handler - Function that returns HTML string or renders into container
   */
  function register(path, handler) {
    routes[path] = handler;
  }

  /**
   * Navigate to a route programmatically
   * @param {string} path - Route path
   */
  function navigate(path) {
    window.location.hash = '#' + path;
  }

  /**
   * Get the current hash path
   * @returns {string}
   */
  function getCurrentPath() {
    const hash = window.location.hash.slice(1); // remove '#'
    return hash || '/home';
  }

  /**
   * Resolve the current route and render
   */
  function resolve() {
    const path = getCurrentPath();
    const handler = routes[path];

    // Always re-fetch the content element (in case shell was re-rendered)
    contentEl = document.getElementById('view');

    if (!contentEl) {
      console.error('[Router] #view element not found');
      return;
    }

    if (handler) {
      currentRoute = path;
      const result = handler(contentEl);

      // If the handler returns a string, inject it
      if (typeof result === 'string') {
        contentEl.innerHTML = result;
      }

      // Add entrance animation
      contentEl.classList.remove('view-enter');
      void contentEl.offsetWidth; // trigger reflow
      contentEl.classList.add('view-enter');

      // Update nav active states
      updateNav(path);
    } else {
      // Fallback: redirect to home
      navigate('/home');
    }
  }

  /**
   * Update bottom nav active state
   * @param {string} activePath
   */
  function updateNav(activePath) {
    const navItems = document.querySelectorAll('.app-nav__item');
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === '#' + activePath) {
        item.classList.add('app-nav__item--active');
      } else {
        item.classList.remove('app-nav__item--active');
      }
    });
  }

  /**
   * Start listening for hash changes
   */
  function start() {
    window.addEventListener('hashchange', resolve);
    // Initial resolve
    resolve();
  }

  /**
   * Get current route path
   * @returns {string|null}
   */
  function current() {
    return currentRoute;
  }

  return {
    register,
    navigate,
    start,
    resolve,
    current,
    getCurrentPath,
  };
})();
