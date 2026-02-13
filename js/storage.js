/**
 * Storage - API-based CRUD layer for furniture items
 * Uses backend API with user authentication
 */
const Storage = (() => {
  
  /**
   * Get all items from API
   * @returns {Promise<Array>}
   */
  async function getAll() {
    try {
      const token = Auth.getToken();
      if (!token) return [];

      const response = await fetch('http://localhost:3000/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('[Storage] Failed to fetch items');
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('[Storage] Get items error:', error);
      return [];
    }
  }

  /**
   * Add a new item
   * @param {Object} item
   * @returns {Promise<Object|null>} The created item
   */
  async function addItem(item) {
    try {
      const token = Auth.getToken();
      if (!token) {
        console.error('[Storage] No auth token');
        return null;
      }

      const response = await fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: item.name,
          room: item.room,
          notes: item.notes || '',
          image: item.image || '',
        }),
      });

      if (!response.ok) {
        console.error('[Storage] Failed to create item');
        return null;
      }

      const data = await response.json();
      return data.item;
    } catch (error) {
      console.error('[Storage] Add item error:', error);
      return null;
    }
  }

  /**
   * Delete an item
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async function deleteItem(id) {
    try {
      const token = Auth.getToken();
      if (!token) {
        console.error('[Storage] No auth token');
        return false;
      }

      const response = await fetch(`http://localhost:3000/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[Storage] Delete item error:', error);
      return false;
    }
  }

  return {
    getAll,
    addItem,
    deleteItem,
  };
})();
