/**
 * Authentication Module
 * Handles user authentication, token management, and session state
 */
const Auth = (() => {
  const TOKEN_KEY = 'auth_token';
  const USER_KEY = 'auth_user';

  /**
   * Register a new user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async function register(email, password) {
    console.log('[Auth.register] Called with:', { email, password: password ? '[PRESENT]' : '[MISSING]' });
    
    const payload = { email, password };
    console.log('[Auth.register] Payload:', JSON.stringify(payload));
    
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Auth.register] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Auth.register] Response data:', data);

      if (!response.ok) {
        console.error('[Auth.register] Registration failed:', data);
        return { success: false, error: data.message || 'Registration failed' };
      }

      // Store token and user
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      console.log('[Auth.register] Success! Token stored.');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Auth.register] Exception:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Login existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async function login(email, password) {
    console.log('[Auth.login] Called with:', { email, password: password ? '[PRESENT]' : '[MISSING]' });
    
    const payload = { email, password };
    console.log('[Auth.login] Payload:', JSON.stringify(payload));
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Auth.login] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Auth.login] Response data:', data);

      if (!response.ok) {
        console.error('[Auth.login] Login failed:', data);
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store token and user
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      console.log('[Auth.login] Success! Token stored.');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[Auth.login] Exception:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Logout current user
   */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Get current user from localStorage
   * @returns {object|null}
   */
  function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get auth token
   * @returns {string|null}
   */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  function isAuthenticated() {
    return !!getToken();
  }

  /**
   * Legacy alias for isAuthenticated
   * @returns {boolean}
   */
  function isLoggedIn() {
    return isAuthenticated();
  }

  /**
   * Get user object (legacy alias)
   * @returns {object|null}
   */
  function getUser() {
    return getCurrentUser();
  }

  /**
   * Verify authentication with backend
   * Calls /auth/me to check if token is still valid
   * @returns {Promise<{valid: boolean, user?: object}>}
   */
  async function verifyAuth() {
    const token = getToken();
    
    if (!token) {
      return { valid: false };
    }

    try {
      const response = await fetch('http://localhost:3000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Token is invalid, clear storage
        logout();
        return { valid: false };
      }

      const data = await response.json();
      
      // Update stored user info
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return { valid: true, user: data.user };
    } catch (error) {
      console.error('[Auth] Verification failed:', error);
      return { valid: false };
    }
  }

  /**
   * Require authentication - redirect to login if not authenticated
   * @returns {Promise<boolean>} true if authenticated, false otherwise
   */
  async function requireAuth() {
    const result = await verifyAuth();
    
    if (!result.valid) {
      window.location.hash = '#/login';
      return false;
    }
    
    return true;
  }

  return {
    register,
    login,
    logout,
    getCurrentUser,
    getToken,
    isAuthenticated,
    isLoggedIn,
    getUser,
    verifyAuth,
    requireAuth,
  };
})();
