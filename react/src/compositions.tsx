'use client';
import { forwardRef, useId } from 'react';
import type { ComponentProps, HTMLAttributes, ReactNode } from 'react';
import { Button } from './button.js';
import { Gauge, KeyHint } from './components.js';
import type { GaugeProps, KeyHintProps } from './components.js';
import { DialogParts } from './overlays.js';
import { useReducedMotion } from './motion.js';
import { cx, partClass } from './style-utils.js';

export interface PartyGauge extends Pick<GaugeProps, 'label' | 'value' | 'max'> { id: string }
export interface PartyMember {
  id: string;
  name: string;
  /** Decorative, noninteractive application-owned content. */
  portrait?: ReactNode;
  status?: ReactNode;
  disabled?: boolean;
  gauges?: readonly PartyGauge[];
}
export interface PartyPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  label: string;
  members: readonly PartyMember[];
  value?: string | null;
  onValueChange?: (id: string) => void;
  emptyMessage?: string;
}
/** A roster becomes selectable only when the application supplies a change callback. */
export const PartyPanel = forwardRef<HTMLElement, PartyPanelProps>(function PartyPanel({ label, members, value, onValueChange, emptyMessage = 'No party members.', className, ...props }, ref) {
  const id = useId();
  return <section aria-label={label} {...props} ref={ref} className={cx('evoker-party-panel', className)}>
    <h2 className="evoker-composition-title">{label}</h2>
    {members.length ? <ul className="evoker-party-members">{members.map((member, index) => {
      const nameId = `${id}-${index}`;
      const selected = !member.disabled && member.id === value;
      return <li key={member.id} data-member-id={member.id} data-selected={selected || undefined}>
        <article aria-labelledby={nameId} className="evoker-party-member">
          {member.portrait != null && <div className="evoker-party-portrait" aria-hidden="true">{member.portrait}</div>}
          <div className="evoker-party-detail"><h3 id={nameId}>{onValueChange
            ? <button type="button" disabled={member.disabled} aria-pressed={selected} onClick={() => onValueChange(member.id)}>{member.name}</button>
            : member.name}</h3>
            {member.status != null && <div className="evoker-party-status">{member.status}</div>}
            <div className="evoker-party-gauges">{member.gauges?.map(gauge => <Gauge key={gauge.id} label={gauge.label} value={gauge.value} max={gauge.max} />)}</div>
          </div>
        </article>
      </li>;
    })}</ul> : <p className="evoker-empty">{emptyMessage}</p>}
  </section>;
});

export interface ResultMetric { id: string; label: string; value: ReactNode }
export interface ResultReward { id: string; label: string; detail?: ReactNode }
export interface ResultSummaryProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: string;
  metrics: readonly ResultMetric[];
  rewards?: readonly ResultReward[];
  actions?: ReactNode;
  emptyMessage?: string;
}
/** Values are final application data; no reward or progression rules are inferred. */
export const ResultSummary = forwardRef<HTMLElement, ResultSummaryProps>(function ResultSummary({ title, metrics, rewards = [], actions, children, emptyMessage = 'No results yet.', className, ...props }, ref) {
  const id = useId();
  return <section aria-labelledby={id} {...props} ref={ref} className={cx('evoker-result-summary', className)}>
    <header><h2 id={id} className="evoker-composition-title">{title}</h2></header>
    {children}
    {metrics.length ? <dl className="evoker-result-metrics">{metrics.map(metric => <div key={metric.id}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl> : <p className="evoker-empty">{emptyMessage}</p>}
    {rewards.length > 0 && <ul className="evoker-result-rewards" aria-label="Rewards">{rewards.map(reward => <li key={reward.id}><strong>{reward.label}</strong>{reward.detail != null && <span>{reward.detail}</span>}</li>)}</ul>}
    {actions != null && <footer className="evoker-composition-actions">{actions}</footer>}
  </section>;
});

export interface MessageLogEntry {
  id: string;
  speaker: string;
  message: ReactNode;
  /** Display content only; no date parsing or timezone conversion is performed. */
  timestamp?: ReactNode;
  actions?: ReactNode;
}
export interface MessageLogProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  label: string;
  entries: readonly MessageLogEntry[];
  emptyMessage?: string;
}
/** Native scrolling stays with the reader; appending history never changes focus or scroll. */
export const MessageLog = forwardRef<HTMLElement, MessageLogProps>(function MessageLog({ label, entries, emptyMessage = 'No messages yet.', className, ...props }, ref) {
  return <section role="log" aria-label={label} aria-live="polite" aria-relevant="additions" aria-atomic={false} tabIndex={0} {...props} ref={ref} className={cx('evoker-message-log', className)}>
    {entries.length ? <ol>{entries.map(entry => <li key={entry.id} data-message-id={entry.id}>
      <div className="evoker-message-heading"><strong>{entry.speaker}</strong>{entry.timestamp != null && <span>{entry.timestamp}</span>}</div>
      <div className="evoker-message-body">{entry.message}</div>
      {entry.actions != null && <div className="evoker-composition-actions">{entry.actions}</div>}
    </li>)}</ol> : <p className="evoker-empty">{emptyMessage}</p>}
  </section>;
});

export interface ActionBarItem {
  id: string;
  label: string;
  keys?: KeyHintProps['keys'];
  glyph?: ReactNode;
  disabled?: boolean;
}
export interface ActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  items: readonly ActionBarItem[];
  onAction: (id: string) => void;
  emptyMessage?: string;
}
/** Key hints describe application bindings; this group installs no keyboard shortcuts. */
export const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(function ActionBar({ label, items, onAction, emptyMessage = 'No actions available.', className, ...props }, ref) {
  return <div role="group" aria-label={label} {...props} ref={ref} className={cx('evoker-action-bar', className)}>
    {items.length ? items.map(item => <Button key={item.id} variant="outline" disabled={item.disabled} onClick={() => onAction(item.id)}>
      {item.keys != null ? <KeyHint keys={item.keys} action={item.label} glyph={item.glyph} /> : item.label}
    </Button>) : <p className="evoker-empty">{emptyMessage}</p>}
  </div>;
});

type DialogRootProps = ComponentProps<typeof DialogParts.Root>;
export interface StatusDialogProps extends Omit<ComponentProps<typeof DialogParts.Content>, 'title' | 'children' | 'ref'> {
  open: boolean;
  onOpenChange: NonNullable<DialogRootProps['onOpenChange']>;
  onOpenChangeComplete?: DialogRootProps['onOpenChangeComplete'];
  disablePointerDismissal?: boolean;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  closeLabel?: string;
}
/** Specialized opacity composition; Base UI retains ownership of focus and lifecycle. */
export const StatusDialog = forwardRef<HTMLDivElement, StatusDialogProps>(function StatusDialog({ open, onOpenChange, onOpenChangeComplete, disablePointerDismissal, title, description, children, actions, closeLabel = 'Close status dialog', className, style, ...props }, ref) {
  const reduced = useReducedMotion();
  const transitionDuration = reduced ? '0ms' : '150ms';
  return <DialogParts.Root open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete} disablePointerDismissal={disablePointerDismissal}>
    <DialogParts.Portal><DialogParts.Backdrop className="evoker-status-backdrop" style={{ transitionDuration }} />
      <DialogParts.Content {...props} ref={ref} className={partClass('evoker-status-dialog', className)}
        style={state => ({ ...(typeof style === 'function' ? style(state) : style), transitionDuration })}>
        <div className="evoker-modal-heading"><DialogParts.Title>{title}</DialogParts.Title>
          <DialogParts.Close render={<Button variant="ghost" size="icon" aria-label={closeLabel} />}>×</DialogParts.Close>
        </div>
        {description != null && <DialogParts.Description>{description}</DialogParts.Description>}
        <div className="evoker-dialog-body">{children}</div>
        {actions != null && <DialogParts.Footer>{actions}</DialogParts.Footer>}
      </DialogParts.Content>
    </DialogParts.Portal>
  </DialogParts.Root>;
});
