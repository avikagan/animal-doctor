import { el, clearElement, animalImg } from '../utils/dom.js';
import { Timer } from '../systems/timer.js';

const TREATMENT_BUTTONS = [
  { icon: '\u{1F48A}', label: 'Medicine', color: '#e57373' },
  { icon: '\u{1FA79}', label: 'Bandage', color: '#64b5f6' },
  { icon: '\u{1F33F}', label: 'Herbs', color: '#81c784' },
  { icon: '\u{1F375}', label: 'Tea', color: '#ffb74d' },
  { icon: '\u{1F489}', label: 'Injection', color: '#ce93d8' },
  { icon: '\u{1F36F}', label: 'Honey', color: '#fff176' }
];

export class SimonSaysGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.buttonCount = Math.min(config.buttonCount || 4, TREATMENT_BUTTONS.length);
    this.startLength = config.startLength || 2;
    this.maxRounds = config.maxRounds || 8;

    this.sequence = [];
    this.playerIndex = 0;
    this.round = 0;
    this.matches = 0;
    this.mistakes = 0;
    this.locked = true;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.statusDisplay = null;
    this.buttons = [];
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

    this.statusDisplay = el('div', {
      className: 'simon-status',
      style: 'text-align: center; font-family: var(--font-main); font-size: 1.1rem; margin: 16px 0; min-height: 1.4em;'
    });

    const grid = el('div', { className: 'simon-grid' });
    this.buttons = [];

    for (let i = 0; i < this.buttonCount; i++) {
      const t = TREATMENT_BUTTONS[i];
      const btn = el('div', {
        className: 'simon-btn',
        style: `--btn-color: ${t.color};`
      }, [
        el('span', { style: 'font-size: 2rem;' }, [t.icon]),
        el('span', { className: 'simon-btn-label' }, [t.label])
      ]);

      btn.addEventListener('click', () => this.playerTap(i));
      grid.appendChild(btn);
      this.buttons.push(btn);
    }

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Watch the treatment sequence, then repeat it!']);

    this.container.appendChild(header);
    this.container.appendChild(this.statusDisplay);
    this.container.appendChild(grid);
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
    this.round++;
    if (this.round > this.maxRounds) {
      this.gameComplete();
      return;
    }

    // Extend the sequence
    this.sequence.push(Math.floor(Math.random() * this.buttonCount));
    this.playerIndex = 0;
    this.locked = true;
    this.statusDisplay.textContent = `Round ${this.round} \u2014 Watch carefully!`;

    // Play the sequence
    const showDelay = 600;
    this.sequence.forEach((btnIndex, i) => {
      setTimeout(() => this.flashButton(btnIndex), (i + 1) * showDelay);
    });

    // Unlock for player input after sequence finishes
    setTimeout(() => {
      this.locked = false;
      this.statusDisplay.textContent = 'Your turn! Repeat the sequence.';
    }, (this.sequence.length + 1) * showDelay);
  }

  flashButton(index) {
    const btn = this.buttons[index];
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 350);
  }

  playerTap(index) {
    if (this.locked) return;

    // Brief flash on tap
    const btn = this.buttons[index];
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 200);

    if (index === this.sequence[this.playerIndex]) {
      // Correct
      this.playerIndex++;

      if (this.playerIndex >= this.sequence.length) {
        // Completed the round
        this.matches++;
        // Bonus points for longer sequences
        const roundScore = this.sequence.length * 50;
        this.scoreDisplay.textContent = `\u2B50 ${this.matches * 100}`;
        this.locked = true;
        this.statusDisplay.textContent = '\u2705 Correct!';

        setTimeout(() => this.nextRound(), 800);
      }
    } else {
      // Wrong
      this.mistakes++;
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 400);
      this.statusDisplay.textContent = '\u274C Wrong! Watch again...';

      // Replay sequence after a short pause
      this.locked = true;
      this.playerIndex = 0;
      setTimeout(() => {
        this.statusDisplay.textContent = 'Watch carefully...';
        const showDelay = 600;
        this.sequence.forEach((btnIndex, i) => {
          setTimeout(() => this.flashButton(btnIndex), (i + 1) * showDelay);
        });
        setTimeout(() => {
          this.locked = false;
          this.statusDisplay.textContent = 'Your turn! Try again.';
        }, (this.sequence.length + 1) * showDelay);
      }, 600);
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
    this.buttons = [];
    this.sequence = [];
  }
}
