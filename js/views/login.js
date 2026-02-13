/**
 * Login View
 * User authentication screen
 */
const LoginView = (() => {

  /**
   * Render the login screen
   * @param {HTMLElement} container
   */
  function render(container) {
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-screen__header">
          <div class="auth-logo">
            <div class="auth-logo__icon">MH</div>
            <h1 class="auth-logo__title">MyHome</h1>
          </div>
          <p class="auth-screen__subtitle">Manage your furniture inventory</p>
        </div>

        <form class="auth-form" id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <input class="form-input" type="email" id="login-email"
                   placeholder="your@email.com" required autocomplete="email">
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-input" type="password" id="login-password"
                   placeholder="••••••••" required autocomplete="current-password">
          </div>

          <button type="submit" class="btn btn--primary btn--full" id="login-submit">
            Login
          </button>

          <div class="auth-form__footer">
            <span class="auth-form__footer-text">Don't have an account?</span>
            <a href="#/register" class="auth-form__link">Create account</a>
          </div>
        </form>
      </div>
    `;

    bindEvents(container);
  }

  /**
   * Bind form events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const form = container.querySelector('#login-form');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(container);
    });
  }

  /**
   * Handle form submission
   * @param {HTMLElement} container
   */
  async function handleSubmit(container) {
    const email = container.querySelector('#login-email').value.trim();
    const password = container.querySelector('#login-password').value;
    const submitBtn = container.querySelector('#login-submit');

    // Basic validation
    if (!email) {
      shakeField(container.querySelector('#login-email'));
      showToast('Email is required', 'error');
      return;
    }
    if (!password) {
      shakeField(container.querySelector('#login-password'));
      showToast('Password is required', 'error');
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContentss = 'Logging in...';

    try {
      // Attempt login (now async)
      const result = await Auth.login(email, password);

      if (result.success) {
        showToast(`Welcome back, ${result.user.email}!`, 'success');
        setTimeout(() => {
          Router.navigate('/home');
        }, 500);
      } else {
        showToast(result.error || 'Login failed', 'error');
        shakeField(container.querySelector('#login-email'));
        shakeField(container.querySelector('#login-password'));
      }
    } catch (error) {
      showToast(error.message || 'Login failed', 'error');
      shakeField(container.querySelector('#login-email'));
      shakeField(container.querySelector('#login-password'));
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
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
