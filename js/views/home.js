/**
 * Home View
 * Main landing screen showing recent furniture items or onboarding
 */
const HomeView = (() => {
  const MAX_RECENT = 4;

  /**
   * Render the Home screen
   * @param {HTMLElement} container
   */
  async function render(container) {
    // Show loading state
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-secondary);">Loading...</div>';

    const items = await Storage.getAll();
    const recentItems = items.slice(0, MAX_RECENT);
    const totalCount = items.length;

    let content;

    if (totalCount === 0) {
      content = renderOnboarding();
    } else {
      content = renderRecentItems(recentItems, totalCount);
    }

    container.innerHTML = `
      ${content}
      ${renderFAB()}
    `;

    bindEvents(container);
  }

  /**
   * Render onboarding empty state
   * @returns {string}
   */
  function renderOnboarding() {
    return `
      <div class="onboarding">
        <div class="onboarding__illustration">
          <svg width="180" height="180" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Moon with glow -->
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FFF4D6;stop-opacity:0.4" />
                <stop offset="70%" style="stop-color:#FFE5A8;stop-opacity:0.15" />
                <stop offset="100%" style="stop-color:#FFE5A8;stop-opacity:0" />
              </radialGradient>
            </defs>
            
            <!-- Moon glow -->
            <circle cx="140" cy="35" r="32" fill="url(#moonGlow)"/>
            
            <!-- Moon body -->
            <circle cx="140" cy="35" r="16" fill="#FFE5A8"/>
            <circle cx="137" cy="32" r="3" fill="#FFF8E1" opacity="0.6"/>
            <circle cx="143" cy="37" r="2" fill="#FFF8E1" opacity="0.5"/>
            
            <!-- House -->
            <path d="M100 60L40 100V180H80V140H120V180H160V100L100 60Z" fill="#E8DCC4" stroke="#B5A393" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Door -->
            <rect x="90" y="150" width="20" height="30" fill="#A89484" rx="2"/>
            <circle cx="95" cy="165" r="1.5" fill="#E8DCC4"/>
            
            <!-- Windows with warm light -->
            <rect x="55" y="115" width="20" height="20" fill="#FFE5A8" rx="2" opacity="0.6"/>
            <rect x="125" y="115" width="20" height="20" fill="#FFE5A8" rx="2" opacity="0.6"/>
            <line x1="65" y1="115" x2="65" y2="135" stroke="#B5A393" stroke-width="1.5"/>
            <line x1="55" y1="125" x2="75" y2="125" stroke="#B5A393" stroke-width="1.5"/>
            <line x1="135" y1="115" x2="135" y2="135" stroke="#B5A393" stroke-width="1.5"/>
            <line x1="125" y1="125" x2="145" y2="125" stroke="#B5A393" stroke-width="1.5"/>
            
            <!-- Small plants -->
            <circle cx="70" cy="180" r="4" fill="#8BA888" opacity="0.7"/>
            <circle cx="130" cy="180" r="4" fill="#8BA888" opacity="0.7"/>
          </svg>
        </div>
        <h2 class="onboarding__title">欢迎回家</h2>
        <p class="onboarding__subtitle">开始记录你的家居物品</p>
        <button class="onboarding__cta" id="onboarding-cta">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>拍照添加家具</span>
        </button>
      </div>
    `;
  }

  /**
   * Render recent items section
   * @param {Array} items
   * @param {number} total
   * @returns {string}
   */
  function renderRecentItems(items, total) {
    const user = Auth.getCurrentUser();
    const username = user ? user.email.split('@')[0] : 'User';
    
    return `
      <div class="home-header">
        <h2 class="home-header__title">${username}'s Home</h2>
      </div>
      <div class="section-header">
        <span class="section-header__title">最近添加</span>
        <span class="section-header__count">${total} 件</span>
      </div>
      ${ItemCard.renderGrid(items)}
      ${total > MAX_RECENT ? `
        <div style="text-align:center; margin-top:20px;">
          <button class="btn btn--ghost btn--sm" id="home-view-all">
            查看全部 ${total} 件
          </button>
        </div>
      ` : ''}
    `;
  }

  /**
   * Render FAB
   * @returns {string}
   */
  function renderFAB() {
    return `
      <button class="fab" id="fab-add" aria-label="Add item">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    `;
  }

  /**
   * Bind events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const fabBtn = container.querySelector('#fab-add');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
        Router.navigate('/add-item');
      });
    }

    const ctaBtn = container.querySelector('#onboarding-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        Router.navigate('/add-item');
      });
    }

    const viewAllBtn = container.querySelector('#home-view-all');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        Router.navigate('/items');
      });
    }
  }

  return { render };
})();
