/**
 * Add Item View
 * Form to add furniture with image upload
 */
const AddItemView = (() => {

  const CATEGORY_OPTIONS = [
    '家具类',
    '家电类',
    '衣帽鞋袜类',
    '数码电子',
    '厨房用品',
    '其他',
  ];

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

  let selectedImageBase64 = null;

  /**
   * Render the Add Item form
   * @param {HTMLElement} container
   */
  function render(container) {
    selectedImageBase64 = null;
    
    container.innerHTML = `
      <div class="page-title">添加家具</div>
      
      <div class="image-upload" id="image-upload-area">
        <input type="file" id="image-input" accept="image/*" style="display: none;">
        <div class="image-upload__placeholder" id="upload-placeholder">
          <div class="image-upload__icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <button type="button" class="image-upload__button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>上传照片</span>
          </button>
          <span class="image-upload__hint">AI 将识别家具信息</span>
        </div>
        <div class="image-upload__preview" id="image-preview" style="display: none;">
          <img id="preview-image" alt="Preview">
          <button type="button" class="image-upload__remove" id="remove-image" aria-label="Remove image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <form class="form" id="add-item-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="item-name">名称 *</label>
          <input class="form-input" type="text" id="item-name"
                 placeholder="例如：宜家书架" required maxlength="100" autocomplete="off">
        </div>

        <div class="form-group">
          <label class="form-label" for="item-category">分类 *</label>
          <select class="form-select" id="item-category" required>
            <option value="" disabled selected>选择分类</option>
            ${CATEGORY_OPTIONS.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="item-room">房间</label>
          <select class="form-select" id="item-room">
            <option value="" selected>选择房间（可选）</option>
            ${ROOM_OPTIONS.map(room => `<option value="${room}">${room}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="item-notes">备注</label>
          <textarea class="form-textarea" id="item-notes"
                    placeholder="颜色、尺寸、购买信息..."
                    rows="3" maxlength="500"></textarea>
          <span class="form-hint">可选 — 添加任何你想记录的信息</span>
        </div>

        <button type="submit" class="btn btn--primary btn--full" id="add-item-submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          保存家具
        </button>
      </form>
    `;

    injectStyles();
    bindEvents(container);
  }

  /**
   * Inject required styles for image upload
   */
  function injectStyles() {
    if (document.getElementById('add-item-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'add-item-styles';
    style.textContent = `
      .image-upload {
        width: 100%;
        height: 280px;
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 24px;
        position: relative;
      }

      .image-upload__placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(122, 157, 126, 0.05) 0%, rgba(153, 181, 157, 0.08) 100%);
        border: 2px dashed var(--color-border);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 32px;
      }

      .image-upload__icon {
        opacity: 0.3;
        margin-bottom: 8px;
      }

      .image-upload__icon svg {
        color: var(--color-primary);
      }

      .image-upload__button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 28px;
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        background: var(--color-primary);
        color: white;
        border: none;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(122, 157, 126, 0.26);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .image-upload__button:active {
        transform: scale(0.96);
        box-shadow: 0 2px 6px rgba(122, 157, 126, 0.20);
      }

      .image-upload__hint {
        font-size: 13px;
        color: var(--color-text-tertiary);
        font-weight: 500;
      }

      .image-upload__preview {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .image-upload__preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-upload__remove {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: background 0.2s;
      }

      .image-upload__remove:active {
        background: rgba(0, 0, 0, 0.8);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Bind events
   * @param {HTMLElement} container
   */
  function bindEvents(container) {
    const form = container.querySelector('#add-item-form');
    const imageInput = container.querySelector('#image-input');
    const uploadArea = container.querySelector('#image-upload-area');
    const placeholder = container.querySelector('#upload-placeholder');
    const preview = container.querySelector('#image-preview');
    const previewImage = container.querySelector('#preview-image');
    const removeBtn = container.querySelector('#remove-image');

    // Upload area click
    uploadArea.addEventListener('click', (e) => {
      if (e.target.closest('#remove-image')) return;
      imageInput.click();
    });

    // Image selection
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        convertToBase64(file, previewImage, placeholder, preview);
      }
    });

    // Remove image
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(imageInput, placeholder, preview, previewImage);
      });
    }

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(container);
    });
  }

  /**
   * Convert image file to base64
   * @param {File} file
   * @param {HTMLElement} previewImg
   * @param {HTMLElement} placeholder
   * @param {HTMLElement} preview
   */
  function convertToBase64(file, previewImg, placeholder, preview) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      selectedImageBase64 = e.target.result;
      previewImg.src = selectedImageBase64;
      placeholder.style.display = 'none';
      preview.style.display = 'block';
    };
    
    reader.onerror = () => {
      showToast('Failed to read image', 'error');
    };
    
    reader.readAsDataURL(file);
  }

  /**
   * Remove selected image
   * @param {HTMLElement} input
   * @param {HTMLElement} placeholder
   * @param {HTMLElement} preview
   * @param {HTMLElement} previewImg
   */
  function removeImage(input, placeholder, preview, previewImg) {
    selectedImageBase64 = null;
    input.value = '';
    previewImg.src = '';
    placeholder.style.display = 'flex';
    preview.style.display = 'none';
  }

  /**
   * Handle form submission
   * @param {HTMLElement} container
   */
  async function handleSubmit(container) {
    const name = container.querySelector('#item-name').value.trim();
    const category = container.querySelector('#item-category').value;
    const room = container.querySelector('#item-room').value;
    const notes = container.querySelector('#item-notes').value.trim();
    const submitBtn = container.querySelector('#add-item-submit');

    // Validate required fields
    if (!name) {
      shakeField(container.querySelector('#item-name'));
      showToast('Name is required', 'error');
      return;
    }
    if (!category) {
      shakeField(container.querySelector('#item-category'));
      showToast('Category is required', 'error');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      // Create item
      const newItem = await Storage.addItem({
        name,
        category,
        room,
        notes,
        image: selectedImageBase64 || ''
      });

      if (newItem) {
        showToast(`"${newItem.name}" added!`, 'success');
        setTimeout(() => {
          Router.navigate('/items');
        }, 600);
      } else {
        showToast('Failed to add item', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '保存家具';
      }
    } catch (error) {
      showToast('Failed to add item', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = '保存家具';
    }
  }

  /**
   * Shake field animation
   * @param {HTMLElement} el
   */
  function shakeField(el) {
    el.style.borderColor = 'var(--color-error)';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'shake 0.4s ease';
    el.focus();

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

    setTimeout(() => {
      el.style.borderColor = '';
      el.style.animation = '';
    }, 1000);
  }

  /**
   * Show toast notification
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
