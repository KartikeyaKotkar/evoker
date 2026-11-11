import type { Page } from './Documentation.js';
import { ComparisonDemo, ContactDemo, CutInDemo, DateDemo, DialogueDemo, GaugeDemo, InspectorDemo, KeyHintDemo, MenuDemo, NameDemo, PanelDemo, QuestDemo, RankDemo, RecordDemo, SelectionDemo, SettingDemo, TransitionDemo, TutorialDemo } from './BlockDemos.js';

export const legacyBlockPages: Page[] = [
  { id: 'menu', title: 'Menu', description: 'A keyboard menu with independent entrance and cursor layers. Arrow keys, W/S, Home and End move focus; native Enter/Space and Z activate. Disabled rows are skipped.', examples: [{ title: 'Select an action', node: <MenuDemo />, code: `import { Menu } from '@evoker/react';

<Menu items={[
  { id: 'inspect', label: 'Inspect' },
  { id: 'compare', label: 'Compare' },
  { id: 'locked', label: 'Unavailable', disabled: true },
]} onSelect={item => console.log(item.id)} />;` }], props: [['items', 'Readonly MenuItem[]: id, label, description?, disabled?, angle?, offset?, scale?', 'Required'], ['onSelect / onActiveChange', '(item, originalIndex) => void; activation and focus are separate', '—'], ['duration / stagger / distance / easing', 'Entrance motion settings', '320ms / 32ms / 40 / easeOut'], ['wrap / bindings', 'Loop navigation / custom InputMapper bindings', 'true / built-in bindings']] },
  { id: 'panel', title: 'Panel', description: 'A shaped content surface: heading, eyebrow, actions and a normal-flow body. Use it to group a workspace, details or a summary. Behavior comes from the controls inside; Panel is not a modal or selection control.', examples: [{ title: 'Compose a working surface', node: <PanelDemo />, code: `import { useState } from 'react';
import { Panel, Button } from '@evoker/react';

export function Workspace() {
  const [reviewed, setReviewed] = useState(false);
  return <Panel title="Session workspace" eyebrow="Workspace / 01" tone="light" cut={28}
    actions={<Button onClick={() => setReviewed(true)}>Review queue</Button>}>
    <p>{reviewed ? 'All recordings reviewed.' : 'Three recordings need review.'}</p>
  </Panel>;
}` }], props: [['title / eyebrow', 'Optional heading and contextual label', '—'], ['children / actions', 'Normal-flow content / header controls', '—'], ['tone / cut', 'blue | dark | light / decorative corner size in CSS pixels, clamped at zero', 'blue / 28'], ['semantics', 'A section labelled by its title; no built-in state or modal behavior', 'Native section attributes']] },
  { id: 'gauge', title: 'Gauge', description: 'A numeric meter or progressbar. Finite values are clamped between zero and a positive finite maximum. Reduced motion removes fill transitions.', examples: [{ title: 'Adjust capacity', node: <GaugeDemo />, code: `import { Gauge } from '@evoker/react';

<Gauge label="Capacity" value={72} max={100} />;
<Gauge label="Upload progress" value={3} max={5} kind="progressbar" />;` }], props: [['value / label', 'Finite numeric value / accessible name', 'Required'], ['max / kind / showValue', 'Positive finite maximum / meter or progressbar / numeric display', '100 / meter / true']] },
  { id: 'key-hint', title: 'KeyHint', description: 'Display keys alongside an action label. Optional platform glyphs retain a key-name alternative. Your application owns key bindings.', examples: [{ title: 'Explain the controls', node: <KeyHintDemo />, code: `import { KeyHint } from '@evoker/react';

<KeyHint keys={['↑', '↓']} action="Navigate" />;
<KeyHint keys="Enter" action="Confirm" />;` }], props: [['keys / action', 'string or readonly string[] / action text', 'Required'], ['glyph', 'Optional replacement visual with a key-name accessible label', '—']] },
  { id: 'selection-indicator', title: 'SelectionIndicator', description: 'A decorative selection layer that moves independently from content. The caller supplies position, size and active state; it does not select items or handle input.', examples: [{ title: 'Move a selection layer', node: <SelectionDemo />, code: `import { SelectionIndicator } from '@evoker/react';

<SelectionIndicator y={48} width="100%" height={40} active />;` }], props: [['x / y / angle / width / height', 'Caller-owned position, rotation and size', '0 / 0 / -2 / 100% / 100%'], ['active', 'Whether the decorative layer is visible', 'true']] },
  { id: 'transition', title: 'Transition', description: 'Show or hide content with fade, slide or wipe motion. Exiting content becomes inert immediately and stays mounted until playback ends. Reopening interrupts the exit.', examples: [{ title: 'Interrupt entrance and exit', node: <TransitionDemo />, code: `import { useState } from 'react';
import { Button, Transition } from '@evoker/react';

export function Reveal() {
  const [show, setShow] = useState(true);
  return <><Button onClick={() => setShow(value => !value)}>Toggle</Button>
    <Transition show={show} effect="wipe"><p>Your content.</p></Transition>
  </>;
}` }], props: [['show', 'Controlled visibility', 'Required'], ['effect / duration / onExited', 'fade | slide | wipe / milliseconds / exit completion', 'wipe / 280 / —']] },
];

export const sourceBlockPages: Page[] = [
  { id: 'inspector-list', title: 'InspectorList', description: 'Select an item to inspect its details, then activate or equip it. Arrow keys and Home/End navigate enabled entries. Controlled selection remains separate from activation.', examples: [{ title: 'Inspect equipment', node: <InspectorDemo />, code: `import { useState } from 'react';
import { InspectorList } from '@evoker/react/blocks';

export function Equipment() {
  const [value, setValue] = useState<string | null>('lens');
  return <InspectorList label="Equipment" items={[
    { id: 'lens', label: 'Signal lens', description: 'Inspect distant details.' },
    { id: 'recorder', label: 'Field recorder' },
  ]} value={value} onValueChange={setValue}
    detail={item => <p>{item.description ?? item.label}</p>}
    onActivate={item => console.log(item.id)} />;
}` }], props: [['items / label / value / onValueChange / detail', 'Readonly items, accessible label, selected id or null, callback, detail renderer', 'Required'], ['onActivate / wrap / emptyMessage', 'Activation callback / loop enabled entries / empty-state text', '— / false / No entries available.']] },
  { id: 'comparison-panel', title: 'ComparisonPanel', description: 'Compare current and candidate values using signed differences, directional arrows and explicit Better/Worse/Unchanged text. Costs and weights can invert the improvement direction.', examples: [{ title: 'Compare equipment', node: <ComparisonDemo />, code: `import { ComparisonPanel } from '@evoker/react/blocks';

<ComparisonPanel title="Compare" rows={[
  { id: 'clarity', label: 'Clarity', current: 72, candidate: 82 },
  { id: 'weight', label: 'Weight', current: 3, candidate: 2, higherIsBetter: false },
]} />;` }], props: [['title / rows', 'Title and readonly ComparisonRow[]: id, label, current, candidate, higherIsBetter?', 'Required'], ['currentLabel / candidateLabel', 'Table column labels', 'Current / Candidate'], ['validation', 'Current, candidate and their difference must be finite', 'higherIsBetter: true']] },
  { id: 'record-card', title: 'RecordCard', description: 'A selectable record with metadata and a separate decorative plane. Empty records remain selectable unless disabled. Metadata and leading content must be noninteractive.', examples: [{ title: 'Choose a session', node: <RecordDemo />, code: `import { RecordCard } from '@evoker/react/blocks';

<RecordCard label="Session 01" selected metadata={[
  { label: 'Location', value: 'North studio' },
]} onClick={() => console.log('Session selected')} />;` }], props: [['label / metadata / leading', 'Name / readonly {label, value}[] / decorative content', 'Required / [] / —'], ['selected / empty / disabled', 'Pressed state / empty visual / native unavailable state', 'false'], ['native button props', 'onClick, type, aria attributes and styles', 'type: button']] },
  { id: 'setting-row', title: 'SettingRow', description: 'Connect a setting label and help to a native control. Spread the supplied attributes onto your input or select; applications own values and persistence.', examples: [{ title: 'Change sound settings', node: <SettingDemo />, code: `import { SettingRow } from '@evoker/react/blocks';

<SettingRow label="Sound feedback" description="Play action feedback."
  control={attributes => <input {...attributes} type="checkbox" defaultChecked />} />;` }], props: [['label / description / control', 'Setting name, help text, and control(attributes) renderer', 'Required'], ['control attributes', 'id and aria-describedby; spread onto the native control', 'Generated associations']] },
  { id: 'quest-brief', title: 'QuestBrief', description: 'A mission with tracked objectives, progress, a deadline and a reward. Check off objectives, then claim the reward. Applications own completion rules; simple string requirements remain supported.', examples: [{ title: 'Complete a mission', node: <QuestDemo />, code: `import { useState } from 'react';
import { Button, QuestBrief } from '@evoker/react';

export function Mission() {
  const [requirements, setRequirements] = useState([
    { id: 'inspect', label: 'Inspect the relay', completed: false },
    { id: 'tune', label: 'Tune the receiver', completed: false },
  ]);
  const [claimed, setClaimed] = useState(false);
  const ready = requirements.every(item => item.completed);
  return <QuestBrief title="Catch the signal" requirements={requirements}
    status={claimed ? 'Reward claimed' : ready ? 'Ready to claim' : 'In progress'}
    onRequirementChange={claimed ? undefined : (id, completed) =>
      setRequirements(items => items.map(item => item.id === id ? { ...item, completed } : item))}
    reward={claimed ? 'Studio access unlocked' : 'Studio access'}
    actions={<Button disabled={!ready || claimed} onClick={() => setClaimed(true)}>Claim reward</Button>} />;
}` }], props: [['title / requirements', 'Title and readonly (string | QuestRequirement)[]', 'Required'], ['QuestRequirement', 'Stable id, label, optional completed boolean', 'completed: false'], ['onRequirementChange', '(id, completed) => void; enables controlled native checkboxes', 'Read-only'], ['status / deadline / reward / actions', 'Caller-owned status, due text, reward and action controls', 'Open / —'], ['progress', 'Structured requirements show completed count and a progressbar', 'Strings retain display-only behavior']] },
  { id: 'date-badge', title: 'DateBadge', description: 'Separate date and time-of-day layers. This demo uses your local clock and updates live. Preview another date/time or return to current time. The reusable badge displays the date and period supplied by its caller.', examples: [{ title: 'Live local date and time', node: <DateDemo />, code: `import { useEffect, useState } from 'react';
import { DateBadge } from '@evoker/react/blocks';

export function LocalDate() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const hour = now.getHours();
  const period = hour < 5 || hour >= 21 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return <DateBadge date={date} period={period} />;
}` }], props: [['date', 'Valid YYYY-MM-DD calendar date, displayed without timezone drift', 'Required'], ['period / phase / locale', 'Caller-supplied time label / new | half | full moon / date locale', '— / — / en'], ['demo time boundaries', 'Local: Morning 05:00–11:59, Afternoon 12:00–16:59, Evening 17:00–20:59, Night 21:00–04:59', 'Live; manual preview pauses display'], ['phase', 'No moon phase is inferred from date or clock', 'Application-owned']] },
  { id: 'rank-change', title: 'RankChange', description: 'Animate outgoing and incoming values with an independent ring. Rapid changes settle on the newest value; reduced motion shows the final value immediately.', examples: [{ title: 'Gain connection rank', node: <RankDemo />, code: `import { RankChange } from '@evoker/react/blocks';

<RankChange label="Connection rank" value={4} />;` }], props: [['label / value', 'Accessible label / finite numeric value', 'Required']] },
  { id: 'contact-tile', title: 'ContactTile', description: 'A message preview with caller-owned read state and unread feedback. Mark this read message unread, then open it to mark it read again. The current state is announced explicitly.', examples: [{ title: 'Read and mark unread', node: <ContactDemo />, code: `import { useState } from 'react';
import { Button, ContactTile } from '@evoker/react';

export function Contact() {
  const [unread, setUnread] = useState(false);
  return <>
    <ContactTile label="Mira" summary="Your next session is ready." unread={unread}
      onClick={() => setUnread(false)} />
    <Button disabled={unread} onClick={() => setUnread(true)}>Mark unread</Button>
    <output aria-live="polite">{unread ? 'Unread message' : 'Message read'}</output>
  </>;
}` }], props: [['label / summary', 'Contact name and message preview', 'Required'], ['unread / selected / avatar', 'Unread state / selection / decorative application-owned portrait', 'false / false / initial'], ['native button props', 'onClick opens caller-owned content; application updates read state', 'type: button']] },
  { id: 'dialogue', title: 'Dialogue', description: 'Compose a speaker, portrait, message, advance action and keyboard choices. This is an inline article; it does not trap focus or reveal text automatically.', examples: [{ title: 'Choose your next move', node: <DialogueDemo />, code: `import { Dialogue } from '@evoker/react/blocks';

<Dialogue speaker="Navigator" choices={[
  { id: 'start', label: 'Start a session' },
  { id: 'help', label: 'Explain the controls' },
]} onChoose={id => console.log(id)} onAdvance={() => console.log('Next')}>
  Where would you like to begin?
</Dialogue>;` }], props: [['speaker / children', 'Speaker name and message content', 'Required / caller content'], ['portrait / choices / onChoose', 'Portrait slot / readonly MenuItem[] / (id) => void', '— / [] / —'], ['onAdvance / advanceLabel', 'Advance action / accessible label', '— / Continue dialogue']] },
  { id: 'name-entry', title: 'NameEntry', description: 'Native editing with help and an optional IME-safe Enter commit. Values are neither trimmed nor rewritten. Native input constraints remain active.', examples: [{ title: 'Save a callsign', node: <NameDemo />, code: `import { NameEntry } from '@evoker/react/blocks';

<NameEntry label="Your callsign" defaultValue="Operator" maxLength={24} required
  hint="Press Enter to save." onCommit={value => console.log(value)} />;` }], props: [['label / hint / onCommit', 'Accessible label / help / (validValue) => void', 'Required / —'], ['native input props / ref', 'Controlled/uncontrolled editing, constraints, events and input ref', 'Forwarded'], ['Enter behavior', 'No commit during composition or invalid input; preventDefault overrides commit', 'Normal form behavior without onCommit']] },
  { id: 'cut-in', title: 'CutIn', description: 'An announcement with separate X/Y motion. The caller controls visibility and hold duration. Exit content becomes inert immediately and stays mounted until playback finishes.', examples: [{ title: 'Control an announcement', node: <CutInDemo />, code: `import { useState } from 'react';
import { Button, CutIn } from '@evoker/react';

export function Announcement() {
  const [show, setShow] = useState(true);
  return <><CutIn show={show}><h3>Connection established.</h3></CutIn>
    <Button onClick={() => setShow(value => !value)}>Toggle announcement</Button>
  </>;
}` }], props: [['show / duration / onExited', 'Visibility / milliseconds / exit completion', 'Required / 150 / —'], ['children', 'Application-owned announcement content', '—']] },
  { id: 'tutorial-callout', title: 'TutorialCallout', description: 'An inline pointer and heading with optional step, target link and dismissal. Applications own placement and target highlighting; no tour engine or modal is installed.', examples: [{ title: 'Dismiss and restore guidance', node: <TutorialDemo />, code: `import { TutorialCallout } from '@evoker/react/blocks';

<TutorialCallout title="Start with a closer look." step="Guide / 01"
  onDismiss={() => console.log('Dismissed')}>
  Select an item to inspect its details.
</TutorialCallout>;` }], props: [['title / children', 'Heading and explanation', 'Required'], ['step / targetId / onDismiss / dismissLabel', 'Step / existing anchor / dismissal / close label', '— / — / — / Dismiss hint']] },
];
