import { sourceBlockPages } from './BlockPages.js';

/** Playground and documentation mount the same examples and behavior. */
export function SourceComponents() {
  return <>{sourceBlockPages.map((page, index) => <article key={page.id} id={`demo-${page.id}`} tabIndex={-1}
    className={`specimen ${['inspector-list', 'dialogue', 'cut-in', 'tutorial-callout'].includes(page.id) ? 'specimen-wide' : ''}`}>
    <div className="specimen-label"><span>{String(index + 10).padStart(2, '0')} / {page.title}</span><a href={`#/docs/${page.id}`}>Docs ↗</a></div>
    {page.examples[0]!.node}
  </article>)}</>;
}
