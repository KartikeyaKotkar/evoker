import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { FocusGroup, Sequence, Timeline, fade, slide, track, wipe } from '@evoker/core';
import { useMotion, useReducedMotion } from './motion.js';
import { Button } from './button.js';
import { DialogParts, TabsParts } from './overlays.js';
export { Button, buttonClassName } from './button.js';
export type { ButtonProps } from './button.js';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string; eyebrow?: string; actions?: ReactNode; tone?: 'blue' | 'dark' | 'light'; cut?: number;
}
export function Panel({ title, eyebrow, actions, tone = 'blue', cut = 28, children, className = '', style, ...props }: PanelProps) {
  const id = useId();
  return <section aria-labelledby={title ? id : undefined} {...props} className={`evoker-panel evoker-panel--${tone} ${className}`}
    style={{ '--evoker-cut': `${Math.max(0, cut)}px`, ...style } as CSSProperties}>
    <div className="evoker-panel-plane" aria-hidden="true" />
    {(title || eyebrow || actions) && <header className="evoker-panel-header"><div>{eyebrow && <p className="evoker-eyebrow">{eyebrow}</p>}{title && <h3 id={id}>{title}</h3>}</div>{actions}</header>}
    <div className="evoker-panel-body">{children}</div>
  </section>;
}

export interface KeyHintProps extends HTMLAttributes<HTMLSpanElement> { keys: string | readonly string[]; action: string; glyph?: ReactNode }
export function KeyHint({ keys, action, glyph, className = '', ...props }: KeyHintProps) {
  const names = typeof keys === 'string' ? [keys] : keys;
  return <span {...props} className={`evoker-keyhint ${className}`}><span className="evoker-keyhint-keys">{glyph ? <span role="img" aria-label={names.join(' + ')}>{glyph}</span> : names.map((key, index) => <kbd key={index}>{key}</kbd>)}</span><span>{action}</span></span>;
}

export interface GaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number; max?: number; label: string; kind?: 'meter' | 'progressbar'; showValue?: boolean;
}
export function Gauge({ value, max = 100, label, kind = 'meter', showValue = true, className = '', ...props }: GaugeProps) {
  if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(value)) throw new Error('Gauge requires a finite value and positive finite max.');
  const current = Math.max(0, Math.min(max, value));
  const reduced = useReducedMotion();
  return <div {...props} className={`evoker-gauge ${className}`} role={kind} aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={current}>
    <div className="evoker-gauge-label"><span>{label}</span>{showValue && <span aria-hidden="true"><b>{current}</b><small> / {max}</small></span>}</div>
    <div className="evoker-gauge-track" aria-hidden="true"><div className="evoker-gauge-fill" style={{ width: `${current / max * 100}%`, transitionDuration: reduced ? '0ms' : undefined }} /></div>
  </div>;
}

export interface TabItem { id: string; label: string; content: ReactNode; disabled?: boolean }
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  items: readonly TabItem[]; value: string; onValueChange: (id: string) => void; label: string;
  indicatorDuration?: number; contentDuration?: number;
}
/** Automatic activation on arrow focus. Parent owns selected value. */
function SimpleTabs({ items, value, onValueChange, label, className = '', indicatorDuration = 100, contentDuration = 220, style, ...props }: TabsProps) {
  return <TabsParts.Root {...props} value={value} onValueChange={next => onValueChange(String(next))} className={`evoker-tabs ${className}`}
    style={{ '--evoker-tab-duration': `${indicatorDuration}ms`, '--evoker-content-duration': `${contentDuration}ms`, ...style } as CSSProperties}>
    <TabsParts.List aria-label={label} activateOnFocus>{items.map(item => <TabsParts.Trigger key={item.id} value={item.id} disabled={item.disabled}>{item.label}</TabsParts.Trigger>)}</TabsParts.List>
    {items.map(item => <TabsParts.Content key={item.id} value={item.id}>{item.content}</TabsParts.Content>)}
  </TabsParts.Root>;
}
export const Tabs = Object.assign(SimpleTabs, TabsParts);

export interface DialogProps extends Omit<React.ComponentProps<typeof DialogParts.Content>, 'title' | 'ref'> {
  open: boolean; onClose: () => void; title: string; actions?: ReactNode; closeLabel?: string;
}
function SimpleDialog({ open, onClose, title, actions, children, closeLabel = 'Close dialog', ...props }: DialogProps) {
  return <DialogParts.Root open={open} onOpenChange={next => { if (!next) onClose(); }}><DialogParts.Portal><DialogParts.Backdrop />
    <DialogParts.Content {...props}><div className="evoker-modal-heading"><DialogParts.Title>{title}</DialogParts.Title>
      <DialogParts.Close render={<Button variant="ghost" size="icon" aria-label={closeLabel} />}>×</DialogParts.Close></div>
      <div className="evoker-dialog-body">{children}</div>{actions && <DialogParts.Footer>{actions}</DialogParts.Footer>}
    </DialogParts.Content>
  </DialogParts.Portal></DialogParts.Root>;
}
export const Dialog = Object.assign(SimpleDialog, DialogParts);

export interface TransitionProps extends HTMLAttributes<HTMLDivElement> {
  show: boolean; effect?: 'fade' | 'slide' | 'wipe'; duration?: number; onExited?: () => void;
}
/** Retains exit content until playback ends. Reversals blend from the displayed pose. */
export function Transition({ show, effect = 'wipe', duration = 280, onExited, children, ...props }: TransitionProps) {
  const { ref, play, player } = useMotion();
  const [present, setPresent] = useState(show);
  const exited = useRef(onExited);
  exited.current = onExited;
  useLayoutEffect(() => { if (show) setPresent(true); }, [show]);
  useLayoutEffect(() => {
    if (!present) return;
    const opacity = fade({ from: show ? 0 : 1, to: show ? 1 : 0, duration });
    const movement = effect === 'wipe' ? wipe({ duration, reverse: !show }) : effect === 'slide'
      ? new Timeline({ duration, tracks: [track('translateX', [{ time: 0, value: show ? -32 : 0 }, { time: duration, value: show ? 0 : 32, easing: 'easeOut' }])] }) : opacity;
    const reset = new Timeline({ duration, tracks: [
      ...(effect !== 'wipe' ? [track('clipRight', [{ time: 0, value: 0 }])] : []),
      ...(effect !== 'slide' ? [track('translateX', [{ time: 0, value: 0 }])] : []),
    ] });
    play(new Sequence().parallel([opacity, movement, reset]).build(), { blend: 'crossfade', blendDuration: Math.min(100, duration), onFinished: () => {
      if (!show) { setPresent(false); exited.current?.(); }
    } });
    return () => player.stop();
  }, [present, show, effect, duration, play, player]);
  return <div {...props} ref={ref} hidden={!present} {...(!show ? { inert: '' } : {})} aria-hidden={!show || undefined}>{present ? children : null}</div>;
}
