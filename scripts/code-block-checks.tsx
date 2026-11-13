import { StrictMode, createRef } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { CodeBlock, Theme } from '@evoker/react';

export async function runCodeBlockChecks() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const pause = () => new Promise(resolve => setTimeout(resolve, 30));
  const render = (node: ReactNode) => flushSync(() => root.render(<StrictMode><Theme>{node}</Theme></StrictMode>));
  const clipboard = (writeText?: (text: string) => Promise<void>) => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: writeText ? { writeText } : undefined });
  const click = (label: string) => flushSync(() => [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === label)!.click());
  const source = 'const html = "<img src=x onerror=alert(1)>";\n\n  signal();\n';
  try {
    const ref = createRef<HTMLElement>();
    render(<CodeBlock ref={ref} code={source} filename="signal.ts" language="typescript" startLine={30} highlightedLines={[32]} data-test="source" />);
    check(ref.current === host.querySelector('figure') && ref.current?.dataset.test === 'source', 'CodeBlock must forward figure attributes and ref');
    check(host.querySelector('code')!.textContent === source && !host.querySelector('img'), 'Code must preserve exact whitespace and escape markup');
    const pre = host.querySelector('pre')!;
    check(pre.tabIndex === 0 && pre.dir === 'ltr' && document.getElementById(pre.getAttribute('aria-labelledby')!)?.textContent === 'signal.ts', 'Code needs a named LTR keyboard-scrollable region');
    check(host.querySelector('.evoker-code-number')?.getAttribute('data-line') === '30' && [...host.querySelectorAll('.evoker-code-number')].every(number => number.getAttribute('aria-hidden') === 'true' && !number.textContent), 'Line numbers must start at the supplied offset and stay out of copied text');
    check(host.querySelector('.evoker-code-line[data-highlighted]')?.textContent === '  signal();', 'Highlights must use displayed line numbers');
    const range = document.createRange();
    range.selectNodeContents(host.querySelector('code')!);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    const selected = window.getSelection()!.toString();
    // Chromium may omit the terminal empty line from a rendered native selection.
    check(selected === source || selected === source.slice(0, -1), 'Native selection must preserve indentation and blank lines without gutter numbers');
    window.getSelection()!.removeAllRanges();
    click('Wrap lines');
    check(pre.hasAttribute('data-wrap') && host.querySelector('[aria-pressed="true"]') && getComputedStyle(pre).whiteSpace === 'pre-wrap', 'Wrap must update the reader preference and accessible pressed state');
    click('Wrap lines');
    check(!pre.hasAttribute('data-wrap') && getComputedStyle(pre).whiteSpace === 'pre', 'Unwrapping must restore native horizontal scrolling');

    let copied = '';
    clipboard(async text => { copied = text; });
    click('Copy');
    await pause();
    check(copied === source && host.querySelector('[role="status"]')?.textContent === 'Copied to clipboard.', 'Copy must use original source and announce success');
    render(<CodeBlock code="new source" filename="next.ts" renderLine={line => <em>{line.toUpperCase()}</em>} />);
    check(host.querySelector('code')!.textContent === 'NEW SOURCE' && host.querySelector('[role="status"]')?.textContent === '1 line', 'Changed source must clear stale copy feedback and support supplied syntax nodes');
    click('Copy');
    await pause();
    check(copied === 'new source', 'Highlighted display content must never replace the original clipboard source');

    let finish: (() => void) | undefined;
    clipboard(() => new Promise<void>(resolve => { finish = resolve; }));
    click('Copied');
    check(host.querySelector<HTMLButtonElement>('[aria-label="Copy next.ts"]')!.disabled, 'Pending copies must prevent duplicate submissions');
    render(<CodeBlock code="latest source" filename="latest.ts" />);
    check(!host.querySelector<HTMLButtonElement>('[aria-label="Copy latest.ts"]')!.disabled, 'Changed source must not inherit the previous pending request');
    finish!();
    await pause();
    check(host.querySelector('[role="status"]')?.textContent === '1 line', 'Obsolete clipboard completion must not announce success for new code');

    clipboard(async () => { throw new Error('Denied'); });
    click('Copy');
    await pause();
    check(host.querySelector('[role="status"]')?.textContent?.includes('copy manually') && document.activeElement === host.querySelector('pre') && window.getSelection()!.toString() === 'latest source', 'Denied clipboard writes must announce failure and select code for native copying');
    clipboard();
    render(<CodeBlock code="offline" />);
    click('Copy');
    await pause();
    check(window.getSelection()!.toString() === 'offline', 'An unavailable clipboard must retain the manual copy fallback');

    let submissions = 0;
    render(<form onSubmit={event => { event.preventDefault(); submissions++; }}><CodeBlock key="plain" code="" copy={false} lineNumbers={false} defaultWrap /></form>);
    check(host.querySelectorAll('button').length === 1 && !host.querySelector('.evoker-code-number') && host.querySelector('pre')!.hasAttribute('data-wrap'), 'Empty, unnumbered, initially wrapped blocks must work without a copy action');
    click('Wrap lines');
    check(submissions === 0, 'Code actions must not submit a surrounding form');
    return 'CodeBlock passed: exact source/selection/copy, safe markup, line offsets/highlights, wrapping, keyboard region, syntax slots, async races, clipboard denial/unavailability and native forms.';
  } finally {
    flushSync(() => root.unmount());
    host.remove();
    window.getSelection()?.removeAllRanges();
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
}
