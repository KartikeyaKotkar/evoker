export function cx(...values: (string | undefined | false)[]) { return values.filter(Boolean).join(' '); }

/** Preserve Base UI's state-aware className contract while adding Evoker's styling hook. */
export function partClass<State>(base: string, value?: string | ((state: State) => string | undefined)) {
  return typeof value === 'function' ? (state: State) => cx(base, value(state)) : cx(base, value);
}
