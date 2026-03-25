import { loadState } from './state.js';
import { render as renderMainMenu } from './screens/mainMenu.js';

function init() {
  loadState();
  renderMainMenu();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
