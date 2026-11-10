/**
 * Motion primitives and named presets.
 *
 * The primitives mirror the reference UI's vocabulary: fade, slide, scale,
 * rotate, move, color, mask/wipe, shake, ripple, plus staggered list motion
 * and cursor selection effects.
 */

import type { EasingFn, EasingName } from './types.js';

type Easing = EasingName | EasingFn;
import { Timeline, track } from './timeline.js';
import type { Keyframe } from './types.js';

export type Direction4 = 'left' | 'right' | 'up' | 'down';

export interface FadeOptions {
  from?: number;
  to?: number;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

export function fade(options: FadeOptions = {}): Timeline {
  const { from = 0, to = 1, duration = 240, easing = 'easeOut', delay = 0 } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track('opacity', [
        { time: delay, value: from },
        { time: delay + duration, value: to, easing },
      ]),
    ],
  });
}

export interface SlideOptions {
  direction?: Direction4;
  distance?: number;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

const SLIDE_PROPERTY: Record<Direction4, 'translateX' | 'translateY'> = {
  left: 'translateX',
  right: 'translateX',
  up: 'translateY',
  down: 'translateY',
};

const SLIDE_SIGN: Record<Direction4, number> = {
  left: -1,
  right: 1,
  up: -1,
  down: 1,
};

export function slide(options: SlideOptions = {}): Timeline {
  const {
    direction = 'left',
    distance = 32,
    duration = 280,
    easing = 'easeOut',
    delay = 0,
  } = options;
  const property = SLIDE_PROPERTY[direction];
  const sign = SLIDE_SIGN[direction];
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track(property, [
        { time: delay, value: sign * distance },
        { time: delay + duration, value: 0, easing },
      ]),
    ],
  });
}

export interface ScaleOptions {
  from?: number;
  to?: number;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

export function scale(options: ScaleOptions = {}): Timeline {
  const { from = 0, to = 1, duration = 240, easing = 'easeOut', delay = 0 } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track('scaleX', [
        { time: delay, value: from },
        { time: delay + duration, value: to, easing },
      ]),
      track('scaleY', [
        { time: delay, value: from },
        { time: delay + duration, value: to, easing },
      ]),
    ],
  });
}

export interface RotateOptions {
  from?: number;
  to?: number;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

export function rotate(options: RotateOptions = {}): Timeline {
  const { from = -8, to = 0, duration = 220, easing = 'easeOut', delay = 0 } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track('rotate', [
        { time: delay, value: from },
        { time: delay + duration, value: to, easing },
      ]),
    ],
  });
}

export interface MoveOptions {
  x?: number;
  y?: number;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

export function move(options: MoveOptions = {}): Timeline {
  const { x = 0, y = 0, duration = 260, easing = 'easeOut', delay = 0 } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track('translateX', [
        { time: delay, value: x },
        { time: delay + duration, value: 0, easing },
      ]),
      track('translateY', [
        { time: delay, value: y },
        { time: delay + duration, value: 0, easing },
      ]),
    ],
  });
}

export interface ColorOptions {
  property?: string;
  from?: string;
  to?: string;
  duration?: number;
  easing?: Easing;
  delay?: number;
}

export function color(options: ColorOptions = {}): Timeline {
  const {
    property = 'color',
    from = '#ffffff',
    to = '#7fd4ff',
    duration = 200,
    easing = 'easeOut',
    delay = 0,
  } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track(property, [
        { time: delay, value: from },
        { time: delay + duration, value: to, easing },
      ]),
    ],
  });
}

/** Deterministic PRNG so shake motion is reproducible in tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ShakeOptions {
  strength?: number;
  duration?: number;
  frequency?: number;
  property?: 'translateX' | 'translateY' | 'rotate';
  seed?: number;
}

export function shake(options: ShakeOptions = {}): Timeline {
  const {
    strength = 8,
    duration = 300,
    frequency = 30,
    property = 'translateX',
    seed = 1337,
  } = options;
  if (!Number.isFinite(duration) || duration < 0 || !Number.isFinite(frequency) || frequency < 0 || !Number.isFinite(strength)) {
    throw new Error('Shake requires finite non-negative duration/frequency and finite strength');
  }
  const random = mulberry32(seed);
  const frames = Math.max(2, Math.round((duration / 1000) * frequency));
  const keyframes: Keyframe[] = [{ time: 0, value: 0, easing: 'linear' }];
  for (let i = 1; i < frames; i++) {
    const progress = i / frames;
    const decay = 1 - progress;
    keyframes.push({
      time: progress * duration,
      value: (random() * 2 - 1) * strength * decay,
      easing: 'linear',
    });
  }
  keyframes.push({ time: duration, value: 0, easing: 'linear' });
  return new Timeline({ duration, tracks: [track(property, keyframes)] });
}

export interface RippleOptions {
  duration?: number;
  maxScale?: number;
  delay?: number;
  easing?: Easing;
}

export function ripple(options: RippleOptions = {}): Timeline {
  const { duration = 520, maxScale = 2.2, delay = 0, easing = 'easeOut' } = options;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track('scaleX', [
        { time: delay, value: 0.2 },
        { time: delay + duration, value: maxScale, easing },
      ]),
      track('scaleY', [
        { time: delay, value: 0.2 },
        { time: delay + duration, value: maxScale, easing },
      ]),
      track('opacity', [
        { time: delay, value: 0.8 },
        { time: delay + duration, value: 0, easing },
      ]),
    ],
  });
}

export interface WipeOptions {
  direction?: Direction4;
  duration?: number;
  easing?: Easing;
  delay?: number;
  reverse?: boolean;
}

const WIPE_PROPERTY: Record<Direction4, string> = {
  left: 'clipRight', right: 'clipLeft', up: 'clipBottom', down: 'clipTop',
};

export function wipe(options: WipeOptions = {}): Timeline {
  const {
    direction = 'left',
    duration = 360,
    easing = 'easeInOut',
    delay = 0,
    reverse = false,
  } = options;
  const from = reverse ? 1 : 0;
  const to = reverse ? 0 : 1;
  return new Timeline({
    duration: delay + duration,
    tracks: [
      track(WIPE_PROPERTY[direction], [
        { time: delay, value: 1 - from },
        { time: delay + duration, value: 1 - to, easing },
      ]),
    ],
  });
}

export interface StaggerOptions {
  itemDuration?: number;
  stagger?: number;
  easing?: Easing;
  direction?: Direction4;
  distance?: number;
}

/** Build a per-item entrance timeline with a stagger delay. */
export function staggeredItem(index: number, options: StaggerOptions = {}): Timeline {
  const { itemDuration = 240, stagger = 40, easing = 'easeOut', direction = 'left', distance = 24 } = options;
  const delay = index * stagger;
  return new Timeline({
    duration: delay + itemDuration,
    tracks: [
      track('opacity', [
        { time: delay, value: 0 },
        { time: delay + itemDuration, value: 1, easing },
      ]),
      track(SLIDE_PROPERTY[direction], [
        { time: delay, value: SLIDE_SIGN[direction] * distance },
        { time: delay + itemDuration, value: 0, easing },
      ]),
    ],
  });
}

export const Motion = {
  fadeIn: (duration = 240, easing: Easing = 'easeOut') =>
    fade({ from: 0, to: 1, duration, easing }),
  fadeOut: (duration = 200, easing: Easing = 'easeIn') =>
    fade({ from: 1, to: 0, duration, easing }),
  slideInLeft: (duration = 280, easing: Easing = 'easeOut') =>
    slide({ direction: 'left', distance: 32, duration, easing }),
  slideOutLeft: (duration = 220, easing: Easing = 'easeIn') =>
    new Timeline({ duration, tracks: [track('translateX', [{ time: 0, value: 0 }, { time: duration, value: -32, easing }])] }),
  slideInRight: (duration = 280, easing: Easing = 'easeOut') =>
    slide({ direction: 'right', distance: 32, duration, easing }),
  slideOutRight: (duration = 220, easing: Easing = 'easeIn') =>
    new Timeline({ duration, tracks: [track('translateX', [{ time: 0, value: 0 }, { time: duration, value: 32, easing }])] }),
  slideInUp: (duration = 280, easing: Easing = 'easeOut') =>
    slide({ direction: 'up', distance: 32, duration, easing }),
  slideInDown: (duration = 280, easing: Easing = 'easeOut') =>
    slide({ direction: 'down', distance: 32, duration, easing }),
  scaleIn: (duration = 220, easing: Easing = 'easeOut') =>
    scale({ from: 0.8, to: 1, duration, easing }),
  scaleOut: (duration = 180, easing: Easing = 'easeIn') =>
    scale({ from: 1, to: 0.8, duration, easing }),
  popIn: (duration = 260, easing: Easing = 'buttonPush') =>
    new Timeline({
      duration,
      tracks: [
        track('scaleX', [
          { time: 0, value: 0.6 },
          { time: duration, value: 1, easing },
        ]),
        track('scaleY', [
          { time: 0, value: 0.6 },
          { time: duration, value: 1, easing },
        ]),
        track('opacity', [
          { time: 0, value: 0 },
          { time: duration * 0.6, value: 1, easing: 'easeOut' },
        ]),
      ],
    }),
  panelIn: (duration = 300) =>
    new Timeline({
      duration,
      tracks: [
        track('opacity', [
          { time: 0, value: 0 },
          { time: duration, value: 1, easing: 'easeOut' },
        ]),
        track('translateY', [
          { time: 0, value: 12 },
          { time: duration, value: 0, easing: 'easeOut' },
        ]),
      ],
    }),
  panelOut: (duration = 200) =>
    new Timeline({
      duration,
      tracks: [
        track('opacity', [
          { time: 0, value: 1 },
          { time: duration, value: 0, easing: 'easeIn' },
        ]),
        track('translateY', [
          { time: 0, value: 0 },
          { time: duration, value: 8, easing: 'easeIn' },
        ]),
      ],
    }),
  shake,
  ripple,
  wipe,
};

export const SelectionMotion = {
  select: (duration = 140) =>
    new Timeline({
      duration,
      tracks: [
        track('rotate', [
          { time: 0, value: -10 },
          { time: duration, value: 0, easing: 'easeOut' },
        ]),
        track('scaleX', [
          { time: 0, value: 1.18 },
          { time: duration, value: 1, easing: 'easeOut' },
        ]),
        track('scaleY', [
          { time: 0, value: 1.18 },
          { time: duration, value: 1, easing: 'easeOut' },
        ]),
      ],
    }),
  deselect: (duration = 120) =>
    new Timeline({
      duration,
      tracks: [
        track('scaleX', [
          { time: 0, value: 1 },
          { time: duration, value: 0.94, easing: 'easeOut' },
        ]),
        track('scaleY', [
          { time: 0, value: 1 },
          { time: duration, value: 0.94, easing: 'easeOut' },
        ]),
      ],
    }),
  hover: (duration = 120) =>
    new Timeline({
      duration,
      tracks: [
        track('scaleX', [
          { time: 0, value: 1 },
          { time: duration, value: 1.06, easing: 'easeOut' },
        ]),
        track('scaleY', [
          { time: 0, value: 1 },
          { time: duration, value: 1.06, easing: 'easeOut' },
        ]),
      ],
    }),
};
