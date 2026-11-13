'use client';
import { Fragment, forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Button } from './button.js';
import { cx } from './style-utils.js';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  code: string;
  filename?: string;
  /** A display label; no language parser is bundled. */
  language?: string;
  lineNumbers?: boolean;
  startLine?: number;
  /** Displayed line numbers to emphasize. */
  highlightedLines?: readonly number[];
  defaultWrap?: boolean;
  copy?: boolean;
  /** Optional syntax tokens from an application-owned highlighter. Return one line without its newline. */
  renderLine?: (line: string, lineNumber: number) => ReactNode;
}

/** Original Evoker source surface. Clipboard content always comes from the unmodified code string. */
export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(function CodeBlock({
  code, filename, language = 'text', lineNumbers = true, startLine = 1,
  highlightedLines = [], defaultWrap = false, copy = true, renderLine, className, ...props
}, ref) {
  if (!Number.isSafeInteger(startLine) || startLine < 1) throw new Error('CodeBlock startLine must be a positive safe integer.');
  const id = useId();
  const content = useRef<HTMLPreElement>(null);
  const request = useRef(0);
  const [wrap, setWrap] = useState(defaultWrap);
  const [result, setResult] = useState<{ code: string; state: 'copying' | 'copied' | 'error' } | null>(null);
  const state = result?.code === code ? result.state : null;
  useEffect(() => {
    setResult(null);
    return () => { request.current++; };
  }, [code]);
  useEffect(() => {
    if (state !== 'copied') return;
    const timer = setTimeout(() => setResult(null), 2000);
    return () => clearTimeout(timer);
  }, [state, code]);
  const copyCode = async () => {
    const current = ++request.current;
    setResult({ code, state: 'copying' });
    try {
      await navigator.clipboard.writeText(code);
      if (current === request.current) setResult({ code, state: 'copied' });
    } catch {
      if (current !== request.current) return;
      setResult({ code, state: 'error' });
      // Keep a denied or unavailable clipboard useful through ordinary native copy.
      content.current?.focus({ preventScroll: true });
      const source = content.current?.querySelector('code');
      const selection = window.getSelection();
      if (source && selection) {
        const range = document.createRange();
        range.selectNodeContents(source);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };
  const lines = code.split('\n');
  if (!Number.isSafeInteger(startLine + lines.length - 1)) throw new Error('CodeBlock line numbers must be safe integers.');
  const highlights = new Set(highlightedLines);
  const title = filename || 'Source code';
  return <figure {...props} ref={ref} className={cx('evoker-code-block', className)}>
    <figcaption className="evoker-code-header">
      <div className="evoker-code-identity"><span className="evoker-code-signal" aria-hidden="true">{'</>'}</span><div>
        <span className="evoker-code-eyebrow">Signal / Source</span><span id={`${id}-title`} className="evoker-code-title">{title}</span>
      </div></div>
      <div className="evoker-code-actions">
        <Button variant="ghost" size="sm" aria-pressed={wrap} aria-controls={`${id}-content`} onClick={() => setWrap(value => !value)}>Wrap lines</Button>
        {copy && <Button variant="ghost" size="sm" disabled={state === 'copying'} aria-label={`Copy ${title}`} onClick={copyCode}>{state === 'copied' ? 'Copied' : state === 'copying' ? 'Copying' : 'Copy'}</Button>}
      </div>
    </figcaption>
    <pre ref={content} id={`${id}-content`} className="evoker-code-content" role="region" tabIndex={0} dir="ltr" aria-labelledby={`${id}-title`} data-wrap={wrap || undefined} data-line-numbers={lineNumbers || undefined}
      style={{ '--evoker-code-digits': `${String(startLine + lines.length - 1).length}ch` } as CSSProperties}>
      <code>{lines.map((line, index) => <Fragment key={index}><span className="evoker-code-line" data-highlighted={highlights.has(startLine + index) || undefined}>
        {lineNumbers && <span className="evoker-code-number" aria-hidden="true" data-line={startLine + index} />}{renderLine ? renderLine(line, startLine + index) : line}
      </span>{index < lines.length - 1 ? '\n' : null}</Fragment>)}</code>
    </pre>
    <div className="evoker-code-footer"><span>{language}</span><span role="status">{state === 'copied' ? 'Copied to clipboard.' : state === 'error' ? 'Copy unavailable. Code selected; copy manually.' : `${lines.length} ${lines.length === 1 ? 'line' : 'lines'}`}</span></div>
  </figure>;
});
