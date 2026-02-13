/**
 * Settings View
 * App settings with logout functionality
 */
const SettingsView = (() => {

  /**
   * Render the Settings screen
   * @param {HTMLElement} container
   */
  function render(container) {
    const user = Auth.getUser();
    
    container.innerHTML = `
      <div class="settings">
        <div class="settings__section">
          <h3 class="settings__section-title">账户</h3>
          ${user ? `
            <div class="settings__item">
              <span class="settings__item-label">邮箱</span>
              <span class="settings__item-value">${user.email || '未设置'}</span>
            </div>
          ` : ''}
          <button class="settings__button settings__button--danger" id="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>退出登录</span>
          </button>
        </div>
        
        <div class="settings__section">
          <h3 class="settings__section-title">关于</h3>
          <div class="settings__item">
            <span class="settings__item-label">版本</span>
            <span class="settings__item-value">1.0.0</span>
          </div>
        </div>
      </div>
    `;

    bindEvents(container);
  }

  /**
   * Bind events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const logoutBtn = container.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  /**
   * Handle logout
   */
  function handleLogout() {
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
      Auth.logout();
      
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

      setTimeout(() => {
        if (typeof Router !== 'undefined') {
          Router.navigate('/login');
        } else {
          window.location.hash = '#/login';
        }
      }, 800);
    }
  }

  return { render };
})();
