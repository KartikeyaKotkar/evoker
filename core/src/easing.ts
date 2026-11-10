/**
 * Easing functions and the named curve registry.
 *
 * Standard easings cover the usual CSS/animation set. The `bowa1`, `fuwari1`,
 * `haneru*`, `gachan2`, `yureruRot`, `kaesiSlide2`, `sin*`, `curve*`,
 * `easeOut*`, and `buttonPush` names come from the reference UI's motion
 * vocabulary. Their exact curve math is not recoverable from the shipped
 * binary, so they are documented approximations built from standard curves.
 */

import type { EasingFn, EasingName } from './types.js';

export const linear: EasingFn = (t) => t;
export const step: EasingFn = (t) => (t < 1 ? 0 : 1);

export const easeInQuad: EasingFn = (t) => t * t;
export const easeOutQuad: EasingFn = (t) => t * (2 - t);
export const easeInOutQuad: EasingFn = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const easeInCubic: EasingFn = (t) => t * t * t;
export const easeOutCubic: EasingFn = (t) => --t * t * t + 1;
export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const easeInQuart: EasingFn = (t) => t * t * t * t;
export const easeOutQuart: EasingFn = (t) => 1 - --t * t * t * t;
export const easeInOutQuart: EasingFn = (t) =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;

export const easeInQuint: EasingFn = (t) => t * t * t * t * t;
export const easeOutQuint: EasingFn = (t) => 1 + --t * t * t * t * t;
export const easeInOutQuint: EasingFn = (t) =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;

export const easeInSine: EasingFn = (t) => 1 - Math.cos((t * Math.PI) / 2);
export const easeOutSine: EasingFn = (t) => Math.sin((t * Math.PI) / 2);
export const easeInOutSine: EasingFn = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

export const easeInExpo: EasingFn = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
export const easeOutExpo: EasingFn = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutExpo: EasingFn = (t) => {
  if (t === 0 || t === 1) return t;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
};

export const easeInCirc: EasingFn = (t) => 1 - Math.sqrt(1 - t * t);
export const easeOutCirc: EasingFn = (t) => Math.sqrt(1 - --t * t);
export const easeInOutCirc: EasingFn = (t) =>
  t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;

export const easeInBack: EasingFn = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};
export const easeOutBack: EasingFn = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeInOutBack: EasingFn = (t) => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

export const easeInElastic: EasingFn = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};
export const easeOutElastic: EasingFn = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
export const easeInOutElastic: EasingFn = (t) => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

export const easeOutBounce: EasingFn = (t) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

/** Cubic bezier easing, matching the CSS `cubic-bezier()` semantics. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFn {
  if (![x1, y1, x2, y2].every(Number.isFinite) || x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    throw new Error('Bezier controls must be finite with x coordinates in [0, 1]');
  }
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivativeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-6) return t;
      const derivative = sampleDerivativeX(t);
      if (Math.abs(derivative) < 1e-6) break;
      t -= error / derivative;
    }
    let low = 0;
    let high = 1;
    t = x;
    while (low < high) {
      const value = sampleX(t);
      if (Math.abs(value - x) < 1e-6) return t;
      if (value < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return t;
  };

  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sampleY(solve(x)));
}

function backWithC1(c1: number): EasingFn {
  return (t) => 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Bounce with a configurable number of visible bounces. */
function bounceSoft(bounces: number): EasingFn {
  return (t) => {
    const damping = Math.pow(0.5, bounces);
    const raw = easeOutBounce(t);
    return 1 - (1 - raw) * (1 - damping * 0.5);
  };
}

const registry = new Map<EasingName, EasingFn>([
  ['linear', linear],
  ['easeIn', easeInCubic],
  ['easeOut', easeOutCubic],
  ['easeInOut', easeInOutCubic],
  ['step', step],
  ['easeInQuad', easeInQuad],
  ['easeOutQuad', easeOutQuad],
  ['easeInOutQuad', easeInOutQuad],
  ['easeInCubic', easeInCubic],
  ['easeOutCubic', easeOutCubic],
  ['easeInOutCubic', easeInOutCubic],
  ['easeInQuart', easeInQuart],
  ['easeOutQuart', easeOutQuart],
  ['easeInOutQuart', easeInOutQuart],
  ['easeInQuint', easeInQuint],
  ['easeOutQuint', easeOutQuint],
  ['easeInOutQuint', easeInOutQuint],
  ['easeInSine', easeInSine],
  ['easeOutSine', easeOutSine],
  ['easeInOutSine', easeInOutSine],
  ['easeInExpo', easeInExpo],
  ['easeOutExpo', easeOutExpo],
  ['easeInOutExpo', easeInOutExpo],
  ['easeInCirc', easeInCirc],
  ['easeOutCirc', easeOutCirc],
  ['easeInOutCirc', easeInOutCirc],
  ['easeInBack', easeInBack],
  ['easeOutBack', easeOutBack],
  ['easeInOutBack', easeInOutBack],
  ['easeInElastic', easeInElastic],
  ['easeOutElastic', easeOutElastic],
  ['easeInOutElastic', easeInOutElastic],
  ['easeOutBounce', easeOutBounce],
  // Reference-style named curves (approximations).
  ['bowa1', easeOutQuart],
  ['fuwari1', easeInOutSine],
  ['haneru1', easeOutBounce],
  ['haneru2', backWithC1(1.4)],
  ['haneru3', backWithC1(1.0)],
  ['gachan2', easeOutExpo],
  ['yureruRot', (t) => 1 + Math.sin(t * Math.PI * 2) * (1 - t) * 0.25],
  ['kaesiSlide2', backWithC1(1.70158)],
  ['sin90', (t) => Math.sin((t * Math.PI) / 2)],
  ['sin180', (t) => (1 - Math.cos(t * Math.PI)) / 2],
  ['sin360', (t) => (1 - Math.cos(t * Math.PI * 2)) / 2],
  ['hSin180', (t) => (1 - Math.cos(t * Math.PI)) / 2],
  ['curveUp1', easeInQuad],
  ['curveUp2', easeInCubic],
  ['curveUp3', easeInQuart],
  ['curveDown1', easeOutQuad],
  ['curveDown2', easeOutCubic],
  ['curveDown3', easeOutQuart],
  ['easeOut1', easeOutQuad],
  ['easeOut2', easeOutCubic],
  ['easeOut3', easeOutQuart],
  ['buttonPush', backWithC1(1.70158)],
]);

export function registerEasing(name: EasingName, fn: EasingFn): void {
  registry.set(name, fn);
}

export function unregisterEasing(name: EasingName): void {
  registry.delete(name);
}

export function resolveEasing(nameOrFn: EasingName | EasingFn): EasingFn {
  if (typeof nameOrFn === 'function') return nameOrFn;
  const fn = registry.get(nameOrFn);
  if (!fn) throw new Error(`Unknown easing: ${nameOrFn}`);
  return fn;
}

export function getEasing(name: EasingName): EasingFn {
  const fn = registry.get(name);
  if (!fn) throw new Error(`Unknown easing: ${name}`);
  return fn;
}

export function listEasings(): EasingName[] {
  return [...registry.keys()];
}

export const EASING_NAMES = Object.freeze([
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
  'step',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInQuart',
  'easeOutQuart',
  'easeInOutQuart',
  'easeInQuint',
  'easeOutQuint',
  'easeInOutQuint',
  'easeInSine',
  'easeOutSine',
  'easeInOutSine',
  'easeInExpo',
  'easeOutExpo',
  'easeInOutExpo',
  'easeInCirc',
  'easeOutCirc',
  'easeInOutCirc',
  'easeInBack',
  'easeOutBack',
  'easeInOutBack',
  'easeInElastic',
  'easeOutElastic',
  'easeInOutElastic',
  'easeOutBounce',
  'bowa1',
  'fuwari1',
  'haneru1',
  'haneru2',
  'haneru3',
  'gachan2',
  'yureruRot',
  'kaesiSlide2',
  'sin90',
  'sin180',
  'sin360',
  'hSin180',
  'curveUp1',
  'curveUp2',
  'curveUp3',
  'curveDown1',
  'curveDown2',
  'curveDown3',
  'easeOut1',
  'easeOut2',
  'easeOut3',
  'buttonPush',
] as const);
