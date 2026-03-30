import { el, clearElement, animalImg } from '../utils/dom.js';
import { shuffle } from '../utils/shuffle.js';
import { Timer } from '../systems/timer.js';

// Each difference is a symptom spot the player needs to find
const DIFFERENCE_ICONS = [
  { icon: '\u{1F915}', label: 'Bruise' },
  { icon: '\u{1FA79}', label: 'Wound' },
  { icon: '\u{1F9A0}', label: 'Germ' },
  { icon: '\u{1F4A7}', label: 'Tear' },
  { icon: '\u26A0\uFE0F', label: 'Swelling' },
  { icon: '\u{1F321}\uFE0F', label: 'Fever spot' },
  { icon: '\u274C', label: 'Rash' },
  { icon: '\u{1F535}', label: 'Cold spot' }
];

export class SpotDifferenceGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.totalDiffs = config.differences || 5;
    this.rounds = config.rounds || 3;
    this.currentRound = 0;
    this.found = 0;
    this.matches = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.roundDisplay = null;
    this.gameArea = null;
    this.differences = [];
  }

  init() {
    clearElement(this.container);

    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        animalImg(this.animal, 'sick', 'emoji-medium'),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, ['\u2B50 0'])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    this.roundDisplay = el('div', { className: 'round-indicator' });
    this.gameArea = el('div', { className: 'spot-container' });

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Find the symptoms on the sick animal! Tap the differences.']);

    this.container.appendChild(header);
    this.container.appendChild(this.roundDisplay);
    this.container.appendChild(this.gameArea);
    this.container.appendChild(instructions);

    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  start() {
    this.timer.start();
    this.nextRound();
  }

  nextRound() {
    if (this.currentRound >= this.rounds) {
      this.gameComplete();
      return;
    }

    this.currentRound++;
    this.found = 0;
    this.roundDisplay.textContent = `Round ${this.currentRound} of ${this.rounds}`;
    clearElement(this.gameArea);

    // Generate random positions for differences
    const diffCount = Math.min(this.totalDiffs, DIFFERENCE_ICONS.length);
    const icons = shuffle([...DIFFERENCE_ICONS]).slice(0, diffCount);

    this.differences = icons.map((d, i) => ({
      ...d,
      x: 15 + Math.random() * 70, // 15-85% to stay in bounds
      y: 10 + Math.random() * 75,
      found: false
    }));

    // Two panels side by side
    const panels = el('div', { className: 'spot-panels' });

    // "Healthy" panel (no differences)
    const healthyPanel = el('div', { className: 'spot-panel spot-healthy' });
    const healthyLabel = el('div', { className: 'spot-panel-label' }, ['\u{1F49A} Healthy']);
    const healthyArea = el('div', { className: 'spot-area' });
    const healthyImg = animalImg(this.animal, 'default', 'emoji-large');
    healthyImg.className = 'spot-img';
    healthyArea.appendChild(healthyImg);
    healthyPanel.appendChild(healthyLabel);
    healthyPanel.appendChild(healthyArea);

    // "Sick" panel (with clickable differences)
    const sickPanel = el('div', { className: 'spot-panel spot-sick' });
    const sickLabel = el('div', { className: 'spot-panel-label' }, ['\u{1F494} Sick']);
    const sickArea = el('div', { className: 'spot-area' });
    const sickImg = animalImg(this.animal, 'default', 'emoji-large');
    sickImg.className = 'spot-img';
    sickArea.appendChild(sickImg);

    // Add difference markers (hidden until found)
    this.differences.forEach((diff, i) => {
      const marker = el('div', {
        className: 'spot-diff-marker',
        style: `left: ${diff.x}%; top: ${diff.y}%;`,
        title: diff.label
      }, [diff.icon]);
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.foundDifference(i, marker);
      });
      sickArea.appendChild(marker);
    });

    // Clicking the sick area anywhere else is a mistake
    sickArea.addEventListener('click', () => {
      if (!this.locked) {
        this.mistakes++;
        sickArea.classList.add('spot-miss');
        setTimeout(() => sickArea.classList.remove('spot-miss'), 300);
      }
    });

    sickPanel.appendChild(sickLabel);
    sickPanel.appendChild(sickArea);

    // Counter
    const counter = el('div', {
      className: 'spot-counter',
      style: 'text-align: center; margin-top: 8px; font-family: var(--font-main);'
    }, [`Found: 0 / ${diffCount}`]);
    this.counterEl = counter;

    panels.appendChild(healthyPanel);
    panels.appendChild(sickPanel);
    this.gameArea.appendChild(panels);
    this.gameArea.appendChild(counter);
  }

  foundDifference(index, marker) {
    if (this.locked) return;
    if (this.differences[index].found) return;

    this.differences[index].found = true;
    marker.classList.add('spot-found');
    this.found++;
    this.matches++;
    this.scoreDisplay.textContent = `\u2B50 ${this.matches * 100}`;
    this.counterEl.textContent = `Found: ${this.found} / ${this.differences.length}`;

    if (this.found >= this.differences.length) {
      this.locked = true;
      setTimeout(() => {
        this.locked = false;
        this.nextRound();
      }, 700);
    }
  }

  updateTimer(remaining) {
    const secs = Math.ceil(remaining);
    this.timerDisplay.textContent = `\u23F0 ${secs}s`;
    if (secs <= 10) this.timerDisplay.classList.add('warning');
  }

  gameComplete() {
    this.timer.stop();
    this.locked = true;
    if (this.onComplete) {
      this.onComplete({
        matches: this.matches,
        mistakes: this.mistakes,
        timeRemaining: this.timer.getRemaining(),
        timeLimit: this.config.timeLimit
      });
    }
  }

  timeUp() {
    this.locked = true;
    if (this.onComplete) {
      this.onComplete({
        matches: Math.max(1, this.matches),
        mistakes: this.mistakes,
        timeRemaining: 0,
        timeLimit: this.config.timeLimit
      });
    }
  }

  destroy() {
    if (this.timer) this.timer.destroy();
    this.differences = [];
  }
}
