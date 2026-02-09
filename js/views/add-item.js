/**
 * Add Item View
 * Form to create a new furniture item via Storage
 */
const AddItemView = (() => {

  const ROOM_OPTIONS = [
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Bathroom',
    'Dining Room',
    'Office',
    'Garage',
    'Balcony',
    'Hallway',
    'Other',
  ];

  /**
   * Render the Add Item form
   * @param {HTMLElement} container
   */
  function render(container) {
    container.innerHTML = `
      <div class="page-title">Add New Furniture</div>
      <form class="form" id="add-item-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="item-name">Name *</label>
          <input class="form-input" type="text" id="item-name"
                 placeholder="e.g. IKEA Kallax Shelf" required maxlength="100" autocomplete="off">
        </div>

        <div class="form-group">
          <label class="form-label" for="item-room">Room *</label>
          <select class="form-select" id="item-room" required>
            <option value="" disabled selected>Select a room</option>
            ${ROOM_OPTIONS.map(room => `<option value="${room}">${room}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="item-notes">Notes</label>
          <textarea class="form-textarea" id="item-notes"
                    placeholder="Color, dimensions, purchase info..."
                    rows="3" maxlength="500"></textarea>
          <span class="form-hint">Optional — add any details you want to remember.</span>
        </div>

        <button type="submit" class="btn btn--primary btn--full" id="add-item-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Furniture
        </button>
      </form>
    `;

    bindEvents(container);
  }

  /**
   * Bind form events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const form = container.querySelector('#add-item-form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(container);
    });
  }

  /**
   * Handle form submission
   * @param {HTMLElement} container
   */
  function handleSubmit(container) {
    const name = container.querySelector('#item-name').value.trim();
    const room = container.querySelector('#item-room').value;
    const notes = container.querySelector('#item-notes').value.trim();

    // Validate required fields
    if (!name) {
      shakeField(container.querySelector('#item-name'));
      return;
    }
    if (!room) {
      shakeField(container.querySelector('#item-room'));
      return;
    }

    // Create item via Storage
    const newItem = Storage.create({
      name,
      room,
      notes: notes || null,
      image: null, // camera integration comes later
    });

    // Show success toast
    showToast(`"${newItem.name}" added!`, 'success');

    // Navigate to home after short delay so toast is visible
    setTimeout(() => {
      Router.navigate('/home');
    }, 600);
  }

  /**
   * Shake a field to indicate validation error
   * @param {HTMLElement} el
   */
  function shakeField(el) {
    el.style.borderColor = '#EF4444';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.4s ease';
    el.focus();

    // Inject shake keyframes if not present
    if (!document.getElementById('shake-keyframes')) {
      const style = document.createElement('style');
      style.id = 'shake-keyframes';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Reset border after animation
    setTimeout(() => {
      el.style.borderColor = '';
      el.style.animation = '';
    }, 1000);
  }

  /**
   * Show a toast notification
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
