import { store } from './store.js';

export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
export function parseNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : Math.max(0, n); }
export function clamp01(v) { return Math.min(1, Math.max(0, v)); }
export function pct(c, g) { return g ? clamp01(c / g) : 0; }
export function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function localDateStr(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export function todayStr() { return localDateStr(new Date()); }

export function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (str === todayStr()) return 'Today';
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
  if (str === localDateStr(tmr)) return 'Tomorrow';
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (str === localDateStr(yest)) return 'Yesterday';
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function fmtFullDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function getDayMeals(d) { return store.state.days[d] || []; }

export function getDayTotals(d) {
  return getDayMeals(d).reduce((a, m) => ({
    calories: a.calories + m.calories,
    protein:  a.protein  + m.protein,
    carbs:    a.carbs    + m.carbs,
    fat:      a.fat      + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

export function showCloudError() { showToast('⚠️ Sync error — data saved locally'); }

export function getFoodEmoji(f) {
  const n = f.name.toLowerCase();
  if (/chicken|turkey|poultry/.test(n)) return '🍗';
  if (/beef|steak|burger/.test(n))      return '🥩';
  if (/fish|salmon|tuna|shrimp|seafood/.test(n)) return '🐟';
  if (/egg/.test(n))                    return '🥚';
  if (/milk|yogurt|dairy|cheese/.test(n)) return '🥛';
  if (/rice|pasta|noodle|bread/.test(n)) return '🍚';
  if (/banana|apple|orange|fruit/.test(n)) return '🍎';
  if (/broc|spinach|salad|vegetable|veggie/.test(n)) return '🥦';
  if (/nut|almond|cashew|peanut/.test(n)) return '🥜';
  if (/oat|cereal|granola/.test(n))     return '🥣';
  if (/protein|whey|shake|supplement/.test(n)) return '💪';
  if (/coffee|tea/.test(n))             return '☕';
  if (/oil|butter|fat/.test(n))         return '🫙';
  return '🍽️';
}
