import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { store, defaultState } from './store.js';
import { showToast, showCloudError } from './utils.js';

let _sb = null;
try {
  if (typeof window !== 'undefined' && window.supabase) {
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) { console.error('Supabase init error:', e); }
export const sb = _sb;

export async function loadStateCloud(userId) {
  const [goalsRes, mealsRes, favsRes, foodsRes] = await Promise.all([
    sb.from('user_goals').select('*').eq('user_id', userId).maybeSingle(),
    sb.from('meals').select('*').eq('user_id', userId).order('created_at'),
    sb.from('favorites').select('*').eq('user_id', userId),
    sb.from('foods').select('*').eq('user_id', userId),
  ]);
  const days = {};
  for (const m of mealsRes.data || []) {
    const d = String(m.date).substring(0, 10);
    if (!days[d]) days[d] = [];
    days[d].push({
      id: m.id, name: m.name, type: m.type,
      calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat,
      ...(m.food_items ? { foodItems: m.food_items } : {}),
      ...(m.fav_id    ? { favId:     m.fav_id }     : {}),
    });
  }
  const favorites = (favsRes.data || []).map(f => ({
    id: f.id, name: f.name,
    calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
    pinned: f.pinned, pinnedType: f.pinned_type || null,
  }));
  const foods = (foodsRes.data || []).map(f => ({
    id: f.id, name: f.name,
    servingSize: f.serving_size, servingUnit: f.serving_unit,
    calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
  }));
  return {
    goals: goalsRes.data
      ? { calories: goalsRes.data.calories, protein: goalsRes.data.protein,
          carbs: goalsRes.data.carbs, fat: goalsRes.data.fat }
      : defaultState().goals,
    days, favorites, foods,
  };
}

export async function migrateToCloud(userId, localState) {
  try {
    await sb.from('user_goals').upsert({
      user_id: userId,
      calories: localState.goals.calories, protein: localState.goals.protein,
      carbs: localState.goals.carbs, fat: localState.goals.fat,
    });
    const mealRows = [];
    for (const [date, meals] of Object.entries(localState.days || []))
      for (const m of meals)
        mealRows.push({ id: m.id, user_id: userId, date,
          name: m.name, type: m.type,
          calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat,
          food_items: m.foodItems || null, fav_id: m.favId || null });
    if (mealRows.length) await sb.from('meals').upsert(mealRows);
    const favRows = (localState.favorites || []).map(f => ({
      id: f.id, user_id: userId,
      name: f.name, calories: f.calories, protein: f.protein,
      carbs: f.carbs, fat: f.fat,
      pinned: f.pinned, pinned_type: f.pinnedType || null,
    }));
    if (favRows.length) await sb.from('favorites').upsert(favRows);
    const foodRows = (localState.foods || []).map(f => ({
      id: f.id, user_id: userId,
      name: f.name, serving_size: f.servingSize, serving_unit: f.servingUnit,
      calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
    }));
    if (foodRows.length) await sb.from('foods').upsert(foodRows);
    showToast('Data synced to cloud ✓');
  } catch (e) { showCloudError(); }
}

export function cloudSyncMeal(entry, date) {
  if (!store.currentUserId) return;
  sb.from('meals').upsert({
    id: entry.id, user_id: store.currentUserId, date,
    name: entry.name, type: entry.type,
    calories: entry.calories, protein: entry.protein,
    carbs: entry.carbs, fat: entry.fat,
    food_items: entry.foodItems || null,
    fav_id: entry.favId || null,
  }).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudDeleteMeal(id) {
  if (!store.currentUserId) return;
  sb.from('meals').delete().eq('id', id).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudSyncFavorite(fav) {
  if (!store.currentUserId) return;
  sb.from('favorites').upsert({
    id: fav.id, user_id: store.currentUserId,
    name: fav.name, calories: fav.calories, protein: fav.protein,
    carbs: fav.carbs, fat: fav.fat,
    pinned: fav.pinned, pinned_type: fav.pinnedType || null,
  }).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudDeleteFavorite(id) {
  if (!store.currentUserId) return;
  sb.from('favorites').delete().eq('id', id).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudSyncFood(food) {
  if (!store.currentUserId) return;
  sb.from('foods').upsert({
    id: food.id, user_id: store.currentUserId,
    name: food.name, serving_size: food.servingSize, serving_unit: food.servingUnit,
    calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat,
  }).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudDeleteFood(id) {
  if (!store.currentUserId) return;
  sb.from('foods').delete().eq('id', id).then(({ error }) => { if (error) showCloudError(); });
}

export function cloudSyncGoals() {
  if (!store.currentUserId) return;
  sb.from('user_goals').upsert({
    user_id: store.currentUserId,
    calories: store.state.goals.calories, protein: store.state.goals.protein,
    carbs: store.state.goals.carbs, fat: store.state.goals.fat,
  }).then(({ error }) => { if (error) showCloudError(); });
}
