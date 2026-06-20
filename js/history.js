import { MEAL_TYPES } from './config.js';
import { store } from './store.js';
import { esc, todayStr, localDateStr, fmtDate, fmtFullDate, getDayMeals, getDayTotals } from './utils.js';

export function renderHistory() {
  if (!store.calYear) {
    const n = new Date();
    store.calYear  = n.getFullYear();
    store.calMonth = n.getMonth();
  }
  renderCalendar();
  renderHistDetail();
}

function renderCalendar() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('cal-month').textContent = months[store.calMonth] + ' ' + store.calYear;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    const el = document.createElement('div'); el.className = 'cal-wd'; el.textContent = d; grid.appendChild(el);
  });
  const fd  = new Date(store.calYear, store.calMonth, 1).getDay();
  const dim = new Date(store.calYear, store.calMonth + 1, 0).getDate();
  const today = todayStr();
  for (let i = 0; i < fd; i++) {
    const el = document.createElement('div'); el.className = 'cal-d empty'; grid.appendChild(el);
  }
  for (let day = 1; day <= dim; day++) {
    const ds = `${store.calYear}-${String(store.calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const el = document.createElement('div');
    let cls = 'cal-d';
    if (ds === today) cls += ' today'; else if (ds > today) cls += ' future';
    if (store.histSelDate === ds) cls += ' sel';
    el.className = cls; el.textContent = day;
    const meals = getDayMeals(ds);
    if (meals.length) {
      const tot = getDayTotals(ds);
      const r = store.state.goals.calories > 0 ? tot.calories / store.state.goals.calories : 0;
      const dot = document.createElement('div'); dot.className = 'cal-dot';
      dot.style.background = r > 1.1 ? 'var(--danger)' : r > 0.9 ? 'var(--carbs)' : 'var(--success)';
      el.appendChild(dot);
    }
    el.onclick = () => { store.histSelDate = ds; renderCalendar(); renderHistDetail(); };
    grid.appendChild(el);
  }
}

export function shiftCal(d) {
  store.calMonth += d;
  if (store.calMonth < 0)  { store.calMonth = 11; store.calYear--; }
  if (store.calMonth > 11) { store.calMonth = 0;  store.calYear++; }
  renderCalendar();
}

function renderHistDetail() {
  const c = document.getElementById('hist-detail');
  if (!store.histSelDate) {
    c.innerHTML = `<div class="empty"><div class="empty-ic">📅</div><div class="empty-tx">Select a day to see details</div></div>`;
    return;
  }
  const meals  = getDayMeals(store.histSelDate);
  const totals = getDayTotals(store.histSelDate);
  const g = store.state.goals;
  const mH = meals.length ? meals.map(m => `
    <div class="hist-mi">
      <span>${MEAL_TYPES.find(t => t.id === m.type)?.emoji || '🍽️'}</span>
      <div class="hist-mi-name">${esc(m.name)}</div>
      <div class="hist-mi-cals">${m.calories} kcal</div>
    </div>`).join('') : '<div style="padding:10px 0;font-size:13px;color:var(--muted)">No meals logged</div>';
  const rc = g.calories - totals.calories;
  c.innerHTML = `
    <div class="hist-detail">
      <div class="hist-ttl">${fmtFullDate(store.histSelDate)}</div>
      <div class="hist-row"><span class="hist-lbl">Calories</span><span class="hist-val ${totals.calories > g.calories ? 'over' : ''}">${Math.round(totals.calories)} / ${g.calories} kcal</span></div>
      <div class="hist-row"><span class="hist-lbl">Protein</span><span class="hist-val">${Math.round(totals.protein)}g / ${g.protein}g</span></div>
      <div class="hist-row"><span class="hist-lbl">Carbs</span><span class="hist-val">${Math.round(totals.carbs)}g / ${g.carbs}g</span></div>
      <div class="hist-row"><span class="hist-lbl">Fat</span><span class="hist-val">${Math.round(totals.fat)}g / ${g.fat}g</span></div>
      <div class="hist-row"><span class="hist-lbl">Balance</span><span class="hist-val ${rc < 0 ? 'over' : ''}">${rc >= 0 ? '+' : ''}${Math.round(rc)} kcal</span></div>
      <div class="sep"></div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin-bottom:8px">Meals (${meals.length})</div>
      ${mH}
      <button class="btn-p" style="margin-top:14px" onclick="goToDay('${store.histSelDate}')">
        ${store.histSelDate >= todayStr() ? '📝 Plan / Edit this day' : '📋 View this day'}
      </button>
    </div>`;
}

export function goToDay(d) {
  store.currentDate = d;
  window.switchView('day');
}
