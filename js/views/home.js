/**
 * Home View
 * Main landing screen showing recent furniture items or empty state
 */
const HomeView = (() => {
  const MAX_RECENT = 4;

  /**
   * Render the Home screen into the view container
   * @param {HTMLElement} container - The #view element
   */
  function render(container) {
    const items = Storage.getAll();
    const recentItems = items.slice(0, MAX_RECENT);
    const totalCount = items.length;

    let content;

    if (totalCount === 0) {
      content = renderEmptyState();
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
   * Render recent items section
   * @param {Array} items
   * @param {number} total
   * @returns {string}
   */
  function renderRecentItems(items, total) {
    return `
      <div class="section-header">
        <span class="section-header__title">Recently Added</span>
        <span class="section-header__count">${total} item${total !== 1 ? 's' : ''}</span>
      </div>
      ${ItemCard.renderGrid(items)}
      ${total > MAX_RECENT ? `
        <div style="text-align:center; margin-top:20px;">
          <button class="btn btn--ghost btn--sm" id="home-view-all">
            View all ${total} items
          </button>
        </div>
      ` : ''}
    `;
  }

  /**
   * Render empty state when no furniture items exist
   * @returns {string}
   */
  function renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2 class="empty-state__title">No furniture yet</h2>
        <p class="empty-state__text">
          Start by adding your first furniture item. Tap the + button to begin.
        </p>
      </div>
    `;
  }

  /**
   * Render the floating action button
   * @returns {string}
   */
  function renderFAB() {
    return `
      <button class="fab" id="fab-add" aria-label="Add item">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    `;
  }

  /**
   * Bind events for the Home view
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const fabBtn = container.querySelector('#fab-add');
    if (fabBtn) {
      fabBtn.addEventListener('click', () => {
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
