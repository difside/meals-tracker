import { store } from './store.js';
import { init, initAuthListener, signInWithGoogle, signInWithEmail, signOut } from './auth.js';
import { openOverlay, closeOverlay, overlayClick, toggleCheck, selectPill } from './ui.js';
import { renderDay, toggleSection, shiftDate, openDatePicker, jumpToDate } from './day.js';
import { openAddMeal, setMealSource, filterFoodPicker, selectFoodForMeal, updateFromFood, addFoodToMeal, removeMealFoodItem, openMealEdit, openAddMealWithFood, submitMeal, deleteMeal, saveMealToFav, openFromFav, addFavToDay, quickAddFav } from './meals.js';
import { renderHistory, shiftCal, goToDay } from './history.js';
import { renderFavorites, addFavToCurrentDay, deleteFav, openFavDetail, selectAddType, selectPinType, addFavFromDetail, pinFav, unpinFav, deleteFavFromDetail, openFavEdit, submitFavEdit } from './favorites.js';
import { renderFoods, openFoodEdit, submitFood, deleteFood, deleteFoodFromModal } from './foods.js';
import { renderSettings, saveGoals } from './settings.js';
import { openScanner, closeScanner } from './scanner.js';

// ---- View switcher (needs access to all renderers) ----
function switchView(v) {
  store.currentView = v;
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  document.getElementById('nb-' + v).classList.add('active');
  const renderers = { day: renderDay, history: renderHistory, foods: renderFoods, favorites: renderFavorites, settings: renderSettings };
  if (renderers[v]) renderers[v]();
}

// ---- Expose all functions used in inline HTML onclick handlers ----
Object.assign(window, {
  // auth
  signInWithGoogle, signInWithEmail, signOut,
  // overlays
  openOverlay, closeOverlay, overlayClick, toggleCheck,
  // day view
  switchView, renderDay, shiftDate, openDatePicker, jumpToDate, toggleSection,
  // meal modal
  openAddMeal, setMealSource, filterFoodPicker, selectFoodForMeal, updateFromFood,
  addFoodToMeal, removeMealFoodItem, openMealEdit, openAddMealWithFood,
  submitMeal, deleteMeal, saveMealToFav, openFromFav, addFavToDay, quickAddFav,
  // type pills
  selectPill,
  // history
  renderHistory, shiftCal, goToDay,
  // favorites
  renderFavorites, addFavToCurrentDay, deleteFav, openFavDetail,
  selectAddType, selectPinType, addFavFromDetail, pinFav, unpinFav,
  deleteFavFromDetail, openFavEdit, submitFavEdit,
  // foods
  renderFoods, openFoodEdit, submitFood, deleteFood, deleteFoodFromModal,
  // scanner
  openScanner, closeScanner,
  // settings
  renderSettings, saveGoals,
});

// ---- Boot ----
initAuthListener();
