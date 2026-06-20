import { MEAL_TYPES, CIRC } from './config.js';
import { store } from './store.js';
import { pct, esc, localDateStr, todayStr, fmtDate, getDayMeals, getDayTotals } from './utils.js';
import { openOverlay, closeOverlay } from './ui.js';

export function renderDay() {
  const { currentDate } = store;
  const state = store.state;

  document.getElementById('date-text').textContent = fmtDate(currentDate);
  const badge = document.getElementById('date-badge');
  if (currentDate === todayStr()) { badge.textContent = 'Today'; badge.style.display = 'inline-block'; }
  else badge.style.display = 'none';

  const totals = getDayTotals(currentDate);
  const g = state.goals;
  const remaining = g.calories - totals.calories;
  const ratio = pct(totals.calories, g.calories);

  const rt = document.getElementById('ring-track');
  rt.setAttribute('stroke-dasharray', `${ratio * CIRC} ${CIRC - ratio * CIRC}`);
  rt.style.stroke = ratio >= 1 ? 'var(--danger)' : 'var(--primary)';

  const rn = document.getElementById('ring-num'), rl = document.getElementById('ring-lbl');
  if (remaining < 0) { rn.textContent = Math.abs(Math.round(remaining)); rn.className = 'ring-num over'; rl.textContent = 'over goal'; }
  else               { rn.textContent = Math.round(remaining);            rn.className = 'ring-num';     rl.textContent = 'remaining'; }

  document.getElementById('cstat-goal').textContent = g.calories + ' kcal';
  document.getElementById('cstat-consumed').textContent = Math.round(totals.calories) + ' kcal';
  const re = document.getElementById('cstat-remaining');
  re.textContent = Math.round(remaining) + ' kcal';
  re.className = 'cal-stat-val' + (remaining < 0 ? ' over' : '');

  function setMacro(bid, vid, c, goal, color) {
    document.getElementById(bid).style.width = (pct(c, goal) * 100) + '%';
    const ov = c > goal;
    document.getElementById(bid).style.background = ov ? 'var(--danger)' : color;
    document.getElementById(vid).textContent = Math.round(c) + ' / ' + goal + 'g';
    document.getElementById(vid).className = 'macro-vals' + (ov ? ' over' : '');
  }
  setMacro('bar-p', 'val-p', totals.protein, g.protein, 'var(--protein)');
  setMacro('bar-c', 'val-c', totals.carbs,   g.carbs,   'var(--carbs)');
  setMacro('bar-f', 'val-f', totals.fat,     g.fat,     'var(--fat)');

  renderMealSections();
}

function renderMealSections() {
  const { currentDate } = store;
  const state = store.state;
  const meals = getDayMeals(currentDate);
  const container = document.getElementById('meal-sections');
  container.innerHTML = '';

  MEAL_TYPES.forEach(type => {
    const tm = meals.filter(m => m.type === type.id);
    const tt = tm.reduce((s, m) => s + m.calories, 0);
    const pf = state.favorites.filter(f => f.pinned && f.pinnedType === type.id);
    const af = new Set(meals.filter(m => m.favId).map(m => m.favId));

    const pinHTML = pf.map(f => {
      const aa = af.has(f.id);
      return `<div class="pin-row">
        <span style="font-size:14px">📌</span>
        <div class="pin-info"><div class="pin-name">${esc(f.name)}</div><div class="pin-cal">${f.calories} kcal · P${f.protein}g C${f.carbs}g F${f.fat}g</div></div>
        <button class="btn-qadd" onclick="quickAddFav('${f.id}','${type.id}')" ${aa ? 'style="background:var(--success)"' : ''}>${aa ? '✓ Added' : '+ Add'}</button>
      </div>`;
    }).join('');

    const mealHTML = tm.map(m => `
      <div class="mi" onclick="openMealEdit('${m.id}')">
        <div class="mi-left">
          <div class="mi-name trunc">${esc(m.name)}</div>
          <div class="mi-macros">P${m.protein}g · C${m.carbs}g · F${m.fat}g</div>
          ${m.foodItems && m.foodItems.length ? `<div class="mi-foods">${m.foodItems.map(fi => `${esc(fi.name)} ${fi.amount}${fi.amountUnit}`).join(' + ')}</div>` : ''}
        </div>
        <div class="mi-right">
          <span class="mi-cals">${m.calories}</span>
          <button class="ibtn" title="Save to Favorites" onclick="event.stopPropagation();saveMealToFav('${m.id}')">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
          <button class="ibtn del" title="Delete" onclick="event.stopPropagation();deleteMeal('${m.id}')">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>`).join('');

    const sec = document.createElement('div');
    sec.className = 'ms';
    sec.innerHTML = `
      <div class="ms-head" onclick="toggleSection('${type.id}')">
        <div class="ms-icon" style="background:${type.bg}">${type.emoji}</div>
        <div class="ms-name">${type.label}</div>
        <div class="ms-cals">${tt ? tt + ' kcal' : ''}</div>
        <div class="ms-chev open" id="chev-${type.id}"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg></div>
      </div>
      <div class="ms-body" id="msb-${type.id}">
        ${pinHTML}${mealHTML}
        <div class="add-row">
          <button class="btn-add-meal" onclick="openAddMeal('${type.id}')">
            <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke-width:3;fill:none;stroke:currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Meal
          </button>
          <button class="btn-from-fav" onclick="openFromFav('${type.id}')">⭐ Favorites</button>
        </div>
      </div>`;
    container.appendChild(sec);
  });
}

export function toggleSection(typeId) {
  const b = document.getElementById('msb-' + typeId);
  const c = document.getElementById('chev-' + typeId);
  if (b.style.display === 'none') { b.style.display = ''; c.classList.add('open'); }
  else { b.style.display = 'none'; c.classList.remove('open'); }
}

export function shiftDate(delta) {
  const [y, m, d] = store.currentDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  store.currentDate = localDateStr(dt);
  renderDay();
}

export function openDatePicker() {
  document.getElementById('date-picker-input').value = store.currentDate;
  openOverlay('ov-date');
}

export function jumpToDate() {
  const v = document.getElementById('date-picker-input').value;
  if (v) {
    store.currentDate = v;
    closeOverlay('ov-date');
    if (store.currentView !== 'day') window.switchView('day');
    else renderDay();
  }
}
