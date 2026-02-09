/**
 * Storage - localStorage CRUD layer for furniture items
 *
 * Data model:
 * {
 *   id:        string   (auto-generated UUID)
 *   name:      string   (furniture name, required)
 *   room:      string   (room label, required)
 *   image:     string   (base64 data-url or path, optional)
 *   notes:     string   (free-text notes, optional)
 *   createdAt: string   (ISO 8601 timestamp)
 *   updatedAt: string   (ISO 8601 timestamp)
 * }
 */
const Storage = (() => {
  const STORAGE_KEY = 'myhome_items';

  // ─── Helpers ────────────────────────────────────────────

  /**
   * Generate a short unique ID
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Read the full items array from localStorage
   * @returns {Array}
   */
  function _readAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Storage] Failed to read localStorage:', e);
      return [];
    }
  }

  /**
   * Write the full items array to localStorage
   * @param {Array} items
   */
  function _writeAll(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[Storage] Failed to write localStorage:', e);
    }
  }

  // ─── Public CRUD API ───────────────────────────────────

  /**
   * Get all furniture items, newest first
   * @returns {Array}
   */
  function getAll() {
    return _readAll().sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  /**
   * Get a single item by ID
   * @param {string} id
   * @returns {Object|null}
   */
  function getById(id) {
    const items = _readAll();
    return items.find(item => item.id === id) || null;
  }

  /**
   * Create a new furniture item
   * @param {Object} data - { name, room, image?, notes? }
   * @returns {Object} The created item (with id and timestamps)
   */
  function create(data) {
    const items = _readAll();
    const now = new Date().toISOString();

    const newItem = {
      id: generateId(),
      name: (data.name || '').trim(),
      room: (data.room || '').trim(),
      image: data.image || null,
      notes: (data.notes || '').trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    items.push(newItem);
    _writeAll(items);

    console.log('[Storage] Created item:', newItem.id);
    return newItem;
  }

  /**
   * Update an existing item by ID
   * @param {string} id
   * @param {Object} data - Partial fields to update
   * @returns {Object|null} The updated item, or null if not found
   */
  function update(id, data) {
    const items = _readAll();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      console.warn('[Storage] Item not found for update:', id);
      return null;
    }

    const updated = {
      ...items[index],
      ...data,
      id: items[index].id,             // prevent id overwrite
      createdAt: items[index].createdAt, // prevent createdAt overwrite
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    _writeAll(items);

    console.log('[Storage] Updated item:', id);
    return updated;
  }

  /**
   * Delete an item by ID
   * @param {string} id
   * @returns {boolean} true if deleted, false if not found
   */
  function remove(id) {
    const items = _readAll();
    const filtered = items.filter(item => item.id !== id);

    if (filtered.length === items.length) {
      console.warn('[Storage] Item not found for delete:', id);
      return false;
    }

    _writeAll(filtered);
    console.log('[Storage] Deleted item:', id);
    return true;
  }

  /**
   * Get total item count
   * @returns {number}
   */
  function count() {
    return _readAll().length;
  }

  /**
   * Clear all items (dev/debug utility)
   */
  function clear() {
    _writeAll([]);
    console.log('[Storage] All items cleared');
  }

  /**
   * Check if storage is available
   * @returns {boolean}
   */
  function isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, '1');
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    count,
    clear,
    isAvailable,
  };
})();
