import { StrictMode, createRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Button, Card, Checkbox, Dialog, Field, Input, Select, Slider, Switch, Tabs, Textarea, Theme, Tooltip } from '@kartikeyak/evoker';

export async function runPrimitiveChecks() {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const check = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
  const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const render = (children: ReactNode) => flushSync(() => root.render(<StrictMode><Theme appearance="light" reducedMotion style={{ '--evoker-font': 'Georgia, serif' } as CSSProperties}>{children}</Theme></StrictMode>));
  const click = (element: Element) => flushSync(() => (element as HTMLElement).click());
  const key = (element: Element, name: string) => flushSync(() => { element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })); element.dispatchEvent(new KeyboardEvent('keyup', { key: name, bubbles: true })); });
  try {
    const ref = createRef<HTMLButtonElement>();
    let activations = 0;
    render(<Button ref={ref} loading onClick={() => activations++}>Save</Button>);
    check(ref.current === host.querySelector('button') && ref.current.disabled, 'Loading button must forward its ref and disable native activation');
    click(ref.current!);
    check(activations === 0 && ref.current?.getAttribute('aria-busy') === 'true', 'Loading state must expose busy semantics');

    render(<form><Field.Root name="email"><Field.Label>Email</Field.Label><Input type="email" name="email" defaultValue="operator@example.com" required /><Field.Description>Account email</Field.Description></Field.Root>
      <Field.Root name="notes"><Field.Label>Notes</Field.Label><Field.Control name="notes" render={<Textarea defaultValue="Ready" />} /></Field.Root>
      <Checkbox name="accepted" defaultChecked aria-label="Accept terms" /><Switch name="feedback" defaultChecked aria-label="Feedback" />
      <Slider.Root name="volume" defaultValue={40}><Slider.Label>Volume</Slider.Label><Slider.Control><Slider.Track><Slider.Indicator /><Slider.Thumb /></Slider.Track></Slider.Control></Slider.Root>
    </form>);
    await pause(20);
    const input = host.querySelector<HTMLInputElement>('input[name="email"]')!;
    const label = [...host.querySelectorAll('label')].find(element => element.textContent === 'Email')!;
    check(label.htmlFor === input.id, 'Field must connect its label to Input');
    check(input.getAttribute('aria-describedby')?.split(' ').some(id => document.getElementById(id)?.textContent === 'Account email'), 'Field must connect its description');
    const textarea = host.querySelector('textarea')!;
    check([...host.querySelectorAll('label')].find(element => element.textContent === 'Notes')?.htmlFor === textarea.id, 'Custom rendered textarea must retain field association');
    const form = host.querySelector('form')!;
    const data = new FormData(form);
    check(data.get('email') === 'operator@example.com' && data.get('notes') === 'Ready', 'Input and textarea values must participate in native forms');
    check(data.has('accepted') && data.has('feedback') && data.get('volume') === '40', 'Checkbox, switch and slider must participate in native forms');
    click(host.querySelector('[role="checkbox"]')!);
    click(host.querySelector('[role="switch"]')!);
    check(!new FormData(form).has('accepted') && !new FormData(form).has('feedback'), 'Unchecked controls must omit their form values');
    const thumb = host.querySelector<HTMLInputElement>('input[type="range"]')!;
    key(thumb, 'ArrowRight');
    check(thumb.value === '41', 'Slider keyboard change must update numeric state');

    let requested = '';
    render(<Input aria-label="Controlled" value="fixed" onValueChange={value => { requested = value; }} />);
    const controlled = host.querySelector('input')!;
    flushSync(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(controlled, 'new'); controlled.dispatchEvent(new Event('input', { bubbles: true })); });
    check(requested === 'new' && controlled.value === 'fixed', 'Controlled input must request updates without taking over parent state');

    render(<Tabs.Root defaultValue="a"><Tabs.List aria-label="Views" activateOnFocus><Tabs.Trigger value="a">Alpha</Tabs.Trigger><Tabs.Trigger value="b">Beta</Tabs.Trigger><Tabs.Trigger value="c" disabled>Unavailable</Tabs.Trigger></Tabs.List><Tabs.Content value="a">Alpha content</Tabs.Content><Tabs.Content value="b">Beta content</Tabs.Content></Tabs.Root>);
    await pause(30);
    flushSync(() => host.querySelector<HTMLButtonElement>('[role="tab"]')!.focus());
    key(document.activeElement!, 'ArrowRight');
    await pause(30);
    check(host.querySelector('[aria-selected="true"]')?.textContent === 'Beta', 'Compound tabs must support uncontrolled keyboard activation');
    key(document.activeElement!, 'End');
    check(host.querySelector('[aria-selected="true"]')?.textContent === 'Beta', 'Disabled tab must not activate');

    const triggerRef = createRef<HTMLButtonElement>();
    let triggerClicks = 0;
    render(<Dialog.Root><Dialog.Trigger render={<Button ref={triggerRef} onClick={() => triggerClicks++} />}>Open composed dialog</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Content><Dialog.Title>Composed title</Dialog.Title><Dialog.Description>Composed description</Dialog.Description><Dialog.Close render={<Button />}>Close composed dialog</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>);
    flushSync(() => triggerRef.current!.focus());
    click(triggerRef.current!);
    await pause(40);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    check(popup && triggerClicks === 1 && triggerRef.current === host.querySelector('button'), 'Render composition must merge behavior, caller events and refs without nested buttons');
    check(popup.getAttribute('aria-labelledby')?.split(' ').some(id => document.getElementById(id)?.textContent === 'Composed title'), 'Dialog title must be linked');
    check(getComputedStyle(popup).backgroundColor === 'rgb(255, 255, 255)' && getComputedStyle(popup).fontFamily.includes('Georgia'), 'Portalled dialog must inherit light theme and custom font token');
    check(popup.contains(document.activeElement), 'Dialog must move focus into its content');
    key(document.activeElement!, 'Escape');
    await pause(40);
    check(!document.querySelector('[role="dialog"]') && document.activeElement === triggerRef.current, 'Escape must close and restore trigger focus');

    render(<form><Select.Root name="region" defaultValue="a" items={{ a: 'Alpha', b: 'Beta', c: 'Unavailable' }}><Select.Trigger aria-label="Region"><Select.Value /></Select.Trigger><Select.Portal><Select.Positioner><Select.Content><Select.List><Select.Item value="a"><Select.ItemText>Alpha</Select.ItemText></Select.Item><Select.Item value="b"><Select.ItemText>Beta</Select.ItemText></Select.Item><Select.Item value="c" disabled><Select.ItemText>Unavailable</Select.ItemText></Select.Item></Select.List></Select.Content></Select.Positioner></Select.Portal></Select.Root></form>);
    click(host.querySelector('button')!);
    await pause(50);
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(element => element.textContent === 'Beta')!;
    check(option, 'Select must render its list in a portal');
    click(option);
    await pause(30);
    check(new FormData(host.querySelector('form')!).get('region') === 'b', 'Selection must update its native form value');
    check(host.querySelector('button')?.textContent?.includes('Beta'), 'Trigger must show selected label');

    render(<Tooltip.Provider delay={0}><Tooltip.Root defaultOpen><Tooltip.Trigger render={<Button />}>Help trigger</Tooltip.Trigger><Tooltip.Portal><Tooltip.Positioner><Tooltip.Content>Helpful content</Tooltip.Content></Tooltip.Positioner></Tooltip.Portal></Tooltip.Root></Tooltip.Provider>);
    await pause(40);
    check(document.querySelector('[role="tooltip"]')?.textContent === 'Helpful content', 'Tooltip must support an uncontrolled initially open popup');
    check(host.querySelector('button')?.getAttribute('aria-describedby')?.split(' ').some(id => document.getElementById(id)?.textContent === 'Helpful content'), 'Tooltip content must describe its trigger');
    render(<Card.Root><Card.Header><Card.Title>Custom heading</Card.Title></Card.Header><Card.Content><Input aria-label="Card input" /></Card.Content><Card.Footer><Button>Custom action</Button></Card.Footer></Card.Root>);
    check(host.querySelector('h3')?.textContent === 'Custom heading' && host.querySelector('input'), 'Card parts must accept independent arbitrary content');
    return 'Primitives passed: composition/events/refs, form values, field association, controlled input, tabs, slider keyboard, themed modal/select portals, Escape/restoration, tooltip focus and card slots.';
  } finally {
    flushSync(() => root.unmount());
    host.remove();
  }
}
