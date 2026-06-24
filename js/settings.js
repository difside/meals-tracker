import { store, save } from './store.js';
import { parseNum, showToast, esc } from './utils.js';
import { cloudSyncGoals } from './db.js';

export function renderSettings() {
  const g = store.state.goals;
  document.getElementById('g-cal').value = g.calories;
  document.getElementById('g-pro').value = g.protein;
  document.getElementById('g-car').value = g.carbs;
  document.getElementById('g-fat').value = g.fat;
  _renderAccountCard();
}

function _renderAccountCard() {
  const card = document.getElementById('set-account-card');
  if (!card) return;
  if (store.currentUserId) {
    card.innerHTML = `
      <div class="set-ttl">Account</div>
      <div class="set-account-row">
        <div class="set-account-ic">☁️</div>
        <div class="set-account-info">
          <div class="set-account-status">Synced to cloud</div>
          <div class="set-account-id">${esc(store.currentUserId.slice(0, 8))}…</div>
        </div>
        <button class="set-signout-btn" onclick="signOut()">Sign out</button>
      </div>`;
  } else {
    card.innerHTML = `
      <div class="set-ttl">Cloud Sync</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:12px">
        Sign in to save your data to the cloud and access it from any device.
      </div>
      <button class="btn-p" style="margin-top:0" onclick="openAuthOverlay()">Sign in / Create account</button>`;
  }
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
