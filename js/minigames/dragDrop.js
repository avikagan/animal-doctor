import { el, clearElement } from '../utils/dom.js';
import { shuffle } from '../utils/shuffle.js';
import { Timer } from '../systems/timer.js';

export class DragDropGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.rounds = config.rounds || 5;
    this.currentRound = 0;
    this.matches = 0;
    this.mistakes = 0;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.roundDisplay = null;
    this.gameArea = null;
    this.locked = false;

    // Touch drag state
    this.draggedEl = null;
    this.draggedData = null;
    this.touchOffset = { x: 0, y: 0 };
  }

  init() {
    clearElement(this.container);

    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        el('span', { style: 'font-size: 24px;' }, [this.animal.emoji]),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, ['\u2B50 0'])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    this.roundDisplay = el('div', { className: 'round-indicator' });
    this.gameArea = el('div', { className: 'dragdrop-container' });

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Drag the correct treatment to each symptom!']);

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
    this.roundDisplay.textContent = `Round ${this.currentRound} of ${this.rounds}`;
    clearElement(this.gameArea);

    const itemCount = Math.min(2 + this.currentRound, this.config.itemsPerRound || 4);

    // Pick symptoms and matching treatments
    const symptoms = this.animal.ailment.symptoms.slice(0, itemCount);
    const correct = this.animal.ailment.correctTreatments.slice(0, itemCount);
    const wrong = this.animal.ailment.wrongTreatments.slice(0, Math.max(1, itemCount - 2));

    const pairings = symptoms.map((s, i) => ({
      symptom: s,
      treatment: correct[i] || correct[0]
    }));

    const allTreatments = shuffle([
      ...pairings.map(p => ({ text: p.treatment, correct: true, forSymptom: p.symptom })),
      ...wrong.map(w => ({ text: w, correct: false, forSymptom: null }))
    ]);

    // Symptoms column
    const symptomsCol = el('div', { className: 'symptoms-column' }, [
      el('h3', {}, ['Symptoms'])
    ]);

    this.roundSlots = [];
    this.roundMatched = 0;
    this.roundTotal = pairings.length;

    pairings.forEach(pair => {
      const slot = el('div', {
        className: 'symptom-slot',
        'data-symptom': pair.symptom,
        'data-expected': pair.treatment
      }, [
        el('span', { style: 'font-size: 20px;' }, ['\u{1F534}']),
        el('span', {}, [pair.symptom])
      ]);

      // Drop handlers
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('drag-over');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('drag-over');
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('drag-over');
        const treatment = e.dataTransfer.getData('text/plain');
        this.handleDrop(slot, treatment);
      });

      // Touch drop zone
      slot._symptom = pair.symptom;
      slot._expected = pair.treatment;

      symptomsCol.appendChild(slot);
      this.roundSlots.push(slot);
    });

    // Treatments column
    const treatmentsCol = el('div', { className: 'treatments-column' }, [
      el('h3', {}, ['Treatments'])
    ]);

    allTreatments.forEach(t => {
      const item = el('div', {
        className: 'treatment-item',
        draggable: 'true',
        'data-treatment': t.text
      }, [t.text]);

      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', t.text);
        item.classList.add('dragging');
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });

      // Touch support
      item.addEventListener('touchstart', (e) => this.touchStart(e, item, t.text), { passive: false });
      item.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
      item.addEventListener('touchend', (e) => this.touchEnd(e), { passive: false });

      treatmentsCol.appendChild(item);
    });

    this.gameArea.appendChild(symptomsCol);
    this.gameArea.appendChild(treatmentsCol);
  }

  handleDrop(slot, treatmentText) {
    if (this.locked) return;
    if (slot.classList.contains('correct')) return;

    const expected = slot.getAttribute('data-expected') || slot._expected;

    if (treatmentText === expected) {
      slot.classList.add('correct');
      slot.innerHTML = '';
      slot.appendChild(el('span', { style: 'font-size: 20px;' }, ['\u2705']));
      slot.appendChild(el('span', {}, [treatmentText]));

      // Mark treatment as placed
      const treatmentEl = this.gameArea.querySelector(`[data-treatment="${CSS.escape(treatmentText)}"]`);
      if (treatmentEl) treatmentEl.classList.add('placed');

      this.matches++;
      this.roundMatched++;
      this.scoreDisplay.textContent = `\u2B50 ${this.matches * 100}`;

      if (this.roundMatched >= this.roundTotal) {
        setTimeout(() => this.nextRound(), 600);
      }
    } else {
      slot.classList.add('incorrect');
      this.mistakes++;
      setTimeout(() => slot.classList.remove('incorrect'), 500);
    }
  }

  // Touch handlers for mobile
  touchStart(e, item, treatmentText) {
    if (this.locked) return;
    e.preventDefault();
    this.draggedEl = item;
    this.draggedData = treatmentText;
    item.classList.add('dragging');

    const touch = e.touches[0];
    const rect = item.getBoundingClientRect();
    this.touchOffset.x = touch.clientX - rect.left;
    this.touchOffset.y = touch.clientY - rect.top;
  }

  touchMove(e) {
    if (!this.draggedEl) return;
    e.preventDefault();

    // Highlight drop zones
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    this.roundSlots.forEach(s => s.classList.remove('drag-over'));
    if (target) {
      const slot = target.closest('.symptom-slot');
      if (slot) slot.classList.add('drag-over');
    }
  }

  touchEnd(e) {
    if (!this.draggedEl) return;
    e.preventDefault();

    this.draggedEl.classList.remove('dragging');
    this.roundSlots.forEach(s => s.classList.remove('drag-over'));

    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
      const slot = target.closest('.symptom-slot');
      if (slot) {
        this.handleDrop(slot, this.draggedData);
      }
    }

    this.draggedEl = null;
    this.draggedData = null;
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
    this.roundSlots = [];
  }
}
