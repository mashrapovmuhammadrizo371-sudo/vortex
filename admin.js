/* =====================================================================
   VORTEX ADMIN — login, tabs va CRUD (APK / PROMO / KUPON / SETTINGS)
   ===================================================================== */

const API_BASE = '/api';
const TOKEN_KEY = 'vortex_admin_token';

/* ---------------------------------------------------------------------
   Auth helpers
   --------------------------------------------------------------------- */

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    clearToken();
    showScreen('admin-login');
    throw new Error('Sessiya tugadi, qaytadan kiring.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'So‘rovda xatolik yuz berdi.');
  }

  if (res.status === 204) return null;
  return res.json();
}

function showScreen(id) {
  document.querySelectorAll('.admin-screen').forEach((el) => {
    el.classList.toggle('admin-screen--active', el.id === id);
  });
}

function toast(message) {
  const el = document.getElementById('admin-toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------------------
   Login
   --------------------------------------------------------------------- */

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.hidden = true;

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Kirishda xatolik.');

    setToken(body.token);
    showScreen('admin-dashboard');
    initDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  showScreen('admin-login');
});

/* ---------------------------------------------------------------------
   Tabs
   --------------------------------------------------------------------- */

document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('admin-tab--active'));
    document.querySelectorAll('.admin-panel').forEach((p) => p.classList.remove('admin-panel--active'));
    tab.classList.add('admin-tab--active');
    document.getElementById(tab.dataset.tab).classList.add('admin-panel--active');
  });
});

/* ---------------------------------------------------------------------
   Generic CRUD wiring factory
   Har bir bo'lim (apk / promo / kupon) bir xil naqshga ega:
   ro'yxat + forma orqali qo'shish / tahrirlash / o'chirish.
   --------------------------------------------------------------------- */

function setupResource({ key, endpoint, fields, renderItem, formTitleNew, formTitleEdit }) {
  const listEl = document.getElementById(`${key}-admin-list`);
  const form = document.getElementById(`${key}-form`);
  const idInput = document.getElementById(`${key}-id`);
  const cancelBtn = document.getElementById(`${key}-cancel`);
  const titleEl = document.getElementById(`${key}-form-title`);

  function resetForm() {
    form.reset();
    idInput.value = '';
    titleEl.textContent = formTitleNew;
    cancelBtn.hidden = true;
  }

  async function load() {
    const items = await apiFetch(`${API_BASE}/${endpoint}`);

    if (!items.length) {
      listEl.innerHTML = '<p class="admin-empty">Hozircha ma\'lumot yo‘q.</p>';
      return;
    }

    listEl.innerHTML = items.map((item) => renderItem(item)).join('');

    listEl.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = items.find((i) => i._id === btn.dataset.edit);
        fields.forEach((f) => {
          document.getElementById(`${key}-${f}`).value = item[f] ?? '';
        });
        idInput.value = item._id;
        titleEl.textContent = formTitleEdit;
        cancelBtn.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    listEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Rostdan ham o‘chirilsinmi?')) return;
        await apiFetch(`${API_BASE}/${endpoint}/${btn.dataset.delete}`, { method: 'DELETE' });
        toast('O‘chirildi.');
        load();
      });
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {};
    fields.forEach((f) => {
      const el = document.getElementById(`${key}-${f}`);
      payload[f] = f === 'order' ? Number(el.value || 0) : el.value.trim();
    });

    const id = idInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}/${endpoint}/${id}` : `${API_BASE}/${endpoint}`;

    await apiFetch(url, { method, body: JSON.stringify(payload) });
    toast('Saqlandi.');
    resetForm();
    load();
  });

  cancelBtn.addEventListener('click', resetForm);

  return { load };
}

const apkResource = setupResource({
  key: 'apk',
  endpoint: 'apk',
  fields: ['name', 'description', 'downloadUrl', 'order'],
  formTitleNew: 'Yangi APK qo‘shish',
  formTitleEdit: 'APK-ni tahrirlash',
  renderItem: (item) => `
    <div class="admin-item">
      <div class="admin-item__info">
        <span class="admin-item__title">📱 ${escapeHtml(item.name)}</span>
        <span class="admin-item__meta">${escapeHtml(item.downloadUrl)}</span>
      </div>
      <div class="admin-item__actions">
        <button class="btn-edit" data-edit="${item._id}" type="button">Tahrirlash</button>
        <button class="btn-danger" data-delete="${item._id}" type="button">O‘chirish</button>
      </div>
    </div>`
});

const promoResource = setupResource({
  key: 'promo',
  endpoint: 'promo',
  fields: ['apkName', 'promoCode', 'order'],
  formTitleNew: 'Yangi PROMO qo‘shish',
  formTitleEdit: 'PROMO-ni tahrirlash',
  renderItem: (item) => `
    <div class="admin-item">
      <div class="admin-item__info">
        <span class="admin-item__title">🎁 ${escapeHtml(item.apkName)}</span>
        <span class="admin-item__meta">${escapeHtml(item.promoCode)}</span>
      </div>
      <div class="admin-item__actions">
        <button class="btn-edit" data-edit="${item._id}" type="button">Tahrirlash</button>
        <button class="btn-danger" data-delete="${item._id}" type="button">O‘chirish</button>
      </div>
    </div>`
});

const kuponResource = setupResource({
  key: 'kupon',
  endpoint: 'kupon',
  fields: ['name', 'code', 'startTime', 'order'],
  formTitleNew: 'Yangi KUPON qo‘shish',
  formTitleEdit: 'KUPON-ni tahrirlash',
  renderItem: (item) => `
    <div class="admin-item">
      <div class="admin-item__info">
        <span class="admin-item__title">🎟️ ${escapeHtml(item.name)}</span>
        <span class="admin-item__meta">${escapeHtml(item.code)} · START ${escapeHtml(item.startTime)}</span>
      </div>
      <div class="admin-item__actions">
        <button class="btn-edit" data-edit="${item._id}" type="button">Tahrirlash</button>
        <button class="btn-danger" data-delete="${item._id}" type="button">O‘chirish</button>
      </div>
    </div>`
});

/* ---------------------------------------------------------------------
   TARMOQLAR + SUPPORT (Settings singleton)
   --------------------------------------------------------------------- */

async function loadSettingsIntoForms() {
  const settings = await apiFetch(`${API_BASE}/settings`);
  document.getElementById('settings-telegram').value = settings.telegram || '';
  document.getElementById('settings-instagram').value = settings.instagram || '';
  document.getElementById('settings-youtube').value = settings.youtube || '';
  document.getElementById('settings-support').value = settings.support || '';
}

document.getElementById('tarmoqlar-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const current = await apiFetch(`${API_BASE}/settings`);
  await apiFetch(`${API_BASE}/settings`, {
    method: 'PUT',
    body: JSON.stringify({
      ...current,
      telegram: document.getElementById('settings-telegram').value.trim(),
      instagram: document.getElementById('settings-instagram').value.trim(),
      youtube: document.getElementById('settings-youtube').value.trim()
    })
  });
  toast('Tarmoqlar saqlandi.');
});

document.getElementById('support-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const current = await apiFetch(`${API_BASE}/settings`);
  await apiFetch(`${API_BASE}/settings`, {
    method: 'PUT',
    body: JSON.stringify({
      ...current,
      support: document.getElementById('settings-support').value.trim()
    })
  });
  toast('Support havolasi saqlandi.');
});

/* ---------------------------------------------------------------------
   Dashboard init
   --------------------------------------------------------------------- */

function initDashboard() {
  apkResource.load();
  promoResource.load();
  kuponResource.load();
  loadSettingsIntoForms();
}

/* ---------------------------------------------------------------------
   Boot — token mavjud bo'lsa to'g'ridan-to'g'ri dashboard'ga o'tamiz
   --------------------------------------------------------------------- */

if (getToken()) {
  showScreen('admin-dashboard');
  initDashboard();
} else {
  showScreen('admin-login');
                                                }
