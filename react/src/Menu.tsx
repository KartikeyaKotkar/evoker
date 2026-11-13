import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { FocusGroup, InputMapper, staggeredItem } from '@kartikeyak/evoker-core';
import type { EasingFn, EasingName } from '@kartikeyak/evoker-core';
import { useMotion } from './motion.js';
import { SelectionIndicator } from './SelectionIndicator.js';

export interface MenuItem {
  id: string; label: string; description?: string; disabled?: boolean;
  /** Kept separate from entrance and cursor transforms. */
  angle?: number; offset?: number; scale?: number;
}
export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  items: readonly MenuItem[];
  onSelect?: (item: MenuItem, index: number) => void;
  onActiveChange?: (item: MenuItem, index: number) => void;
  duration?: number; stagger?: number; distance?: number; easing?: EasingName | EasingFn;
  wrap?: boolean; bindings?: Record<string, string[]>; itemStyle?: CSSProperties;
}
function MenuRow({ item, index, active, duration, stagger, distance, easing, activate, focus, itemStyle }: {
  item: MenuItem; index: number; active: boolean; duration: number; stagger: number; distance: number;
  easing: EasingName | EasingFn; activate: () => void; focus: () => void; itemStyle?: CSSProperties;
}) {
  const entrance = useMotion();
  useLayoutEffect(() => { entrance.play(staggeredItem(index, { itemDuration: duration, stagger, distance, easing })); },
    [entrance.play, index, duration, stagger, distance, easing]);
  return <div ref={entrance.ref} className="evoker-menu-item">
    <div style={{ transform: `translateX(${item.offset ?? 0}px) rotate(${item.angle ?? 0}deg) scale(${item.scale ?? 1})`, transformOrigin: 'left center' }}>
      <button type="button" role="menuitem" disabled={item.disabled} tabIndex={active ? 0 : -1}
        data-id={item.id} data-active={active} className="evoker-menu-button" style={itemStyle} onFocus={focus} onClick={activate}>
        <span className="evoker-menu-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="evoker-menu-copy"><span>{item.label}</span>{item.description && <small>{item.description}</small>}</span>
        <span className="evoker-menu-marker" aria-hidden="true">↗</span>
      </button>
    </div>
  </div>;
}

/** Stable ids preserve focus across reorder; disabled rows are skipped. */
export function Menu({ items, onSelect, onActiveChange, duration = 320, stagger = 32, distance = 40,
  easing = 'easeOut', wrap = true, bindings, itemStyle, onKeyDown, className = '', ...props }: MenuProps) {
  const [activeId, setActiveId] = useState<string | undefined>(() => items.find(item => !item.disabled)?.id);
  const enabled = items.filter(item => !item.disabled);
  const active = enabled.find(item => item.id === activeId) ?? enabled[0];
  useLayoutEffect(() => { setActiveId(active?.id); }, [active?.id]);
  const container = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ y: 0, height: 0 });
  const mapper = useMemo(() => new InputMapper({ bindings }), [bindings]);
  const selectFocus = (item: MenuItem) => {
    if (item.id === active?.id) return;
    setActiveId(item.id);
    onActiveChange?.(item, items.indexOf(item));
  };
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const rows = [...element.querySelectorAll<HTMLElement>('.evoker-menu-item')];
      const row = rows[items.findIndex(item => item.id === active?.id)];
      setIndicator({ y: row?.offsetTop ?? 0, height: row?.offsetHeight ?? 0 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const row of element.children) observer.observe(row);
    return () => observer.disconnect();
  }, [items, active?.id]);
  return <div {...props} className={`evoker-menu ${className}`} ref={container} role="menu" aria-orientation="vertical" onKeyDown={event => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || !active) return;
    const group = new FocusGroup(enabled, { wrap });
    group.moveTo(enabled.indexOf(active));
    const actions = mapper.mapKey(event.key);
    if (actions.includes('up')) group.move(-1);
    else if (actions.includes('down')) group.move(1);
    else if (actions.includes('home')) group.moveTo(0);
    else if (actions.includes('end')) group.moveTo(enabled.length - 1);
    else if (actions.includes('confirm') && event.key !== 'Enter' && event.key !== ' ') {
      onSelect?.(active, items.indexOf(active)); event.preventDefault(); return;
    } else return;
    event.preventDefault();
    const next = group.current!;
    [...container.current!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(button => button.dataset.id === next.id)?.focus();
  }}>
    <SelectionIndicator y={indicator.y} height={indicator.height} active={!!active} />
    {items.map((item, index) => <MenuRow key={item.id} item={item} index={index} active={active?.id === item.id}
      duration={duration} stagger={stagger} distance={distance} easing={easing} itemStyle={itemStyle}
      focus={() => selectFocus(item)} activate={() => { selectFocus(item); onSelect?.(item, index); }} />)}
  </div>;
}
