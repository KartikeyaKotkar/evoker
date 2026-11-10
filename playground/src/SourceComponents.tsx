import { useState } from 'react';
import { Button, ComparisonPanel, ContactTile, CutIn, DateBadge, Dialogue, InspectorList, NameEntry, QuestBrief, RankChange, RecordCard, SettingRow, TutorialCallout } from '@evoker/react';

export const sourceComponentItems = [
  ['InspectorList', '<InspectorList items={items} value={selected}\n  onValueChange={setSelected} label="Collection"\n  detail={item => <Details item={item} />} />', 'Selection-driven details. Separate activation. Scrollable rows.'],
  ['ComparisonPanel', '<ComparisonPanel title="Compare" rows={rows} />', 'Current and candidate values, deltas and explicit improvement direction.'],
  ['RecordCard', '<RecordCard label="Session 01" selected={selected}\n  metadata={fields} onClick={select} />', 'Selectable record with independently arranged metadata and empty state.'],
  ['SettingRow', '<SettingRow label="Volume" description="…"\n  control={attributes => <input {...attributes} type="range" />} />', 'Semantic control slot connected to its own label and contextual help.'],
  ['QuestBrief', '<QuestBrief title="First signal" status="Open"\n  requirements={requirements} reward="Access" />', 'Objective, requirements, dated metadata and separate reward region.'],
  ['DateBadge', '<DateBadge date="2026-11-10"\n  period="Evening" phase="half" />', 'Separate month, day, weekday, time-period and phase layers.'],
  ['RankChange', '<RankChange label="Connection" value={rank} />', 'Outgoing number, incoming number and expanding ring move independently.'],
  ['ContactTile', '<ContactTile label="Mira" summary="Signal ready"\n  unread={unread} onClick={read} />', 'Caller-owned avatar, message preview and independent unread feedback.'],
  ['Dialogue', '<Dialogue speaker="Navigator" choices={choices}\n  onChoose={choose} onAdvance={next}>…</Dialogue>', 'Speaker, portrait, message, advance marker and choice regions.'],
  ['NameEntry', '<NameEntry label="Your name" value={name}\n  onChange={change} onCommit={save} />', 'Native text editing, IME-safe commit and a delayed reveal.'],
  ['CutIn', '<CutIn show={visible}>\n  <h3>Connection established</h3>\n</CutIn>', 'Independent X/Y entrance and exit tracks with interruptible playback.'],
  ['TutorialCallout', '<TutorialCallout title="Choose a signal"\n  targetId="collection" onDismiss={dismiss}>…</TutorialCallout>', 'Inline pointer, heading, optional step and dismiss/target actions.'],
] as const;

const inventory = [
  { id: 'lens', label: 'Signal lens', description: 'Bring distant details into focus.', meta: '120', clarity: 82, weight: 4, range: 64 },
  { id: 'recorder', label: 'Field recorder', description: 'Keep the signals worth remembering.', meta: '240', clarity: 68, weight: 2, range: 80 },
  { id: 'beacon', label: 'Aerial beacon', description: 'Currently unavailable.', meta: '—', clarity: 90, weight: 3, range: 90, disabled: true },
];
const choices = [{ id: 'start', label: 'Start a session' }, { id: 'controls', label: 'Explain the controls' }, { id: 'locked', label: 'Unavailable route', disabled: true }];

export function SourceComponents() {
  const [itemId, setItemId] = useState<string | null>('lens');
  const item = inventory.find(entry => entry.id === itemId) ?? inventory[0]!;
  const [record, setRecord] = useState('first');
  const [volume, setVolume] = useState(65);
  const [sound, setSound] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [date, setDate] = useState('2026-11-10');
  const [rank, setRank] = useState(3);
  const [unread, setUnread] = useState(true);
  const [dialogue, setDialogue] = useState('Every choice opens a different path. Where would you like to begin?');
  const [name, setName] = useState('Operator');
  const [committed, setCommitted] = useState('');
  const [announcement, setAnnouncement] = useState(true);
  const [hint, setHint] = useState(true);
  const [action, setAction] = useState('Ready to inspect.');
  return <>
    <article className="specimen specimen-wide" id="collection-inspector"><div className="specimen-label"><span>10 / INSPECTOR LIST</span><span>SELECT / INSPECT / ACT</span></div>
      <InspectorList label="Equipment collection" items={inventory} value={itemId} onValueChange={setItemId} onActivate={entry => setAction(`${entry.label} activated`)} detail={entry => <>
        <p className="evoker-eyebrow">Equipment / {entry.meta} credits</p><h3>{entry.label}</h3><p>{entry.description}</p><Button onClick={() => setAction(`${entry.label} equipped`)}>Equip selection</Button>
      </>} /><output className="source-result" aria-live="polite">{action}</output>
    </article>
    <article className="specimen"><div className="specimen-label"><span>11 / COMPARISON PANEL</span><span>CURRENT / CANDIDATE</span></div>
      <ComparisonPanel title={item.label} rows={[
        { id: 'clarity', label: 'Clarity', current: 72, candidate: item.clarity },
        { id: 'weight', label: 'Weight', current: 3, candidate: item.weight, higherIsBetter: false },
        { id: 'range', label: 'Range', current: 64, candidate: item.range },
      ]} />
    </article>
    <article className="specimen"><div className="specimen-label"><span>12 / RECORD CARD</span><span>SELECT A SESSION</span></div><div className="source-stack">
      <RecordCard label="Session 01" selected={record === 'first'} onClick={() => setRecord('first')} metadata={[{ label: 'Location', value: 'North studio' }, { label: 'Saved', value: '11 / 10' }]} />
      <RecordCard label="New session" selected={record === 'new'} empty onClick={() => setRecord('new')} metadata={[{ label: 'Status', value: 'Empty slot' }]} />
    </div></article>
    <article className="specimen"><div className="specimen-label"><span>13 / SETTING ROW</span><span>CONTROL + HELP</span></div>
      <SettingRow label="Sound feedback" description="Play feedback when an action completes." control={attributes => <input {...attributes} type="checkbox" checked={sound} onChange={event => setSound(event.target.checked)} />} />
      <SettingRow label={`Volume · ${volume}%`} description="Choose the level that suits your space." control={attributes => <input {...attributes} type="range" min={0} max={100} value={volume} onChange={event => setVolume(Number(event.target.value))} />} />
    </article>
    <article className="specimen"><div className="specimen-label"><span>14 / QUEST BRIEF</span><span>REQUIREMENTS / REWARD</span></div>
      <QuestBrief title="Catch the signal" status={completed ? 'Complete' : 'Open'} deadline="November 12" requirements={['Inspect one item', 'Compare its attributes']} reward="Studio access">
        <p>A small mission to get you moving.</p>
      </QuestBrief><Button variant="secondary" className="source-action" onClick={() => setCompleted(value => !value)}>{completed ? 'Reopen objective' : 'Complete objective'}</Button>
    </article>
    <article className="specimen"><div className="specimen-label"><span>15 / DATE BADGE</span><span>CALENDAR / TIME</span></div>
      <DateBadge date={date} period="Evening" phase="half" /><label className="source-date-control">Choose date<input aria-label="Choose badge date" type="date" value={date} onChange={event => { if (/^\d{4}-\d{2}-\d{2}$/.test(event.target.value)) setDate(event.target.value); }} /></label>
    </article>
    <article className="specimen"><div className="specimen-label"><span>16 / RANK CHANGE</span><span>INDEPENDENT LAYERS</span></div>
      <RankChange label="Connection rank" value={rank} /><Button variant="secondary" onClick={() => setRank(value => value + 1)}>Gain rank</Button>
    </article>
    <article className="specimen"><div className="specimen-label"><span>17 / CONTACT TILE</span><span>MESSAGE / UNREAD</span></div>
      <ContactTile label="Mira" summary={unread ? 'Your next session is ready.' : 'You are all caught up.'} unread={unread} selected={!unread} onClick={() => setUnread(false)} />
      <Button variant="ghost" className="source-action" onClick={() => setUnread(true)}>Mark unread</Button>
    </article>
    <article className="specimen"><div className="specimen-label"><span>19 / NAME ENTRY</span><span>TYPE / ENTER</span></div>
      <NameEntry label="Your callsign" value={name} maxLength={24} required hint="Up to 24 characters. Press Enter to save." onChange={event => setName(event.target.value)} onCommit={setCommitted} />
      <output className="source-result" aria-live="polite">{committed ? `Saved callsign: ${committed}` : 'Your name, your next chapter.'}</output>
    </article>
    <article className="specimen specimen-wide"><div className="specimen-label"><span>18 / DIALOGUE</span><span>SPEAKER / MESSAGE / CHOICES</span></div>
      <Dialogue speaker="Navigator" portrait={<span className="source-portrait" aria-label="Navigator avatar">N</span>} choices={choices}
        onChoose={id => setDialogue(id === 'start' ? 'Session ready. Choose your first piece of equipment above.' : 'Arrow keys move through choices. Enter or Space activates the focused choice.')}
        onAdvance={() => setDialogue('Take your time. The next move is yours.')}>{dialogue}</Dialogue>
    </article>
    <article className="specimen specimen-wide"><div className="specimen-label"><span>20 / CUT-IN</span><span>STRETCH / HOLD / EXIT</span></div>
      <div className="source-cutin-stage"><CutIn show={announcement}><p className="evoker-eyebrow">Session / 01</p><h3>Connection established.</h3><p>All systems ready. Make your next move.</p></CutIn></div>
      <Button variant="secondary" className="source-action" onClick={() => setAnnouncement(value => !value)}>{announcement ? 'Dismiss announcement' : 'Show announcement'}</Button>
    </article>
    <article className="specimen specimen-wide"><div className="specimen-label"><span>21 / TUTORIAL CALLOUT</span><span>POINT / EXPLAIN / DISMISS</span></div>
      {hint ? <TutorialCallout title="Start with a closer look." step="Guide / 01" targetId="collection-inspector" onDismiss={() => setHint(false)}><p>Select an item to inspect its details. Compare the candidate before you equip it.</p></TutorialCallout>
        : <Button variant="secondary" onClick={() => setHint(true)}>Restore hint</Button>}
    </article>
  </>;
}
