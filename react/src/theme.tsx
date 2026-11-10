'use client';
import { createContext, forwardRef, useContext } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { EvokerProvider, useReducedMotion } from './motion.js';
import { cx } from './style-utils.js';

export interface ThemeProps extends HTMLAttributes<HTMLDivElement> {
  appearance?: 'dark' | 'light';
  density?: 'comfortable' | 'compact';
  reducedMotion?: boolean | 'system';
}
const ThemeContext = createContext({ appearance: 'dark' as 'dark' | 'light', density: 'comfortable' as 'comfortable' | 'compact', reduced: false, className: '', style: {} as CSSProperties });

const ThemeElement = forwardRef<HTMLDivElement, Omit<ThemeProps, 'reducedMotion'>>(function ThemeElement({ appearance = 'dark', density = 'comfortable', className, style, children, ...props }, ref) {
  const reduced = useReducedMotion();
  const parent = useContext(ThemeContext);
  const tokens = Object.fromEntries(Object.entries(style ?? {}).filter(([key]) => key.startsWith('--evoker-'))) as CSSProperties;
  return <ThemeContext.Provider value={{ appearance, density, reduced, className: cx(parent.className, className), style: { ...parent.style, ...tokens } }}>
    <div {...props} ref={ref} data-evoker-theme={appearance} data-density={density} data-reduced-motion={reduced} className={cx('evoker-theme', className)} style={style}>{children}</div>
  </ThemeContext.Provider>;
});
export const Theme = forwardRef<HTMLDivElement, ThemeProps>(function Theme({ reducedMotion, ...props }, ref) {
  const inherited = useReducedMotion();
  const parent = useContext(ThemeContext);
  return <EvokerProvider reducedMotion={reducedMotion ?? inherited}><ThemeElement {...props} appearance={props.appearance ?? parent.appearance} density={props.density ?? parent.density} ref={ref} /></EvokerProvider>;
});

/** Portals keep the same theme tokens and preferences as their logical React parent. */
export function PortalTheme({ children }: { children: ReactNode }) {
  const theme = useContext(ThemeContext);
  const reduced = useReducedMotion();
  return <div data-evoker-theme={theme.appearance} data-density={theme.density} data-reduced-motion={reduced}
    className={cx('evoker-theme evoker-portal-theme', theme.className)} style={{ ...theme.style, display: 'contents' }}>{children}</div>;
}
