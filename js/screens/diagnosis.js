import { el, showScreen, clearElement, animalImg } from '../utils/dom.js';
import { getState, setState } from '../state.js';
import { getAnimalById, getConservationInfo } from '../data/animals.js';

export function render() {
  const screen = showScreen('diagnosis');
  clearElement(screen);

  const state = getState();
  const animal = getAnimalById(state.selectedAnimal);
  if (!animal) return;

  const conservation = getConservationInfo(animal.conservationStatus);

  // Hero image — full width, dominant element
  const heroImg = animalImg(animal, 'default', 'emoji-large');
  heroImg.className = 'diagnosis-hero-img';

  const container = el('div', { className: 'diagnosis-screen' }, [
    el('div', { className: 'diagnosis-hero' }, [
      el('button', {
        className: 'btn btn-secondary diagnosis-back-btn',
        onClick: () => import('./animalSelect.js').then(m => m.render())
      }, ['\u2190 Back']),
      heroImg,
      el('div', { className: 'diagnosis-hero-badge' }, [
        el('span', {
          className: 'badge',
          style: `background: ${conservation.color}; color: ${animal.conservationStatus === 'VU' ? 'var(--color-text)' : 'white'};`
        }, [conservation.label])
      ])
    ]),

    el('div', { className: 'diagnosis-info' }, [
      el('div', { className: 'card diagnosis-card' }, [
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

      el('div', { className: 'text-center mt-2 mb-2' }, [
        el('button', {
          className: 'btn btn-primary btn-large',
          onClick: () => {
            import('./minigame.js').then(m => m.render());
          }
        }, ['\u{1F48A} Begin Treatment!']),
        el('p', { className: 'mt-1', style: 'font-size: 0.85rem; color: var(--color-text-light);' }, [
          `${getMinigameLabel(animal.minigameType)} \u2022 ${getTimeLimit(animal)}s \u2022 ${conservation.multiplier}x multiplier`
        ])
      ])
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
