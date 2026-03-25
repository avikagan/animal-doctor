import { el, showScreen, clearElement } from '../utils/dom.js';
import { getState, setState } from '../state.js';
import { getAnimalById, getConservationInfo } from '../data/animals.js';

export function render() {
  const screen = showScreen('diagnosis');
  clearElement(screen);

  const state = getState();
  const animal = getAnimalById(state.selectedAnimal);
  if (!animal) return;

  const conservation = getConservationInfo(animal.conservationStatus);

  const container = el('div', { className: 'text-center' }, [
    el('div', { className: 'mb-2', style: 'text-align: left;' }, [
      el('button', {
        className: 'btn btn-secondary',
        onClick: () => import('./animalSelect.js').then(m => m.render())
      }, ['\u2190 Back'])
    ]),

    el('div', { className: 'mt-2 mb-2' }, [
      el('div', { className: 'emoji-large anim-sick' }, [animal.emoji]),
      el('h2', { className: 'mt-2' }, [animal.name]),
      el('span', {
        className: 'badge',
        style: `background: ${conservation.color}; color: ${animal.conservationStatus === 'VU' ? 'var(--color-text)' : 'white'};`
      }, [conservation.label])
    ]),

    el('div', { className: 'card mt-2', style: 'max-width: 500px; margin-left: auto; margin-right: auto; text-align: left;' }, [
      el('h3', { className: 'mb-1', style: 'color: var(--color-danger);' }, [
        `\u{1FA7A} Diagnosis: ${animal.ailment.name}`
      ]),
      el('p', { className: 'mb-2' }, [animal.ailment.description]),
      el('h3', { className: 'mb-1' }, ['Symptoms:']),
      el('ul', { style: 'list-style: none; padding: 0;' },
        animal.ailment.symptoms.map((symptom, i) => {
          const li = el('li', {
            className: 'anim-slide-up',
            style: `padding: 8px 0 8px 28px; position: relative; animation-delay: ${0.2 + i * 0.15}s; opacity: 0; animation-fill-mode: forwards;`
          }, [symptom]);
          const dot = el('span', { style: 'position: absolute; left: 0; top: 8px;' }, ['\u{1F534}']);
          li.prepend(dot);
          return li;
        })
      )
    ]),

    el('div', { className: 'mt-3 mb-2' }, [
      el('button', {
        className: 'btn btn-primary btn-large anim-pop-in',
        onClick: () => {
          import('./minigame.js').then(m => m.render());
        }
      }, ['\u{1F48A} Begin Treatment!'])
    ]),

    el('p', { className: 'mt-1', style: 'font-size: 0.85rem; color: var(--color-text-light);' }, [
      `Mini-game: ${getMinigameLabel(animal.minigameType)} \u2022 Time: ${getTimeLimit(animal)}s \u2022 ${conservation.multiplier}x score multiplier`
    ])
  ]);

  screen.appendChild(container);
}

function getMinigameLabel(type) {
  const labels = {
    matchPairs: 'Memory Match',
    matchThree: 'Match-3 Puzzle',
    dragDrop: 'Drag & Drop'
  };
  return labels[type] || type;
}

function getTimeLimit(animal) {
  return animal.minigameConfig.timeLimit;
}
