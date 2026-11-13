import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { FocusGroup, Sequence, Timeline, fade, slide, track, wipe } from '@k2x/evoker-core';
import { Gauge, Panel } from './components.js';
import { useMotion } from './motion.js';

export interface InspectorItem {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
}
export interface InspectorListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  items: readonly InspectorItem[];
  value: string | null;
  onValueChange: (id: string) => void;
  onActivate?: (item: InspectorItem) => void;
  label: string;
  detail: (item: InspectorItem) => ReactNode;
  emptyMessage?: string;
  wrap?: boolean;
}
/** Selection and activation are distinct; descriptions and actions stay outside the listbox. */
export function InspectorList({ items, value, onValueChange, onActivate, label, detail, emptyMessage = 'No entries available.',
  wrap = false, className = '', ...props }: InspectorListProps) {
  const root = useRef<HTMLDivElement>(null);
  const [cursorId, setCursorId] = useState<string | null>(value);
  const enabled = items.filter(item => !item.disabled);
  const selected = enabled.find(item => item.id === value);
  const cursor = enabled.find(item => item.id === cursorId) ?? selected ?? enabled[0];
  const detailsId = useId();
  const { ref, play } = useMotion();
  useLayoutEffect(() => {
    play(new Sequence().parallel([fade({ duration: 180 }), slide({ duration: 220, delay: 30, distance: 20 }), wipe({ duration: 230 })]).build(),
      { blend: 'crossfade', blendDuration: 80 });
  }, [selected?.id, play]);
  return <div {...props} ref={root} className={`evoker-inspector ${className}`}>
    <div role="listbox" aria-label={label} aria-orientation="vertical" className="evoker-inspector-list" onKeyDown={event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || !cursor) return;
      const group = new FocusGroup(enabled, { wrap });
      group.moveTo(enabled.indexOf(cursor));
      if (event.key === 'ArrowDown') group.move(1);
      else if (event.key === 'ArrowUp') group.move(-1);
      else if (event.key === 'Home') group.moveTo(0);
      else if (event.key === 'End') group.moveTo(enabled.length - 1);
      else return;
      event.preventDefault();
      const next = group.current!;
      if (next.id !== value) onValueChange(next.id);
      [...root.current!.querySelectorAll<HTMLButtonElement>('[role="option"]')].find(button => button.dataset.id === next.id)?.focus();
    }}>
      {items.map(item => <button type="button" role="option" key={item.id} data-id={item.id} aria-selected={selected?.id === item.id}
        disabled={item.disabled} tabIndex={cursor?.id === item.id ? 0 : -1} aria-controls={detailsId}
        onFocus={() => setCursorId(item.id)} onClick={() => { if (item.id !== value) onValueChange(item.id); onActivate?.(item); }}>
        <span className="evoker-inspector-item"><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>
        {item.meta && <span className="evoker-inspector-meta">{item.meta}</span>}<i aria-hidden="true">›</i>
      </button>)}
      {items.length === 0 && <p className="evoker-empty">{emptyMessage}</p>}
    </div>
    <section id={detailsId} aria-label={`${label} details`} className="evoker-inspector-detail"><div ref={ref}>
      {selected ? detail(selected) : <p className="evoker-empty">{items.length ? 'Select an entry to inspect.' : emptyMessage}</p>}
    </div></section>
  </div>;
}

export interface ComparisonRow { id: string; label: string; current: number; candidate: number; higherIsBetter?: boolean }
export interface ComparisonPanelProps extends HTMLAttributes<HTMLElement> {
  title: string;
  rows: readonly ComparisonRow[];
  currentLabel?: string;
  candidateLabel?: string;
}
export function ComparisonPanel({ title, rows, currentLabel = 'Current', candidateLabel = 'Candidate', className = '', ...props }: ComparisonPanelProps) {
  for (const row of rows) if (!Number.isFinite(row.current) || !Number.isFinite(row.candidate) || !Number.isFinite(row.candidate - row.current)) {
    throw new Error('ComparisonPanel requires finite values and differences.');
  }
  return <section {...props} className={`evoker-comparison ${className}`}>
    <table><caption>{title}</caption><thead><tr><th scope="col">Attribute</th><th scope="col">{currentLabel}</th><th scope="col">{candidateLabel}</th><th scope="col">Change</th></tr></thead>
      <tbody>{rows.map(row => {
        const delta = row.candidate - row.current;
        const outcome = delta === 0 ? 'Unchanged' : (delta > 0) === (row.higherIsBetter ?? true) ? 'Better' : 'Worse';
        return <tr key={row.id} data-outcome={outcome.toLowerCase()}><th scope="row">{row.label}</th><td>{row.current}</td><td><strong>{row.candidate}</strong></td>
          <td><span aria-hidden="true">{delta === 0 ? '—' : delta > 0 ? '↑' : '↓'} </span>{delta > 0 ? '+' : ''}{Number(delta.toPrecision(12))}<small>{outcome}</small></td></tr>;
      })}</tbody>
    </table>
  </section>;
}

export interface RecordCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  metadata?: readonly { label: string; value: ReactNode }[];
  leading?: ReactNode;
  selected?: boolean;
  empty?: boolean;
}
/** Native rectangular button hit area; only decorative layers are clipped. */
export function RecordCard({ label, metadata = [], leading, selected = false, empty = false, className = '', type = 'button', ...props }: RecordCardProps) {
  return <button {...props} type={type} className={`evoker-record ${className}`} aria-pressed={selected} data-empty={empty}>
    {leading && <span className="evoker-record-leading">{leading}</span>}
    <span className="evoker-record-content"><strong>{label}</strong><span className="evoker-record-metadata">{metadata.map((entry, index) => <span key={index}><small>{entry.label}</small><span>{entry.value}</span></span>)}</span></span>
    <span aria-hidden="true" className="evoker-record-marker">{empty ? '+' : '↗'}</span>
  </button>;
}

export interface ContactTileProps extends Omit<RecordCardProps, 'metadata' | 'leading' | 'empty'> {
  summary: string;
  avatar?: ReactNode;
  unread?: boolean;
}
export function ContactTile({ label, summary, avatar, unread = false, className = '', 'aria-label': accessibleLabel, ...props }: ContactTileProps) {
  const { ref, play } = useMotion<HTMLSpanElement>();
  useLayoutEffect(() => {
    play(new Timeline({ duration: unread ? 500 : 0, tracks: [track('rotate', unread ? [
      { time: 0, value: 0 }, { time: 100, value: -8 }, { time: 220, value: 5 }, { time: 350, value: -3 }, { time: 500, value: 0 },
    ] : [{ time: 0, value: 0 }])] }));
  }, [unread, play]);
  return <RecordCard {...props} label={label} className={`evoker-contact ${className}`} aria-label={accessibleLabel ?? `${label}${unread ? ', unread' : ''}. ${summary}`}
    data-unread={unread} leading={<span className="evoker-contact-avatar" aria-hidden="true">{avatar ?? label.slice(0, 1)}</span>}
    metadata={[{ label: 'Message', value: summary }, { label: 'Status', value: <span ref={ref} className="evoker-contact-status">{unread ? 'New' : 'Read'}</span> }]} />;
}

export interface QuestRequirement { id: string; label: string; completed?: boolean }
export interface QuestBriefProps extends HTMLAttributes<HTMLElement> {
  title: string;
  requirements: readonly (string | QuestRequirement)[];
  onRequirementChange?: (id: string, completed: boolean) => void;
  actions?: ReactNode;
  status?: string;
  deadline?: ReactNode;
  reward?: ReactNode;
  children?: ReactNode;
}
export function QuestBrief({ title, requirements, onRequirementChange, actions, status = 'Open', deadline, reward, children, className = '', ...props }: QuestBriefProps) {
  const tracked = requirements.some(requirement => typeof requirement !== 'string');
  const completed = requirements.filter(requirement => typeof requirement !== 'string' && requirement.completed).length;
  return <Panel {...props} title={title} eyebrow={status} className={`evoker-quest ${className}`}>
    {children}{deadline && <p className="evoker-quest-deadline">Due <strong>{deadline}</strong></p>}
    {tracked && <Gauge label="Objective progress" kind="progressbar" value={completed} max={requirements.length} />}
    <ul>{requirements.map((requirement, index) => typeof requirement === 'string'
      ? <li key={`text-${index}`}>{requirement}</li>
      : <li key={`objective-${requirement.id}`} data-completed={!!requirement.completed}>
        {onRequirementChange ? <label><input type="checkbox" checked={!!requirement.completed} onChange={event => onRequirementChange(requirement.id, event.target.checked)} />{requirement.label}</label>
          : <span>{requirement.label}<small>{requirement.completed ? ' — Complete' : ' — Incomplete'}</small></span>}
      </li>)}</ul>
    {reward && <div className="evoker-quest-reward"><small>Reward</small><div>{reward}</div></div>}
    {actions && <div className="evoker-composition-actions">{actions}</div>}
  </Panel>;
}
