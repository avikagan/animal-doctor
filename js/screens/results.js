import { el, showScreen, clearElement, animalImg } from '../utils/dom.js';
import { getState, updateJournal, updateHighScore } from '../state.js';
import { getAnimalById, getConservationInfo } from '../data/animals.js';
import { calculateScore } from '../systems/scoring.js';

export function render(gameResults) {
  const screen = showScreen('results');
  clearElement(screen);

  const state = getState();
  const animal = getAnimalById(state.selectedAnimal);
  if (!animal) return;

  const scoreData = calculateScore({
    matches: gameResults.matches,
    mistakes: gameResults.mistakes,
    timeRemaining: gameResults.timeRemaining,
    timeLimit: gameResults.timeLimit,
    conservationStatus: animal.conservationStatus
  });

  // Update state
  const prevJournal = state.journal[animal.id];
  const wasUnlocked = prevJournal?.unlocked;
  const prevFacts = prevJournal?.factsRevealed || 0;

  updateJournal(animal.id, {
    unlocked: true,
    factsRevealed: Math.max(prevFacts, scoreData.stars),
    healCount: (prevJournal?.healCount || 0) + 1
  });
  updateHighScore(animal.id, scoreData.finalScore);

  const conservation = getConservationInfo(animal.conservationStatus);
  const newUnlock = !wasUnlocked;
  const newFacts = scoreData.stars > prevFacts;

  const starsStr = '\u2B50'.repeat(scoreData.stars) + '\u2606'.repeat(3 - scoreData.stars);

  const container = el('div', { className: 'text-center' }, [
    // Healed animal
    el('div', { className: 'mt-2 mb-2' }, [
      animalImg(animal, gameResults.timeRemaining > 0 ? 'healthy' : 'sick', gameResults.timeRemaining > 0 ? 'emoji-hero' : 'emoji-large'),
      el('h2', { className: 'mt-1 anim-pop-in' }, [
        gameResults.timeRemaining > 0 ? `${animal.name} feels better!` : 'Time\'s up!'
      ]),
      el('div', { className: 'stars-display mt-1', style: 'font-size: 2rem;' }, [starsStr])
    ]),

    // Score breakdown
    el('div', { className: 'card mt-2', style: 'max-width: 400px; margin-left: auto; margin-right: auto; text-align: left;' }, [
      el('h3', { className: 'text-center mb-2' }, ['Score Breakdown']),
      scoreRow('Matches', `${gameResults.matches} \u00D7 100`, scoreData.basePoints),
      scoreRow('Accuracy', `${scoreData.accuracy}%`, scoreData.accuracyBonus),
      scoreData.perfectBonus > 0 ? scoreRow('Perfect Run!', '\u{1F31F}', scoreData.perfectBonus) : null,
      scoreRow('Speed Bonus', '', scoreData.speedBonus),
      el('hr', { style: 'margin: 8px 0; border: 1px solid var(--color-bg-dark);' }),
      scoreRow('Subtotal', '', scoreData.subtotal),
      el('div', {
        className: 'flex justify-between items-center',
        style: 'padding: 4px 0; color: var(--color-primary-dark); font-weight: 700;'
      }, [
        el('span', {}, [`Conservation Bonus (${conservation.label})`]),
        el('span', {}, [`\u00D7${scoreData.multiplier}`])
      ]),
      el('hr', { style: 'margin: 8px 0; border: 2px solid var(--color-primary);' }),
      el('div', {
        className: 'flex justify-between items-center',
        style: 'padding: 4px 0; font-family: var(--font-main); font-size: 1.3rem;'
      }, [
        el('span', {}, ['Total']),
        el('span', { style: 'color: var(--color-primary-dark);' }, [`${scoreData.finalScore}`])
      ])
    ].filter(Boolean)),

    // Notifications
    newUnlock ? el('div', { className: 'card mt-2 anim-pop-in', style: 'background: #e8f5e9; max-width: 400px; margin-left: auto; margin-right: auto;' }, [
      el('p', { style: 'font-family: var(--font-main); font-size: 1.1rem;' }, [
        `\u{1F4D6} New Journal Entry Unlocked: ${animal.name}!`
      ])
    ]) : null,

    newFacts && !newUnlock ? el('div', { className: 'card mt-2 anim-pop-in', style: 'background: #fff8e1; max-width: 400px; margin-left: auto; margin-right: auto;' }, [
      el('p', { style: 'font-family: var(--font-main); font-size: 1rem;' }, [
        `\u{1F31F} New facts unlocked in journal! (${scoreData.stars}\u2B50)`
      ])
    ]) : null,

    // Buttons
    el('div', { className: 'flex flex-wrap justify-center gap-2 mt-3 mb-2' }, [
      el('button', {
        className: 'btn btn-primary',
        onClick: () => import('./minigame.js').then(m => m.render())
      }, ['\u{1F504} Play Again']),
      el('button', {
        className: 'btn btn-accent',
        onClick: () => import('./journal.js').then(m => m.renderDetail(animal.id))
      }, ['\u{1F4D6} View Journal']),
      el('button', {
        className: 'btn btn-secondary',
        onClick: () => import('./animalSelect.js').then(m => m.render())
      }, ['Next Animal \u2192']),
      el('button', {
        className: 'btn btn-secondary',
        onClick: () => import('./mainMenu.js').then(m => m.render())
      }, ['\u{1F3E0} Menu'])
    ])
  ].filter(Boolean));

  screen.appendChild(container);
}

function scoreRow(label, detail, points) {
  return el('div', { className: 'flex justify-between items-center', style: 'padding: 4px 0;' }, [
    el('span', { style: 'color: var(--color-text-light);' }, [
      detail ? `${label} (${detail})` : label
    ]),
    el('span', { style: 'font-weight: 700;' }, [`+${points}`])
  ]);
}
