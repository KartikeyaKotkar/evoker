import { StrictMode, createRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ActionBar, Button, Dialog, MessageLog, PartyPanel, ResultSummary, StatusDialog, Theme } from '@evoker/react';

export async function runCompositionChecks() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const render = (children: ReactNode, reduced = true) => flushSync(() => root.render(<StrictMode><Theme appearance="light" reducedMotion={reduced} style={{ '--evoker-font': 'Georgia, serif' } as CSSProperties}>{children}</Theme></StrictMode>));
  const click = (element: HTMLElement) => flushSync(() => element.click());
  const members = [{ id: 'a', name: 'Alpha', gauges: [{ id: 'health', label: 'Health', value: 150, max: 100 }] }, { id: 'b', name: 'Beta' }, { id: 'locked', name: 'Locked', disabled: true }];
  try {
    const ref = createRef<HTMLElement>();
    let chosen = '';
    const roster = (value: string, reverse = false) => <PartyPanel ref={ref} data-test="party" label="Team" members={reverse ? [...members].reverse() : members} value={value} onValueChange={id => { chosen = id; }} />;
    render(roster('a'));
    check(ref.current === host.querySelector('section') && ref.current?.dataset.test === 'party', 'PartyPanel must forward native props and ref');
    check(host.querySelector('[role="meter"]')?.getAttribute('aria-valuenow') === '100', 'Party gauges must reuse clamping');
    check(!host.querySelector('button [role="meter"]'), 'Gauges must stay outside selection buttons');
    click(host.querySelectorAll('button')[1]!);
    check(chosen === 'b' && host.querySelector('[aria-pressed="true"]')?.textContent === 'Alpha', 'Party selection requests must preserve caller ownership');
    click(host.querySelectorAll('button')[2]!);
    check(chosen === 'b', 'Disabled members must not request selection');
    const alpha = host.querySelector('[data-member-id="a"]');
    render(roster('a', true));
    check(host.querySelector('[data-member-id="a"]') === alpha && host.querySelector('[aria-pressed="true"]')?.textContent === 'Alpha', 'Reordering must preserve member identity and selection');
    render(roster('missing'));
    check(!host.querySelector('[aria-pressed="true"]'), 'Missing selection must stay unselected');
    render(roster('locked'));
    check(!host.querySelector('[aria-pressed="true"]'), 'Disabled selection must stay unselected');
    render(<PartyPanel label="Read only" members={members} />);
    check(!host.querySelector('button') && host.querySelector('article'), 'Display-only rosters must not create inert buttons');
    render(<PartyPanel label="Empty" members={[]} emptyMessage="No team" />);
    check(host.textContent?.includes('No team'), 'Empty roster must explain its state');

    let accepted = 0;
    render(<ResultSummary title="Complete" metrics={[{ id: 'score', label: 'Score', value: <strong>1,240</strong> }]} rewards={[{ id: 'access', label: 'Access', detail: 'Unlocked' }]}
      actions={<button onClick={() => accepted++}>Accept</button>}><p>Mission details</p></ResultSummary>);
    check(host.querySelector('dt')?.textContent === 'Score' && host.querySelector('dd')?.textContent === '1,240', 'Results must preserve caller values and definition-list semantics');
    check(host.querySelector('ul[aria-label="Rewards"]')?.textContent === 'AccessUnlocked' && host.textContent?.includes('Mission details'), 'Result slots must stay distinct');
    click(host.querySelector('button')!);
    check(accepted === 1, 'Result actions must remain interactive');
    render(<ResultSummary title="Pending" metrics={[]} />);
    check(host.textContent?.includes('No results yet.') && !host.querySelector('ul'), 'Empty results must explain their state and omit absent rewards');

    const logRef = createRef<HTMLElement>();
    const entries = Array.from({ length: 24 }, (_, i) => ({ id: String(i), speaker: `Speaker ${i}`, message: `Message ${i}`, timestamp: '18:40', actions: <button onClick={() => accepted++}>Replay {i}</button> }));
    render(<MessageLog ref={logRef} label="History" entries={entries} />);
    const log = logRef.current!;
    const first = log.querySelector('li');
    check(log.getAttribute('role') === 'log' && log.getAttribute('aria-live') === 'polite' && log.getAttribute('aria-relevant') === 'additions' && log.querySelectorAll('ol > li').length === 24, 'History must be an ordered log announcing additions');
    const replay = log.querySelector('button')!;
    replay.focus();
    log.scrollTop = 50;
    const scroll = log.scrollTop;
    render(<MessageLog ref={logRef} label="History" entries={[...entries, { id: 'new', speaker: 'Guide', message: 'New message', timestamp: '18:41', actions: null }]} />);
    check(log.scrollTop === scroll && document.activeElement === replay && log.querySelector('li') === first, 'Appending history must preserve reader focus, scroll and existing nodes');
    click(replay);
    check(accepted === 2, 'Log action slots must retain native behavior');
    render(<MessageLog label="Empty history" entries={[]} />);
    check(host.textContent === 'No messages yet.', 'Empty history must explain its state');

    const barRef = createRef<HTMLDivElement>();
    const actions: string[] = [];
    render(<ActionBar ref={barRef} data-test="actions" label="Actions" items={[{ id: 'inspect', label: 'Inspect', keys: ['Shift', 'E'], glyph: <span>◇</span> }, { id: 'disabled', label: 'Locked', disabled: true }]} onAction={id => actions.push(id)} />);
    click(host.querySelector('button')!);
    click(host.querySelectorAll('button')[1]!);
    check(actions.join() === 'inspect' && barRef.current?.getAttribute('role') === 'group' && barRef.current.dataset.test === 'actions', 'ActionBar must forward props and invoke only enabled actions');
    check(host.querySelector('[role="img"]')?.getAttribute('aria-label') === 'Shift + E', 'Custom key glyphs must retain key-name alternatives');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'E', shiftKey: true, bubbles: true }));
    check(actions.length === 1, 'Hints must not install global shortcuts');
    render(<ActionBar label="Empty actions" items={[]} onAction={() => {}} />);
    check(host.textContent === 'No actions available.', 'Empty action groups must explain their state');

    const trigger = createRef<HTMLButtonElement>();
    const retry = createRef<HTMLButtonElement>();
    const popupRef = createRef<HTMLDivElement>();
    const completed: boolean[] = [];
    const reasons: string[] = [];
    let setOpen: (open: boolean) => void = () => {};
    function StatusHarness({ preventOutside = false }: { preventOutside?: boolean }) {
      const [open, update] = useState(false);
      setOpen = update;
      return <><Button ref={trigger} onClick={() => update(true)}>Status trigger</Button>
        <StatusDialog ref={popupRef} open={open} onOpenChange={(next, details) => { reasons.push(details.reason); update(next); }} onOpenChangeComplete={value => completed.push(value)}
          disablePointerDismissal={preventOutside} title="Connection" description="Saved locally" initialFocus={retry} finalFocus={trigger}
          className={() => 'custom-status'} style={() => ({ borderBottomWidth: 7 })} actions={<Button ref={retry}>Retry</Button>}>Offline</StatusDialog></>;
    }
    render(<StatusHarness />, false);
    trigger.current!.focus();
    click(trigger.current!);
    await pause(260);
    const popup = popupRef.current!;
    check(popup.classList.contains('custom-status') && popup.style.borderBottomWidth === '7px', 'Status popup must retain state-aware styling and ref');
    check(getComputedStyle(popup).transitionDuration === '0.15s' && getComputedStyle(popup).transitionProperty === 'opacity' && getComputedStyle(popup).translate === 'none', 'Status dialog must use its scoped opacity-only fade');
    check(getComputedStyle(popup).backgroundColor === 'rgb(255, 255, 255)' && getComputedStyle(popup).fontFamily.includes('Georgia'), 'Status portal must inherit theme overrides');
    check(document.getElementById(popup.getAttribute('aria-labelledby')!)?.textContent === 'Connection' && document.getElementById(popup.getAttribute('aria-describedby')!)?.textContent === 'Saved locally', 'Status title and description must be linked');
    check(document.activeElement === retry.current && completed[completed.length - 1] === true, 'Status dialog must honor initial focus and opening completion');
    flushSync(() => setOpen(false));
    await pause(30);
    check(document.querySelector('.evoker-status-dialog'), 'Closing content must remain mounted for its fade');
    flushSync(() => setOpen(true));
    await pause(230);
    check(popupRef.current && !completed.includes(false), 'Reopening must cancel the obsolete closing completion');
    flushSync(() => retry.current!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    await pause(240);
    check(!document.querySelector('.evoker-status-dialog') && document.activeElement === trigger.current && reasons.includes('escape-key') && completed.filter(value => !value).length === 1, 'Escape must forward its reason, complete once and restore focus');

    render(<StatusHarness preventOutside />);
    click(trigger.current!);
    await pause(60);
    check(popupRef.current?.style.transitionDuration === '0ms', 'Reduced status transitions must settle immediately');
    const backdrop = document.querySelector<HTMLElement>('.evoker-status-backdrop')!;
    flushSync(() => { backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0 })); backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); backdrop.click(); });
    await pause(30);
    check(popupRef.current, 'disablePointerDismissal must preserve the open dialog');
    click(document.querySelector<HTMLButtonElement>('[aria-label="Close status dialog"]')!);
    await pause(60);
    check(!document.querySelector('.evoker-status-dialog') && document.activeElement === trigger.current, 'Visible close action must work with reduced motion and pointer dismissal disabled');
    render(<Dialog.Root open><Dialog.Portal><Dialog.Backdrop /><Dialog.Content><Dialog.Title>Ordinary dialog</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>, false);
    await pause(30);
    check(getComputedStyle(document.querySelector<HTMLElement>('.evoker-modal')!).transitionProperty.includes('translate'), 'Ordinary dialog motion must remain unchanged');
    return 'Compositions passed: controlled roster/gauges, semantic results, stable history/focus/scroll, native actions, scoped status transitions/interruption/focus/theme/reduced motion.';
  } finally {
    flushSync(() => root.unmount());
    host.remove();
  }
}
