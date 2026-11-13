import { useEffect, useState } from 'react';
import { Button, ComparisonPanel, ContactTile, CutIn, DateBadge, Dialogue, Gauge, InspectorList, KeyHint, Menu, NameEntry, Panel, QuestBrief, RankChange, RecordCard, SelectionIndicator, SettingRow, Transition, TutorialCallout } from '@k2x/evoker';
import type { PanelProps, QuestRequirement } from '@k2x/evoker';
import { SelectControl } from './SelectControl.js';

const inventory = [
  { id: 'lens', label: 'Signal lens', description: 'Bring distant details into focus.', meta: '120 credits', clarity: 82, weight: 4 },
  { id: 'recorder', label: 'Field recorder', description: 'Keep the signals worth remembering.', meta: '240 credits', clarity: 68, weight: 2 },
  { id: 'beacon', label: 'Aerial beacon', description: 'Currently unavailable.', meta: '—', clarity: 90, weight: 3, disabled: true },
];

export function InspectorDemo() {
  const [value, setValue] = useState<string | null>('lens');
  const [action, setAction] = useState('Select an item, inspect its details, then equip it.');
  return <div><InspectorList label="Equipment collection" items={inventory} value={value} onValueChange={setValue} onActivate={item => setAction(`${item.label} activated`)} detail={item => <>
    <h3>{item.label}</h3><p>{item.description}</p><Button onClick={() => setAction(`${item.label} equipped`)}>Equip selection</Button>
  </>} /><output className="source-result" aria-live="polite">{action}</output></div>;
}
export function ComparisonDemo() {
  const [value, setValue] = useState('lens');
  const item = inventory.find(entry => entry.id === value)!;
  return <div className="source-stack"><SelectControl label="Compare equipment" value={value} onValueChange={setValue} options={inventory.filter(entry => !entry.disabled).map(entry => ({ value: entry.id, label: entry.label }))} />
    <ComparisonPanel title={item.label} rows={[{ id: 'clarity', label: 'Clarity', current: 72, candidate: item.clarity }, { id: 'weight', label: 'Weight', current: 3, candidate: item.weight, higherIsBetter: false }]} /></div>;
}
export function RecordDemo() {
  const [value, setValue] = useState('first');
  return <div className="source-stack"><RecordCard label="Session 01" selected={value === 'first'} onClick={() => setValue('first')} metadata={[{ label: 'Location', value: 'North studio' }, { label: 'Saved', value: '11 / 10' }]} />
    <RecordCard label="New session" selected={value === 'new'} empty onClick={() => setValue('new')} metadata={[{ label: 'Status', value: 'Empty slot' }]} /></div>;
}
export function SettingDemo() {
  const [volume, setVolume] = useState(65);
  const [sound, setSound] = useState(true);
  return <><SettingRow label="Sound feedback" description="Play feedback when an action completes." control={attributes => <input {...attributes} type="checkbox" checked={sound} onChange={event => setSound(event.target.checked)} />} />
    <SettingRow label={`Volume · ${volume}%`} description="Choose the level that suits your space." control={attributes => <input {...attributes} type="range" min={0} max={100} value={volume} onChange={event => setVolume(Number(event.target.value))} />} /></>;
}
const objectives: readonly QuestRequirement[] = [
  { id: 'inspect', label: 'Inspect the relay' }, { id: 'compare', label: 'Compare both signal readings' }, { id: 'tune', label: 'Tune the receiver' },
];
export function QuestDemo() {
  const [requirements, setRequirements] = useState(objectives);
  const [claimed, setClaimed] = useState(false);
  const completed = requirements.filter(item => item.completed).length;
  const ready = completed === requirements.length;
  return <div className="quest-demo"><QuestBrief title="Catch the signal" status={claimed ? 'Reward claimed' : ready ? 'Ready to claim' : completed ? 'In progress' : 'New objective'} deadline="Before the next session"
    requirements={requirements} onRequirementChange={claimed ? undefined : (id, done) => setRequirements(previous => previous.map(item => item.id === id ? { ...item, completed: done } : item))}
    reward={<span>{claimed ? 'Unlocked: Studio access + 120 credits' : 'Studio access · 120 credits'}</span>}
    actions={claimed ? <Button variant="secondary" onClick={() => { setRequirements(objectives); setClaimed(false); }}>Start new objective</Button>
      : <Button disabled={!ready} onClick={() => setClaimed(true)}>Claim reward</Button>}>
    <p>A broken relay hides a clear signal. Work through the objectives to restore the connection.</p>
  </QuestBrief><output className="source-result" aria-live="polite">{claimed ? 'Mission complete. Studio access unlocked. +120 credits received.' : `${completed} of ${requirements.length} objectives complete${ready ? '. Reward ready to claim.' : '.'}`}</output></div>;
}

function localDateTime(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function DateDemo() {
  const [now, setNow] = useState(() => new Date());
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const value = preview ?? localDateTime(now);
  const hour = Number(value.slice(11, 13));
  const period = hour < 5 || hour >= 21 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  return <div className="date-demo"><DateBadge date={value.slice(0, 10)} period={period} />
    <p className="source-clock-status">{preview ? 'Preview time' : 'Live local time'} · {value.slice(11, 16)}</p>
    <label className="source-date-control">Preview date and time<input aria-label="Preview date and time" type="datetime-local" min="0001-01-01T00:00" max="9999-12-31T23:59" value={value} onChange={event => { if (event.target.validity.valid && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(event.target.value)) setPreview(event.target.value); }} /></label>
    <Button variant="secondary" className="source-action" disabled={preview === null} onClick={() => { setNow(new Date()); setPreview(null); }}>Use current time</Button>
  </div>;
}
export function RankDemo() {
  const [rank, setRank] = useState(3);
  return <><RankChange label="Connection rank" value={rank} /><Button variant="secondary" onClick={() => setRank(value => value + 1)}>Gain rank</Button></>;
}
export function ContactDemo() {
  const [unread, setUnread] = useState(false);
  const [opened, setOpened] = useState(false);
  return <div className="contact-demo"><ContactTile label="Mira" summary={unread ? 'New message: Your next session is ready.' : 'Your next session is ready.'} unread={unread} selected={opened} onClick={() => { setUnread(false); setOpened(true); }} />
    <Button variant="ghost" className="source-action" disabled={unread} onClick={() => { setUnread(true); setOpened(false); }}>Mark unread</Button>
    {opened && <div className="source-message"><h3>Message from Mira</h3><p>Meet me at the north studio. Your equipment is ready for the next session.</p><Button variant="secondary" onClick={() => setOpened(false)}>Close message</Button></div>}
    <output className="source-result" aria-live="polite">{unread ? 'Message marked unread. Open Mira’s message to mark it read.' : opened ? 'Message opened and marked read.' : 'Message read. Mark it unread to try the notification state.'}</output>
  </div>;
}
export function DialogueDemo() {
  const [message, setMessage] = useState('Every choice opens a different path. Where would you like to begin?');
  return <Dialogue speaker="Navigator" portrait={<span className="source-portrait" aria-hidden="true">N</span>} choices={[{ id: 'start', label: 'Start a session' }, { id: 'controls', label: 'Explain the controls' }, { id: 'locked', label: 'Unavailable route', disabled: true }]}
    onChoose={id => setMessage(id === 'start' ? 'Session ready. Choose your first piece of equipment.' : 'Arrow keys move through choices. Enter or Space activates the focused choice.')}
    onAdvance={() => setMessage('Take your time. The next move is yours.')}>{message}</Dialogue>;
}
export function NameDemo() {
  const [name, setName] = useState('Operator');
  const [committed, setCommitted] = useState('');
  return <><NameEntry label="Your callsign" value={name} maxLength={24} required hint="Up to 24 characters. Press Enter to save." onChange={event => setName(event.target.value)} onCommit={setCommitted} /><output className="source-result" aria-live="polite">{committed ? `Saved callsign: ${committed}` : 'Your name, your next chapter.'}</output></>;
}
export function CutInDemo() {
  const [show, setShow] = useState(true);
  return <><div className="source-cutin-stage"><CutIn show={show}><p className="evoker-eyebrow">Session / 01</p><h3>Connection established.</h3><p>All systems ready. Make your next move.</p></CutIn></div><Button variant="secondary" className="source-action" onClick={() => setShow(value => !value)}>{show ? 'Dismiss announcement' : 'Show announcement'}</Button></>;
}
export function TutorialDemo() {
  const [show, setShow] = useState(true);
  return show ? <TutorialCallout title="Start with a closer look." step="Guide / 01" onDismiss={() => setShow(false)}><p>Select an item to inspect its details. Compare the candidate before you equip it.</p></TutorialCallout> : <Button variant="secondary" onClick={() => setShow(true)}>Restore hint</Button>;
}
export function PanelDemo() {
  const [tone, setTone] = useState<NonNullable<PanelProps['tone']>>('light');
  const [cut, setCut] = useState(28);
  const [reviewed, setReviewed] = useState(false);
  return <div className="source-stack panel-demo"><Panel title="Session workspace" eyebrow="Panel / content surface" tone={tone} cut={cut}
    actions={<Button variant="outline" onClick={() => setReviewed(value => !value)}>{reviewed ? 'Reset queue' : 'Review queue'}</Button>}>
    <p>{reviewed ? 'All three recordings reviewed. Your workspace is ready.' : 'Three recordings need review. Group a heading, actions and any application content inside this surface.'}</p>
    <Gauge label="Recordings reviewed" value={reviewed ? 3 : 0} max={3} />
  </Panel><div className="source-stack"><SelectControl label="Panel tone" value={tone} onValueChange={value => setTone(value as typeof tone)} options={[{ value: 'light', label: 'Light' }, { value: 'blue', label: 'Blue' }, { value: 'dark', label: 'Dark' }]} />
    <label>Corner cut · {cut}px<input aria-label="Panel corner cut" type="range" min="0" max="60" value={cut} onChange={event => setCut(Number(event.target.value))} /></label></div>
    <p>A Panel groups content and actions in a shaped surface. Its children supply behavior; it does not open a modal or manage selection.</p></div>;
}
export function MenuDemo() {
  const [selected, setSelected] = useState('No action yet');
  return <><Menu aria-label="Example menu" items={[{ id: 'inspect', label: 'Inspect' }, { id: 'compare', label: 'Compare' }, { id: 'locked', label: 'Unavailable', disabled: true }]} onSelect={item => setSelected(`${item.label} selected`)} /><output className="source-result" aria-live="polite">{selected}</output></>;
}
export function GaugeDemo() {
  const [value, setValue] = useState(72);
  return <><Gauge label="Capacity" value={value} /><label className="range-label">Adjust capacity<input aria-label="Adjust capacity" type="range" min="0" max="100" value={value} onChange={event => setValue(Number(event.target.value))} /></label></>;
}
export function KeyHintDemo() { return <div className="hint-stack"><KeyHint keys={['↑', '↓']} action="Navigate" /><KeyHint keys="Enter" action="Confirm" /><KeyHint keys="Esc" action="Back" /></div>; }
export function SelectionDemo() {
  const [value, setValue] = useState(0);
  return <div className="cursor-demo"><SelectionIndicator y={value * 48} height={40} />{['First position', 'Second position'].map((label, index) => <button type="button" key={label} aria-pressed={value === index} onClick={() => setValue(index)}>{label}</button>)}</div>;
}
export function TransitionDemo() {
  const [show, setShow] = useState(true);
  return <div className="source-stack"><Button onClick={() => setShow(value => !value)}>{show ? 'Hide content' : 'Show content'}</Button><Transition show={show} effect="wipe"><Panel title="Content follows the shape" tone="light"><p>Exit waits for playback. Reopening interrupts the exit.</p></Panel></Transition></div>;
}
