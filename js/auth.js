import { sb, loadStateCloud, migrateToCloud } from './db.js';
import { store, applyState, loadStateLocal, defaultState } from './store.js';
import { showToast, todayStr } from './utils.js';
import { renderDay } from './day.js';

export function showAuthUI() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('signout-btn').style.display = 'none';
}

export function hideAuthUI() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = '';
  document.getElementById('signout-btn').style.display = '';
}

export function showLoadingScreen() { document.getElementById('loading-screen').style.display = 'flex'; }
export function hideLoadingScreen() { document.getElementById('loading-screen').style.display = 'none'; }

export async function signInWithGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  });
  if (error) showToast('Google sign-in error: ' + error.message);
}

export async function signInWithEmail() {
  const email = document.getElementById('auth-email').value.trim();
  if (!email) { showToast('Enter your email address'); return; }
  const btn = document.querySelector('.auth-btn-email');
  btn.disabled = true; btn.textContent = 'Sending…';
  const { error } = await sb.auth.signInWithOtp({
    email, options: { emailRedirectTo: window.location.href },
  });
  btn.disabled = false; btn.textContent = '✉️ Send Magic Link';
  if (error) { showToast('Error: ' + error.message); return; }
  document.getElementById('auth-email-sent').style.display = 'block';
}

export async function signOut() {
  await sb.auth.signOut();
  store.currentUserId = null;
  applyState(defaultState());
  showAuthUI();
  showToast('Signed out');
}

export async function init() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showAuthUI(); return; }
  store.currentUserId = session.user.id;

  hideAuthUI();
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
  renderDay();
}

export function initAuthListener() {
  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') init();
    if (event === 'SIGNED_OUT') showAuthUI();
  });
}
