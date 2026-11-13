import { useRef, useState } from 'react';
import { ActionBar, Button, MessageLog, PartyPanel, ResultSummary, StatusDialog } from '@k2x/evoker';
import type { PartyMember } from '@k2x/evoker';
import type { Page } from './Documentation.js';
import { codeBlockPage } from './CodeBlockPage.js';

const members: readonly PartyMember[] = [
  { id: 'mira', name: 'Mira', portrait: 'M', status: 'Ready', gauges: [{ id: 'health', label: 'Health', value: 84 }, { id: 'focus', label: 'Focus', value: 42, max: 60 }] },
  { id: 'ren', name: 'Ren', portrait: 'R', status: 'Recovering', gauges: [{ id: 'health', label: 'Health', value: 38 }] },
  { id: 'sol', name: 'Sol', portrait: 'S', status: 'Away', disabled: true },
];
function PartyDemo() {
  const [value, setValue] = useState<string | null>('mira');
  return <div className="source-stack"><PartyPanel label="Field team" members={members} value={value} onValueChange={setValue} /><output aria-live="polite">Selected: {members.find(member => member.id === value)?.name ?? 'None'}</output></div>;
}
function ResultDemo() {
  const [accepted, setAccepted] = useState(false);
  return <div className="source-stack"><ResultSummary title="Operation complete" metrics={[{ id: 'score', label: 'Score', value: '1,240' }, { id: 'time', label: 'Elapsed', value: '04:32' }]}
    rewards={[{ id: 'access', label: 'Studio access', detail: 'Unlocked' }, { id: 'credits', label: 'Credits', detail: '+120' }]}
    actions={<Button disabled={accepted} onClick={() => setAccepted(true)}>Accept results</Button>}><p>Every signal accounted for. Your next move is ready.</p></ResultSummary>
    <output aria-live="polite">{accepted ? 'Results accepted' : 'Review your results'}</output></div>;
}
function LogDemo() {
  const [entries, setEntries] = useState([{ id: '1', speaker: 'Navigator', message: 'The route is clear.', timestamp: '18:40' }]);
  return <div className="source-stack"><MessageLog label="Mission history" entries={entries} /><Button onClick={() => setEntries(previous => [...previous, { id: String(previous.length + 1), speaker: 'Operator', message: `Signal ${previous.length + 1} received.`, timestamp: '18:41' }])}>Append message</Button></div>;
}
function ActionDemo() {
  const [action, setAction] = useState('None');
  return <div className="source-stack"><ActionBar label="Mission actions" items={[{ id: 'inspect', label: 'Inspect', keys: 'E' }, { id: 'confirm', label: 'Confirm', keys: ['Shift', 'Enter'] }, { id: 'locked', label: 'Unavailable', disabled: true }]} onAction={setAction} /><output aria-live="polite">Action: {action}</output></div>;
}
function StatusDemo() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('Connection interrupted');
  const trigger = useRef<HTMLButtonElement>(null);
  const retry = useRef<HTMLButtonElement>(null);
  return <div className="source-stack"><Button ref={trigger} onClick={() => setOpen(true)}>Open connection status</Button><output aria-live="polite">{status}</output>
    <StatusDialog open={open} onOpenChange={setOpen} title="Connection status" description="Your work is saved locally." initialFocus={retry} finalFocus={trigger}
      actions={<Button ref={retry} onClick={() => setStatus('Connection restored')}>Retry connection</Button>}><p>{status}</p></StatusDialog>
  </div>;
}

export const compositionPages: Page[] = [
  { id: 'party-panel', title: 'PartyPanel', description: 'A layered roster with independent portraits, member selection, status text and gauges. Selection is controlled; omit onValueChange for a display-only roster.',
    examples: [{ title: 'Select a team member', node: <PartyDemo />, code: `import { useState } from 'react';
import { PartyPanel } from '@k2x/evoker/blocks';

const members = [
  { id: 'mira', name: 'Mira', status: 'Ready',
    gauges: [{ id: 'health', label: 'Health', value: 84, max: 100 }] },
  { id: 'ren', name: 'Ren', status: 'Recovering' },
  { id: 'sol', name: 'Sol', status: 'Away', disabled: true },
];
export function Team() {
  const [value, setValue] = useState<string | null>('mira');
  return <PartyPanel label="Field team" members={members}
    value={value} onValueChange={setValue} />;
}` }], props: [['label / members', 'Required accessible label and readonly PartyMember[] with stable unique ids', 'Required'], ['PartyMember', 'id, name, portrait?, status?, disabled?, gauges?: PartyGauge[]', 'Application content'], ['PartyGauge', 'id, label, finite value, positive finite max?', 'max: 100; values clamped'], ['value / onValueChange', 'Controlled selected id / (id: string) => void', 'Display-only without callback'], ['emptyMessage', 'Text for an empty roster', 'No party members.'], ['portrait / selection', 'Portrait is decorative and noninteractive. Missing or disabled ids are not selected.', 'Native Tab and Enter/Space']] },
  { id: 'result-summary', title: 'ResultSummary', description: 'Present caller-supplied final metrics and rewards with separate content and action regions. No progression rules, totals, or automatic counters are built in.',
    examples: [{ title: 'Review operation results', node: <ResultDemo />, code: `import { ResultSummary } from '@k2x/evoker/blocks';
import { Button } from '@k2x/evoker';

export function Results({ onAccept }: { onAccept: () => void }) {
  return <ResultSummary title="Operation complete"
    metrics={[
      { id: 'score', label: 'Score', value: '1,240' },
      { id: 'time', label: 'Elapsed', value: '04:32' },
    ]}
    rewards={[{ id: 'access', label: 'Studio access', detail: 'Unlocked' }]}
    actions={<Button onClick={onAccept}>Accept results</Button>}>
    <p>Every signal accounted for.</p>
  </ResultSummary>;
}` }], props: [['title / metrics', 'Required title and readonly { id, label, value: ReactNode }[]', 'Required'], ['rewards', 'Readonly { id, label, detail?: ReactNode }[]', 'Empty; section omitted'], ['children / actions', 'Body content / footer controls', '—'], ['emptyMessage', 'Text shown when metrics is empty', 'No results yet.'], ['semantics', 'Metrics use a definition list; rewards use a list. Values are displayed as supplied.', 'No calculations']] },
  { id: 'message-log', title: 'MessageLog', description: 'An ordered, labelled history with polite additions announcements. Native scrolling stays with the reader; new entries do not force scrolling or move focus. Audio and history persistence belong to your application.',
    examples: [{ title: 'Append history', node: <LogDemo />, code: `import { useState } from 'react';
import { MessageLog } from '@k2x/evoker/blocks';
import { Button } from '@k2x/evoker';

export function History() {
  const [entries, setEntries] = useState([
    { id: '1', speaker: 'Navigator', message: 'The route is clear.' },
  ]);
  return <>
    <MessageLog label="Mission history" entries={entries} />
    <Button onClick={() => setEntries(previous => [...previous, {
      id: String(previous.length + 1), speaker: 'Operator', message: 'Signal received.',
    }])}>Append message</Button>
  </>;
}` }], props: [['label / entries', 'Required label and readonly MessageLogEntry[] with stable unique ids', 'Required'], ['MessageLogEntry', 'id, speaker, message: ReactNode, timestamp?: ReactNode, actions?: ReactNode', 'Application content'], ['emptyMessage', 'Text for empty history', 'No messages yet.'], ['ref / onScroll / style', 'Native root access; customize maxHeight or implement your own scroll policy', '24rem maximum height'], ['announcements', 'role=log; polite additions; not atomic. Timestamps are display content only.', 'No focus or automatic scroll changes']] },
  { id: 'action-bar', title: 'ActionBar', description: 'A wrapping command group with independent key hints and disabled actions. Buttons use native Tab and Enter/Space behavior. Hints describe application bindings; the component installs no global shortcuts.',
    examples: [{ title: 'Choose an action', node: <ActionDemo />, code: `import { useState } from 'react';
import { ActionBar } from '@k2x/evoker/blocks';

export function Commands() {
  const [action, setAction] = useState('None');
  return <>
    <ActionBar label="Mission actions" onAction={setAction} items={[
      { id: 'inspect', label: 'Inspect', keys: 'E' },
      { id: 'confirm', label: 'Confirm', keys: ['Shift', 'Enter'] },
      { id: 'locked', label: 'Unavailable', disabled: true },
    ]} />
    <output aria-live="polite">Action: {action}</output>
  </>;
}` }], props: [['label / items / onAction', 'Accessible label, readonly ActionBarItem[], and (id: string) => void', 'Required'], ['ActionBarItem', 'id, label, keys?: string | readonly string[], glyph?: ReactNode, disabled?: boolean', 'Stable unique ids'], ['keys / glyph', 'Key names; optional decorative replacement glyph with key-name alternative', 'Hint only; glyph requires keys'], ['emptyMessage', 'Text for an empty group', 'No actions available.'], ['keyboard', 'Native buttons in an accessible group; disabled actions cannot activate', 'No shortcut handlers']] },
  { id: 'status-dialog', title: 'StatusDialog', description: 'A controlled status composition over the existing dialog primitives, with a scoped 150 ms opacity fade. Base UI owns focus, dismissal, interrupted transitions and lifecycle. Reduced motion settles immediately; applications own status and retry operations.',
    examples: [{ title: 'Control connection status', node: <StatusDemo />, code: `import { useRef, useState } from 'react';
import { StatusDialog } from '@k2x/evoker/blocks';
import { Button } from '@k2x/evoker';

export function Connection() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('Connection interrupted');
  const trigger = useRef<HTMLButtonElement>(null);
  return <>
    <Button ref={trigger} onClick={() => setOpen(true)}>Open connection status</Button>
    <StatusDialog open={open} onOpenChange={setOpen} title="Connection status"
      description="Your work is saved locally." finalFocus={trigger}
      actions={<Button onClick={() => setStatus('Connection restored')}>Retry connection</Button>}>
      <p>{status}</p>
    </StatusDialog>
  </>;
}` }], props: [['open / onOpenChange / title', 'Controlled boolean, Base UI change callback including event details, accessible title', 'Required'], ['description / children / actions', 'Descriptive phrasing content / body / footer actions', '—'], ['closeLabel', 'Accessible label for the always-present close button', 'Close status dialog'], ['onOpenChangeComplete', '(open: boolean) => void, after the active transition finishes', 'Base UI lifecycle'], ['disablePointerDismissal', 'Prevent outside-press dismissal; Escape and close remain available', 'false'], ['initialFocus / finalFocus', 'Existing popup focus preferences; use a ref for external controls', 'Base UI defaults'], ['ref / render / className / style', 'Popup customization; state-aware styles retained, duration is 150ms or 0ms for reduced motion', 'Themed portal']] },
  codeBlockPage,
];
