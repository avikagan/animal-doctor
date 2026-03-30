import { el, clearElement, animalImg } from '../utils/dom.js';
import { shuffle } from '../utils/shuffle.js';
import { Timer } from '../systems/timer.js';

const TREATMENT_ICONS = [
  '\u{1F48A}', '\u{1FA79}', '\u{1F33F}', '\u{1F375}', '\u{1F36F}',
  '\u{1F33B}', '\u{1F489}', '\u{1F9EA}', '\u2764\uFE0F', '\u{1F33E}',
  '\u{1F952}', '\u{1F96C}'
];

export class MatchPairsGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.pairs = config.pairs || 6;
    this.cards = [];
    this.flipped = [];
    this.matched = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.currentScore = 0;
  }

  init() {
    clearElement(this.container);

    // Build card data
    const treatments = this.animal.ailment.correctTreatments.slice(0, this.pairs);
    while (treatments.length < this.pairs) {
      treatments.push(`Treatment ${treatments.length + 1}`);
    }

    const icons = TREATMENT_ICONS.slice(0, this.pairs);
    const cardData = [];
    for (let i = 0; i < this.pairs; i++) {
      const data = { id: i, icon: icons[i] || '\u{1F48A}', label: treatments[i] };
      cardData.push({ ...data, uid: i * 2 });
      cardData.push({ ...data, uid: i * 2 + 1 });
    }

    this.cardData = shuffle(cardData);

    // Game header
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

    // Grid
    const cols = this.pairs <= 6 ? 4 : this.pairs <= 8 ? 4 : 5;
    const grid = el('div', { className: `match-grid cols-${cols}` });

    this.cardData.forEach((data, index) => {
      const card = el('div', { className: 'match-card', 'data-uid': data.uid });
      const inner = el('div', { className: 'match-card-inner' });

      const back = el('div', { className: 'match-card-back' }, ['?']);
      const front = el('div', { className: 'match-card-front' }, [
        el('span', { style: 'font-size: 1.8rem;' }, [data.icon]),
        el('span', { className: 'card-label' }, [data.label])
      ]);

      inner.appendChild(back);
      inner.appendChild(front);
      card.appendChild(inner);

      card.addEventListener('click', () => this.flipCard(card, data));
      grid.appendChild(card);
      this.cards.push({ element: card, data });
    });

    // Instructions
    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Flip cards to find matching treatment pairs!']);

    this.container.appendChild(header);
    this.container.appendChild(grid);
    this.container.appendChild(instructions);

    // Timer
    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  start() {
    this.timer.start();
  }

  updateTimer(remaining) {
    const secs = Math.ceil(remaining);
    this.timerDisplay.textContent = `\u23F0 ${secs}s`;
    if (secs <= 10) {
      this.timerDisplay.classList.add('warning');
    }
  }

  flipCard(cardEl, data) {
    if (this.locked) return;
    if (cardEl.classList.contains('flipped')) return;
    if (cardEl.classList.contains('matched')) return;

    cardEl.classList.add('flipped');
    this.flipped.push({ element: cardEl, data });

    if (this.flipped.length === 2) {
      this.locked = true;
      const [first, second] = this.flipped;

      if (first.data.id === second.data.id) {
        // Match!
        this.matched++;
        this.currentScore += 100;
        this.scoreDisplay.textContent = `\u2B50 ${this.currentScore}`;

        setTimeout(() => {
          first.element.classList.add('matched');
          second.element.classList.add('matched');
          this.flipped = [];
          this.locked = false;

          if (this.matched >= this.pairs) {
            this.gameComplete();
          }
        }, 300);
      } else {
        // No match
        this.mistakes++;
        setTimeout(() => {
          first.element.classList.remove('flipped');
          second.element.classList.remove('flipped');
          this.flipped = [];
          this.locked = false;
        }, 800);
      }
    }
  }

  gameComplete() {
    this.timer.stop();
    if (this.onComplete) {
      this.onComplete({
        matches: this.matched,
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
        matches: this.matched,
        mistakes: this.mistakes,
        timeRemaining: 0,
        timeLimit: this.config.timeLimit
      });
    }
  }

  destroy() {
    if (this.timer) this.timer.destroy();
    this.cards = [];
    this.flipped = [];
  }
}
