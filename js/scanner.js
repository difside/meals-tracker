import { store } from './store.js';
import { showToast } from './utils.js';
import { openAddMealWithFood } from './meals.js';

let _scanner = null;

export function openScanner() {
  const overlay = document.getElementById('ov-scanner');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!window.Html5Qrcode) {
    showToast('Barcode scanner not available');
    closeScanner();
    return;
  }

  _scanner = new window.Html5Qrcode('scanner-viewport');
  _scanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 160 } },
    (decodedText) => onScanSuccess(decodedText),
    () => {}
  ).catch(err => {
    showToast('Camera access denied');
    console.error('Scanner start error:', err);
    closeScanner();
  });
}

export function closeScanner() {
  const overlay = document.getElementById('ov-scanner');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (_scanner) {
    _scanner.stop().catch(() => {}).finally(() => {
      _scanner.clear();
      _scanner = null;
    });
  }
}

function onScanSuccess(barcode) {
  const food = store.state.foods.find(f => f.barcode === barcode);
  if (food) {
    closeScanner();
    showToast(`Found: ${food.name}`);
    setTimeout(() => openAddMealWithFood(food.id), 300);
  } else {
    showToast(`Barcode ${barcode} not in database`);
  }
}
