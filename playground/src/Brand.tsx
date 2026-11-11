import type { MouseEventHandler } from 'react';

/** The repository's official SVG mark is shared by the playground and docs. */
export function BrandLink({ onClick }: { onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  return <a href="#" className="wordmark" aria-label="Evoker home" onClick={onClick}>
    <img src={`${import.meta.env.BASE_URL}brand/evoker-mark.svg`} width={32} height={32} alt="" />
    evoker<span> / UI</span>
  </a>;
}
