/**
 * App Bootstrap
 * Initializes the layout shell, registers routes, and starts the router
 */
const App = (() => {

  // Protected routes that require authentication
  const PROTECTED_ROUTES = ['/home', '/items', '/add-item', '/family', '/settings'];
  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ['/login', '/register'];

  /**
   * Build the app shell (header + content area + bottom nav)
   * Only renders shell for authenticated users
   */
  function renderShell() {
    const appEl = document.getElementById('app');

    appEl.innerHTML = `
      ${Header.render()}
      <main class="app-content" id="view"></main>
      ${renderBottomNav()}
    `;

    // Initialize header (fetch user info and bind events)
    Header.init();
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
    const hash = (window.location.hash || '#/home').replace('#', '');

    function active(route) {
      return hash === route ? ' app-nav__item--active' : '';
    }

    return `
      <nav class="app-nav">
        <a href="#/home" class="app-nav__item${active('/home')}">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span class="app-nav__label">首页</span>
        </a>
        <a href="#/items" class="app-nav__item${active('/items')}">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </span>
          <span class="app-nav__label">物品</span>
        </a>
        <a href="#/add-item" class="app-nav__item app-nav__item--center">
          <span class="app-nav__add-btn">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </span>
        </a>
        <a href="#/family" class="app-nav__item${active('/family')}">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="app-nav__label">家庭</span>
        </a>
        <a href="#/settings" class="app-nav__item${active('/settings')}">
          <span class="app-nav__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="app-nav__label">设置</span>
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
    return async (container) => {
      // Verify auth with backend
      const isAuthenticated = await Auth.requireAuth();
      
      if (!isAuthenticated) {
        return; // requireAuth already redirected to login
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
    Router.register('/family', protectedRoute(FamilyView.render));
    Router.register('/settings', protectedRoute(SettingsView.render));
  }

  /**
   * Update bottom nav active state without full re-render
   * @param {string} currentPath
   */
  function updateNavActive(currentPath) {
    const navItems = document.querySelectorAll('.app-nav__item');
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (!href) return;
      const route = href.replace('#', '');
      item.classList.toggle('app-nav__item--active', route === currentPath);
    });
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
    let currentPath = Router.getCurrentPath();

    // 2. Register all routes first
    registerRoutes();

    // 3. If no hash, set default
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = isLoggedIn ? '#/home' : '#/login';
      currentPath = Router.getCurrentPath();
    }

    // 4. Handle initial route based on auth state
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

    let lastShellType = PUBLIC_ROUTES.includes(currentPath) ? 'auth' : 'app';

    // 5. Listen for route changes to update shell ONLY when switching between auth/app
    window.addEventListener('hashchange', () => {
      const newPath = Router.getCurrentPath();
      const needsAuthShell = PUBLIC_ROUTES.includes(newPath);
      const newShellType = needsAuthShell ? 'auth' : 'app';
      
      // Only re-render shell if switching between auth and app views
      if (newShellType !== lastShellType) {
        renderAppropriateShell();
        lastShellType = newShellType;
        // Re-resolve route after shell change
        setTimeout(() => Router.resolve(), 0);
      } else if (newShellType === 'app') {
        // Update active nav highlight without full re-render
        updateNavActive(newPath);
      }
    });

    // 6. Start the router
    Router.start();

    console.log('[App] MyHome app initialized');
  }

  return { init };
})();

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
