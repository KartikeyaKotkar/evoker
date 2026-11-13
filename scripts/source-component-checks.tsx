import { StrictMode, createRef, useState } from 'react';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { ComparisonPanel, ContactTile, CutIn, DateBadge, Dialogue, EvokerProvider, InspectorList, NameEntry, QuestBrief, RankChange, RecordCard, SettingRow, TutorialCallout } from '@kartikeyak/evoker';

// Real browser boundary checks for the public source-informed compositions.
export async function runSourceComponentChecks() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const pause = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));
  const render = (children: ReactNode, reduced = true) => flushSync(() => root.render(<StrictMode><EvokerProvider reducedMotion={reduced}>{children}</EvokerProvider></StrictMode>));
  const key = (element: Element, name: string, composing = false) => flushSync(() => element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, isComposing: composing })));
  let changes = 0;
  let activations = 0;
  const items = [{ id: 'a', label: 'Alpha' }, { id: 'disabled', label: 'Locked', disabled: true }, { id: 'b', label: 'Beta' }];
  function Collection() {
    const [value, setValue] = useState<string | null>('a');
    return <InspectorList label="Test collection" items={items} value={value} onValueChange={id => { changes++; setValue(id); }} onActivate={() => activations++}
      detail={item => <button onClick={() => activations++}>Equip {item.label}</button>} />;
  }
  try {
    render(<Collection />);
    const list = host.querySelector('[role="listbox"]')!;
    flushSync(() => host.querySelector<HTMLButtonElement>('[data-id="a"]')!.focus());
    key(list, 'ArrowDown');
    check(document.activeElement?.getAttribute('data-id') === 'b', 'Inspector must skip disabled entries');
    check(host.querySelector('[aria-selected="true"]')?.textContent?.includes('Beta'), 'Inspector selection must update');
    check(host.querySelector('section button')?.textContent === 'Equip Beta', 'Selected details must stay synchronized');
    check(changes === 1 && activations === 0, 'Navigation changes selection once without activating');
    flushSync(() => (document.activeElement as HTMLButtonElement).click());
    check(changes === 1 && activations === 1, 'Native option activation must fire once');
    check(!list.contains(host.querySelector('section button')), 'Detail actions must remain outside listbox options');
    render(<InspectorList label="Empty" items={[]} value={null} onValueChange={() => {}} detail={() => null} />);
    check(!host.querySelector('[role="option"]'), 'Empty inspector must remain renderable');
    render(<InspectorList label="Unavailable" items={[items[1]!]} value="disabled" onValueChange={() => {}} detail={() => 'Wrong details'} />);
    check(!host.querySelector('[tabindex="0"]') && !host.textContent?.includes('Wrong details'), 'Disabled items cannot be selected');

    render(<ComparisonPanel title="Equipment" rows={[
      { id: 'weight', label: 'Weight', current: 3, candidate: 2, higherIsBetter: false },
      { id: 'same', label: 'Range', current: 10, candidate: 10 },
    ]} />);
    check(host.querySelector('tbody tr')?.getAttribute('data-outcome') === 'better', 'Lower-is-better comparison must invert improvement semantics');
    check(host.querySelectorAll('tbody tr')[1]?.textContent?.includes('Unchanged'), 'Equal comparison must be explicit');
    render(<RecordCard label="Slot" selected metadata={[{ label: 'Date', value: 'Today' }]} onClick={() => activations++} />);
    check(host.querySelector('button')?.getAttribute('aria-pressed') === 'true', 'Record selection must be exposed');
    render(<RecordCard label="Unavailable" disabled onClick={() => activations++} />);
    const before = activations;
    host.querySelector('button')!.click();
    check(activations === before, 'Disabled record must not activate');
    render(<ContactTile label="Mira" summary="Hello" unread />);
    check(host.querySelector('button')?.getAttribute('aria-label')?.includes('unread'), 'Unread status must have a text equivalent');

    render(<SettingRow label="Sound" description="Action feedback" control={attributes => <input {...attributes} type="checkbox" />} />);
    const settingLabel = host.querySelector('label')!;
    const settingInput = host.querySelector('input')!;
    check(settingLabel.htmlFor === settingInput.id, 'Setting label must target its control');
    check(document.getElementById(settingInput.getAttribute('aria-describedby')!)?.textContent === 'Action feedback', 'Setting help must be associated');

    const inputRef = createRef<HTMLInputElement>();
    const commits: string[] = [];
    render(<NameEntry ref={inputRef} label="Name" defaultValue="Operator" onCommit={value => commits.push(value)} />);
    check(inputRef.current === host.querySelector('input'), 'NameEntry must forward its native input ref');
    key(inputRef.current!, 'Enter', true);
    check(commits.length === 0, 'Composing Enter must not commit an unfinished IME value');
    key(inputRef.current!, 'Enter');
    check(commits.length === 1 && commits[0] === 'Operator', 'Normal Enter must commit once');
    render(<NameEntry key="required" label="Required name" defaultValue="" required onCommit={value => commits.push(value)} />);
    key(host.querySelector('input')!, 'Enter');
    check(commits.length === 1, 'Invalid required input must not commit');

    render(<DateBadge date="2024-02-29" period="Evening" phase="full" />);
    check(host.querySelector('time')?.dateTime === '2024-02-29' && host.querySelector('strong')?.textContent === '29', 'Date badge must preserve a leap date without local timezone drift');
    render(<RankChange label="Rank" value={1} />, false);
    render(<RankChange label="Rank" value={2} />, false);
    await pause(40);
    render(<RankChange label="Rank" value={3} />, false);
    await pause(480);
    check(host.querySelector('output')?.textContent === '3' && !host.querySelector('.evoker-rank-outgoing')?.textContent, 'Rapid rank updates must settle on the latest value');
    render(<RankChange label="Rank" value={4} />);
    check(host.querySelector('.evoker-rank-ring')?.getAttribute('style')?.includes('opacity: 0'), 'Reduced rank feedback must leave a final static pose');

    let exits = 0;
    render(<CutIn show={false} onExited={() => exits++}><button>Announcement action</button></CutIn>);
    check(!host.querySelector('button'), 'Initially hidden cut-in must not mount interactive content');
    render(<CutIn show onExited={() => exits++}><button>Announcement action</button></CutIn>);
    check(host.querySelector('button') && (host.firstElementChild as HTMLElement).style.opacity === '1', 'Reduced cut-in must register and reach its visible endpoint');
    render(<CutIn show={false} onExited={() => exits++}><button>Announcement action</button></CutIn>);
    check((host.firstElementChild as HTMLElement).hidden && exits === 1, 'Cut-in must complete exit once');
    render(<CutIn show duration={180}><button>Announcement action</button></CutIn>, false);
    await pause(50);
    render(<CutIn show={false} duration={180}><button>Announcement action</button></CutIn>, false);
    check(host.firstElementChild?.hasAttribute('inert'), 'Exiting cut-in must become inert immediately');
    await pause(40);
    render(<CutIn show duration={180}><button>Announcement action</button></CutIn>, false);
    await pause(250);
    check(!(host.firstElementChild as HTMLElement).hidden && (host.firstElementChild as HTMLElement).style.opacity === '1', 'Reopening must cancel obsolete cut-in completion');

    let chosen = '';
    render(<Dialogue speaker="Guide" choices={items} onChoose={id => { chosen = id; }}>Choose a route.</Dialogue>);
    const menu = host.querySelector('[role="menu"]')!;
    flushSync(() => host.querySelector<HTMLButtonElement>('[data-id="a"]')!.focus());
    key(menu, 'ArrowDown');
    flushSync(() => (document.activeElement as HTMLButtonElement).click());
    check(chosen === 'b', 'Dialogue choices must preserve keyboard and disabled-row behavior');
    render(<QuestBrief title="Mission" status="Complete" requirements={['Inspect item']} deadline="Today" reward="Access" />);
    check(host.textContent?.includes('Complete') && host.querySelector('li')?.textContent === 'Inspect item', 'Quest composition must expose status and requirements');
    check(!host.querySelector('[role="progressbar"]'), 'Legacy string objectives must retain display-only behavior');
    let requirementChange = '';
    const objectives = [{ id: 'inspect', label: 'Inspect relay', completed: false }, { id: 'tune', label: 'Tune receiver', completed: true }];
    render(<QuestBrief title="Tracked mission" requirements={objectives} onRequirementChange={(id, done) => { requirementChange = `${id}:${done}`; }} actions={<button>Claim reward</button>} />);
    const objective = host.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    flushSync(() => objective.click());
    check(requirementChange === 'inspect:true' && !objective.checked, 'Objective changes must request caller updates without taking over state');
    check(host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow') === '1', 'Tracked quest must expose current progress');
    render(<QuestBrief title="Tracked mission" requirements={[{ ...objectives[0]!, completed: true }, objectives[1]!]} />);
    check(!host.querySelector('input') && host.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow') === '2', 'Readonly structured objectives must retain completion state');
    let dismissed = false;
    render(<TutorialCallout title="Hint" onDismiss={() => { dismissed = true; }}>Inspect the item.</TutorialCallout>);
    flushSync(() => host.querySelector<HTMLButtonElement>('[aria-label="Dismiss hint"]')!.click());
    check(dismissed, 'Tutorial must expose a native dismissal action');
    return 'Source components passed: controlled inspector/activation, comparison semantics, record/contact states, associated settings, IME-safe input, UTC date, rapid rank changes, cut-in interruption/reduced motion, dialogue choices, quest and tutorial actions.';
  } finally {
    flushSync(() => root.unmount());
    host.remove();
  }
}
