# Evoker UI

A React component library with a Persona 3 Reload–inspired theme and an engine-independent motion core. Build applications from reusable primitives, then compose optional collection, dialogue and feedback blocks.

## Documentation

```sh
npm ci
npm run dev
```

The local documentation opens with installation, theming and individual component pages. Each primitive has an interactive preview, copyable code and an API table. Open `/#/blocks` for the original source-inspired compositions and motion controls.

## Install in another application

The packages are currently distributed through local npm archives. They have not been published to the npm registry.

```sh
# In this repository
npm run package

# In your React application, replace /path/to/evoker
npm install /path/to/evoker/artifacts/npm/evoker-core-0.1.0.tgz \
  /path/to/evoker/artifacts/npm/evoker-react-0.1.0.tgz
```

Requires React and React DOM 18 or 19. The archives include ESM, TypeScript declarations and CSS; normal npm dependency resolution installs Base UI. No Tailwind setup is required.

```tsx
import { Button, Card, Field, Input, Theme } from '@evoker/react';
import '@evoker/react/styles.css';

export function App() {
  return <Theme appearance="dark">
    <Card.Root>
      <Card.Header>
        <Card.Title>Your next project</Card.Title>
        <Card.Description>Compose the interface your application needs.</Card.Description>
      </Card.Header>
      <Card.Content>
        <Field.Root name="project">
          <Field.Label>Project name</Field.Label>
          <Input name="project" placeholder="Signal studio" required />
          <Field.Description>You can change this later.</Field.Description>
        </Field.Root>
      </Card.Content>
      <Card.Footer><Button onClick={() => console.log('Create')}>Create project</Button></Card.Footer>
    </Card.Root>
  </Theme>;
}
```

## Public primitives

- `Button`: primary/secondary/outline/ghost variants, small/medium/large/icon sizes, loading state, native attributes and ref. `buttonClassName()` provides the same styling for a caller-owned link or router component.
- `Input`, `Textarea`, `Field.Root/Label/Control/Description/Error`: native editing and form submission with linked labels, descriptions and validation. Use `Field.Control render={<Textarea />}` for multiline field composition.
- `Checkbox`, `Switch`: checked/defaultChecked, disabled/mixed states, checked-change callbacks and native form values.
- `Select.Root/Trigger/Value/Portal/Positioner/Content/List/Item/ItemText`: composable single/multiple selection with positioning, keyboard navigation and forms. Supply Root's `items` label mapping, or format Value's children, so labels remain available while the popup is unmounted.
- `Slider.Root/Label/Value/Control/Track/Indicator/Thumb`: numeric or range values, labels, keyboard/pointer interaction and form values.
- `Dialog.Root/Trigger/Portal/Backdrop/Content/Title/Description/Close/Footer`: controlled or uncontrolled modal behavior and caller-owned content. `Content` accepts explicit initial/final focus preferences.
- `Tabs.Root/List/Trigger/Content/Indicator`: controlled or uncontrolled values, horizontal/vertical orientation and manual or automatic activation. Disabled tabs may receive arrow focus for discoverability but cannot activate.
- `Card.Root/Header/Title/Description/Content/Footer`, `Badge`, `Separator`: composable surfaces and structural pieces.
- `Tooltip.Provider/Root/Trigger/Portal/Positioner/Content` and `DropdownMenu.Root/Trigger/Portal/Positioner/Content/Item`: contextual help and actions.

Behavior parts accept Base UI's typed props, state-aware `className`/`style`, forwarded refs and `render` composition. The application owns content, data and async operations. Components expose controlled/uncontrolled state where appropriate; form controls accept native `name` and participate in `FormData`.

```tsx
import { Button, Dialog } from '@evoker/react';

<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Edit profile</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Content>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>Choose the details to update.</Dialog.Description>
      {/* Your form or other content */}
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="outline" />}>Cancel</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

Individual package entries include `@evoker/react/button`, `/theme`, `/controls`, `/dialog`, `/tabs` and `/blocks`. CSS is marked as a side effect for bundlers; unused JS exports can be removed. Interactive entry points carry `use client`; import global CSS from the appropriate root layout in frameworks such as Next.js.

## Theme and source identity

`Theme` scopes `appearance="dark" | "light"`, `density="comfortable" | "compact"` and `reducedMotion="system" | boolean`. Nested themes inherit omitted settings. Portalled overlays retain their theme and CSS token overrides.

```css
.my-theme {
  --evoker-sky: #6d9ac7;
  --evoker-blue: #1269cc;
  --evoker-cyan: #51eefc;
  --evoker-white: #ffffff;
  --evoker-ink: #303030;
  --evoker-font: Arial, Helvetica, sans-serif;
}
```

`<Theme className="my-theme">…</Theme>` applies these tokens. Semantic background, foreground, accent, border, focus and control-density roles build on them. The extracted reference establishes layered planes, independent cursor/text composition, separate key/action labels, individual transforms and motion relationships. Those findings inform Evoker's theme and blocks. Original/licensed typography and original scalable geometry remain in the public package; game textures, fonts, keys and full native tables remain private.

## Optional blocks and motion

`@evoker/react/blocks` exports `InspectorList`, `ComparisonPanel`, `RecordCard`, `ContactTile`, `QuestBrief`, `SettingRow`, `DateBadge`, `RankChange`, `Dialogue`, `NameEntry`, `CutIn` and `TutorialCallout`. Their contracts and fidelity limits are in [expanded components](docs/EXPANDED_COMPONENTS.md). Existing root imports remain available, including the flat Dialog/Tabs convenience APIs, `Menu`, `Panel`, `Gauge`, `KeyHint`, `SelectionIndicator` and `Transition`.

`@evoker/core` retains DOM-free timelines, sequences, players, scenes and focus/input helpers with zero runtime dependencies. React's `useMotion`, `Animated` and `EvokerProvider` remain available. Base UI owns complex React interaction behavior; Evoker owns its styling and source-inspired motion. Neither core independence nor this React implementation proves compatibility with another engine.

## Verification

```sh
npm test
npm run typecheck
npm run test:browser
npm run test:package
```

The browser suite checks primitive composition/refs, native form values, field association, controlled state, focus/keyboard behavior, themed portals, blocks, documentation routes and desktop/mobile layout. It needs Node.js 22+ and installed Chromium (`CHROME_PATH` can override detection). The local test browser uses `--no-sandbox` for container compatibility. `EVOKER_SCREENSHOTS=/tmp npm run test:browser` saves screenshots.

`test:package` builds archives, installs them into a separate temporary consumer outside the workspace and verifies declarations, subpath imports, CSS and a production build without aliases. It requires network access for npm dependencies. Regular builds require Node.js 20.19+.

See [library design research](docs/LIBRARY_DESIGN.md) and [source policy](docs/SOURCE_POLICY.md). Source research, extracted assets, credentials and conversation history stay local and are excluded from Git. Exact native runtime fidelity remains unverified.
