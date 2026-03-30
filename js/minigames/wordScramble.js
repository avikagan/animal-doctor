import { el, clearElement, animalImg } from '../utils/dom.js';
import { shuffle } from '../utils/shuffle.js';
import { Timer } from '../systems/timer.js';

export class WordScrambleGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.rounds = config.rounds || 5;
    this.currentRound = 0;
    this.matches = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.roundDisplay = null;
    this.gameArea = null;
    this.selectedLetters = [];
    this.letterSlots = [];

    // Build word list from animal data
    this.words = this.buildWordList();
  }

  buildWordList() {
    const treatments = this.animal.ailment.correctTreatments.map(t => ({
      word: t.toUpperCase(),
      hint: `Treatment: ${t}`
    }));
    const symptoms = this.animal.ailment.symptoms.map(s => ({
      word: s.toUpperCase(),
      hint: `Symptom: ${s}`
    }));
    // Filter to reasonable lengths and shuffle
    return shuffle([...treatments, ...symptoms].filter(w => w.word.length <= 18));
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
    this.gameArea = el('div', { className: 'scramble-container' });

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Tap letters in order to unscramble the word!']);

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
    if (this.currentRound >= this.rounds || this.currentRound >= this.words.length) {
      this.gameComplete();
      return;
    }

    const wordData = this.words[this.currentRound];
    this.currentRound++;
    this.roundDisplay.textContent = `Round ${this.currentRound} of ${Math.min(this.rounds, this.words.length)}`;
    this.selectedLetters = [];

    clearElement(this.gameArea);

    // Hint
    const hint = el('div', {
      className: 'scramble-hint',
      style: 'text-align: center; margin-bottom: 16px; font-size: 0.9rem; color: var(--color-text-light); font-style: italic;'
    }, [`Hint: ${wordData.hint}`]);

    // Answer slots
    const answerRow = el('div', { className: 'scramble-answer' });
    this.letterSlots = [];
    for (let i = 0; i < wordData.word.length; i++) {
      const ch = wordData.word[i];
      if (ch === ' ') {
        const spacer = el('div', { className: 'scramble-slot scramble-space' });
        answerRow.appendChild(spacer);
        this.letterSlots.push({ element: spacer, char: ' ', filled: true });
      } else {
        const slot = el('div', { className: 'scramble-slot' });
        answerRow.appendChild(slot);
        this.letterSlots.push({ element: slot, char: ch, filled: false });
      }
    }

    // Scrambled letters (only non-space characters)
    const letters = wordData.word.split('').filter(c => c !== ' ');
    const scrambled = shuffle([...letters]);
    const letterRow = el('div', { className: 'scramble-letters' });

    scrambled.forEach((letter, i) => {
      const btn = el('div', {
        className: 'scramble-letter',
        'data-index': i
      }, [letter]);
      btn.addEventListener('click', () => this.tapLetter(btn, letter));
      letterRow.appendChild(btn);
    });

    this.gameArea.appendChild(hint);
    this.gameArea.appendChild(answerRow);
    this.gameArea.appendChild(letterRow);

    // Clear button
    const clearBtn = el('button', {
      className: 'btn btn-secondary',
      style: 'display: block; margin: 12px auto 0;',
      onClick: () => this.clearAnswer()
    }, ['\u{1F504} Clear']);
    this.gameArea.appendChild(clearBtn);
  }

  tapLetter(btn, letter) {
    if (this.locked) return;
    if (btn.classList.contains('used')) return;

    btn.classList.add('used');

    // Find next empty non-space slot
    const nextSlot = this.letterSlots.find(s => !s.filled);
    if (!nextSlot) return;

    nextSlot.element.textContent = letter;
    nextSlot.element.classList.add('scramble-filled');
    nextSlot.filled = true;
    this.selectedLetters.push({ btn, slot: nextSlot });

    // Check if all slots filled
    const allFilled = this.letterSlots.every(s => s.filled);
    if (allFilled) {
      this.checkAnswer();
    }
  }

  clearAnswer() {
    if (this.locked) return;
    this.selectedLetters.forEach(({ btn, slot }) => {
      btn.classList.remove('used');
      slot.element.textContent = '';
      slot.element.classList.remove('scramble-filled');
      slot.filled = false;
    });
    this.selectedLetters = [];
  }

  checkAnswer() {
    const answer = this.letterSlots.map(s => {
      if (s.char === ' ') return ' ';
      return s.element.textContent;
    }).join('');

    const target = this.words[this.currentRound - 1].word;

    if (answer === target) {
      this.matches++;
      this.scoreDisplay.textContent = `\u2B50 ${this.matches * 100}`;
      this.letterSlots.forEach(s => s.element.classList.add('scramble-correct'));
      this.locked = true;
      setTimeout(() => {
        this.locked = false;
        this.nextRound();
      }, 700);
    } else {
      this.mistakes++;
      this.letterSlots.forEach(s => {
        if (s.char !== ' ') s.element.classList.add('scramble-wrong');
      });
      setTimeout(() => {
        this.letterSlots.forEach(s => s.element.classList.remove('scramble-wrong'));
        this.clearAnswer();
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
    this.selectedLetters = [];
    this.letterSlots = [];
  }
}
