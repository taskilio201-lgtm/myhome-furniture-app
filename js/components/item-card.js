/**
 * ItemCard Component
 * Reusable furniture card with image thumbnail
 */
const ItemCard = (() => {

  /**
   * Render a single item card
   * @param {Object} item
   * @returns {string}
   */
  function render(item) {
    const imageHTML = item.image
      ? `<img class="item-card__image" src="${item.image}" alt="${item.name}" loading="lazy">`
      : `<div class="item-card__image item-card__image--placeholder">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
             <circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>
         </div>`;

    return `
      <article class="item-card" data-id="${item.id}">
        ${imageHTML}
        <div class="item-card__body">
          <div class="item-card__name">${escapeHtml(item.name)}</div>
          <span class="item-card__room">${escapeHtml(item.room)}</span>
        </div>
      </article>
    `;
  }

  /**
   * Render a grid of item cards
   * @param {Array} items
   * @returns {string}
   */
  function renderGrid(items) {
    if (!items || items.length === 0) return '';
    return `
      <div class="items-grid">
        ${items.map(item => render(item)).join('')}
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, renderGrid };
})();
