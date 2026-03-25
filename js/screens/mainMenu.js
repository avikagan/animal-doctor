import { el, showScreen, clearElement } from '../utils/dom.js';
import { getState } from '../state.js';
import { ANIMALS } from '../data/animals.js';

export function render() {
  const screen = showScreen('mainMenu');
  clearElement(screen);

  const state = getState();

  const container = el('div', { className: 'text-center' }, [
    el('div', { className: 'mt-3 mb-3' }, [
      el('div', { className: 'anim-float', style: 'font-size: 100px; line-height: 1;' }, ['\u{1FA7A}']),
      el('h1', { className: 'mt-2', style: 'font-size: 2.8rem; color: var(--color-primary-dark);' }, ['Animal Doctor']),
      el('p', { className: 'mt-1', style: 'font-size: 1.1rem; color: var(--color-text-light);' }, [
        'Help sick animals feel better!'
      ])
    ]),
    el('div', { className: 'flex flex-col items-center gap-2 mt-3' }, [
      el('button', {
        className: 'btn btn-primary btn-large',
        onClick: () => {
          import('./animalSelect.js').then(m => m.render());
        }
      }, ['\u{1F3AE} Play']),
      el('button', {
        className: 'btn btn-secondary btn-large',
        onClick: () => {
          import('./journal.js').then(m => m.render());
        }
      }, ['\u{1F4D6} Journal']),
    ]),
    el('div', { className: 'mt-3' }, [
      el('div', { className: 'card', style: 'display: inline-block; padding: 12px 24px;' }, [
        el('span', { style: 'font-size: 0.9rem; color: var(--color-text-light);' }, [
          `Total Score: `
        ]),
        el('span', { className: 'total-score-value', style: 'font-family: var(--font-main); font-size: 1.1rem;' }, [
          `${state.totalScore}`
        ])
      ])
    ]),
    el('div', { className: 'mt-3' }, [
      el('div', { style: 'font-size: 36px; display: flex; justify-content: center; gap: 8px;' },
        ANIMALS.map(a => el('span', { className: 'anim-float', style: `animation-delay: ${Math.random() * 2}s;` }, [a.emoji]))
      )
    ])
  ]);

  screen.appendChild(container);
}
