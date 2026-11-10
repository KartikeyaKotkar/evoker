import type { Clock } from './clock.js';
import { PerformanceClock } from './clock.js';
import type { Direction, NodeProps } from './types.js';
import { clamp01 } from './types.js';
import { interpolate } from './track.js';
import type { Timeline } from './timeline.js';
import type { Scene } from './scene.js';

export type PlayerState = 'idle' | 'playing' | 'paused' | 'finished';
export interface PlayOptions {
  blend?: 'none' | 'crossfade';
  blendDuration?: number;
  speed?: number;
  /** Total iterations, including the first. Infinity repeats indefinitely. */
  loop?: number;
  direction?: Direction;
  offset?: number;
  onFinished?: () => void;
}
export interface PlayerOptions {
  clock?: Clock;
  target?: Partial<NodeProps>;
  apply?: (props: Partial<NodeProps>) => void;
  scene?: Scene;
}
export interface PlayerEvents {
  start: { timeline: Timeline };
  finished: { timeline: Timeline };
  update: { time: number; props: Partial<NodeProps> };
  interrupt: { previous: Timeline; next: Timeline };
}
type Listener<K extends keyof PlayerEvents> = (payload: PlayerEvents[K]) => void;
type Pose = Partial<NodeProps>;
interface BlendState { from: Pose; nodes: Record<string, Pose>; elapsed: number; duration: number }

function mix(a: Pose, b: Pose, t: number): Pose {
  const result = { ...a, ...b };
  for (const key of Object.keys(b)) {
    if (a[key] !== undefined && b[key] !== undefined) result[key] = interpolate(a[key], b[key], t);
  }
  return result;
}
function validateSpeed(speed: number): void {
  if (!Number.isFinite(speed) || speed < 0) throw new Error('Speed must be finite and non-negative');
}

/** Explicit playback. Timestamps must use the supplied clock's time origin. */
export class Player {
  private readonly clock: Clock;
  private readonly scene?: Scene;
  private readonly target?: Pose;
  private readonly applyProps: (props: Pose) => void;
  private _timeline: Timeline | null = null;
  private _state: PlayerState = 'idle';
  private _time = 0;
  private _cycle = 0;
  private _speed = 1;
  private _direction: Direction = 'normal';
  private sign = 1;
  private iterations = 1;
  private lastNow = 0;
  private blend: BlendState | null = null;
  private pose: Pose = {};
  private nodePoses: Record<string, Pose> = Object.create(null);
  private onFinished?: () => void;
  private readonly listeners: { [K in keyof PlayerEvents]: Set<Listener<K>> } = {
    start: new Set(), finished: new Set(), update: new Set(), interrupt: new Set(),
  };

  constructor(options: PlayerOptions = {}) {
    this.clock = options.clock ?? new PerformanceClock();
    this.scene = options.scene;
    this.target = options.target;
    this.applyProps = options.apply ?? ((props) => { Object.assign(this.target ?? {}, props); });
  }
  get state(): PlayerState { return this._state; }
  get timeline(): Timeline | null { return this._timeline; }
  get time(): number { return this._time; }
  get progress(): number {
    return this._timeline?.duration ? clamp01(this._time / this._timeline.duration) : this._state === 'finished' ? 1 : 0;
  }
  get cycle(): number { return this._cycle; }
  get speed(): number { return this._speed; }
  get direction(): Direction { return this._direction; }
  get isPlaying(): boolean { return this._state === 'playing'; }
  on<K extends keyof PlayerEvents>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener);
    return () => { this.listeners[event].delete(listener); };
  }
  off<K extends keyof PlayerEvents>(event: K, listener: Listener<K>): void { this.listeners[event].delete(listener); }
  private emit<K extends keyof PlayerEvents>(event: K, payload: PlayerEvents[K]): void {
    for (const listener of [...this.listeners[event]]) listener(payload);
  }
  play(timeline: Timeline | undefined = this._timeline ?? undefined, options: PlayOptions = {}): void {
    if (!timeline) return;
    const speed = options.speed ?? 1;
    validateSpeed(speed);
    const loop = options.loop ?? timeline.loop;
    if (loop !== Infinity && (!Number.isInteger(loop) || loop < 1)) throw new Error('Loop must be a positive iteration count or Infinity');
    if (options.offset !== undefined && !Number.isFinite(options.offset)) throw new Error('Offset must be finite');
    const blendDuration = options.blendDuration ?? 120;
    if (!Number.isFinite(blendDuration) || blendDuration < 0) throw new Error('Blend duration must be finite and non-negative');
    const previous = this._timeline;
    this.blend = options.blend === 'crossfade' && previous && blendDuration > 0
      ? { from: { ...this.target, ...this.pose }, nodes: { ...this.nodePoses }, elapsed: 0, duration: blendDuration }
      : null;
    this._timeline = timeline;
    this._speed = speed;
    this._direction = options.direction ?? timeline.direction;
    this.sign = this._direction === 'reverse' ? -1 : 1;
    this.iterations = loop;
    this._time = (options.offset === undefined ? (this.sign < 0 ? 1 : 0) : clamp01(options.offset)) * timeline.duration;
    this._cycle = 0;
    this.onFinished = options.onFinished;
    this._state = 'playing';
    this.lastNow = this.clock.now();
    if (timeline.duration === 0) this.blend = null;
    if (previous) this.emit('interrupt', { previous, next: timeline });
    this.emit('start', { timeline });
    this.applyCurrent();
    if (timeline.duration === 0 && this._timeline === timeline && this.isPlaying) this.finish();
  }
  pause(): void { if (this.isPlaying) this._state = 'paused'; }
  resume(): void {
    if (this._state === 'paused' && this._timeline) {
      this._state = 'playing'; this.lastNow = this.clock.now();
      this.emit('start', { timeline: this._timeline });
    }
  }
  stop(): void {
    this._state = 'idle'; this._timeline = null; this._time = 0; this._cycle = 0;
    this.blend = null; this.onFinished = undefined;
  }
  seek(progress: number): void {
    if (!Number.isFinite(progress)) throw new Error('Progress must be finite');
    if (!this._timeline) return;
    this._time = clamp01(progress) * this._timeline.duration;
    this.lastNow = this.clock.now();
    this.blend = null;
    this.applyCurrent();
  }
  reverse(): void {
    this.sign *= -1;
    if (this._direction !== 'alternate') this._direction = this.sign < 0 ? 'reverse' : 'normal';
    if (this._state === 'finished' && this._timeline) {
      this._state = 'playing'; this._cycle = 0; this.lastNow = this.clock.now();
      this.emit('start', { timeline: this._timeline });
    }
  }
  setSpeed(speed: number): void { validateSpeed(speed); this._speed = speed; }
  update(now: number = this.clock.now()): void {
    if (!Number.isFinite(now)) throw new Error('Timestamp must be finite');
    if (!this.isPlaying || !this._timeline) return;
    const delta = Math.max(0, now - this.lastNow);
    this.lastNow = Math.max(now, this.lastNow);
    if (this.blend) {
      this.blend.elapsed += delta;
      if (this.blend.elapsed >= this.blend.duration) this.blend = null;
    }
    const timeline = this._timeline;
    const duration = timeline.duration;
    if (duration === 0) { this.applyCurrent(); this.finish(); return; }
    const distance = this.sign > 0 ? this._time : duration - this._time;
    const travel = distance + delta * this._speed;
    const crossed = Math.floor(travel / duration);
    const remaining = this.iterations - this._cycle;
    const finished = crossed >= remaining;
    if (finished) {
      this.blend = null;
      const endSign = this._direction === 'alternate' && (remaining - 1) % 2 ? -this.sign : this.sign;
      this.sign = endSign;
      this._time = endSign > 0 ? duration : 0;
      this._cycle = this.iterations;
    } else {
      this._cycle += crossed;
      if (this._direction === 'alternate' && crossed % 2) this.sign *= -1;
      const local = travel % duration;
      this._time = this.sign > 0 ? local : duration - local;
    }
    this.applyCurrent();
    if (finished && this._timeline === timeline && this.isPlaying) this.finish();
  }
  private applyCurrent(): void {
    if (!this._timeline) return;
    const t = this.blend ? clamp01(this.blend.elapsed / this.blend.duration) : 1;
    let props = this._timeline.evaluate(this._time);
    if (this.scene) {
      const targets = this._timeline.evaluateByTarget(this._time);
      for (const [id, next] of Object.entries(targets)) {
        const node = this.scene.getNode(id);
        if (!node) continue;
        const pose = this.blend ? mix(this.blend.nodes[id] ?? node.props, next, t) : next;
        node.set(pose);
        this.nodePoses[id] = { ...node.props };
      }
    } else {
      if (this.blend) props = mix(this.blend.from, props, t);
      this.pose = { ...this.pose, ...props };
      this.applyProps(props);
    }
    this.emit('update', { time: this._time, props });
  }
  private finish(): void {
    const timeline = this._timeline!;
    const callback = this.onFinished;
    this._state = 'finished'; this.onFinished = undefined;
    this.emit('finished', { timeline });
    callback?.();
  }
}
