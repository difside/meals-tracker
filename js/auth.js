import { sb, loadStateCloud, migrateToCloud } from './db.js';
import { store, applyState, loadStateLocal, defaultState } from './store.js';
import { showToast } from './utils.js';
import { renderDay } from './day.js';
import { renderSettings } from './settings.js';

// ---- Auth overlay (not a blocking screen) ----

export function openAuthOverlay() {
  document.getElementById('auth-screen').classList.add('open');
  document.getElementById('auth-email-sent').style.display = 'none';
  document.getElementById('auth-email').value = '';
}

export function closeAuthOverlay() {
  document.getElementById('auth-screen').classList.remove('open');
}

export function handleAuthOverlayClick(e) {
  if (e.target === document.getElementById('auth-screen')) closeAuthOverlay();
}

export function handleAuthHdrBtn() {
  if (store.currentUserId) signOut();
  else openAuthOverlay();
}

// ---- Loading screen ----

export function showLoadingScreen() { document.getElementById('loading-screen').style.display = 'flex'; }
export function hideLoadingScreen() { document.getElementById('loading-screen').style.display = 'none'; }

// ---- Sign in ----

export async function signInWithGoogle() {
  if (!sb) { showToast('Auth unavailable — check connection'); return; }
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) showToast('Google sign-in error: ' + error.message);
}

export async function signInWithEmail() {
  if (!sb) { showToast('Auth unavailable — check connection'); return; }
  const email = document.getElementById('auth-email').value.trim();
  if (!email) { showToast('Enter your email address'); return; }
  const btn = document.querySelector('.auth-btn-email');
  btn.disabled = true; btn.textContent = 'Sending…';
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await sb.auth.signInWithOtp({
    email, options: { emailRedirectTo: redirectTo },
  });
  btn.disabled = false; btn.textContent = '✉️ Send Magic Link';
  if (error) { showToast('Error: ' + error.message, 5000); return; }
  document.getElementById('auth-email-sent').style.display = 'block';
}

// ---- Sign out ----

export async function signOut() {
  if (sb) await sb.auth.signOut();
  store.currentUserId = null;
  applyState(loadStateLocal());
  _updateHeaderBtn();
  renderDay();
  renderSettings();
  showToast('Signed out — data saved locally');
}

// ---- Boot helpers ----

function _bootLocal() {
  applyState(loadStateLocal());
  if (!store.state.foods) store.state.foods = [];
  const n = new Date();
  store.calYear  = n.getFullYear();
  store.calMonth = n.getMonth();
  _updateHeaderBtn();
  renderDay();
  renderSettings();
}

function _updateHeaderBtn() {
  const btn = document.getElementById('auth-hdr-btn');
  if (!btn) return;
  btn.textContent = store.currentUserId ? 'Sign out' : 'Sign in';
}

// ---- Main init (cloud login) ----

let _initializing = false;
export async function init() {
  if (_initializing) return;
  _initializing = true;
  try {
    if (!sb) { _bootLocal(); return; }
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { _bootLocal(); return; }

    store.currentUserId = session.user.id;
    closeAuthOverlay();
    showLoadingScreen();

    try {
      const cloudState = await loadStateCloud(store.currentUserId);
      const cloudEmpty = !Object.keys(cloudState.days).length
        && !cloudState.favorites.length && !cloudState.foods.length
        && cloudState.goals.calories === defaultState().goals.calories;
      if (cloudEmpty) {
        const local = loadStateLocal();
        const hasLocal = Object.keys(local.days).length || local.favorites.length || local.foods.length;
        applyState(local);
        if (hasLocal) migrateToCloud(store.currentUserId, local);
      } else {
        applyState(cloudState);
      }
    } catch (e) {
      console.error('Cloud load error:', e);
      applyState(loadStateLocal());
      showToast('⚠️ Running offline — data saved locally');
    }

    if (!store.state.foods) store.state.foods = [];
    const n = new Date();
    store.calYear  = n.getFullYear();
    store.calMonth = n.getMonth();
    hideLoadingScreen();
    _updateHeaderBtn();
    renderDay();
    renderSettings();
  } catch (e) {
    console.error('Init error:', e);
    _bootLocal();
  } finally {
    _initializing = false;
  }
}

// ---- Auth state listener ----

export function initAuthListener() {
  if (!sb) { _bootLocal(); return; }
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') {
      if (session) init();
      else _bootLocal();
    }
    if (event === 'SIGNED_IN') init();
    if (event === 'SIGNED_OUT') { /* handled in signOut() */ }
  });
}
