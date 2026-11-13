import { forwardRef, useId, useLayoutEffect } from 'react';
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { fade } from '@k2x/evoker-core';
import { Button } from './components.js';
import { useMotion } from './motion.js';

export interface SettingRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  description: string;
  control: (attributes: { id: string; 'aria-describedby': string }) => ReactNode;
}
/** The caller supplies a semantic control; this row connects its label and help. */
export function SettingRow({ label, description, control, className = '', ...props }: SettingRowProps) {
  const id = useId();
  return <div {...props} className={`evoker-setting ${className}`}><div className="evoker-setting-main"><label htmlFor={id}>{label}</label>
    <div>{control({ id, 'aria-describedby': `${id}-help` })}</div></div><p id={`${id}-help`}>{description}</p></div>;
}

export interface NameEntryProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> {
  label: string;
  hint?: string;
  onCommit?: (value: string) => void;
}
/** Native input preserves selection, IME, validation, form participation and autofill. */
export const NameEntry = forwardRef<HTMLInputElement, NameEntryProps>(function NameEntry({ label, hint, onCommit, className = '', id, onKeyDown,
  'aria-describedby': describedBy, ...props }, inputRef) {
  const generated = useId();
  const inputId = id ?? generated;
  const { ref, play } = useMotion();
  useLayoutEffect(() => { play(fade({ delay: 50, duration: 50 })); }, [play]);
  return <div ref={ref} className={`evoker-nameentry ${className}`}><label htmlFor={inputId}>{label}</label>
    <div className="evoker-nameentry-field"><input {...props} ref={inputRef} id={inputId} type="text"
      aria-describedby={[describedBy, hint ? `${generated}-hint` : ''].filter(Boolean).join(' ') || undefined}
      onKeyDown={event => {
        onKeyDown?.(event);
        if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || event.key !== 'Enter' || !onCommit) return;
        event.preventDefault();
        if (event.currentTarget.reportValidity()) onCommit(event.currentTarget.value);
      }} /><span aria-hidden="true">↵</span></div>
    {hint && <p id={`${generated}-hint`}>{hint}</p>}
  </div>;
});

export interface TutorialCalloutProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  children: ReactNode;
  step?: string;
  onDismiss?: () => void;
  dismissLabel?: string;
  targetId?: string;
}
/** Inline guidance with an original pointer. Application layout places it beside its target. */
export function TutorialCallout({ title, children, step, onDismiss, dismissLabel = 'Dismiss hint', targetId, className = '', ...props }: TutorialCalloutProps) {
  const id = useId();
  return <aside {...props} className={`evoker-tutorial ${className}`} aria-labelledby={id}>
    <div className="evoker-tutorial-head">{step && <span className="evoker-eyebrow">{step}</span>}{onDismiss && <Button variant="ghost" aria-label={dismissLabel} onClick={onDismiss}>×</Button>}</div>
    <h3 id={id}>{title}</h3><div>{children}</div>{targetId && <a href={`#${encodeURIComponent(targetId)}`} className="evoker-tutorial-link">Go to target ↗</a>}
  </aside>;
}
