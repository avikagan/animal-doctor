import { el, clearElement } from '../utils/dom.js';
import { Timer } from '../systems/timer.js';

const TILE_TYPES = [
  { icon: '\u{1F48A}', color: '#e57373' },  // pill - red
  { icon: '\u{1F33F}', color: '#81c784' },  // herb - green
  { icon: '\u{1F48E}', color: '#64b5f6' },  // crystal - blue
  { icon: '\u{1F36F}', color: '#ffb74d' },  // honey - orange
  { icon: '\u{1F33B}', color: '#fff176' },  // flower - yellow
  { icon: '\u{1F52C}', color: '#ce93d8' },  // microscope - purple
  { icon: '\u2764\uFE0F', color: '#f48fb1' } // heart - pink
];

export class MatchThreeGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.gridSize = config.gridSize || 6;
    // Use fewer tile types to make matches much easier to find
    this.tileTypes = Math.min(config.tileTypes || 5, TILE_TYPES.length);
    if (this.tileTypes > 4) this.tileTypes = 4; // cap at 4 for playability
    this.targetScore = config.targetScore || 500;
    this.board = [];
    this.selected = null;
    this.score = 0;
    this.matches = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.gridEl = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.hintTimeout = null;
  }

  init() {
    clearElement(this.container);
    this.buildBoard();

    // Header
    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        el('span', { style: 'font-size: 24px;' }, [this.animal.emoji]),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, [`\u2B50 0 / ${this.targetScore}`])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    // Grid
    this.gridEl = el('div', { className: 'match3-grid' });
    this.gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
    this.renderBoard();

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Tap a tile, then tap an adjacent tile to swap them and match 3 in a row!']);

    this.container.appendChild(header);
    this.container.appendChild(this.gridEl);
    this.container.appendChild(instructions);

    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  buildBoard() {
    this.board = [];
    for (let r = 0; r < this.gridSize; r++) {
      this.board[r] = [];
      for (let c = 0; c < this.gridSize; c++) {
        this.board[r][c] = this.randomTile(r, c);
      }
    }
    // Ensure there are valid moves; if not, regenerate
    let attempts = 0;
    while (!this.hasValidMoves() && attempts < 50) {
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          this.board[r][c] = this.randomTile(r, c);
        }
      }
      attempts++;
    }
  }

  randomTile(row, col) {
    let type;
    let attempts = 0;
    do {
      type = Math.floor(Math.random() * this.tileTypes);
      attempts++;
    } while (attempts < 20 && this.wouldMatch(row, col, type));
    return type;
  }

  wouldMatch(row, col, type) {
    if (col >= 2 && this.board[row]?.[col - 1] === type && this.board[row]?.[col - 2] === type) return true;
    if (row >= 2 && this.board[row - 1]?.[col] === type && this.board[row - 2]?.[col] === type) return true;
    return false;
  }

  hasValidMoves() {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        // Try swap right
        if (c + 1 < this.gridSize) {
          this.swapBoard(r, c, r, c + 1);
          if (this.findMatches().length > 0) { this.swapBoard(r, c, r, c + 1); return true; }
          this.swapBoard(r, c, r, c + 1);
        }
        // Try swap down
        if (r + 1 < this.gridSize) {
          this.swapBoard(r, c, r + 1, c);
          if (this.findMatches().length > 0) { this.swapBoard(r, c, r + 1, c); return true; }
          this.swapBoard(r, c, r + 1, c);
        }
      }
    }
    return false;
  }

  findHint() {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (c + 1 < this.gridSize) {
          this.swapBoard(r, c, r, c + 1);
          if (this.findMatches().length > 0) { this.swapBoard(r, c, r, c + 1); return [{row: r, col: c}, {row: r, col: c+1}]; }
          this.swapBoard(r, c, r, c + 1);
        }
        if (r + 1 < this.gridSize) {
          this.swapBoard(r, c, r + 1, c);
          if (this.findMatches().length > 0) { this.swapBoard(r, c, r + 1, c); return [{row: r, col: c}, {row: r+1, col: c}]; }
          this.swapBoard(r, c, r + 1, c);
        }
      }
    }
    return null;
  }

  swapBoard(r1, c1, r2, c2) {
    [this.board[r1][c1], this.board[r2][c2]] = [this.board[r2][c2], this.board[r1][c1]];
  }

  showHint() {
    const hint = this.findHint();
    if (!hint) return;
    hint.forEach(({row, col}) => {
      const tileEl = this.getTileEl(row, col);
      if (tileEl) {
        tileEl.classList.add('hint');
      }
    });
  }

  clearHints() {
    if (!this.gridEl) return;
    this.gridEl.querySelectorAll('.hint').forEach(t => t.classList.remove('hint'));
  }

  resetHintTimer() {
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
    this.clearHints();
    this.hintTimeout = setTimeout(() => {
      if (!this.locked) this.showHint();
    }, 4000);
  }

  renderBoard() {
    clearElement(this.gridEl);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const type = this.board[r][c];
        const tileInfo = TILE_TYPES[type];
        const tile = el('div', {
          className: 'match3-tile',
          style: `background: ${tileInfo.color}33; border: 3px solid ${tileInfo.color};`,
          onClick: () => this.selectTile(r, c)
        }, [tileInfo.icon]);
        this.gridEl.appendChild(tile);
      }
    }
  }

  getTileEl(row, col) {
    return this.gridEl.children[row * this.gridSize + col];
  }

  selectTile(row, col) {
    if (this.locked) return;
    this.clearHints();

    if (this.selected === null) {
      this.selected = { row, col };
      const tileEl = this.getTileEl(row, col);
      if (tileEl) tileEl.classList.add('selected');
    } else {
      const prev = this.selected;
      const prevEl = this.getTileEl(prev.row, prev.col);
      if (prevEl) prevEl.classList.remove('selected');

      // Clicking the same tile deselects it
      if (row === prev.row && col === prev.col) {
        this.selected = null;
        this.resetHintTimer();
        return;
      }

      const dr = Math.abs(row - prev.row);
      const dc = Math.abs(col - prev.col);
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        this.trySwap(prev.row, prev.col, row, col);
      } else {
        // Not adjacent — select new tile instead
        this.selected = { row, col };
        const tileEl = this.getTileEl(row, col);
        if (tileEl) tileEl.classList.add('selected');
        return;
      }
      this.selected = null;
    }
  }

  async trySwap(r1, c1, r2, c2) {
    this.locked = true;

    // Visual swap animation
    const tile1 = this.getTileEl(r1, c1);
    const tile2 = this.getTileEl(r2, c2);

    // Animate the swap
    const dx = (c2 - c1) * 100;
    const dy = (r2 - r1) * 100;
    if (tile1) tile1.style.transition = 'transform 0.2s ease';
    if (tile2) tile2.style.transition = 'transform 0.2s ease';
    if (tile1) tile1.style.transform = `translate(${dx}%, ${dy}%)`;
    if (tile2) tile2.style.transform = `translate(${-dx}%, ${-dy}%)`;

    await this.wait(200);

    // Actually swap in board
    this.swapBoard(r1, c1, r2, c2);

    const allMatches = this.findMatches();
    if (allMatches.length > 0) {
      this.renderBoard();
      await this.processMatches(allMatches);
    } else {
      // Swap back — show brief shake animation
      this.swapBoard(r1, c1, r2, c2);

      // Animate swap back
      if (tile1) tile1.style.transform = '';
      if (tile2) tile2.style.transform = '';
      await this.wait(200);

      // Shake to indicate invalid
      if (tile1) { tile1.style.transition = ''; tile1.classList.add('invalid-swap'); }
      if (tile2) { tile2.style.transition = ''; tile2.classList.add('invalid-swap'); }
      await this.wait(400);
      if (tile1) tile1.classList.remove('invalid-swap');
      if (tile2) tile2.classList.remove('invalid-swap');

      this.mistakes++;
    }

    this.locked = false;
    this.resetHintTimer();

    // If no valid moves remain, shuffle the board
    if (!this.hasValidMoves()) {
      await this.shuffleBoard();
    }
  }

  async shuffleBoard() {
    this.locked = true;
    // Collect all tile types, shuffle, redistribute
    const allTypes = [];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        allTypes.push(this.board[r][c]);
      }
    }
    // Fisher-Yates shuffle
    for (let i = allTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTypes[i], allTypes[j]] = [allTypes[j], allTypes[i]];
    }
    let idx = 0;
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.board[r][c] = allTypes[idx++];
      }
    }

    // Clear any accidental matches from the shuffle
    let clearMatches = this.findMatches();
    while (clearMatches.length > 0) {
      clearMatches.forEach(({row, col}) => {
        this.board[row][col] = Math.floor(Math.random() * this.tileTypes);
      });
      clearMatches = this.findMatches();
    }

    this.renderBoard();
    this.locked = false;
  }

  findMatches() {
    const matched = new Set();

    // Horizontal
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c <= this.gridSize - 3; c++) {
        const t = this.board[r][c];
        if (t !== -1 && this.board[r][c + 1] === t && this.board[r][c + 2] === t) {
          let end = c + 2;
          while (end + 1 < this.gridSize && this.board[r][end + 1] === t) end++;
          for (let i = c; i <= end; i++) matched.add(`${r},${i}`);
        }
      }
    }

    // Vertical
    for (let c = 0; c < this.gridSize; c++) {
      for (let r = 0; r <= this.gridSize - 3; r++) {
        const t = this.board[r][c];
        if (t !== -1 && this.board[r + 1][c] === t && this.board[r + 2][c] === t) {
          let end = r + 2;
          while (end + 1 < this.gridSize && this.board[end + 1][c] === t) end++;
          for (let i = r; i <= end; i++) matched.add(`${i},${c}`);
        }
      }
    }

    return [...matched].map(s => {
      const [r, c] = s.split(',').map(Number);
      return { row: r, col: c };
    });
  }

  async processMatches(matchedCells) {
    const pointsPerTile = 10;
    const matchCount = matchedCells.length;
    this.score += matchCount * pointsPerTile;
    this.matches += Math.floor(matchCount / 3);
    this.scoreDisplay.textContent = `\u2B50 ${this.score} / ${this.targetScore}`;

    // Animate removal
    matchedCells.forEach(({ row, col }) => {
      const tileEl = this.getTileEl(row, col);
      if (tileEl) tileEl.classList.add('removing');
      this.board[row][col] = -1;
    });

    await this.wait(350);

    // Gravity
    for (let c = 0; c < this.gridSize; c++) {
      let writeRow = this.gridSize - 1;
      for (let r = this.gridSize - 1; r >= 0; r--) {
        if (this.board[r][c] !== -1) {
          this.board[writeRow][c] = this.board[r][c];
          if (writeRow !== r) this.board[r][c] = -1;
          writeRow--;
        }
      }
      for (let r = writeRow; r >= 0; r--) {
        this.board[r][c] = Math.floor(Math.random() * this.tileTypes);
      }
    }

    this.renderBoard();
    await this.wait(250);

    // Cascades
    const newMatches = this.findMatches();
    if (newMatches.length > 0) {
      await this.processMatches(newMatches);
    }

    // Check win
    if (this.score >= this.targetScore) {
      this.gameComplete();
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  start() {
    this.timer.start();
    this.resetHintTimer();
  }

  updateTimer(remaining) {
    const secs = Math.ceil(remaining);
    this.timerDisplay.textContent = `\u23F0 ${secs}s`;
    if (secs <= 10) this.timerDisplay.classList.add('warning');
  }

  gameComplete() {
    this.timer.stop();
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
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
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
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
    if (this.hintTimeout) clearTimeout(this.hintTimeout);
    this.selected = null;
  }
}
