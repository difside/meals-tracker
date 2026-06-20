import { store, save } from './store.js';
import { parseNum, showToast } from './utils.js';
import { cloudSyncGoals } from './db.js';

export function renderSettings() {
  const g = store.state.goals;
  document.getElementById('g-cal').value = g.calories;
  document.getElementById('g-pro').value = g.protein;
  document.getElementById('g-car').value = g.carbs;
  document.getElementById('g-fat').value = g.fat;
}

export function saveGoals() {
  const g = store.state.goals;
  g.calories = parseNum(document.getElementById('g-cal').value) || 2000;
  g.protein  = parseNum(document.getElementById('g-pro').value) || 150;
  g.carbs    = parseNum(document.getElementById('g-car').value) || 250;
  g.fat      = parseNum(document.getElementById('g-fat').value) || 65;
  save();
  cloudSyncGoals();
  showToast('Goals saved ✓');
}
