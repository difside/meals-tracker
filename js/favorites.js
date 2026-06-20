import { MEAL_TYPES } from './config.js';
import { store, save } from './store.js';
import { uid, esc, fmtDate, showToast } from './utils.js';
import { cloudSyncMeal, cloudSyncFavorite, cloudDeleteFavorite } from './db.js';
import { openOverlay, closeOverlay } from './ui.js';

export function renderFavorites() {
  const state = store.state;
  const c = document.getElementById('fav-list');
  if (!state.favorites.length) {
    c.innerHTML = `<div class="empty"><div class="empty-ic">⭐</div><div class="empty-tx">No favorites yet</div><div class="empty-sub">Tap the ★ on any meal to save it here</div></div>`;
    return;
  }
  c.innerHTML = state.favorites.map(f => {
    const pb = f.pinned ? `<div class="fav-badge">📌 Daily ${MEAL_TYPES.find(t => t.id === f.pinnedType)?.label || ''}</div>` : '';
    return `
    <div class="fav-card">
      <div class="fav-em" style="background:${f.pinned ? '#fef3c7' : 'var(--bg)'}">⭐</div>
      <div class="fav-info">
        <div class="fav-name">${esc(f.name)}</div>
        <div class="fav-mac">${f.calories} kcal · P${f.protein}g · C${f.carbs}g · F${f.fat}g</div>
        ${pb}
      </div>
      <div class="fav-acts">
        <button class="btn-qadd2" onclick="openFavDetail('${f.id}')">Manage</button>
        <button class="ibtn" onclick="addFavToCurrentDay('${f.id}')" title="Quick-add to today">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke-width:3;fill:none;stroke:currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button class="ibtn del" onclick="deleteFav('${f.id}')" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

export function addFavToCurrentDay(favId) {
  const state = store.state;
  const fav = state.favorites.find(f => f.id === favId);
  if (!fav) return;
  const t = fav.pinnedType || 'snack';
  if (!state.days[store.currentDate]) state.days[store.currentDate] = [];
  const entry = { id: uid(), name: fav.name, type: t, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat, favId: fav.id };
  state.days[store.currentDate].push(entry);
  save();
  cloudSyncMeal(entry, store.currentDate);
  showToast('Added to ' + fmtDate(store.currentDate));
}

export function deleteFav(id) {
  store.state.favorites = store.state.favorites.filter(f => f.id !== id);
  save();
  cloudDeleteFavorite(id);
  renderFavorites();
  showToast('Removed from favorites');
}

// ---- Favorite detail modal ----

export function openFavDetail(favId) {
  store.activeFavId = favId;
  const fav = store.state.favorites.find(f => f.id === favId);
  if (!fav) return;
  store.selectedPinType = fav.pinnedType;
  document.getElementById('fav-det-hdr').innerHTML = `
    <div class="fav-det-em">⭐</div>
    <div>
      <div class="fav-det-name">${esc(fav.name)}</div>
      <div class="fav-det-mac">${fav.calories} kcal</div>
      <div class="mchips"><span class="mchip p">P ${fav.protein}g</span><span class="mchip c">C ${fav.carbs}g</span><span class="mchip f">F ${fav.fat}g</span></div>
    </div>`;
  renderFavDetBody(fav);
  openOverlay('ov-fav-det');
}

function renderFavDetBody(fav) {
  const pg = MEAL_TYPES.map(t =>
    `<button class="pin-btn ${store.selectedPinType === t.id ? 'on' : ''}" onclick="selectPinType('${t.id}')"><span class="pin-em">${t.emoji}</span><div class="pin-lbl">${t.label}</div></button>`
  ).join('');
  document.getElementById('fav-det-body').innerHTML = `
    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:10px">Add to Today (${fmtDate(store.currentDate)})</div>
      <div class="type-pills" style="margin-bottom:10px">${MEAL_TYPES.map(t => `<button class="tpill ${(fav.pinnedType || 'breakfast') === t.id ? 'on' : ''}" onclick="selectAddType(this,'${t.id}')">${t.emoji} ${t.label}</button>`).join('')}</div>
      <button class="btn-p" onclick="addFavFromDetail()">+ Add to ${fmtDate(store.currentDate)}</button>
    </div>
    <div class="sep"></div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:10px">📌 Pin as Daily Meal</div>
    <div class="pin-grid">${pg}</div>
    ${fav.pinned
      ? `<button class="btn-d" onclick="unpinFav()">Unpin Daily Meal</button>`
      : `<button class="btn-p" onclick="pinFav()">Pin Selected Meal Type</button>`}
    <div class="sep"></div>
    <button class="btn-s" onclick="openFavEdit('${fav.id}')">✏️ Edit</button>
    <button class="btn-d" onclick="deleteFavFromDetail('${fav.id}')">🗑️ Delete</button>`;
}

export function selectAddType(btn, tid) {
  btn.closest('.type-pills').querySelectorAll('.tpill').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

export function selectPinType(tid) {
  store.selectedPinType = tid;
  const fav = store.state.favorites.find(f => f.id === store.activeFavId);
  if (fav) renderFavDetBody(fav);
}

export function addFavFromDetail() {
  const state = store.state;
  const fav = state.favorites.find(f => f.id === store.activeFavId);
  if (!fav) return;
  const ap = document.querySelector('#fav-det-body .type-pills .tpill.on');
  const type = ap ? MEAL_TYPES.find(t => ap.textContent.includes(t.label))?.id || 'snack' : 'snack';
  if (!state.days[store.currentDate]) state.days[store.currentDate] = [];
  const entry = { id: uid(), name: fav.name, type, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat, favId: fav.id };
  state.days[store.currentDate].push(entry);
  save();
  cloudSyncMeal(entry, store.currentDate);
  closeOverlay('ov-fav-det');
  showToast('Added to ' + fmtDate(store.currentDate) + ' ✓');
}

export function pinFav() {
  if (!store.selectedPinType) { showToast('Select a meal type to pin'); return; }
  const fav = store.state.favorites.find(f => f.id === store.activeFavId);
  if (!fav) return;
  fav.pinned = true; fav.pinnedType = store.selectedPinType;
  save();
  cloudSyncFavorite(fav);
  closeOverlay('ov-fav-det');
  renderFavorites();
  showToast('📌 Pinned as daily ' + MEAL_TYPES.find(t => t.id === store.selectedPinType)?.label);
}

export function unpinFav() {
  const fav = store.state.favorites.find(f => f.id === store.activeFavId);
  if (!fav) return;
  fav.pinned = false; fav.pinnedType = null;
  save();
  cloudSyncFavorite(fav);
  closeOverlay('ov-fav-det');
  renderFavorites();
  showToast('Unpinned');
}

export function deleteFavFromDetail(id) {
  store.state.favorites = store.state.favorites.filter(f => f.id !== id);
  save();
  cloudDeleteFavorite(id);
  closeOverlay('ov-fav-det');
  renderFavorites();
  showToast('Removed from favorites');
}

// ---- Favorite edit modal ----

export function openFavEdit(favId) {
  closeOverlay('ov-fav-det');
  document.getElementById('fav-edit-id').value = favId || '';
  if (favId) {
    const fav = store.state.favorites.find(f => f.id === favId);
    if (!fav) return;
    document.getElementById('fav-edit-title').textContent = 'Edit Favorite';
    document.getElementById('fe-name').value = fav.name;
    document.getElementById('fe-cal').value  = fav.calories;
    document.getElementById('fe-pro').value  = fav.protein;
    document.getElementById('fe-car').value  = fav.carbs;
    document.getElementById('fe-fat').value  = fav.fat;
  } else {
    document.getElementById('fav-edit-title').textContent = 'New Favorite';
    ['fe-name','fe-cal','fe-pro','fe-car','fe-fat'].forEach(id => document.getElementById(id).value = '');
  }
  openOverlay('ov-fav-edit');
  setTimeout(() => document.getElementById('fe-name').focus(), 350);
}

export function submitFavEdit() {
  const name = document.getElementById('fe-name').value.trim();
  if (!name) { showToast('Please enter a name'); return; }
  const cal = parseFloat(document.getElementById('fe-cal').value) || 0;
  const pro = parseFloat(document.getElementById('fe-pro').value) || 0;
  const car = parseFloat(document.getElementById('fe-car').value) || 0;
  const fat = parseFloat(document.getElementById('fe-fat').value) || 0;
  const eid = document.getElementById('fav-edit-id').value;
  const state = store.state;
  if (eid) {
    const fav = state.favorites.find(f => f.id === eid);
    if (fav) { Object.assign(fav, { name, calories: cal, protein: pro, carbs: car, fat }); cloudSyncFavorite(fav); }
  } else {
    const fav = { id: uid(), name, calories: cal, protein: pro, carbs: car, fat, pinned: false, pinnedType: null };
    state.favorites.push(fav);
    cloudSyncFavorite(fav);
  }
  save();
  closeOverlay('ov-fav-edit');
  renderFavorites();
  showToast(eid ? 'Favorite updated' : 'Favorite saved ⭐');
}
