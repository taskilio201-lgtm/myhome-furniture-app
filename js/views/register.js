/**
 * Register View
 * New user registration screen
 */
const RegisterView = (() => {

  /**
   * Render the register screen
   * @param {HTMLElement} container
   */
  function render(container) {
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-screen__header">
          <div class="auth-logo">
            <div class="auth-logo__icon">MH</div>
            <h1 class="auth-logo__title">Create Account</h1>
          </div>
          <p class="auth-screen__subtitle">Start organizing your furniture</p>
        </div>

        <form class="auth-form" id="register-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="register-email">Email</label>
            <input class="form-input" type="email" id="register-email"
                   placeholder="your@email.com" required autocomplete="email">
          </div>

          <div class="form-group">
            <label class="form-label" for="register-password">Password</label>
            <input class="form-input" type="password" id="register-password"
                   placeholder="At least 6 characters" required autocomplete="new-password">
            <span class="form-hint">Minimum 6 characters</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="register-password-confirm">Confirm Password</label>
            <input class="form-input" type="password" id="register-password-confirm"
                   placeholder="Re-enter password" required autocomplete="new-password">
          </div>

          <button type="submit" class="btn btn--primary btn--full" id="register-submit">
            Create Account
          </button>

          <div class="auth-form__footer">
            <span class="auth-form__footer-text">Already have an account?</span>
            <a href="#/login" class="auth-form__link">Login</a>
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
    const form = container.querySelector('#register-form');

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
    const email = container.querySelector('#register-email').value.trim();
    const password = container.querySelector('#register-password').value;
    const passwordConfirm = container.querySelector('#register-password-confirm').value;
    const submitBtn = container.querySelector('#register-submit');

    // Validate email
    if (!email) {
      shakeField(container.querySelector('#register-email'));
      showToast('Email is required', 'error');
      return;
    }

    // Validate password length
    if (!password || password.length < 6) {
      shakeField(container.querySelector('#register-password'));
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    // Validate password match
    if (password !== passwordConfirm) {
      shakeField(container.querySelector('#register-password-confirm'));
      showToast('Passwords do not match', 'error');
      return;
    }

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      // Attempt registration (now async)
      const result = await Auth.register(email, password);

      if (result.success) {
        showToast('Account created successfully!', 'success');
        setTimeout(() => {
          Router.navigate('/home');
        }, 500);
      } else {
        showToast(result.error || 'Registration failed', 'error');
        if (result.error && result.error.toLowerCase().includes('email')) {
          shakeField(container.querySelector('#register-email'));
        }
      }
    } catch (error) {
      showToast(error.message || 'Registration failed', 'error');
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
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
