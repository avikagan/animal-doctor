import { el, clearElement, animalImg } from '../utils/dom.js';
import { Timer } from '../systems/timer.js';

const GERM_EMOJIS = ['\u{1F9A0}', '\u{1F47E}', '\u{1F47B}', '\u{1FAB4}', '\u{1F4A5}'];

export class GermZapperGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.gridSize = config.gridSize || 4;
    this.targetZaps = config.targetZaps || 20;
    this.spawnInterval = config.spawnInterval || 1200;
    this.germLifetime = config.germLifetime || 2000;
    this.maxGerms = config.maxGerms || 3;

    this.zaps = 0;
    this.mistakes = 0;
    this.missed = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.gridEl = null;
    this.cells = [];
    this.activeGerms = new Map();
    this.spawnTimer = null;
  }

  init() {
    clearElement(this.container);

    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        animalImg(this.animal, 'sick', 'emoji-medium'),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, [`\u2B50 0 / ${this.targetZaps}`])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    this.gridEl = el('div', { className: 'zapper-grid' });
    this.gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    this.cells = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const cell = el('div', { className: 'zapper-cell' });
      cell.addEventListener('click', () => this.tapCell(i));
      this.gridEl.appendChild(cell);
      this.cells.push(cell);
    }

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Tap the germs before they escape!']);

    this.container.appendChild(header);
    this.container.appendChild(this.gridEl);
    this.container.appendChild(instructions);

    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  start() {
    this.timer.start();
    this.scheduleSpawn();
  }

  scheduleSpawn() {
    // Vary spawn rate a bit for unpredictability
    const jitter = (Math.random() - 0.5) * this.spawnInterval * 0.4;
    const delay = Math.max(300, this.spawnInterval + jitter);

    this.spawnTimer = setTimeout(() => {
      if (!this.locked) {
        this.spawnGerm();
        this.scheduleSpawn();
      }
    }, delay);
  }

  spawnGerm() {
    if (this.activeGerms.size >= this.maxGerms) return;

    // Find empty cells
    const emptyCells = [];
    for (let i = 0; i < this.cells.length; i++) {
      if (!this.activeGerms.has(i)) emptyCells.push(i);
    }
    if (emptyCells.length === 0) return;

    const cellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const emoji = GERM_EMOJIS[Math.floor(Math.random() * GERM_EMOJIS.length)];
    const cell = this.cells[cellIndex];

    const germ = el('span', { className: 'zapper-germ' }, [emoji]);
    cell.appendChild(germ);

    // Auto-remove after lifetime
    const timeout = setTimeout(() => {
      this.removeGerm(cellIndex, false);
    }, this.germLifetime);

    this.activeGerms.set(cellIndex, { element: germ, timeout });
  }

  tapCell(index) {
    if (this.locked) return;

    if (this.activeGerms.has(index)) {
      this.removeGerm(index, true);
      this.zaps++;
      this.scoreDisplay.textContent = `\u2B50 ${this.zaps} / ${this.targetZaps}`;

      // Zap effect
      const cell = this.cells[index];
      cell.classList.add('zapped');
      setTimeout(() => cell.classList.remove('zapped'), 300);

      if (this.zaps >= this.targetZaps) {
        this.gameComplete();
      }
    } else {
      // Tapped empty cell
      this.mistakes++;
      const cell = this.cells[index];
      cell.classList.add('miss');
      setTimeout(() => cell.classList.remove('miss'), 300);
    }
  }

  removeGerm(index, wasZapped) {
    const germ = this.activeGerms.get(index);
    if (!germ) return;

    clearTimeout(germ.timeout);
    germ.element.remove();
    this.activeGerms.delete(index);

    if (!wasZapped) {
      this.missed++;
      this.mistakes++;
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
    this.clearAllGerms();
    if (this.onComplete) {
      this.onComplete({
        matches: this.zaps,
        mistakes: this.mistakes,
        timeRemaining: this.timer.getRemaining(),
        timeLimit: this.config.timeLimit
      });
    }
  }

  timeUp() {
    this.locked = true;
    this.clearAllGerms();
    if (this.onComplete) {
      this.onComplete({
        matches: Math.max(1, this.zaps),
        mistakes: this.mistakes,
        timeRemaining: 0,
        timeLimit: this.config.timeLimit
      });
    }
  }

  clearAllGerms() {
    clearTimeout(this.spawnTimer);
    for (const [index] of this.activeGerms) {
      this.removeGerm(index, false);
    }
  }

  destroy() {
    if (this.timer) this.timer.destroy();
    this.clearAllGerms();
    this.cells = [];
  }
}
