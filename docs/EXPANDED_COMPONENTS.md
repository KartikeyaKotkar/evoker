# Expanded React components

The toolkit exports eighteen optional compositions alongside its original component families and reusable primitives. All are available from `@k2x/evoker` and `@k2x/evoker/blocks`; their reusable styling ships through `@k2x/evoker/styles.css`. The catalog includes working examples. No extracted image, font, polygon collection, native table or key is imported into the application or packages.

## Collection inspection and comparison

```tsx
import { useState } from 'react';
import { Button, ComparisonPanel, InspectorList } from '@k2x/evoker';

const items = [
  { id: 'lens', label: 'Signal lens', description: 'Inspect distant details.', meta: '120 credits' },
  { id: 'recorder', label: 'Field recorder', description: 'Keep useful signals.', meta: '240 credits' },
  { id: 'later', label: 'Unavailable', disabled: true },
];

export function Equipment() {
  const [value, setValue] = useState<string | null>('lens');
  return <InspectorList label="Equipment" items={items} value={value}
    onValueChange={setValue} onActivate={item => console.log('Activated', item.id)}
    detail={item => <>
      <h3>{item.label}</h3><p>{item.description}</p>
      <ComparisonPanel title="Attributes" rows={[
        { id: 'clarity', label: 'Clarity', current: 72, candidate: item.id === 'lens' ? 82 : 68 },
        { id: 'weight', label: 'Weight', current: 3, candidate: 2, higherIsBetter: false },
      ]} />
      <Button onClick={() => console.log('Equipped', item.id)}>Equip</Button>
    </>} />;
}
```

Arrow keys and Home/End select and focus enabled options; native Enter/Space invokes activation. Pointer activation selects before invoking `onActivate`. Focus alone does not invoke activation. Tab leaves the list and can reach the detail actions. Selection is controlled by item id; reordered items keep their identity, while missing or disabled selected ids show the placeholder. Empty collections render the empty message. `wrap` defaults to false.

Comparisons validate finite current, candidate and difference values. They render a semantic table with current/candidate headers, signed deltas, directional arrows and textual Better/Worse/Unchanged outcomes. `higherIsBetter` defaults to true and can be false for costs or weight. Meaning remains available without color. Input values are application data, not native game statistics.

## Composition contracts

- `RecordCard` is a native button with `label`, `metadata`, optional `leading`, `selected` and `empty`. Empty records remain selectable unless explicitly disabled. Its metadata is a readonly array of `{ label, value }`; values and leading content must be noninteractive. `ContactTile` composes that record with `summary`, optional `avatar` and `unread`; it exposes unread state in its accessible label and animates its indicator once when unread becomes true. The caller owns read/selected state.
- `SettingRow` connects its label and help text to `control({ id, 'aria-describedby' })`. Spread these attributes onto a native input or select. The caller owns values, allowed ranges, steps and persistence.
- `QuestBrief` separates requirements, deadline, status, reward and optional `actions`. Existing readonly string requirements remain display-only. Structured `QuestRequirement` items (`id`, `label`, `completed?`) add a completed-count progressbar; optional `onRequirementChange(id, completed)` renders controlled native checkboxes. Without that callback, structured objectives display explicit completion text. Applications own completion, claiming and persistence. The shared playground/docs demo tracks three objectives, gates reward claiming until all are complete, announces the unlocked reward and supports restarting.
- `DateBadge` requires a real `YYYY-MM-DD` date and formats it with an explicit UTC timezone and optional `locale` (default `en`). Optional `period` and `phase` are caller-owned display values. It never infers moon phase or advances time. Invalid dates throw. This is a date display, not an interactive calendar or date picker.
- The shared DateBadge demo supplies the browser's live local date and time, updating across date and period boundaries. Morning is 05:00–11:59, Afternoon 12:00–16:59, Evening 17:00–20:59 and Night 21:00–04:59. Manual date/time preview stays fixed until “Use current time” is selected. No moon phase is inferred. The ContactTile demo starts read, disables “Mark unread” while already unread, and opens message content while marking it read.
- `RankChange` requires a finite numeric value and label. The incoming number, outgoing number and ring use separate motion players. Rapid updates cancel obsolete outgoing completion callbacks; reduced motion settles immediately on the newest value. The output announces the complete value rather than intermediate animation samples.
- `Dialogue` separates `speaker`, optional `portrait`, message children, optional `choices`, `onChoose(id)` and `onAdvance`. Choices reuse the existing keyboard menu and disabled-row behavior. Message updates are announced politely. The component is an article, with no modal focus trap or automatic text reveal.
- `NameEntry` forwards its ref and native text-input props. It adds a linked label, optional hint and `onCommit(value)`. Native selection, IME and constraint validation remain intact. Non-composing Enter calls `onCommit` once only if native constraints pass; a caller that prevents the key event overrides this behavior. Without `onCommit`, normal input/form Enter behavior remains available. Values are not trimmed or rewritten.
- `CutIn` accepts `show`, optional `duration` (default 150 ms) and `onExited`. Its original entrance/exit uses different X/Y scale tracks. The component remains mounted for exit, makes exiting content inert immediately and unmounts children on completion. Reopening interrupts exit from its displayed pose. The application owns hold duration and dismissal.
- `TutorialCallout` provides an inline aside with `title`, body, optional `step`, `onDismiss`, `dismissLabel` and `targetId`. It has original pointer geometry and an optional ordinary target link. The application owns placement and any target highlighting or surrounding scrim.

## Five beta compositions

Every block has a searchable page in the separate documentation view. The five latest additions are at `#/docs/party-panel`, `#/docs/result-summary`, `#/docs/message-log`, `#/docs/action-bar`, and `#/docs/status-dialog`. Older blocks, including QuestBrief, DateBadge, ContactTile and the Panel surface, have their own pages too. Playground and documentation mount the same block examples. The pages include code examples and prop contracts. Native attributes are forwarded; ref support follows each component's API. Use stable unique ids in all collections.

- `PartyPanel` takes `label`, readonly `members`, optional controlled `value` and `onValueChange(id)`. Each `PartyMember` has `id`, `name`, optional decorative/noninteractive `portrait`, `status`, `disabled` and readonly `gauges`. Each `PartyGauge` has `id`, `label`, finite `value` and optional positive finite `max` (default 100); existing Gauge clamping and validation apply. Gauges remain outside selection buttons. Missing or disabled selected ids have no selected member. Without a callback, the roster is display-only. `emptyMessage` defaults to “No party members.”
- `ResultSummary` takes `title` and readonly `metrics` (`id`, `label`, `value: ReactNode`), optional `rewards` (`id`, `label`, `detail?: ReactNode`), children and footer `actions`. Metrics are a definition list; rewards are a separate list omitted when empty. Values are supplied final display content; the block does not calculate rewards or animate numeric counters. `emptyMessage` defaults to “No results yet.”
- `MessageLog` takes `label` and readonly `entries` (`id`, `speaker`, `message: ReactNode`, optional display `timestamp` and interactive `actions`). It is a keyboard-scrollable ordered log with polite additions announcements and a default maximum height of 24rem. Appending stable entries does not scroll or move focus. The application owns history, audio and any alternative scrolling policy through native ref/onScroll/style. Timestamp content is displayed without parsing. `emptyMessage` defaults to “No messages yet.”
- `ActionBar` takes `label`, readonly `items` (`id`, `label`, optional `keys`, `glyph`, `disabled`) and `onAction(id)`. Buttons retain native Tab and Enter/Space behavior and never submit a surrounding form. Keys accept a string or readonly string array; an optional glyph replaces the visual keys while retaining their accessible names. Supply `keys` when using a glyph. The group registers no global shortcuts and does not claim `aria-keyshortcuts` bindings. `emptyMessage` defaults to “No actions available.”
- `StatusDialog` takes controlled `open`, `onOpenChange`, `title`, optional phrasing `description`, children, footer `actions` and `closeLabel` (default “Close status dialog”). It composes existing themed dialog parts, always includes a close button, and forwards Base UI callback details and `onOpenChangeComplete`. `disablePointerDismissal` defaults to false; Escape and the close button remain available. Popup attributes, ref, `render`, state-aware className/style and initial/final focus preferences are preserved. Only this composition uses the fixed 150 ms opacity fade; reduced motion sets it to zero. Base UI owns completion, interruption, focus trapping and dismissal. Applications own connection status, retry operations and when to open/close; the component monitors no network state.

```tsx
import { PartyPanel, ResultSummary, MessageLog, ActionBar } from '@k2x/evoker/blocks';
import '@k2x/evoker/styles.css';

<PartyPanel label="Team" members={[
  { id: 'mira', name: 'Mira', status: 'Ready',
    gauges: [{ id: 'health', label: 'Health', value: 84 }] },
]} />;
<ResultSummary title="Complete" metrics={[
  { id: 'score', label: 'Score', value: '1,240' },
]} />;
<MessageLog label="History" entries={[
  { id: '1', speaker: 'Navigator', message: 'The route is clear.' },
]} />;
<ActionBar label="Actions" items={[
  { id: 'inspect', label: 'Inspect', keys: 'E' },
]} onAction={id => console.log(id)} />;
```

The PartyPanel, BattleResult, BackLog and KeyHelp reference families inform the separation of content and decoration. Their static metadata does not establish browser interaction rules or full runtime composition. The connection widget's recovered opacity channels support a 150 ms sequence-time reference; this does not establish universal game dialog timing. Public geometry, application examples and web interaction contracts are authored for Evoker.

## CodeBlock

`CodeBlock` is an original Evoker source surface, available from the root and `/blocks` entries. The playground's tile 27 and `#/docs/code-block` share its examples. The playground API inspector and all documentation code examples also use this component.

```tsx
import { CodeBlock } from '@k2x/evoker';

<CodeBlock code={source} filename="components/next-move.tsx"
  language="tsx" highlightedLines={[5, 6, 7]} />;
```

The angular signal mark, file identity, cyan line accents and sharp borders follow Evoker's palette and theme roles. The interaction reference is [shadcn's Code Block documentation](https://ui.shadcn.com/docs/components/base/code-block): file identity, native scrolling, optional numbering, wrapping and copy feedback. The implementation and geometry are original.

`code` is the authoritative string for copying, including blank lines, indentation and trailing newlines. Text is escaped through React; it is never executed or inserted as raw HTML. `filename` defaults to “Source code”; `language` is a display label defaulting to “text”. `lineNumbers` defaults to true; `startLine` defaults to 1 and must produce positive safe integer line numbers. `highlightedLines` refers to displayed numbers. Gutters are hidden from assistive technology and excluded from clipboard content and native selection.

The named LTR `pre` is keyboard focusable and scrolls within a 30rem height cap. `defaultWrap` sets the initial reader preference; the wrap button exposes `aria-pressed`. `copy={false}` removes the copy action. Clipboard failures select the code for manual copying and announce the fallback. Pending copies cannot announce success for a changed source; all actions are native non-submitting buttons. The figure forwards native attributes and its ref.

Syntax highlighting is optional: `renderLine(line, displayedLineNumber)` accepts application-owned React token nodes without adding a parser dependency. Return only that line, without its newline, and preserve its text. Default output is plain text; `language` alone does not tokenize it. The raw `code` remains the clipboard source even when rendered tokens differ. No formatter, code runner, streaming engine or global shortcuts are installed.

## Source relationships and fidelity limits

Private source research informs the separation of selection, list entrance, detail content, actions, typography and feedback motion. Public components use original geometry and application-owned data. See [source policy](SOURCE_POLICY.md) for distribution boundaries.

These components are authored browser adaptations. Native rendering, interpolation, timing overrides and final game composition remain unverified; the library does not claim exact runtime reproduction.
