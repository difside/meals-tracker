function _todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

export function defaultState() {
  return { goals: { calories: 2000, protein: 150, carbs: 250, fat: 65 }, days: {}, favorites: [], foods: [] };
}

// Single shared mutable object — all modules import this reference and mutate properties directly.
export const store = {
  // App data
  state: defaultState(),

  // UI state
  currentDate: _todayStr(),
  currentView: 'day',
  calYear: null,
  calMonth: null,
  histSelDate: null,
  pendingMealType: 'breakfast',
  mealSource: 'custom',
  selectedFoodId: null,
  mealFoodItems: [],
  activeFavId: null,
  selectedPinType: null,
  currentUserId: null,
};

export function applyState(newState) {
  store.state.goals     = newState.goals;
  store.state.days      = newState.days;
  store.state.favorites = newState.favorites;
  store.state.foods     = newState.foods;
}

export function loadStateLocal() {
  try {
    const s = localStorage.getItem('mt2');
    if (s) return Object.assign(defaultState(), JSON.parse(s));
  } catch (e) { /* ignore */ }
  return defaultState();
}

export function save() {
  localStorage.setItem('mt2', JSON.stringify(store.state));
}
