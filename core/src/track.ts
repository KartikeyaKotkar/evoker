/**
 * Keyframe tracks and value interpolation.
 */

import type { Interpolator, Keyframe, NodeProps, Track } from './types.js';
import { resolveEasing } from './easing.js';

export const interpolateNumber: Interpolator<number> = (a, b, t) => a + (b - a) * t;

export const interpolateNumberArray: Interpolator<number[]> = (a, b, t) => {
  const length = Math.min(a.length, b.length);
  const out = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? av;
    out[i] = av + (bv - av) * t;
  }
  return out;
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i;

export function parseColor(color: string): [number, number, number, number] | null {
  const hex = HEX_RE.exec(color.trim());
  if (hex) {
    const raw = hex[1]!;
    if (raw.length === 3) {
      return [
        parseInt(raw[0]! + raw[0]!, 16),
        parseInt(raw[1]! + raw[1]!, 16),
        parseInt(raw[2]! + raw[2]!, 16),
        1,
      ];
    }
    if (raw.length === 6) {
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
        1,
      ];
    }
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16),
      parseInt(raw.slice(6, 8), 16) / 255,
    ];
  }
  const rgb = RGB_RE.exec(color.trim());
  if (rgb) {
    return [
      Number(rgb[1]),
      Number(rgb[2]),
      Number(rgb[3]),
      rgb[4] === undefined ? 1 : Number(rgb[4]),
    ];
  }
  return null;
}

export function formatColor(r: number, g: number, b: number, a: number): string {
  if (a >= 1) {
    const to = (v: number) => Math.round(clampByte(v)).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`;
  }
  return `rgba(${Math.round(clampByte(r))}, ${Math.round(clampByte(g))}, ${Math.round(clampByte(b))}, ${round3(a)})`;
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function round3(v: number): number {
  return Math.round(v * 1000) / 1000;
}

export const interpolateColor: Interpolator<string> = (a, b, t) => {
  const from = parseColor(a);
  const to = parseColor(b);
  if (!from || !to) return t < 1 ? a : b;
  return formatColor(
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
    from[3] + (to[3] - from[3]) * t,
  );
};

export const interpolateBoolean: Interpolator<boolean> = (a, b, t) => (t < 1 ? a : b);

export function interpolate<T>(a: T, b: T, t: number): T {
  if (typeof a === 'number' && typeof b === 'number') {
    return interpolateNumber(a, b, t) as T;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return interpolateNumberArray(a as number[], b as number[], t) as unknown as T;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return interpolateColor(a, b, t) as T;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return interpolateBoolean(a, b, t) as T;
  }
  return (t < 1 ? a : b) as T;
}

export function evaluateTrack<T>(track: Track<T>, time: number): T | undefined {
  const keyframes = track.keyframes;
  if (keyframes.length === 0) return undefined;
  if (keyframes.length === 1) return keyframes[0]!.value;

  const first = keyframes[0]!;
  const last = keyframes[keyframes.length - 1]!;
  if (time < first.time) return first.value;
  if (time >= last.time) return last.value;

  for (let i = keyframes.length - 2; i >= 0; i--) {
    const a = keyframes[i]!;
    const b = keyframes[i + 1]!;
    if (time >= a.time && time <= b.time) {
      const span = b.time - a.time;
      const local = span <= 0 ? 0 : (time - a.time) / span;
      const easing = resolveEasing(b.easing ?? 'linear');
      const eased = easing(local);
      return interpolate(a.value, b.value, eased);
    }
  }
  return last.value;
}

/** Merge evaluated tracks into a flat property map. */
export function evaluateTracks(tracks: Track<any>[], time: number): Partial<NodeProps> {
  const result: Partial<NodeProps> = {};
  for (const track of orderedTracks(tracks)) {
    if (time < (track.keyframes[0]?.time ?? 0) && result[track.property] !== undefined) continue;
    const value = evaluateTrack(track, time);
    if (value !== undefined) {
      result[track.property] = value as NodeProps[string];
    }
  }
  return result;
}

/** Group evaluated tracks by their declared target node. */
export function evaluateTracksByTarget(
  tracks: Track<any>[],
  time: number,
): Record<string, Partial<NodeProps>> {
  const result: Record<string, Partial<NodeProps>> = Object.create(null);
  for (const track of orderedTracks(tracks)) {
    const target = track.target ?? '__default__';
    if (time < (track.keyframes[0]?.time ?? 0) && result[target]?.[track.property] !== undefined) continue;
    const value = evaluateTrack(track, time);
    if (value === undefined) continue;
    (result[target] ??= {})[track.property] = value as NodeProps[string];
  }
  return result;
}

function orderedTracks(tracks: Track<any>[]): Track<any>[] {
  return [...tracks].sort((a, b) => (a.keyframes[0]?.time ?? 0) - (b.keyframes[0]?.time ?? 0));
}

export function sortKeyframes<T>(keyframes: Keyframe<T>[]): Keyframe<T>[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}
