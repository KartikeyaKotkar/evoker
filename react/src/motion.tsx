import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Player, Timeline, track } from '@kartikeyak/evoker-core';
import type { PlayOptions } from '@kartikeyak/evoker-core';
import { CssRenderer } from './CssRenderer.js';

const MotionPreference = createContext<boolean | 'system'>('system');
export function EvokerProvider({ reducedMotion = 'system', children }: { reducedMotion?: boolean | 'system'; children: ReactNode }) {
  return <MotionPreference.Provider value={reducedMotion}>{children}</MotionPreference.Provider>;
}
export function useReducedMotion(): boolean {
  const preference = useContext(MotionPreference);
  const [system, setSystem] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystem(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return preference === 'system' ? system : preference;
}

/** One element, one player. React owns mounting; the adapter owns animated inline properties. */
export function useMotion<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const [renderer] = useState(() => new CssRenderer());
  const [player] = useState(() => new Player({ apply: (props) => renderer.apply('element', props) }));
  useLayoutEffect(() => {
    if (!ref.current) return;
    const unregister = renderer.register('element', ref.current);
    let frame: number | undefined;
    const tick = (now: number) => {
      frame = undefined;
      player.update(now);
      if (player.isPlaying) frame = requestAnimationFrame(tick);
    };
    const start = player.on('start', () => {
      if (frame === undefined) frame = requestAnimationFrame(tick);
    });
    return () => {
      start();
      if (frame !== undefined) cancelAnimationFrame(frame);
      player.stop();
      unregister();
    };
  }, [player, renderer]);
  const play = useCallback((timeline: Timeline, options: PlayOptions = {}) => {
    if (reducedMotion) {
      const end = timeline.evaluate((options.direction ?? timeline.direction) === 'reverse' ? 0 : timeline.duration);
      player.play(new Timeline({ duration: 0, tracks: Object.entries(end).map(([property, value]) => track(property, [{ time: 0, value }])) }), { onFinished: options.onFinished });
    } else player.play(timeline, options);
  }, [player, reducedMotion]);
  return { ref, player, play };
}

export interface AnimatedProps extends HTMLAttributes<HTMLDivElement> {
  motion?: Timeline;
  playback?: PlayOptions;
}
export function Animated({ motion, playback, ...props }: AnimatedProps) {
  const { ref, play } = useMotion();
  useLayoutEffect(() => { if (motion) play(motion, playback); }, [motion, playback, play]);
  return <div {...props} ref={ref} />;
}
