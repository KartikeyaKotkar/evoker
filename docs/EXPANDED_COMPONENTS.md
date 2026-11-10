# Expanded React components

The toolkit now exports twelve additional components, for 21 component families in total. All are available from `@evoker/react`; their reusable styling ships through `@evoker/react/styles.css`. The catalog includes a working example for every addition. No extracted image, font, polygon collection, native table or key is imported into the application or packages.

## Collection inspection and comparison

```tsx
import { useState } from 'react';
import { Button, ComparisonPanel, InspectorList } from '@evoker/react';

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
- `SettingRow` connects its label and help text to `control({ id, 'aria-describedby' })`. Spread these attributes onto a native input or select. The caller owns values, allowed ranges, steps and persistence. `QuestBrief` separates requirements, deadline, status and reward; it does not interpret game flags or implement a task engine.
- `DateBadge` requires a real `YYYY-MM-DD` date and formats it with an explicit UTC timezone and optional `locale` (default `en`). Optional `period` and `phase` are caller-owned display values. It never infers moon phase or advances time. Invalid dates throw. This is a date display, not an interactive calendar or date picker.
- `RankChange` requires a finite numeric value and label. The incoming number, outgoing number and ring use separate motion players. Rapid updates cancel obsolete outgoing completion callbacks; reduced motion settles immediately on the newest value. The output announces the complete value rather than intermediate animation samples.
- `Dialogue` separates `speaker`, optional `portrait`, message children, optional `choices`, `onChoose(id)` and `onAdvance`. Choices reuse the existing keyboard menu and disabled-row behavior. Message updates are announced politely. The component is an article, with no modal focus trap or automatic text reveal.
- `NameEntry` forwards its ref and native text-input props. It adds a linked label, optional hint and `onCommit(value)`. Native selection, IME and constraint validation remain intact. Non-composing Enter calls `onCommit` once only if native constraints pass; a caller that prevents the key event overrides this behavior. Without `onCommit`, normal input/form Enter behavior remains available. Values are not trimmed or rewritten.
- `CutIn` accepts `show`, optional `duration` (default 150 ms) and `onExited`. Its original entrance/exit uses different X/Y scale tracks. The component remains mounted for exit, makes exiting content inert immediately and unmounts children on completion. Reopening interrupts exit from its displayed pose. The application owns hold duration and dismissal.
- `TutorialCallout` provides an inline aside with `title`, body, optional `step`, `onDismiss`, `dismissLabel` and `targetId`. It has original pointer geometry and an optional ordinary target link. The application owns placement and any target highlighting or surrounding scrim.

## Source relationships and fidelity limits

Private source research informs the separation of selection, list entrance, detail content, actions, typography and feedback motion. Public components use original geometry and application-owned data. See [source policy](SOURCE_POLICY.md) for distribution boundaries.

These components are authored browser adaptations. Native rendering, interpolation, timing overrides and final game composition remain unverified; the library does not claim exact runtime reproduction.
