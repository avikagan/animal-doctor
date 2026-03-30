import { el, clearElement, animalImg } from '../utils/dom.js';
import { Timer } from '../systems/timer.js';

export class SliderPuzzleGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.gridSize = config.gridSize || 3;
    this.totalTiles = this.gridSize * this.gridSize;
    this.tiles = [];
    this.emptyIndex = this.totalTiles - 1;
    this.moves = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.gridEl = null;

    // Anatomy/x-ray icons for tiles
    this.tileIcons = this.buildTileIcons();
  }

  buildTileIcons() {
    const icons = [
      '\u{1F9B4}', '\u{1FAC0}', '\u{1FAC1}', '\u{1F9E0}',
      '\u{1F441}\uFE0F', '\u{1F9B7}', '\u{1F4AA}', '\u{1F9B6}',
      '\u{1F463}', '\u{1F490}', '\u2764\uFE0F', '\u{1F33F}',
      '\u{1F33B}', '\u{1F48A}', '\u{1FA79}', '\u{1F52C}'
    ];
    return icons.slice(0, this.totalTiles - 1);
  }

  init() {
    clearElement(this.container);

    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        animalImg(this.animal, 'sick', 'emoji-medium'),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, ['\u2B50 0 moves'])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    this.gridEl = el('div', { className: 'slider-grid' });
    this.gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    // Create solved state then shuffle
    this.tiles = [];
    for (let i = 0; i < this.totalTiles - 1; i++) {
      this.tiles.push(i);
    }
    this.tiles.push(-1); // empty
    this.emptyIndex = this.totalTiles - 1;

    this.shuffleBoard();
    this.renderBoard();

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Slide the tiles to put them in the correct order!']);

    this.container.appendChild(header);
    this.container.appendChild(this.gridEl);
    this.container.appendChild(instructions);

    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  shuffleBoard() {
    // Perform random valid moves to ensure solvability
    const shuffleMoves = this.gridSize === 3 ? 100 : 200;
    for (let i = 0; i < shuffleMoves; i++) {
      const neighbors = this.getNeighbors(this.emptyIndex);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.tiles[this.emptyIndex] = this.tiles[pick];
      this.tiles[pick] = -1;
      this.emptyIndex = pick;
    }
  }

  getNeighbors(index) {
    const row = Math.floor(index / this.gridSize);
    const col = index % this.gridSize;
    const neighbors = [];
    if (row > 0) neighbors.push(index - this.gridSize);
    if (row < this.gridSize - 1) neighbors.push(index + this.gridSize);
    if (col > 0) neighbors.push(index - 1);
    if (col < this.gridSize - 1) neighbors.push(index + 1);
    return neighbors;
  }

  renderBoard() {
    clearElement(this.gridEl);
    this.tiles.forEach((tile, index) => {
      if (tile === -1) {
        const empty = el('div', { className: 'slider-tile slider-empty' });
        this.gridEl.appendChild(empty);
      } else {
        const isCorrect = tile === index;
        const tileEl = el('div', {
          className: `slider-tile ${isCorrect ? 'slider-correct' : ''}`
        }, [
          el('span', { style: 'font-size: 1.6rem;' }, [this.tileIcons[tile] || '\u{1F48A}']),
          el('span', { className: 'slider-tile-num' }, [`${tile + 1}`])
        ]);
        tileEl.addEventListener('click', () => this.tapTile(index));
        this.gridEl.appendChild(tileEl);
      }
    });
  }

  tapTile(index) {
    if (this.locked) return;

    const neighbors = this.getNeighbors(index);
    if (!neighbors.includes(this.emptyIndex)) {
      this.mistakes++;
      return;
    }

    // Swap
    this.tiles[this.emptyIndex] = this.tiles[index];
    this.tiles[index] = -1;
    this.emptyIndex = index;
    this.moves++;
    this.scoreDisplay.textContent = `\u2B50 ${this.moves} moves`;

    this.renderBoard();

    if (this.isSolved()) {
      this.gameComplete();
    }
  }

  isSolved() {
    for (let i = 0; i < this.totalTiles - 1; i++) {
      if (this.tiles[i] !== i) return false;
    }
    return true;
  }

  start() {
    this.timer.start();
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
      // Convert moves into a matches/mistakes score the scoring system understands
      // Fewer moves = better. Give credit for solving it.
      const optimalMoves = this.gridSize * this.gridSize * 2;
      const efficiency = Math.max(1, Math.round((optimalMoves / Math.max(1, this.moves)) * 10));
      this.onComplete({
        matches: efficiency,
        mistakes: this.mistakes,
        timeRemaining: this.timer.getRemaining(),
        timeLimit: this.config.timeLimit
      });
    }
  }

  timeUp() {
    this.locked = true;
    // Count how many tiles are in the correct position
    let correctCount = 0;
    for (let i = 0; i < this.totalTiles - 1; i++) {
      if (this.tiles[i] === i) correctCount++;
    }
    if (this.onComplete) {
      this.onComplete({
        matches: Math.max(1, correctCount),
        mistakes: this.mistakes,
        timeRemaining: 0,
        timeLimit: this.config.timeLimit
      });
    }
  }

  destroy() {
    if (this.timer) this.timer.destroy();
    this.tiles = [];
  }
}
