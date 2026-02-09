/**
 * Items View
 * Browse all furniture items with filter-by-room and delete
 */
const ItemsView = (() => {

  let activeRoom = 'All';

  /**
   * Render the Items screen
   * @param {HTMLElement} container
   */
  function render(container) {
    const allItems = Storage.getAll();
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
      <div class="items-list" id="items-list">
        ${filtered.map(item => renderListItem(item)).join('')}
      </div>
    `;

    bindEvents(container);
  }

  /**
   * Get unique room names from items
   * @param {Array} items
   * @returns {Array<string>}
   */
  function getUniqueRooms(items) {
    const rooms = new Set(items.map(item => item.room).filter(Boolean));
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
    return items.filter(item => item.room === room);
  }

  /**
   * Render room filter chips
   * @param {Array<string>} rooms
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
   * Render a single list item row
   * @param {Object} item
   * @returns {string}
   */
  function renderListItem(item) {
    const thumbContent = item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <rect x="2" y="7" width="20" height="14" rx="2"/>
           <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/>
         </svg>`;

    return `
      <div class="items-list-item" data-id="${item.id}">
        <div class="items-list-item__thumb">
          ${thumbContent}
        </div>
        <div class="items-list-item__info">
          <div class="items-list-item__name">${item.name}</div>
          <div class="items-list-item__room">${item.room}</div>
        </div>
        <div class="items-list-item__actions">
          <button class="items-list-item__btn items-list-item__btn--delete"
                  data-delete-id="${item.id}"
                  aria-label="Delete ${item.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <h2 class="empty-state__title">No items yet</h2>
        <p class="empty-state__text">
          Items you add will appear here.
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

    // Delete buttons
    container.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.deleteId;
        const item = Storage.getById(id);
        if (item) {
          showDeleteConfirm(item, container);
        }
      });
    });
  }

  /**
   * Show delete confirmation bottom sheet
   * @param {Object} item
   * @param {HTMLElement} container
   */
  function showDeleteConfirm(item, container) {
    // Remove existing dialog if any
    const existing = document.querySelector('.dialog-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    overlay.innerHTML = `
      <div class="dialog">
        <h3 class="dialog__title">Delete "${item.name}"?</h3>
        <p class="dialog__text">This action cannot be undone. The item will be permanently removed.</p>
        <div class="dialog__actions">
          <button class="btn btn--ghost" id="dialog-cancel">Cancel</button>
          <button class="btn btn--danger" id="dialog-confirm">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('dialog-overlay--visible');
    });

    // Cancel
    overlay.querySelector('#dialog-cancel').addEventListener('click', () => {
      closeDialog(overlay);
    });

    // Tap outside
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog(overlay);
    });

    // Confirm delete
    overlay.querySelector('#dialog-confirm').addEventListener('click', () => {
      Storage.remove(item.id);
      closeDialog(overlay);
      showToast(`"${item.name}" deleted`, 'success');
      render(container);
    });
  }

  /**
   * Close dialog overlay
   * @param {HTMLElement} overlay
   */
  function closeDialog(overlay) {
    overlay.classList.remove('dialog-overlay--visible');
    setTimeout(() => overlay.remove(), 300);
  }

  /**
   * Show a toast notification
   * @param {string} message
   * @param {string} type - 'success' or 'error'
   */
  function showToast(message, type = 'success') {
    // Remove existing toast
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
