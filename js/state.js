const STORAGE_KEY = 'animalDoctor_save';

const DEFAULT_STATE = {
  currentScreen: 'mainMenu',
  selectedAnimal: null,
  activeMinigame: null,
  journal: {},
  highScores: {},
  totalScore: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true
  }
};

let state = { ...DEFAULT_STATE };
let listeners = [];

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach(fn => fn(state));
}

export function updateJournal(animalId, patch) {
  const current = state.journal[animalId] || { unlocked: false, factsRevealed: 0, healCount: 0 };
  state.journal = {
    ...state.journal,
    [animalId]: { ...current, ...patch }
  };
  persist();
}

export function updateHighScore(animalId, score) {
  const current = state.highScores[animalId] || { best: 0, lastPlayed: 0 };
  state.highScores = {
    ...state.highScores,
    [animalId]: {
      best: Math.max(current.best, score),
      lastPlayed: Date.now()
    }
  };
  if (score > current.best) {
    state.totalScore = state.totalScore - current.best + score;
  }
  persist();
}

export function onStateChange(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function persist() {
  try {
    const save = {
      journal: state.journal,
      highScores: state.highScores,
      totalScore: state.totalScore,
      settings: state.settings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('Failed to save game state:', e);
  }
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load game state:', e);
    state = { ...DEFAULT_STATE };
  }
}

export function resetState() {
  state = { ...DEFAULT_STATE };
  localStorage.removeItem(STORAGE_KEY);
}
