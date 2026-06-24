import { store, save } from './store.js';
import { uid, parseNum, esc, showToast, getFoodEmoji } from './utils.js';
import { cloudSyncFood, cloudDeleteFood } from './db.js';
import { openOverlay, closeOverlay } from './ui.js';

export function renderFoods() {
  const state = store.state;
  const q = (document.getElementById('food-search-inp')?.value || '').toLowerCase();
  const filtered = q ? state.foods.filter(f => f.name.toLowerCase().includes(q)) : state.foods;
  const container = document.getElementById('food-list');

  if (!state.foods.length) {
    container.innerHTML = `<div class="empty"><div class="empty-ic">🥦</div><div class="empty-tx">No foods saved yet</div><div class="empty-sub">Add foods with their nutrition info to quickly log meals</div></div>`;
    return;
  }
  if (!filtered.length) {
    container.innerHTML = `<div class="empty"><div class="empty-ic">🔍</div><div class="empty-tx">No foods match "${esc(q)}"</div></div>`;
    return;
  }
  container.innerHTML = filtered.map(f => {
    const isOwner = !f.userId || f.userId === store.currentUserId;
    return `
    <div class="food-card">
      <div class="food-ic">${getFoodEmoji(f)}</div>
      <div class="food-info">
        <div class="food-name">${esc(f.name)}</div>
        <div class="food-srv">Per ${f.servingSize} ${f.servingUnit}</div>
        <div class="food-mac">${f.calories} kcal · P${f.protein}g · C${f.carbs}g · F${f.fat}g${f.saturatedFat ? ` · Sat ${f.saturatedFat}g` : ''}${f.transFat ? ` · Trans ${f.transFat}g` : ''}</div>
      </div>
      <div class="food-acts">
        <button class="btn-p" style="width:auto;padding:7px 12px;font-size:12px;margin-top:0;border-radius:10px" onclick="openAddMealWithFood('${f.id}')">
          + Add
        </button>
        ${isOwner ? `
        <button class="ibtn" onclick="openFoodEdit('${f.id}')" title="Edit">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="ibtn del" onclick="deleteFood('${f.id}')" title="Delete">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>` : ''}
      </div>
    </div>`;
  }).join('');
}

export function openFoodEdit(foodId) {
  const isNew = !foodId;
  document.getElementById('food-edit-title').textContent = isNew ? 'Add Food' : 'Edit Food';
  document.getElementById('food-delete-btn').style.display = isNew ? 'none' : '';
  document.getElementById('food-edit-id').value = foodId || '';
  if (foodId) {
    const f = store.state.foods.find(f => f.id === foodId);
    if (!f) return;
    document.getElementById('food-edit-name').value     = f.name;
    document.getElementById('food-edit-srv-size').value = f.servingSize;
    document.getElementById('food-edit-srv-unit').value = f.servingUnit;
    document.getElementById('food-edit-cal').value      = f.calories;
    document.getElementById('food-edit-pro').value      = f.protein;
    document.getElementById('food-edit-car').value      = f.carbs;
    document.getElementById('food-edit-fat').value      = f.fat;
    document.getElementById('food-edit-sat').value      = f.saturatedFat || '';
    document.getElementById('food-edit-trans').value    = f.transFat || '';
  } else {
    document.getElementById('food-edit-name').value     = '';
    document.getElementById('food-edit-srv-size').value = 100;
    document.getElementById('food-edit-srv-unit').value = 'g';
    document.getElementById('food-edit-cal').value      = '';
    document.getElementById('food-edit-pro').value      = '';
    document.getElementById('food-edit-car').value      = '';
    document.getElementById('food-edit-fat').value      = '';
    document.getElementById('food-edit-sat').value      = '';
    document.getElementById('food-edit-trans').value    = '';
  }
  openOverlay('ov-food-edit');
  setTimeout(() => document.getElementById('food-edit-name').focus(), 350);
}

export function submitFood() {
  const name = document.getElementById('food-edit-name').value.trim();
  if (!name) { showToast('Please enter a food name'); return; }
  const srvSize = parseNum(document.getElementById('food-edit-srv-size').value) || 100;
  const srvUnit = document.getElementById('food-edit-srv-unit').value;
  const cal = parseNum(document.getElementById('food-edit-cal').value);
  const pro = parseNum(document.getElementById('food-edit-pro').value);
  const car = parseNum(document.getElementById('food-edit-car').value);
  const fat = parseNum(document.getElementById('food-edit-fat').value);
  const saturatedFat = parseNum(document.getElementById('food-edit-sat').value);
  const transFat = parseNum(document.getElementById('food-edit-trans').value);
  const eid = document.getElementById('food-edit-id').value;
  const state = store.state;
  if (eid) {
    const f = state.foods.find(f => f.id === eid);
    if (f) { Object.assign(f, { name, servingSize: srvSize, servingUnit: srvUnit, calories: cal, protein: pro, carbs: car, fat, saturatedFat, transFat }); cloudSyncFood(f); }
  } else {
    const food = { id: uid(), name, servingSize: srvSize, servingUnit: srvUnit, calories: cal, protein: pro, carbs: car, fat, saturatedFat, transFat };
    state.foods.push(food);
    cloudSyncFood(food);
  }
  save();
  closeOverlay('ov-food-edit');
  if (store.currentView === 'foods') renderFoods();
  showToast(eid ? 'Food updated ✓' : 'Food saved ✓');
}

export function deleteFood(id) {
  store.state.foods = store.state.foods.filter(f => f.id !== id);
  save();
  cloudDeleteFood(id);
  renderFoods();
  showToast('Food deleted');
}

export function deleteFoodFromModal() {
  const id = document.getElementById('food-edit-id').value;
  if (!id) return;
  store.state.foods = store.state.foods.filter(f => f.id !== id);
  save();
  cloudDeleteFood(id);
  closeOverlay('ov-food-edit');
  if (store.currentView === 'foods') renderFoods();
  showToast('Food deleted');
}
