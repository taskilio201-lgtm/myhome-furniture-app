/**
 * Items View
 * Browse all furniture items with images
 */
const ItemsView = (() => {

  let activeRoom = 'All';

  /**
   * Render the Items screen
   * @param {HTMLElement} container
   */
  async function render(container) {
    // Show loading state
    container.innerHTML = '<div style="padding:40px;text-align:center;color:var(--color-text-secondary);">Loading...</div>';

    const allItems = await Storage.getAll();
    const rooms = getUniqueRooms(allItems);
    const filtered = filterByRoom(allItems, activeRoom);

    if (allItems.length === 0) {
      container.innerHTML = renderEmptyState();
      bindEvents(container);
      return;
    }

    container.innerHTML = `
      ${renderFilterChips(rooms)}
      <div class="section-header">
        <span class="section-header__title">${activeRoom === 'All' ? 'All Items' : activeRoom}</span>
        <span class="section-header__count">${filtered.length}</span>
      </div>
      <div class="items-grid">
        ${filtered.map(item => ItemCard.render(item)).join('')}
      </div>
    `;

    bindEvents(container);
  }

  /**
   * Get unique room names
   * @param {Array} items
   * @returns {Array}
   */
  function getUniqueRooms(items) {
    const rooms = new Set(items.map(item => item.category).filter(Boolean));
    return ['All', ...Array.from(rooms).sort()];
  }

  /**
   * Filter items by room
   * @param {Array} items
   * @param {string} room
   * @returns {Array}
   */
  function filterByRoom(items, room) {
    if (room === 'All') return items;
    return items.filter(item => item.category === room);
  }

  /**
   * Render filter chips
   * @param {Array} rooms
   * @returns {string}
   */
  function renderFilterChips(rooms) {
    return `
      <div class="filter-chips">
        ${rooms.map(room => `
          <button class="filter-chip ${room === activeRoom ? 'filter-chip--active' : ''}"
                  data-room="${room}">
            ${room}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render empty state
   * @returns {string}
   */
  function renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2 class="empty-state__title">Start building your home inventory</h2>
        <p class="empty-state__text">
          Tap the + button to add your first furniture item with a photo.
        </p>
      </div>
    `;
  }

  /**
   * Bind events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    // Filter chips
    container.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        activeRoom = chip.dataset.room;
        render(container);
      });
    });

    // Card clicks for delete
    container.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', async (e) => {
        const id = card.dataset.id;
        const allItems = await Storage.getAll();
        const item = allItems.find(i => i.id === id);
        if (item) {
          showItemActions(item, container);
        }
      });
    });
  }

  /**
   * Show item action dialog
   * @param {Object} item
   * @param {HTMLElement} container
   */
  function showItemActions(item, container) {
    const existing = document.querySelector('.dialog-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog">
        <h3 class="dialog__title">${item.name}</h3>
        <p class="dialog__text">${item.category || 'Uncategorized'}${item.description ? ' • ' + item.description : ''}</p>
        <div class="dialog__actions">
          <button class="btn btn--ghost" id="dialog-cancel">Cancel</button>
          <button class="btn btn--danger" id="dialog-delete">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('dialog-overlay--visible');
    });

    overlay.querySelector('#dialog-cancel').addEventListener('click', () => {
      closeDialog(overlay);
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog(overlay);
    });

    overlay.querySelector('#dialog-delete').addEventListener('click', async () => {
      const success = await Storage.deleteItem(item.id);
      closeDialog(overlay);
      if (success) {
        showToast(`"${item.name}" deleted`, 'success');
        render(container);
      } else {
        showToast('Failed to delete item', 'error');
      }
    });
  }

  /**
   * Close dialog
   * @param {HTMLElement} overlay
   */
  function closeDialog(overlay) {
    overlay.classList.remove('dialog-overlay--visible');
    setTimeout(() => overlay.remove(), 300);
  }

  /**
   * Show toast
   * @param {string} message
   * @param {string} type
   */
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  return { render };
})();
