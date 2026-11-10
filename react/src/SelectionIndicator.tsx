import { useLayoutEffect } from 'react';
import type { CSSProperties } from 'react';
import { Timeline, track } from '@evoker/core';
import { useMotion } from './motion.js';

export interface SelectionIndicatorProps {
  x?: number; y?: number; angle?: number; width?: CSSProperties['width']; height?: CSSProperties['height'];
  active?: boolean; duration?: number; className?: string; style?: CSSProperties;
}
/** Decorative layer: coordinates belong to its positioned parent, never to DOM focus. */
export function SelectionIndicator({ x = 0, y = 0, angle = -2, width = '100%', height = '100%', active = true,
  duration = 100, className = '', style }: SelectionIndicatorProps) {
  const { ref, play } = useMotion();
  useLayoutEffect(() => {
    play(new Timeline({ duration, tracks: Object.entries({ translateX: x, translateY: y, rotate: angle, opacity: active ? 1 : 0 })
      .map(([property, value]) => track(property, [{ time: 0, value }, { time: duration, value }])) }),
    { blend: 'crossfade', blendDuration: duration });
  }, [x, y, angle, active, duration, play]);
  return <div aria-hidden="true" ref={ref} className={`evoker-selection ${className}`} style={{ width, height, ...style }}><i /><b /></div>;
}
