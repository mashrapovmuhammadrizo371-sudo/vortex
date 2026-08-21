/* =====================================================================
   VORTEX — frontend logic
   Barcha ma'lumotlar backend API'dan olinadi (hardcode qilinmagan).
   ===================================================================== */

const API_BASE = '/api';

/* ---------------------------------------------------------------------
   Screen navigation
   --------------------------------------------------------------------- */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.toggle('screen--active', el.id === id);
  });
}

document.getElementById('btn-kirish').addEventListener('click', () => {
  showScreen('screen-main');
});

document.querySelectorAll('[data-target]').forEach((tile) => {
  tile.addEventListener('click', () => showScreen(tile.dataset.target));
});

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showScreen('screen-main'));
});

/* ---------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------- */

function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`So‘rov xato: ${url}`);
  return res.json();
}

/* ---------------------------------------------------------------------
   APK
   --------------------------------------------------------------------- */

async function loadApks() {
  const list = document.getElementById('apk-list');
  const empty = document.getElementById('apk-empty');

  try {
    const apks = await fetchJson(`${API_BASE}/apk`);

    if (!apks.length) {
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    list.innerHTML = apks
      .map(
        (apk) => `
      <article class="card">
        <span class="card__eyebrow">📱 APK</span>
        <h3 class="card__title">${escapeHtml(apk.name)}</h3>
        ${apk.description ? `<p class="card__desc">${escapeHtml(apk.description)}</p>` : ''}
        <a class="card__cta" href="${escapeHtml(apk.downloadUrl)}" target="_blank" rel="noopener">
          ⬇️ YUKLAB OLISH
        </a>
      </article>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = 'Ma\'lumotni yuklab bo\'lmadi. Birozdan so‘ng qayta urinib ko‘ring.';
  }
}

/* ---------------------------------------------------------------------
   TARMOQLAR + SUPPORT (settings)
   --------------------------------------------------------------------- */

async function loadSettings() {
  try {
    const settings = await fetchJson(`${API_BASE}/settings`);

    document.getElementById('link-telegram').href = settings.telegram || '#';
    document.getElementById('link-instagram').href = settings.instagram || '#';
    document.getElementById('link-youtube').href = settings.youtube || '#';

    document.getElementById('btn-support').onclick = () => {
      if (settings.support) window.open(settings.support, '_blank', 'noopener');
    };
  } catch (err) {
    /* Sozlamalarni yuklab bo'lmadi — havolalar "#" bo'lib qoladi. */
  }
}

/* ---------------------------------------------------------------------
   PROMO
   --------------------------------------------------------------------- */

async function loadPromos() {
  const list = document.getElementById('promo-list');
  const empty = document.getElementById('promo-empty');

  try {
    const promos = await fetchJson(`${API_BASE}/promo`);

    if (!promos.length) {
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    list.innerHTML = promos
      .map(
        (promo) => `
      <article class="card">
        <span class="card__eyebrow">🎁 PROMO</span>
        <div class="card__row"><span>APK NOMI</span><strong>${escapeHtml(promo.apkName)}</strong></div>
        <div class="card__row"><span>PROMOKOD</span><strong class="card__code">${escapeHtml(promo.promoCode)}</strong></div>
      </article>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = 'Ma\'lumotni yuklab bo\'lmadi. Birozdan so‘ng qayta urinib ko‘ring.';
  }
}

/* ---------------------------------------------------------------------
   KUPON
   --------------------------------------------------------------------- */

async function loadKuponlar() {
  const list = document.getElementById('kupon-list');
  const empty = document.getElementById('kupon-empty');

  try {
    const kuponlar = await fetchJson(`${API_BASE}/kupon`);

    if (!kuponlar.length) {
      list.innerHTML = '';
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    list.innerHTML = kuponlar
      .map(
        (k) => `
      <article class="card">
        <span class="card__eyebrow">🎟️ ${escapeHtml(k.name)}</span>
        <div class="card__row"><span>KOD</span><strong class="card__code">${escapeHtml(k.code)}</strong></div>
        <div class="card__row"><span>START</span><strong>${escapeHtml(k.startTime)}</strong></div>
      </article>`
      )
      .join('');
  } catch (err) {
    list.innerHTML = '';
    empty.hidden = false;
    empty.textContent = 'Ma\'lumotni yuklab bo\'lmadi. Birozdan so‘ng qayta urinib ko‘ring.';
  }
}

/* ---------------------------------------------------------------------
   Init — sahifa ochilganda barcha ma'lumotlarni oldindan yuklab qo'yamiz
   --------------------------------------------------------------------- */

loadApks();
loadSettings();
loadPromos();
loadKuponlar();
  
