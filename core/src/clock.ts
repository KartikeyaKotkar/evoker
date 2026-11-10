/**
 * Time sources. The core never assumes a specific clock, which keeps it
 * usable in browsers, game engines, tests, and headless renderers.
 */

export interface Clock {
  /** Current time in milliseconds. */
  now(): number;
}

export class PerformanceClock implements Clock {
  now(): number {
    return (globalThis as { performance?: { now(): number } }).performance?.now() ?? Date.now();
  }
}

export class ManualClock implements Clock {
  private current = 0;

  now(): number {
    return this.current;
  }

  set(time: number): void {
    this.current = time;
  }

  advance(delta: number): void {
    this.current += delta;
  }
}

/**
 * Frame-based clock. Useful for reproducing the frame-count driven timing
 * model used by the reference UI (delay + frame + wait).
 */
export class FrameClock implements Clock {
  constructor(
    public fps = 60,
    public frame = 0,
  ) {}

  now(): number {
    return (this.frame * 1000) / this.fps;
  }

  tick(): void {
    this.frame += 1;
  }

  setFrame(frame: number): void {
    this.frame = frame;
  }
}
