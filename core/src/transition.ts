import type { Node } from './scene.js';
import type { Player, PlayOptions } from './player.js';
import type { Timeline } from './timeline.js';
import { Sequence } from './sequence.js';

export type TimelineFactory = Timeline | ((node?: Node) => Timeline);
export interface StateDefinition { enter?: TimelineFactory; exit?: TimelineFactory }
export interface StateTarget { player: Player; node?: Node }
export interface StateMachineOptions {
  states: Record<string, StateDefinition>;
  initial?: string;
  targets?: Record<string, StateTarget>;
  defaultTarget?: StateTarget;
}
export interface TransitionOptions {
  interrupt?: boolean;
  blend?: 'none' | 'crossfade';
  blendDuration?: number;
}
export interface StateMachineEvents {
  change: { from: string; to: string };
  transitionStart: { from: string; to: string };
  transitionEnd: { from: string; to: string };
}
type Listener<K extends keyof StateMachineEvents> = (payload: StateMachineEvents[K]) => void;
function resolve(factory: TimelineFactory | undefined, node?: Node): Timeline | undefined {
  return typeof factory === 'function' ? factory(node) : factory;
}

/** Shared players run exit then enter. Distinct players run both in parallel. */
export class StateMachine {
  readonly states: Record<string, StateDefinition>;
  private readonly targets: Record<string, StateTarget>;
  private readonly defaultTarget?: StateTarget;
  private _state: string;
  private generation = 0;
  private active = new Set<Player>();
  private readonly listeners: { [K in keyof StateMachineEvents]: Set<Listener<K>> } = {
    change: new Set(), transitionStart: new Set(), transitionEnd: new Set(),
  };
  constructor(options: StateMachineOptions) {
    this.states = options.states;
    this.targets = options.targets ?? {};
    this.defaultTarget = options.defaultTarget;
    this._state = options.initial ?? Object.keys(options.states)[0] ?? '';
    if (!Object.hasOwnProperty.call(this.states, this._state)) throw new Error(`Unknown initial state: ${this._state}`);
  }
  get state(): string { return this._state; }
  get isTransitioning(): boolean { return this.active.size > 0; }
  on<K extends keyof StateMachineEvents>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener);
    return () => { this.listeners[event].delete(listener); };
  }
  private emit<K extends keyof StateMachineEvents>(event: K, payload: StateMachineEvents[K]): void {
    for (const listener of [...this.listeners[event]]) listener(payload);
  }
  transition(to: string, options: TransitionOptions = {}): boolean {
    if (!Object.hasOwnProperty.call(this.states, to)) throw new Error(`Unknown state: ${to}`);
    if (to === this._state || (this.isTransitioning && !options.interrupt)) return false;
    const from = this._state;
    const jobs = new Map<Player, Sequence>();
    const append = (target: StateTarget | undefined, factory: TimelineFactory | undefined) => {
      const timeline = resolve(factory, target?.node);
      if (!timeline || !target) return;
      const sequence = jobs.get(target.player) ?? new Sequence();
      sequence.then(timeline);
      jobs.set(target.player, sequence);
    };
    append(this.targets[from] ?? this.defaultTarget, this.states[from]?.exit);
    append(this.targets[to] ?? this.defaultTarget, this.states[to]?.enter);
    const generation = ++this.generation;
    // Replacing playback clears obsolete completion callbacks; poses remain available for blending.
    for (const player of this.active) if (!jobs.has(player)) player.stop();
    this.active = new Set(jobs.keys());
    const payload = { from, to };
    this._state = to;
    this.emit('transitionStart', payload);
    this.emit('change', payload);
    if (generation !== this.generation) return true;
    if (!jobs.size) this.emit('transitionEnd', payload);
    for (const [player, sequence] of jobs) {
      if (generation !== this.generation) break;
      const playOptions: PlayOptions = {
        loop: 1,
        blend: options.blend ?? (options.interrupt ? 'crossfade' : 'none'),
        blendDuration: options.blendDuration ?? 120,
        onFinished: () => {
          if (generation !== this.generation) return;
          this.active.delete(player);
          if (!this.active.size) this.emit('transitionEnd', payload);
        },
      };
      player.play(sequence.build(), playOptions);
    }
    return true;
  }
  enter(options: TransitionOptions = {}): void {
    const target = this.targets[this._state] ?? this.defaultTarget;
    const timeline = resolve(this.states[this._state]?.enter, target?.node);
    if (timeline && target) target.player.play(timeline, { blend: options.blend, blendDuration: options.blendDuration });
  }
  dispose(): void {
    this.generation++;
    for (const player of this.active) player.stop();
    this.active.clear();
    for (const listeners of Object.values(this.listeners)) listeners.clear();
  }
}
