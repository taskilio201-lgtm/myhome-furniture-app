/**
 * Auth - Frontend-only mock authentication system
 * 
 * This is a simple auth layer that stores user data in localStorage.
 * Will be replaced by real backend authentication in the future.
 * 
 * User model:
 * {
 *   id: string,
 *   email: string,
 *   createdAt: string
 * }
 */
const Auth = (() => {
  const STORAGE_KEY = 'myhome_user';
  const SESSION_KEY = 'myhome_session';

  // ─── Helpers ────────────────────────────────────────────

  /**
   * Generate a short unique ID
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  }

  /**
   * Simple email validation
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Get stored users from localStorage
   * @returns {Array}
   */
  function _getUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('[Auth] Failed to read users:', e);
      return [];
    }
  }

  /**
   * Save users to localStorage
   * @param {Array} users
   */
  function _saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('[Auth] Failed to save users:', e);
    }
  }

  /**
   * Get current session
   * @returns {Object|null}
   */
  function _getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[Auth] Failed to read session:', e);
      return null;
    }
  }

  /**
   * Save session
   * @param {Object} user
   */
  function _saveSession(user) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('[Auth] Failed to save session:', e);
    }
  }

  /**
   * Clear session
   */
  function _clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('[Auth] Failed to clear session:', e);
    }
  }

  // ─── Public API ─────────────────────────────────────────

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @param {string} [name] - Optional name (defaults to email)
   * @returns {Promise<Object>} { success: boolean, user?: Object, error?: string }
   */
  async function register(email, password, name = null) {
    try {
      const data = await API.apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name: name || email.split('@')[0], 
          email, 
          password 
        }),
      });

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Save user to session
      if (data.user) {
        _saveSession(data.user);
      }

      console.log('[Auth] User registered:', email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} { success: boolean, user?: Object, error?: string }
   */
  async function login(email, password) {
    try {
      const data = await API.apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Save token to localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      // Save user to session
      if (data.user) {
        _saveSession(data.user);
      }

      console.log('[Auth] User logged in:', email);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout current user
   */
  function logout() {
    const user = _getSession();
    _clearSession();
    console.log('[Auth] User logged out:', user?.email || 'unknown');
  }

  /**
   * Get current logged-in user
   * @returns {Object|null}
   */
  function getUser() {
    return _getSession();
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  function isLoggedIn() {
    return _getSession() !== null;
  }

  /**
   * Require authentication - redirect if not logged in
   * @param {string} redirectRoute - Route to redirect to if not authenticated
   * @returns {boolean} true if authenticated, false if redirected
   */
  function requireAuth(redirectRoute = '/login') {
    if (!isLoggedIn()) {
      console.log('[Auth] Authentication required, redirecting to', redirectRoute);
      if (typeof Router !== 'undefined') {
        Router.navigate(redirectRoute);
      } else {
        window.location.hash = '#' + redirectRoute;
      }
      return false;
    }
    return true;
  }

  /**
   * Clear all auth data (dev/debug utility)
   */
  function clearAll() {
    _clearSession();
    _saveUsers([]);
    console.log('[Auth] All auth data cleared');
  }

  return {
    register,
    login,
    logout,
    getUser,
    isLoggedIn,
    requireAuth,
    clearAll,
  };
})();
