# @k2x/evoker

Evoker is an MIT-licensed, P3R-inspired React UI toolkit: original angular surfaces, themed controls, independent motion and application-owned content.

## Install the beta

In an existing React 18 or 19 application:

```sh
npm install @k2x/evoker@beta
```

React and React DOM are peer dependencies. npm installs the matching Evoker core and Base UI dependencies automatically. The beta API may change before 1.0.

Import the stylesheet once in your application entry or root layout:

```tsx
import { Button, Theme } from '@k2x/evoker';
import '@k2x/evoker/styles.css';

export function App() {
  return <Theme appearance="dark" reducedMotion="system">
    <Button onClick={() => console.log('Signal received')}>Your next move</Button>
  </Theme>;
}
```

Use `@k2x/evoker/blocks` for CodeBlock, QuestBrief, PartyPanel and other compositions. Smaller entries also include `/button`, `/theme`, `/controls`, `/dialog` and `/tabs`. With Next.js, interactive usage belongs behind a client boundary and the stylesheet belongs in the root layout.

The package includes ESM, TypeScript declarations, CSS and the MIT license. It contains original code and geometry; no game artwork, fonts, keys or private research are distributed.

[Source and documentation](https://github.com/K2X-Lab/evoker) · [Block contracts](https://github.com/K2X-Lab/evoker/blob/main/docs/EXPANDED_COMPONENTS.md) · [Contributing](https://github.com/K2X-Lab/evoker/blob/main/CONTRIBUTING.md) · [MIT license](https://github.com/K2X-Lab/evoker/blob/main/LICENSE)
