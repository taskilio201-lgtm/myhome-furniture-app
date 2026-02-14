/**
 * Family View
 * Manage family members, invite codes, and join flows
 */
const FamilyView = (() => {

  /** Cached state for the current render */
  let _state = {
    home: null,
    members: [],
    isOwner: false,
    inviteCode: null,
    loading: true,
  };

  // ─── Render ──────────────────────────────────────────────────

  /**
   * Main render entry
   * @param {HTMLElement} container
   */
  async function render(container) {
    _state.loading = true;
    container.innerHTML = renderLoading();

    try {
      const data = await API.apiFetch('/family/home');
      _state.home = data.home;
      _state.members = data.members || [];
      _state.isOwner = data.isOwner;
      _state.inviteCode = data.home.invite_code || null;
      _state.loading = false;
    } catch (err) {
      console.error('[Family] Load error:', err);
      _state.loading = false;
      container.innerHTML = renderError(err.message);
      return;
    }

    container.innerHTML = renderPage();
    bindEvents(container);
  }

  function renderLoading() {
    return `
      <div class="family" style="display:flex;align-items:center;justify-content:center;min-height:300px;">
        <span style="color:var(--color-text-secondary);font-size:15px;">加载中...</span>
      </div>
    `;
  }

  function renderError(message) {
    return `
      <div class="family">
        <div class="family__section family__section--info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style="color:var(--color-error);">加载失败：${escapeHtml(message)}</span>
        </div>
      </div>
    `;
  }

  function renderPage() {
    return `
      <div class="family">
        <div class="family__header">
          <h2 class="family__title">${escapeHtml(_state.home?.name || '我的家庭')}</h2>
          <p class="family__subtitle">管理家庭成员，共享物品清单</p>
        </div>

        ${renderMembersSection()}
        ${renderInviteSection()}
        ${renderJoinSection()}
      </div>

      <!-- Join Modal (hidden) -->
      <div class="family-modal__overlay" id="join-modal" style="display:none;">
        <div class="family-modal">
          <div class="family-modal__header">
            <h3 class="family-modal__title">加入家庭</h3>
            <button class="family-modal__close" id="join-modal-close">&times;</button>
          </div>
          <p class="family-modal__desc">输入邀请码加入其他家庭</p>
          <input
            type="text"
            class="family-modal__input"
            id="join-code-input"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            maxlength="19"
            autocomplete="off"
            spellcheck="false"
          />
          <div class="family-modal__verify" id="join-verify-result" style="display:none;"></div>
          <button class="family__invite-btn" id="join-confirm-btn" disabled>
            <span>加入家庭</span>
          </button>
        </div>
      </div>
    `;
  }

  // ─── Sections ────────────────────────────────────────────────

  function renderMembersSection() {
    const membersHTML = _state.members.map(m => {
      const initial = (m.email || '?').charAt(0).toUpperCase();
      const name = m.email || '未知';
      const isOwner = m.role === 'owner';
      return `
        <div class="family__member">
          <div class="family__member-avatar${isOwner ? '' : ' family__member-avatar--member'}">${initial}</div>
          <div class="family__member-info">
            <span class="family__member-name">${escapeHtml(name)}</span>
            ${isOwner
              ? '<span class="family__member-badge family__member-badge--owner">创建者</span>'
              : '<span class="family__member-badge family__member-badge--member">成员</span>'}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="family__section">
        <h3 class="family__section-title">成员列表 <span style="opacity:0.5;">(${_state.members.length})</span></h3>
        <div class="family__members">
          ${membersHTML || '<p style="color:var(--color-text-secondary);font-size:14px;">暂无成员</p>'}
        </div>
      </div>
    `;
  }

  function renderInviteSection() {
    return `
      <div class="family__section">
        <h3 class="family__section-title">邀请码</h3>
        <p class="family__description">将邀请码分享给家人，他们可以直接加入你的家庭。</p>
        <div class="family__code-box" id="invite-code-box">
          ${_state.inviteCode
            ? renderCodeDisplay(_state.inviteCode)
            : `<button class="family__invite-btn" id="generate-code-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <span>生成邀请码</span>
              </button>`
          }
        </div>
      </div>
    `;
  }

  function renderCodeDisplay(code) {
    return `
      <div class="family__code-display">
        <span class="family__code-text">${code}</span>
        <button class="family__code-copy" id="copy-code-btn" data-code="${code}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>复制</span>
        </button>
      </div>
    `;
  }

  function renderJoinSection() {
    return `
      <div class="family__section">
        <h3 class="family__section-title">加入其他家庭</h3>
        <p class="family__description">如果你收到了邀请码，可以加入另一个家庭。</p>
        <button class="family__join-btn" id="open-join-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span>输入邀请码</span>
        </button>
      </div>
    `;
  }

  // ─── Events ──────────────────────────────────────────────────

  function bindEvents(container) {
    // Generate invite code
    const genBtn = container.querySelector('#generate-code-btn');
    if (genBtn) {
      genBtn.addEventListener('click', handleGenerateCode);
    }

    // Copy code
    const copyBtn = container.querySelector('#copy-code-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopyCode);
    }

    // Open join modal
    const openJoinBtn = container.querySelector('#open-join-btn');
    if (openJoinBtn) {
      openJoinBtn.addEventListener('click', () => toggleModal(true));
    }

    // Close join modal
    const closeBtn = document.querySelector('#join-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => toggleModal(false));
    }

    // Modal overlay click to close
    const overlay = document.querySelector('#join-modal');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) toggleModal(false);
      });
    }

    // Join code input — auto-format and verify
    const codeInput = document.querySelector('#join-code-input');
    if (codeInput) {
      codeInput.addEventListener('input', handleCodeInput);
    }

    // Join confirm
    const confirmBtn = document.querySelector('#join-confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', handleJoinFamily);
    }
  }

  // ─── Handlers ────────────────────────────────────────────────

  async function handleGenerateCode() {
    const btn = document.querySelector('#generate-code-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>生成中...</span>';
    }

    try {
      const data = await API.apiFetch('/family/invite-code');
      _state.inviteCode = data.invite_code;

      const box = document.querySelector('#invite-code-box');
      if (box) {
        box.innerHTML = renderCodeDisplay(data.invite_code);
        // Rebind copy
        const copyBtn = box.querySelector('#copy-code-btn');
        if (copyBtn) {
          copyBtn.addEventListener('click', handleCopyCode);
        }
      }
      showToast('邀请码已生成');
    } catch (err) {
      showToast('生成失败：' + err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>生成邀请码</span>';
      }
    }
  }

  async function handleCopyCode(e) {
    const btn = e.currentTarget;
    const code = btn.dataset.code;

    try {
      await navigator.clipboard.writeText(code);
      const label = btn.querySelector('span');
      if (label) {
        label.textContent = '已复制!';
        setTimeout(() => { label.textContent = '复制'; }, 2000);
      }
      showToast('邀请码已复制到剪贴板');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('邀请码已复制到剪贴板');
    }
  }

  /** Auto-format invite code input: uppercase, add dashes */
  function handleCodeInput(e) {
    const input = e.target;
    let raw = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Insert dashes every 4 chars
    const parts = [];
    for (let i = 0; i < raw.length && i < 16; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    const formatted = parts.join('-');
    input.value = formatted;

    // Verify when full code entered
    const cleanCode = formatted.replace(/-/g, '');
    if (cleanCode.length === 16) {
      verifyCode(formatted);
    } else {
      const resultEl = document.querySelector('#join-verify-result');
      if (resultEl) resultEl.style.display = 'none';
      const confirmBtn = document.querySelector('#join-confirm-btn');
      if (confirmBtn) confirmBtn.disabled = true;
    }
  }

  let _verifyTimeout = null;
  async function verifyCode(code) {
    clearTimeout(_verifyTimeout);
    _verifyTimeout = setTimeout(async () => {
      const resultEl = document.querySelector('#join-verify-result');
      const confirmBtn = document.querySelector('#join-confirm-btn');

      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = '<span style="color:var(--color-text-secondary);">验证中...</span>';
      }

      try {
        const data = await API.apiFetch(`/family/verify-code/${encodeURIComponent(code)}`);
        if (data.valid) {
          resultEl.innerHTML = `<span style="color:var(--color-success);">✓ 找到家庭：${escapeHtml(data.home_name)}</span>`;
          if (confirmBtn) confirmBtn.disabled = false;
        } else {
          resultEl.innerHTML = '<span style="color:var(--color-error);">✗ 邀请码无效</span>';
          if (confirmBtn) confirmBtn.disabled = true;
        }
      } catch (err) {
        resultEl.innerHTML = `<span style="color:var(--color-error);">验证失败：${escapeHtml(err.message)}</span>`;
        if (confirmBtn) confirmBtn.disabled = true;
      }
    }, 300);
  }

  async function handleJoinFamily() {
    const input = document.querySelector('#join-code-input');
    const btn = document.querySelector('#join-confirm-btn');
    const code = input?.value?.trim();
    if (!code || !btn) return;

    btn.disabled = true;
    btn.innerHTML = '<span>加入中...</span>';

    try {
      const data = await API.apiFetch('/family/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: code }),
      });

      showToast(data.message || '成功加入家庭');
      toggleModal(false);

      // Refresh the entire page view
      const container = document.getElementById('view');
      if (container) {
        await render(container);
      }
    } catch (err) {
      showToast(err.message || '加入失败', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>加入家庭</span>';
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────

  function toggleModal(show) {
    const modal = document.querySelector('#join-modal');
    if (modal) {
      modal.style.display = show ? 'flex' : 'none';
      if (show) {
        const input = modal.querySelector('#join-code-input');
        if (input) { input.value = ''; input.focus(); }
        const result = modal.querySelector('#join-verify-result');
        if (result) result.style.display = 'none';
        const btn = modal.querySelector('#join-confirm-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span>加入家庭</span>'; }
      }
    }
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, c => map[c]);
  }

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
