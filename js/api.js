/**
 * API Helper
 * Centralized fetch wrapper for all backend API calls
 * 
 * Base URL: http://localhost:3000/api
 * Automatically handles:
 * - Auth token injection
 * - JSON content-type headers
 * - Response parsing
 * - Error handling
 */
const API = (() => {
  const BASE_URL = 'http://localhost:3000/api';

  /**
   * Make an API request with automatic token injection and error handling
   * @param {string} endpoint - API endpoint (e.g. '/register', '/items')
   * @param {Object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<any>} Parsed JSON response
   * @throws {Error} If request fails
   */
  async function apiFetch(endpoint, options = {}) {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if it exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Build full URL
    const url = `${BASE_URL}${endpoint}`;

    // Make the request
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-OK responses
      if (!response.ok) {
        // Try to extract error message from response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Parse and return JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw with more context if it's a network error
      if (error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to reach the server');
      }
      throw error;
    }
  }

  return {
    apiFetch,
  };
})();
