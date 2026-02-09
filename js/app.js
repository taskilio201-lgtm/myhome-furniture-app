/**
 * App Bootstrap
 * Initializes the layout shell, registers routes, and starts the router
 */
const App = (() => {

  // Protected routes that require authentication
  const PROTECTED_ROUTES = ['/home', '/items', '/add-item', '/settings'];
  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ['/login', '/register'];

  /**
   * Build the app shell (header + content area + bottom nav)
   * Only renders shell for authenticated users
   */
  function renderShell() {
    const appEl = document.getElementById('app');

    appEl.innerHTML = `
      ${Header.render({ title: 'MyHome' })}
      <main class="app-content" id="view"></main>
      ${renderBottomNav()}
    `;

    // Bind logout event after header is rendered
    Header.bindLogoutEvent();
  }

  /**
   * Render minimal shell for auth screens (no nav)
   */
  function renderAuthShell() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `<main class="app-content" id="view" style="padding-top:0"></main>`;
  }

  /**
   * Render bottom navigation bar
   * @returns {string} HTML string
   */
  function renderBottomNav() {
    return `
      <nav class="app-nav">
        <a href="#/home" class="app-nav__item app-nav__item--active">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="app-nav__label">Home</span>
        </a>
        <a href="#/items" class="app-nav__item">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span class="app-nav__label">Items</span>
        </a>
        <a href="#/add-item" class="app-nav__item">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </span>
          <span class="app-nav__label">Add</span>
        </a>
        <a href="#/settings" class="app-nav__item">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="app-nav__label">Settings</span>
        </a>
      </nav>
    `;
  }

  /**
   * Create protected route handler
   * @param {Function} handler - The actual view render function
   * @returns {Function}
   */
  function protectedRoute(handler) {
    return (container) => {
      if (!Auth.isLoggedIn()) {
        Router.navigate('/login');
        return;
      }
      return handler(container);
    };
  }

  /**
   * Register all routes with the router
   */
  function registerRoutes() {
    // Auth routes (public)
    Router.register('/login', LoginView.render);
    Router.register('/register', RegisterView.render);

    // Protected app routes
    Router.register('/home', protectedRoute(HomeView.render));
    Router.register('/items', protectedRoute(ItemsView.render));
    Router.register('/add-item', protectedRoute(AddItemView.render));
    Router.register('/settings', protectedRoute(SettingsView.render));
  }

  /**
   * Check current route and render appropriate shell
   */
  function renderAppropriateShell() {
    const currentPath = Router.getCurrentPath();
    
    if (PUBLIC_ROUTES.includes(currentPath)) {
      // Auth screens don't need full shell
      renderAuthShell();
    } else {
      // Protected routes need full shell
      renderShell();
    }
  }

  /**
   * Initialize the application
   */
  function init() {
    // 1. Check authentication state
    const isLoggedIn = Auth.isLoggedIn();
    const currentPath = Router.getCurrentPath();

    // 2. Register all routes first
    registerRoutes();

    // 3. Handle initial route based on auth state
    if (!isLoggedIn && PROTECTED_ROUTES.includes(currentPath)) {
      // User trying to access protected route without login
      window.location.hash = '#/login';
      renderAuthShell();
    } else if (isLoggedIn && PUBLIC_ROUTES.includes(currentPath)) {
      // Logged-in user on auth page, redirect to home
      window.location.hash = '#/home';
      renderShell();
    } else {
      // Normal routing
      renderAppropriateShell();
    }

    // 4. Listen for route changes to update shell
    window.addEventListener('hashchange', () => {
      renderAppropriateShell();
    });

    // 5. Start the router
    Router.start();

    console.log('[App] MyHome app initialized');
  }

  return { init };
})();

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
