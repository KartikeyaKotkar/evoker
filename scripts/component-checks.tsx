import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Dialog, EvokerProvider, Gauge, Menu, Tabs, Transition } from '@k2x/evoker';

// Loaded only by the browser smoke script through Vite, never by the application.
export async function runComponentChecks() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const pause = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration));
  const render = (children: ReactNode, reduced = true) => flushSync(() => root.render(<StrictMode><EvokerProvider reducedMotion={reduced}>{children}</EvokerProvider></StrictMode>));
  const items = [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }, { id: 'c', label: 'Disabled', disabled: true }];
  const buttons = () => [...host.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
  let focusChanges = 0;
  let activations = 0;
  const menu = (list = items) => <Menu aria-label="Fixture commands" items={list} onActiveChange={() => focusChanges++} onSelect={() => activations++} />;
  try {
    render(menu());
    render(menu([items[1]!, items[0]!, items[2]!]));
    check(host.querySelector('[tabindex="0"]')?.textContent?.includes('Alpha'), 'Initial active identity must survive reorder');
    flushSync(() => {
      buttons().find(button => button.dataset.id === 'a')!.focus();
      host.querySelector('[role="menu"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    check(document.activeElement?.textContent?.includes('Beta'), 'Navigation must wrap and skip disabled items');
    check(focusChanges === 1, 'One focus callback per navigation');
    flushSync(() => (document.activeElement as HTMLElement).click());
    check(activations === 1, 'One activation callback per click');
    render(menu([items[0]!, items[2]!]));
    check(host.querySelector('[tabindex="0"]')?.textContent?.includes('Alpha'), 'Removed active item must leave an enabled tab stop');
    render(menu([]));
    check(buttons().length === 0, 'Empty menu must remain renderable');
    render(menu([items[2]!]));
    check(!host.querySelector('[tabindex="0"]'), 'All-disabled menu must not expose an enabled tab stop');
    render(<Tabs items={[]} value="none" onValueChange={() => {}} label="Empty" />);
    check(host.querySelectorAll('[role="tab"]').length === 0, 'Empty tabs must remain renderable');

    render(<Transition show={false}><button>Initially hidden</button></Transition>);
    check(!host.querySelector('button'), 'Initially hidden transition must not mount content');
    render(<Transition show effect="wipe"><button>New content</button></Transition>);
    check(host.querySelector('button')?.textContent === 'New content', 'Initially hidden transition must register its renderer when shown');
    check((host.firstElementChild as HTMLElement).style.opacity === '1', 'Reduced entrance must reach final pose');
    render(<Transition show={false} effect="wipe"><button>New content</button></Transition>);
    render(<Transition show effect="fade"><button>New content</button></Transition>);
    check(!(host.firstElementChild as HTMLElement).style.clipPath.includes('100%'), 'Changing effects must clear old clipping');
    render(<Gauge label="Overflow" value={150} max={100} />);
    check(host.firstElementChild?.getAttribute('aria-valuenow') === '100', 'Gauge must clamp above max');
    render(<Gauge label="Negative" value={-1} max={100} />);
    check(host.firstElementChild?.getAttribute('aria-valuenow') === '0', 'Gauge must clamp below zero');

    let closeRequests = 0;
    const modal = (open: boolean) => <Dialog open={open} title="Fixture modal" onClose={() => closeRequests++}><button>Inside modal</button></Dialog>;
    render(modal(true), false);
    await pause(30);
    check(document.querySelector('[role="dialog"]'), 'Initially open modal must survive Strict Mode replay');
    check(closeRequests === 0, 'Strict Mode replay must not send a close request');
    render(modal(false), false);
    await pause(30);
    render(modal(true), false);
    await pause(200);
    check(document.querySelector('[role="dialog"]'), 'Interrupted exit must not close a reopened modal');
    render(null);
    check(!document.querySelector('[role="dialog"]'), 'Unmount must clean up modal');
    return 'Component boundaries passed: stable ids, exact callbacks, empty/disabled collections, initially hidden transitions, effect reset, clamped gauge, Strict Mode and interrupted modal cleanup.';
  } finally {
    flushSync(() => root.unmount());
    host.remove();
  }
}
