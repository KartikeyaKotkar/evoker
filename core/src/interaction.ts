/**
 * Interaction abstractions: focus groups, directional navigation, input
 * mapping, and selection effects.
 */

export type Orientation = 'vertical' | 'horizontal' | 'grid';
export type NavDirection = 'up' | 'down' | 'left' | 'right';

export interface FocusGroupOptions {
  orientation?: Orientation;
  wrap?: boolean;
  columns?: number;
}

export interface FocusGroupEvents {
  change: { cursor: number };
  select: { index: number };
  boundary: { direction: NavDirection };
}

type Listener<K extends keyof FocusGroupEvents> = (payload: FocusGroupEvents[K]) => void;

export class FocusGroup<T = unknown> {
  items: T[];
  cursor = 0;
  orientation: Orientation;
  wrap: boolean;
  columns: number;

  private readonly listeners: {
    [K in keyof FocusGroupEvents]: Set<Listener<K>>;
  } = {
    change: new Set(),
    select: new Set(),
    boundary: new Set(),
  };

  constructor(items: T[] = [], options: FocusGroupOptions = {}) {
    this.items = items;
    this.orientation = options.orientation ?? 'vertical';
    this.wrap = options.wrap ?? true;
    this.columns = options.columns ?? 1;
    if (!Number.isInteger(this.columns) || this.columns < 1) throw new Error('Grid columns must be a positive integer');
  }

  setItems(items: T[]): void {
    const previous = this.cursor;
    this.items = items;
    if (this.cursor >= items.length) this.cursor = Math.max(0, items.length - 1);
    if (previous !== this.cursor) this.emit('change', { cursor: this.cursor });
  }

  get size(): number {
    return this.items.length;
  }

  get current(): T | undefined {
    return this.items[this.cursor];
  }

  on<K extends keyof FocusGroupEvents>(event: K, listener: Listener<K>): () => void {
    this.listeners[event].add(listener);
    return () => this.listeners[event].delete(listener);
  }

  private emit<K extends keyof FocusGroupEvents>(event: K, payload: FocusGroupEvents[K]): void {
    for (const listener of this.listeners[event]) listener(payload);
  }

  move(delta: number): void {
    if (!Number.isInteger(delta)) throw new Error('Navigation delta must be an integer');
    const size = this.items.length;
    if (size === 0) return;
    const next = this.cursor + delta;
    if (this.wrap) {
      const wrapped = ((next % size) + size) % size;
      if (wrapped !== this.cursor) {
        this.cursor = wrapped;
        this.emit('change', { cursor: wrapped });
      }
    } else if (next >= 0 && next < size) {
      this.cursor = next;
      this.emit('change', { cursor: next });
    } else {
      this.emit('boundary', {
        direction: delta > 0 ? (this.orientation === 'vertical' ? 'down' : 'right') : this.orientation === 'vertical' ? 'up' : 'left',
      });
    }
  }

  moveTo(index: number): void {
    if (!Number.isInteger(index)) throw new Error('Focus index must be an integer');
    const size = this.items.length;
    if (size === 0) return;
    const clamped = Math.max(0, Math.min(size - 1, index));
    if (clamped !== this.cursor) {
      this.cursor = clamped;
      this.emit('change', { cursor: clamped });
    }
  }

  select(index: number = this.cursor): void {
    const size = this.items.length;
    if (size === 0) return;
    this.moveTo(index);
    this.emit('select', { index: this.cursor });
  }
}

export class Navigation {
  groups: FocusGroup[] = [];
  active = 0;

  addGroup(group: FocusGroup): void {
    this.groups.push(group);
  }

  setActive(index: number): void {
    if (index >= 0 && index < this.groups.length) this.active = index;
  }

  move(direction: NavDirection): void {
    const group = this.groups[this.active];
    if (!group) return;
    const vertical = group.orientation === 'vertical';
    if (group.orientation === 'grid') {
      const delta = direction === 'up' ? -group.columns : direction === 'down' ? group.columns : direction === 'left' ? -1 : 1;
      group.move(delta);
    } else if (direction === 'up' && vertical) group.move(-1);
    else if (direction === 'down' && vertical) group.move(1);
    else if (direction === 'left' && !vertical) group.move(-1);
    else if (direction === 'right' && !vertical) group.move(1);
  }
}

export type InputAction =
  | NavDirection
  | 'confirm'
  | 'cancel'
  | 'pageUp'
  | 'pageDown'
  | 'home'
  | 'end'
  | string;

export interface InputMapperOptions {
  bindings?: Record<InputAction, string[]>;
}

const DEFAULT_BINDINGS: Record<string, string[]> = {
  up: ['ArrowUp', 'w', 'W'],
  down: ['ArrowDown', 's', 'S'],
  left: ['ArrowLeft', 'a', 'A'],
  right: ['ArrowRight', 'd', 'D'],
  confirm: ['Enter', ' ', 'z', 'Z'],
  cancel: ['Escape', 'Backspace', 'x', 'X'],
  pageUp: ['PageUp'],
  pageDown: ['PageDown'],
  home: ['Home'],
  end: ['End'],
};

export class InputMapper {
  private readonly bindings = new Map<string, InputAction[]>();

  constructor(options: InputMapperOptions = {}) {
    const merged = { ...DEFAULT_BINDINGS, ...(options.bindings ?? {}) };
    for (const [action, keys] of Object.entries(merged)) {
      this.bind(action as InputAction, keys);
    }
  }

  bind(action: InputAction, keys: string[]): void {
    for (const key of keys) {
      const existing = this.bindings.get(key) ?? [];
      if (!existing.includes(action)) existing.push(action);
      this.bindings.set(key, existing);
    }
  }

  unbind(action: InputAction): void {
    for (const [key, actions] of this.bindings) {
      const filtered = actions.filter((entry) => entry !== action);
      if (filtered.length === 0) this.bindings.delete(key);
      else this.bindings.set(key, filtered);
    }
  }

  mapKey(key: string): InputAction[] {
    return this.bindings.get(key) ?? [];
  }

  handleKeyboardEvent(event: { key: string }): InputAction[] {
    return this.mapKey(event.key);
  }
}

export interface SelectionControllerOptions {
  select?: () => void;
  deselect?: () => void;
  hover?: () => void;
}

/** Glue between a FocusGroup and motion callbacks. */
export class SelectionController {
  constructor(
    private readonly group: FocusGroup,
    private readonly handlers: SelectionControllerOptions,
  ) {
  }

  move(delta: number): void {
    const previous = this.group.cursor;
    this.group.move(delta);
    if (this.group.cursor !== previous) this.handlers.hover?.();
  }

  select(): void {
    this.handlers.select?.();
    this.group.select();
  }

  deselect(): void {
    this.handlers.deselect?.();
  }
}
