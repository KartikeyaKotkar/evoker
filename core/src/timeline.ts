/**
 * Timeline: a duration plus a set of keyframe tracks.
 */

import type { Direction, Track } from './types.js';
import { evaluateTracks, evaluateTracksByTarget } from './track.js';
import { clamp } from './types.js';
import type { NodeProps } from './types.js';

export interface TimelineOptions {
  duration: number;
  tracks: Track<any>[];
  loop?: number;
  direction?: Direction;
  name?: string;
}

export class Timeline {
  readonly duration: number;
  readonly tracks: Track<any>[];
  readonly loop: number;
  readonly direction: Direction;
  readonly name?: string;

  constructor(options: TimelineOptions) {
    if (!Number.isFinite(options.duration) || options.duration < 0) {
      throw new Error('Timeline duration must be finite and non-negative');
    }
    const loop = options.loop ?? 1;
    if (loop !== Infinity && (!Number.isInteger(loop) || loop < 1)) {
      throw new Error('Loop must be a positive iteration count or Infinity');
    }
    this.duration = options.duration;
    this.tracks = options.tracks.map((track) => {
      for (const keyframe of track.keyframes) {
        if (!Number.isFinite(keyframe.time) || keyframe.time < 0 || keyframe.time > options.duration) {
          throw new Error('Keyframe time must be within the timeline duration');
        }
      }
      return { ...track, keyframes: [...track.keyframes].sort((a, b) => a.time - b.time) };
    });
    this.loop = loop;
    this.direction = options.direction ?? 'normal';
    this.name = options.name;
  }

  /** Evaluate all tracks at `time` milliseconds and merge into one property map. */
  evaluate(time: number): Partial<NodeProps> {
    return evaluateTracks(this.tracks, clamp(time, 0, this.duration));
  }

  /** Evaluate tracks grouped by their target node id. */
  evaluateByTarget(time: number): Record<string, Partial<NodeProps>> {
    return evaluateTracksByTarget(this.tracks, clamp(time, 0, this.duration));
  }

  clone(): Timeline {
    return new Timeline({
      duration: this.duration,
      tracks: this.tracks.map((track) => ({
        property: track.property,
        target: track.target,
        keyframes: track.keyframes.map((keyframe) => ({ ...keyframe })),
      })),
      loop: this.loop,
      direction: this.direction,
      name: this.name,
    });
  }
}

export function track<T>(
  property: string,
  keyframes: Track<T>['keyframes'],
  target?: string,
): Track<T> {
  return { property, keyframes, target };
}
