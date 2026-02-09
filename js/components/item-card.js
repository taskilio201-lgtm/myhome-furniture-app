/**
 * ItemCard Component
 * Reusable furniture card with image, name, and room label
 */
const ItemCard = (() => {

  /**
   * Render a single item card
   * @param {Object} item
   * @param {string} item.id - Unique item ID
   * @param {string} item.name - Furniture name
   * @param {string} item.room - Room label (e.g. "Living Room")
   * @param {string} [item.image] - Image URL (optional)
   * @returns {string} HTML string
   */
  function render(item) {
    const imageHTML = item.image
      ? `<img class="item-card__image" src="${item.image}" alt="${item.name}" loading="lazy">`
      : `<div class="item-card__image item-card__image--placeholder">
           <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#9CA3AF">
             <rect x="2" y="7" width="20" height="14" rx="2"/>
             <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/>
           </svg>
         </div>`;

    return `
      <article class="item-card" data-id="${item.id}">
        ${imageHTML}
        <div class="item-card__body">
          <div class="item-card__name">${item.name}</div>
          <span class="item-card__room">${item.room}</span>
        </div>
      </article>
    `;
  }

  /**
   * Render a grid of item cards
   * @param {Array} items - Array of item objects
   * @returns {string} HTML string
   */
  function renderGrid(items) {
    if (!items || items.length === 0) return '';
    return `
      <div class="items-grid">
        ${items.map(item => render(item)).join('')}
      </div>
    `;
  }

  return { render, renderGrid };
})();
