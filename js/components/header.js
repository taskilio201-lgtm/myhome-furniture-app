/**
 * Header Component
 * Shows user info and logout button
 */
const Header = (() => {

  /**
   * Render the header
   * @returns {string}
   */
  function render() {
    return `
      <header class="app-header">
        <h1 class="app-header__welcome">欢迎回家</h1>
        <div class="app-header__user" id="header-user">
          <span class="app-header__email">加载中...</span>
          <button class="app-header__logout" id="header-logout" style="display:none;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Initialize header - fetch user info and bind events
   */
  async function init() {
    const userEl = document.querySelector('#header-user .app-header__email');
    const logoutBtn = document.getElementById('header-logout');

    if (!userEl) return;

    // Verify auth and get user info
    const result = await Auth.verifyAuth();

    if (result.valid && result.user) {
      userEl.textContent = result.user.email;
      if (logoutBtn) {
        logoutBtn.style.display = 'flex';
      }
    } else {
      userEl.textContent = '未登录';
    }

    // Bind logout event
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    Auth.logout();
    
    // Show toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = '已退出登录';
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
      window.location.hash = '#/login';
    }, 800);
  }

  /**
   * Legacy function for compatibility
   */
  function bindLogoutEvent() {
    // No-op, init() handles everything now
  }

  return { render, init, bindLogoutEvent };
})();
