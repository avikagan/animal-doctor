import { showScreen, clearElement } from '../utils/dom.js';
import { getState } from '../state.js';
import { getAnimalById } from '../data/animals.js';
import { MatchPairsGame } from '../minigames/matchPairs.js';
import { MatchThreeGame } from '../minigames/matchThree.js';
import { DragDropGame } from '../minigames/dragDrop.js';

const GAME_CLASSES = {
  matchPairs: MatchPairsGame,
  matchThree: MatchThreeGame,
  dragDrop: DragDropGame
};

let activeGame = null;

export function render() {
  const screen = showScreen('minigame');
  clearElement(screen);

  const state = getState();
  const animal = getAnimalById(state.selectedAnimal);
  if (!animal) return;

  // Destroy previous game if any
  if (activeGame) {
    activeGame.destroy();
    activeGame = null;
  }

  // Randomly pick a game type from available configs
  const availableTypes = Object.keys(animal.minigameConfigs);
  const gameType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const config = animal.minigameConfigs[gameType];

  const GameClass = GAME_CLASSES[gameType];
  if (!GameClass) {
    screen.textContent = 'Unknown game type!';
    return;
  }

  activeGame = new GameClass(screen, config, animal);
  activeGame.onComplete = (results) => {
    activeGame.destroy();
    activeGame = null;
    import('./results.js').then(m => m.render(results));
  };
  activeGame.init();
  activeGame.start();
}
