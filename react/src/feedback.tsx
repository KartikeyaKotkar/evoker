import { useLayoutEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Sequence, Timeline, fade, scale, slide, track } from '@k2x/evoker-core';
import { Button } from './components.js';
import { Menu } from './Menu.js';
import type { MenuItem } from './Menu.js';
import { useMotion } from './motion.js';

export interface DateBadgeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** ISO calendar date, interpreted without the browser's local timezone. */
  date: string;
  period?: string;
  phase?: 'new' | 'half' | 'full';
  locale?: string;
}
export function DateBadge({ date, period, phase, locale = 'en', className = '', ...props }: DateBadgeProps) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('DateBadge requires a valid YYYY-MM-DD calendar date.');
  }
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(parsed);
  const accessibleDate = format({ dateStyle: 'full' });
  return <time {...props} dateTime={date} className={`evoker-date ${className}`} aria-label={[accessibleDate, period, phase ? `${phase} moon` : ''].filter(Boolean).join(', ')}
    data-double-digit={parsed.getUTCDate() >= 10}>
    <span className="evoker-date-month" aria-hidden="true">{format({ month: 'short' })}</span><strong aria-hidden="true">{format({ day: 'numeric' })}</strong>
    <span className="evoker-date-context" aria-hidden="true"><b>{format({ weekday: 'short' })}</b>{period && <span>{period}</span>}</span>
    {phase && <span aria-hidden="true" className={`evoker-moon evoker-moon--${phase}`} />}
  </time>;
}

export interface RankChangeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> { label: string; value: number }
/** Outgoing value, incoming value and ring have independent animation ownership. */
export function RankChange({ label, value, className = '', ...props }: RankChangeProps) {
  if (!Number.isFinite(value)) throw new Error('RankChange requires a finite value.');
  const previous = useRef(value);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const incomingMotion = useMotion();
  const outgoingMotion = useMotion();
  const ringMotion = useMotion();
  useLayoutEffect(() => {
    const changed = previous.current !== value;
    if (changed) setOutgoing(previous.current);
    previous.current = value;
    incomingMotion.play(new Sequence().parallel([fade({ duration: 180 }), slide({ direction: 'down', distance: 18, duration: 260 })]).build(), { blend: 'crossfade', blendDuration: 80 });
    outgoingMotion.play(new Timeline({ duration: 180, tracks: [
      track('opacity', [{ time: 0, value: changed ? 1 : 0 }, { time: 180, value: 0 }]),
      track('translateY', [{ time: 0, value: 0 }, { time: 180, value: -20, easing: 'easeOut' }]),
    ] }), { onFinished: () => setOutgoing(null) });
    ringMotion.play(new Sequence().parallel([scale({ from: .7, to: 1.4, duration: 430 }), fade({ from: changed ? .8 : 0, to: 0, duration: 430 })]).build());
  }, [value, incomingMotion.play, outgoingMotion.play, ringMotion.play]);
  return <div {...props} className={`evoker-rank ${className}`}>
    <span ref={ringMotion.ref} className="evoker-rank-ring" aria-hidden="true" />
    <span className="evoker-rank-label">{label}</span><div className="evoker-rank-values">
      <div ref={outgoingMotion.ref} className="evoker-rank-outgoing" aria-hidden="true">{outgoing}</div>
      <div ref={incomingMotion.ref}><output aria-label={label} aria-live="polite" aria-atomic="true">{value}</output></div>
    </div>
  </div>;
}

export interface DialogueProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect' | 'title'> {
  speaker: string;
  portrait?: ReactNode;
  choices?: readonly MenuItem[];
  onChoose?: (id: string) => void;
  onAdvance?: () => void;
  advanceLabel?: string;
}
/** Message, speaker label, portrait, advance action and choices stay independently composable. */
export function Dialogue({ speaker, portrait, choices = [], onChoose, onAdvance, advanceLabel = 'Continue dialogue', children, className = '', ...props }: DialogueProps) {
  return <article {...props} className={`evoker-dialogue ${className}`} aria-label={`${speaker} dialogue`}>
    {portrait && <div className="evoker-dialogue-portrait">{portrait}</div>}
    <div className="evoker-dialogue-message"><h3 className="evoker-dialogue-speaker">{speaker}</h3><div className="evoker-dialogue-body" aria-live="polite">{children}</div>
      {onAdvance && <Button className="evoker-dialogue-advance" variant="ghost" onClick={onAdvance} aria-label={advanceLabel}>Next ▷</Button>}
    </div>
    {choices.length > 0 && <div className="evoker-dialogue-choices"><Menu aria-label={`Choices for ${speaker}`} items={choices} duration={180} stagger={24} onSelect={item => onChoose?.(item.id)} /></div>}
  </article>;
}

export interface CutInProps extends HTMLAttributes<HTMLDivElement> {
  show: boolean;
  duration?: number;
  onExited?: () => void;
}
/** Authored independent-axis motion, informed by the recovered RenderTransform binding. */
export function CutIn({ show, duration = 150, onExited, children, className = '', ...props }: CutInProps) {
  const { ref, play, player } = useMotion();
  const [present, setPresent] = useState(show);
  const finished = useRef(onExited);
  finished.current = onExited;
  useLayoutEffect(() => { if (show) setPresent(true); }, [show]);
  useLayoutEffect(() => {
    if (!present) return;
    play(new Timeline({ duration, tracks: [
      track('scaleX', [{ time: 0, value: show ? .03 : 1 }, { time: duration * .55, value: show ? .8 : 1.3, easing: 'easeOut' }, { time: duration, value: show ? 1 : 0, easing: 'easeOut' }]),
      track('scaleY', [{ time: 0, value: show ? .9 : 1 }, { time: duration * .55, value: show ? .12 : .15, easing: 'easeOut' }, { time: duration, value: show ? 1 : 0, easing: 'easeOut' }]),
      track('opacity', [{ time: 0, value: show ? 0 : 1 }, { time: duration, value: show ? 1 : 0 }]),
    ] }), { blend: 'crossfade', blendDuration: Math.min(60, duration), onFinished: () => { if (!show) { setPresent(false); finished.current?.(); } } });
    return () => player.stop();
  }, [present, show, duration, play, player]);
  return <div {...props} ref={ref} className={`evoker-cutin ${className}`} hidden={!present} aria-hidden={!show || undefined} {...(!show ? { inert: '' } : {})}>{present ? children : null}</div>;
}
