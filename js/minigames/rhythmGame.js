import { el, clearElement, animalImg } from '../utils/dom.js';
import { Timer } from '../systems/timer.js';

export class RhythmGame {
  constructor(container, config, animalData) {
    this.container = container;
    this.config = config;
    this.animal = animalData;
    this.onComplete = null;

    this.bpm = config.bpm || 80;
    this.targetBeats = config.targetBeats || 20;
    this.hitWindow = config.hitWindow || 250; // ms tolerance

    this.beats = 0;
    this.hits = 0;
    this.mistakes = 0;
    this.locked = false;
    this.timer = null;
    this.timerDisplay = null;
    this.scoreDisplay = null;
    this.heartEl = null;
    this.lineEl = null;
    this.tapZoneEl = null;
    this.beatInterval = null;
    this.nextBeatTime = 0;
    this.animFrame = null;
    this.markers = [];
  }

  init() {
    clearElement(this.container);

    const header = el('div', { className: 'game-header' }, [
      el('div', { className: 'animal-info' }, [
        animalImg(this.animal, 'sick', 'emoji-medium'),
        el('span', { style: 'font-family: var(--font-main); font-size: 0.9rem;' }, [this.animal.name])
      ]),
      el('div', { className: 'timer' }, ['\u23F0 --']),
      el('div', { className: 'score' }, [`\u2B50 0 / ${this.targetBeats}`])
    ]);

    this.timerDisplay = header.querySelector('.timer');
    this.scoreDisplay = header.querySelector('.score');

    // Heart display
    this.heartEl = el('div', { className: 'rhythm-heart' }, ['\u2764\uFE0F']);

    // Monitor line area
    const monitor = el('div', { className: 'rhythm-monitor' });
    this.lineEl = el('div', { className: 'rhythm-line' });
    this.tapZoneEl = el('div', { className: 'rhythm-tap-zone' });
    monitor.appendChild(this.lineEl);
    monitor.appendChild(this.tapZoneEl);

    // Tap button
    const tapBtn = el('div', { className: 'rhythm-tap-btn' }, [
      el('span', { style: 'font-size: 2rem;' }, ['\u{1F49F}']),
      el('span', {}, ['TAP'])
    ]);
    tapBtn.addEventListener('click', () => this.playerTap());
    tapBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.playerTap();
    }, { passive: false });

    const instructions = el('p', {
      className: 'text-center mt-2',
      style: 'font-size: 0.85rem; color: var(--color-text-light);'
    }, ['Tap when the pulse reaches the heart zone!']);

    this.container.appendChild(header);
    this.container.appendChild(this.heartEl);
    this.container.appendChild(monitor);
    this.container.appendChild(tapBtn);
    this.container.appendChild(instructions);

    this.timer = new Timer(
      this.config.timeLimit,
      (remaining) => this.updateTimer(remaining),
      () => this.timeUp()
    );
  }

  start() {
    this.timer.start();
    const intervalMs = (60 / this.bpm) * 1000;
    this.nextBeatTime = Date.now() + intervalMs;

    this.beatInterval = setInterval(() => {
      if (this.locked) return;
      this.spawnBeat();
      this.beats++;
    }, intervalMs);

    // Spawn first beat immediately
    this.spawnBeat();
    this.beats++;

    this.animate();
  }

  spawnBeat() {
    const marker = el('div', { className: 'rhythm-marker' });
    this.lineEl.appendChild(marker);
    this.markers.push({
      element: marker,
      spawnTime: Date.now(),
      hit: false,
      expired: false
    });
  }

  animate() {
    this.animFrame = requestAnimationFrame(() => this.animate());

    const travelTime = 2000; // ms for marker to cross the monitor
    const now = Date.now();
    const tapZonePos = 0.75; // 75% across is the target

    this.markers.forEach(m => {
      if (m.hit || m.expired) return;

      const elapsed = now - m.spawnTime;
      const progress = elapsed / travelTime;

      if (progress >= 1) {
        // Missed
        m.expired = true;
        m.element.classList.add('rhythm-missed');
        this.mistakes++;
        setTimeout(() => m.element.remove(), 300);
      } else {
        m.element.style.left = `${progress * 100}%`;
      }
    });

    // Pulse the heart on beat
    const intervalMs = (60 / this.bpm) * 1000;
    const beatProgress = ((now % intervalMs) / intervalMs);
    if (beatProgress < 0.15) {
      this.heartEl.classList.add('rhythm-pulse');
    } else {
      this.heartEl.classList.remove('rhythm-pulse');
    }
  }

  playerTap() {
    if (this.locked) return;

    const now = Date.now();
    const travelTime = 2000;
    const tapZonePos = 0.75;
    const targetTime = travelTime * tapZonePos;

    // Find the closest unhit marker to the tap zone
    let best = null;
    let bestDist = Infinity;

    this.markers.forEach(m => {
      if (m.hit || m.expired) return;
      const elapsed = now - m.spawnTime;
      const dist = Math.abs(elapsed - targetTime);
      if (dist < bestDist) {
        bestDist = dist;
        best = m;
      }
    });

    if (best && bestDist <= this.hitWindow) {
      // Hit!
      best.hit = true;
      best.element.classList.add('rhythm-hit');
      setTimeout(() => best.element.remove(), 300);

      this.hits++;
      this.scoreDisplay.textContent = `\u2B50 ${this.hits} / ${this.targetBeats}`;

      // Flash heart
      this.heartEl.classList.add('rhythm-success');
      setTimeout(() => this.heartEl.classList.remove('rhythm-success'), 200);

      if (this.hits >= this.targetBeats) {
        this.gameComplete();
      }
    } else {
      // Missed tap
      this.mistakes++;
      this.tapZoneEl.classList.add('rhythm-miss-flash');
      setTimeout(() => this.tapZoneEl.classList.remove('rhythm-miss-flash'), 200);
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
    this.cleanup();
    if (this.onComplete) {
      this.onComplete({
        matches: this.hits,
        mistakes: this.mistakes,
        timeRemaining: this.timer.getRemaining(),
        timeLimit: this.config.timeLimit
      });
    }
  }

  timeUp() {
    this.locked = true;
    this.cleanup();
    if (this.onComplete) {
      this.onComplete({
        matches: Math.max(1, this.hits),
        mistakes: this.mistakes,
        timeRemaining: 0,
        timeLimit: this.config.timeLimit
      });
    }
  }

  cleanup() {
    clearInterval(this.beatInterval);
    cancelAnimationFrame(this.animFrame);
  }

  destroy() {
    this.cleanup();
    if (this.timer) this.timer.destroy();
    this.markers = [];
  }
}
