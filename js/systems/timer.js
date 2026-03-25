export class Timer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.interval = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = Date.now();
    this.interval = setInterval(() => this.tick(), 100);
  }

  tick() {
    const now = Date.now();
    const elapsed = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.remaining = Math.max(0, this.remaining - elapsed);

    if (this.onTick) this.onTick(this.remaining, this.duration);

    if (this.remaining <= 0) {
      this.stop();
      if (this.onComplete) this.onComplete();
    }
  }

  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getRemaining() {
    return this.remaining;
  }

  destroy() {
    this.stop();
    this.onTick = null;
    this.onComplete = null;
  }
}
