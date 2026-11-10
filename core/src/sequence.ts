/**
 * Sequence: composes timelines into serial and parallel groups, then flattens
 * them into a single timeline with absolute keyframe times.
 */

import type { Track } from './types.js';
import { Timeline } from './timeline.js';

interface Step {
  timeline: Timeline;
  offset: number;
}

export class Sequence {
  private readonly steps: Step[] = [];
  private cursor = 0;

  /** Append a timeline at an explicit offset, or at the current cursor. */
  add(timeline: Timeline, offset?: number): this {
    const start = offset ?? this.cursor;
    if (!Number.isFinite(start) || start < 0) throw new Error('Sequence offset must be finite and non-negative');
    this.steps.push({ timeline, offset: start });
    this.cursor = Math.max(this.cursor, start + timeline.duration);
    return this;
  }

  /** Append a timeline after the current cursor. */
  then(timeline: Timeline): this {
    return this.add(timeline, this.cursor);
  }

  /** Append timelines in parallel at the current cursor. */
  parallel(timelines: Timeline[]): this {
    const start = this.cursor;
    let end = start;
    for (const timeline of timelines) {
      this.steps.push({ timeline, offset: start });
      end = Math.max(end, start + timeline.duration);
    }
    this.cursor = end;
    return this;
  }

  get duration(): number {
    return this.cursor;
  }

  build(): Timeline {
    const tracks: Track<any>[] = [];
    for (const step of this.steps) {
      for (const source of step.timeline.tracks) {
        tracks.push({
          property: source.property,
          target: source.target,
          keyframes: source.keyframes.map((keyframe) => ({
            ...keyframe,
            time: keyframe.time + step.offset,
          })),
        });
      }
    }
    return new Timeline({ duration: this.cursor, tracks, name: 'sequence' });
  }
}
