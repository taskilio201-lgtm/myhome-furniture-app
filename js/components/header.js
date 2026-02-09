/**
 * Header Component
 * Renders the mobile app header with logo and title
 */
const Header = (() => {

  /**
   * Render the header
   * @param {Object} options
   * @param {string} [options.title='MyHome'] - Header title
   * @param {boolean} [options.showLogout=true] - Show logout button if logged in
   * @returns {string} HTML string
   */
  function render(options = {}) {
    const title = options.title || 'MyHome';
    const showLogout = options.showLogout !== false;
    
    // Check if user is logged in
    const isLoggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
    const showLogoutBtn = showLogout && isLoggedIn;

    return `
      <header class="app-header">
        <div class="app-header__logo">
          <div class="app-header__icon">MH</div>
          <h1 class="app-header__title">${title}</h1>
        </div>
        <div class="app-header__actions">
          ${showLogoutBtn ? `
            <button class="app-header__btn" id="header-logout-btn" aria-label="Logout" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </header>
    `;
  }

  /**
   * Bind logout event (call after rendering shell)
   */
  function bindLogoutEvent() {
    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  /**
   * Handle logout button click
   */
  function handleLogout() {
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
      Auth.logout();
      
      // Show toast
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = 'Logged out successfully';
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
      });
      
      setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.remove(), 400);
      }, 1500);

      // Redirect to login
      setTimeout(() => {
        if (typeof Router !== 'undefined') {
          Router.navigate('/login');
        } else {
          window.location.hash = '#/login';
        }
      }, 800);
    }
  }

  return { render, bindLogoutEvent };
})();
