import { store, save } from './store.js';
import { uid, parseNum, esc, showToast } from './utils.js';
import { cloudSyncMeal, cloudDeleteMeal, cloudSyncFavorite } from './db.js';
import { openOverlay, closeOverlay, renderTypePills } from './ui.js';
import { renderDay } from './day.js';

// ---- Meal modal ----

export function openAddMeal(type) {
  store.pendingMealType = type;
  store.mealSource      = 'custom';
  store.selectedFoodId  = null;
  store.mealFoodItems   = [];
  document.getElementById('meal-modal-title').textContent = 'Add Meal';
  document.getElementById('meal-edit-id').value = '';
  document.getElementById('meal-name').value    = '';
  document.getElementById('meal-cal').value     = '';
  document.getElementById('meal-pro').value     = '';
  document.getElementById('meal-car').value     = '';
  document.getElementById('meal-fat').value     = '';
  document.getElementById('fchk-save').classList.remove('on');
  document.getElementById('meal-save-fav').checked = false;
  setMealSource('custom');
  renderTypePills('meal-type-pills', store.pendingMealType);
  openOverlay('ov-meal');
  setTimeout(() => document.getElementById('meal-name').focus(), 350);
}

export function setMealSource(src) {
  store.mealSource = src;
  document.getElementById('stog-custom').classList.toggle('on', src === 'custom');
  document.getElementById('stog-food').classList.toggle('on', src === 'food');
  document.getElementById('food-picker-wrap').style.display = src === 'food' ? '' : 'none';
  if (src === 'food') {
    store.selectedFoodId = null;
    document.getElementById('food-search-meal').value = '';
    document.getElementById('food-servings-wrap').style.display = 'none';
    renderMealFoodList();
    filterFoodPicker();
    setTimeout(() => document.getElementById('food-search-meal').focus(), 100);
  }
}

export function filterFoodPicker() {
  const q = document.getElementById('food-search-meal').value.toLowerCase();
  const list = document.getElementById('food-picker-list');
  const state = store.state;
  if (!state.foods.length) {
    list.innerHTML = '<div class="fpick-no-results">No foods saved yet — go to Foods tab to add some</div>';
    return;
  }
  const filtered = q ? state.foods.filter(f => f.name.toLowerCase().includes(q)) : state.foods;
  if (!filtered.length) {
    list.innerHTML = '<div class="fpick-no-results">No foods match your search</div>';
    return;
  }
  list.innerHTML = filtered.map(f => `
    <div class="fpick-item ${store.selectedFoodId === f.id ? 'sel' : ''}" onclick="selectFoodForMeal('${f.id}')">
      <div class="fpick-name">${esc(f.name)}</div>
      <div class="fpick-info">${f.calories} kcal / ${f.servingSize}${f.servingUnit}</div>
    </div>`).join('');
}

export function selectFoodForMeal(foodId) {
  store.selectedFoodId = foodId;
  const food = store.state.foods.find(f => f.id === foodId);
  if (!food) return;
  if (!document.getElementById('meal-name').value) document.getElementById('meal-name').value = food.name;
  document.getElementById('food-servings-wrap').style.display = '';
  document.getElementById('meal-servings').value = food.servingSize;
  document.getElementById('servings-unit-lbl').textContent = food.servingUnit;
  updateFromFood();
  filterFoodPicker();
}

export function updateFromFood() {
  const food = store.state.foods.find(f => f.id === store.selectedFoodId);
  if (!food) return;
  const amount = parseNum(document.getElementById('meal-servings').value) || food.servingSize;
  const ratio = amount / food.servingSize;
  const cal = Math.round(food.calories * ratio);
  const pro = +(food.protein * ratio).toFixed(1);
  const car = +(food.carbs   * ratio).toFixed(1);
  const fat = +(food.fat     * ratio).toFixed(1);
  document.getElementById('food-sel-preview').innerHTML = `
    <div class="food-sel-name">📦 ${esc(food.name)} — ${amount}${food.servingUnit}</div>
    <div class="food-sel-macros">${cal} kcal · P${pro}g · C${car}g · F${fat}g</div>`;
}

export function addFoodToMeal() {
  const food = store.state.foods.find(f => f.id === store.selectedFoodId);
  if (!food) { showToast('Select a food first'); return; }
  const amount = parseNum(document.getElementById('meal-servings').value) || food.servingSize;
  const ratio = amount / food.servingSize;
  store.mealFoodItems.push({
    foodId: food.id, name: food.name, amount,
    amountUnit: food.servingUnit,
    calories: Math.round(food.calories * ratio),
    protein: +(food.protein * ratio).toFixed(1),
    carbs:   +(food.carbs   * ratio).toFixed(1),
    fat:     +(food.fat     * ratio).toFixed(1),
  });
  if (store.mealFoodItems.length === 1 && !document.getElementById('meal-name').value)
    document.getElementById('meal-name').value = food.name;
  renderMealFoodList();
  recalcMealTotals();
  store.selectedFoodId = null;
  document.getElementById('food-search-meal').value = '';
  document.getElementById('food-servings-wrap').style.display = 'none';
  filterFoodPicker();
  setTimeout(() => document.getElementById('food-search-meal').focus(), 80);
}

export function removeMealFoodItem(idx) {
  store.mealFoodItems.splice(idx, 1);
  renderMealFoodList();
  recalcMealTotals();
}

function renderMealFoodList() {
  const wrap = document.getElementById('meal-food-list-wrap');
  const container = document.getElementById('meal-food-items');
  if (!store.mealFoodItems.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  const items = store.mealFoodItems;
  const totalCal = items.reduce((s, i) => s + i.calories, 0);
  const totalPro = +(items.reduce((s, i) => s + i.protein, 0)).toFixed(1);
  const totalCar = +(items.reduce((s, i) => s + i.carbs,   0)).toFixed(1);
  const totalFat = +(items.reduce((s, i) => s + i.fat,     0)).toFixed(1);
  container.innerHTML = items.map((item, idx) => `
    <div class="meal-food-item">
      <div class="mfi-info">
        <div class="mfi-name">${esc(item.name)}</div>
        <div class="mfi-detail">${item.amount}${item.amountUnit} · P${item.protein}g · C${item.carbs}g · F${item.fat}g</div>
      </div>
      <span class="mfi-cal">${item.calories} kcal</span>
      <button class="mfi-rm" onclick="removeMealFoodItem(${idx})" title="Remove">×</button>
    </div>`).join('') + `
    <div class="meal-food-total">
      <span class="mft-label">Total: ${totalCal} kcal</span>
      <span class="mft-macros">P${totalPro}g · C${totalCar}g · F${totalFat}g</span>
    </div>`;
}

function recalcMealTotals() {
  if (!store.mealFoodItems.length) return;
  const items = store.mealFoodItems;
  document.getElementById('meal-cal').value = items.reduce((s, i) => s + i.calories, 0);
  document.getElementById('meal-pro').value = +(items.reduce((s, i) => s + i.protein, 0)).toFixed(1);
  document.getElementById('meal-car').value = +(items.reduce((s, i) => s + i.carbs,   0)).toFixed(1);
  document.getElementById('meal-fat').value = +(items.reduce((s, i) => s + i.fat,     0)).toFixed(1);
}

export function openMealEdit(mealId) {
  const meal = (store.state.days[store.currentDate] || []).find(m => m.id === mealId);
  if (!meal) return;
  store.pendingMealType = meal.type;
  store.mealFoodItems   = meal.foodItems ? [...meal.foodItems] : [];
  store.selectedFoodId  = null;
  document.getElementById('meal-modal-title').textContent = 'Edit Meal';
  document.getElementById('meal-edit-id').value = meal.id;
  document.getElementById('meal-name').value    = meal.name;
  document.getElementById('meal-cal').value     = meal.calories;
  document.getElementById('meal-pro').value     = meal.protein;
  document.getElementById('meal-car').value     = meal.carbs;
  document.getElementById('meal-fat').value     = meal.fat;
  document.getElementById('fchk-save').classList.remove('on');
  document.getElementById('meal-save-fav').checked = false;
  const src = store.mealFoodItems.length ? 'food' : 'custom';
  store.mealSource = src;
  document.getElementById('stog-custom').classList.toggle('on', src === 'custom');
  document.getElementById('stog-food').classList.toggle('on', src === 'food');
  document.getElementById('food-picker-wrap').style.display = src === 'food' ? '' : 'none';
  if (src === 'food') {
    document.getElementById('food-search-meal').value = '';
    document.getElementById('food-servings-wrap').style.display = 'none';
    renderMealFoodList();
    filterFoodPicker();
  }
  renderTypePills('meal-type-pills', store.pendingMealType);
  openOverlay('ov-meal');
}

export function openAddMealWithFood(foodId) {
  openAddMeal(store.pendingMealType || 'snack');
  setTimeout(() => { setMealSource('food'); selectFoodForMeal(foodId); }, 380);
}

export function submitMeal() {
  const state = store.state;
  const name = document.getElementById('meal-name').value.trim();
  if (!name) { showToast('Please enter a meal name'); return; }
  const cal  = parseNum(document.getElementById('meal-cal').value);
  const pro  = parseNum(document.getElementById('meal-pro').value);
  const car  = parseNum(document.getElementById('meal-car').value);
  const fat  = parseNum(document.getElementById('meal-fat').value);
  const eid  = document.getElementById('meal-edit-id').value;
  const stf  = document.getElementById('meal-save-fav').checked;
  const foodItems = store.mealSource === 'food' && store.mealFoodItems.length ? [...store.mealFoodItems] : null;

  if (!state.days[store.currentDate]) state.days[store.currentDate] = [];
  const entry = {
    id: eid || uid(), name, type: store.pendingMealType,
    calories: cal, protein: pro, carbs: car, fat,
    ...(foodItems ? { foodItems } : { foodItems: undefined }),
  };

  if (eid) {
    const idx = state.days[store.currentDate].findIndex(m => m.id === eid);
    if (idx !== -1) {
      const merged = { ...state.days[store.currentDate][idx], ...entry };
      if (!merged.foodItems) delete merged.foodItems;
      state.days[store.currentDate][idx] = merged;
    }
  } else {
    state.days[store.currentDate].push(entry);
  }

  if (stf && !state.favorites.find(f => f.name.toLowerCase() === name.toLowerCase())) {
    const newFav = { id: uid(), name, calories: cal, protein: pro, carbs: car, fat, pinned: false, pinnedType: null };
    state.favorites.push(newFav);
    cloudSyncFavorite(newFav);
  }

  save();
  cloudSyncMeal(entry, store.currentDate);
  closeOverlay('ov-meal');
  renderDay();
  showToast(eid ? 'Meal updated' : 'Meal added ✓');
}

export function deleteMeal(id) {
  const state = store.state;
  if (!state.days[store.currentDate]) return;
  state.days[store.currentDate] = state.days[store.currentDate].filter(m => m.id !== id);
  if (!state.days[store.currentDate].length) delete state.days[store.currentDate];
  save();
  cloudDeleteMeal(id);
  renderDay();
  showToast('Meal removed');
}

export function saveMealToFav(mealId) {
  const state = store.state;
  const meal = (state.days[store.currentDate] || []).find(m => m.id === mealId);
  if (!meal) return;
  if (state.favorites.find(f => f.name.toLowerCase() === meal.name.toLowerCase())) {
    showToast('Already in Favorites'); return;
  }
  const newFav = { id: uid(), name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, pinned: false, pinnedType: null };
  state.favorites.push(newFav);
  save();
  cloudSyncFavorite(newFav);
  showToast('Saved to Favorites ⭐');
}

// ---- From-favorites modal ----

export function openFromFav(type) {
  store.pendingMealType = type;
  const state = store.state;
  const list = document.getElementById('fav-select-list');
  if (!state.favorites.length) {
    list.innerHTML = `<div class="empty"><div class="empty-ic">⭐</div><div class="empty-tx">No favorites yet</div></div>`;
  } else {
    list.innerHTML = state.favorites.map(f => `
      <div class="fsel-item" onclick="addFavToDay('${f.id}')">
        <span style="font-size:20px">⭐</span>
        <div class="fsel-nm">${esc(f.name)}</div>
        <div style="font-size:11px;color:var(--muted);text-align:right">
          <div class="fsel-cal">${f.calories} kcal</div>
          <div>P${f.protein} C${f.carbs} F${f.fat}g</div>
        </div>
      </div>`).join('');
  }
  openOverlay('ov-from-fav');
}

export function addFavToDay(favId) {
  const state = store.state;
  const fav = state.favorites.find(f => f.id === favId);
  if (!fav) return;
  if (!state.days[store.currentDate]) state.days[store.currentDate] = [];
  const entry = { id: uid(), name: fav.name, type: store.pendingMealType, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat, favId: fav.id };
  state.days[store.currentDate].push(entry);
  save();
  cloudSyncMeal(entry, store.currentDate);
  closeOverlay('ov-from-fav');
  renderDay();
  showToast('Added ' + fav.name + ' ✓');
}

export function quickAddFav(favId, type) {
  const state = store.state;
  const fav = state.favorites.find(f => f.id === favId);
  if (!fav) return;
  if (!state.days[store.currentDate]) state.days[store.currentDate] = [];
  const entry = { id: uid(), name: fav.name, type, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat, favId: fav.id };
  state.days[store.currentDate].push(entry);
  save();
  cloudSyncMeal(entry, store.currentDate);
  renderDay();
  showToast('Added ' + fav.name + ' ✓');
}
