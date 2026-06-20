import { MEAL_TYPES } from './config.js';
import { store } from './store.js';

export function openOverlay(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeOverlay(id) {
  document.getElementById(id).classList.remove('open');
  if (!document.querySelector('.overlay.open')) document.body.style.overflow = '';
}

export function overlayClick(e, id) {
  if (e.target === document.getElementById(id)) closeOverlay(id);
}

export function toggleCheck(rowId, checkId) {
  const chk = document.getElementById(checkId);
  chk.checked = !chk.checked;
  document.getElementById(rowId).classList.toggle('on', chk.checked);
}

export function renderTypePills(containerId, selected) {
  document.getElementById(containerId).innerHTML = MEAL_TYPES.map(t =>
    `<button class="tpill ${t.id === selected ? 'on' : ''}" onclick="selectPill('${containerId}','${t.id}',this)">${t.emoji} ${t.label}</button>`
  ).join('');
}

export function selectPill(containerId, typeId, btn) {
  store.pendingMealType = typeId;
  document.querySelectorAll(`#${containerId} .tpill`).forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}
