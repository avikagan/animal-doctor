import { el, showScreen, clearElement } from '../utils/dom.js';
import { getState, setState } from '../state.js';
import { ANIMALS, getConservationInfo } from '../data/animals.js';

export function render() {
  const screen = showScreen('animalSelect');
  clearElement(screen);

  const state = getState();

  const header = el('div', { className: 'flex items-center justify-between mb-2' }, [
    el('button', {
      className: 'btn btn-secondary',
      onClick: () => import('./mainMenu.js').then(m => m.render())
    }, ['\u2190 Back']),
    el('h2', {}, ['Choose Your Patient'])
  ]);

  const grid = el('div', { className: 'animal-grid' });

  ANIMALS.forEach(animal => {
    const conservation = getConservationInfo(animal.conservationStatus);
    const journalEntry = state.journal[animal.id];
    const healed = journalEntry && journalEntry.unlocked;
    const bestScore = state.highScores[animal.id]?.best || 0;

    const stars = '\u2B50'.repeat(animal.difficulty) + '\u2606'.repeat(5 - animal.difficulty);

    const card = el('div', {
      className: `card animal-card ${healed ? 'healed' : ''}`,
      onClick: () => {
        setState({ selectedAnimal: animal.id });
        import('./diagnosis.js').then(m => m.render());
      }
    }, [
      el('span', { className: 'emoji-large' }, [animal.emoji]),
      el('div', { className: 'animal-name' }, [animal.name]),
      el('div', { className: 'animal-species' }, [animal.species]),
      el('span', {
        className: `badge badge-${animal.conservationStatus.toLowerCase()}`,
        style: `background: ${conservation.color}; color: ${animal.conservationStatus === 'VU' ? 'var(--color-text)' : 'white'};`
      }, [conservation.label]),
      el('div', { className: 'difficulty-stars mt-1' }, [stars]),
      el('div', { className: 'mt-1', style: 'font-size: 0.8rem; color: var(--color-text-light);' }, [
        `${conservation.multiplier}x score multiplier`
      ]),
      bestScore > 0
        ? el('div', { className: 'best-score' }, [`Best: ${bestScore} pts`])
        : el('div', { className: 'best-score' }, ['Not yet treated'])
    ]);

    grid.appendChild(card);
  });

  screen.appendChild(header);
  screen.appendChild(grid);
}
