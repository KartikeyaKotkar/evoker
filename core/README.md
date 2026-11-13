# @k2x/evoker-core

Evoker's engine-independent TypeScript motion and input core. It has no React, DOM or runtime dependencies.

## Install the beta

```sh
npm install @k2x/evoker-core@beta
```

The beta API may change before 1.0. The package ships ESM and TypeScript declarations.

```ts
import { Timeline, track } from '@k2x/evoker-core';

const fade = new Timeline({
  duration: 300,
  tracks: [track('opacity', [
    { time: 0, value: 0 },
    { time: 300, value: 1 },
  ])],
});
```

The core describes motion; an application-owned renderer applies its output. For React components, use [`@k2x/evoker`](https://www.npmjs.com/package/@k2x/evoker).

[Source and documentation](https://github.com/K2X-Lab/evoker) · [Contributing](https://github.com/K2X-Lab/evoker/blob/main/CONTRIBUTING.md) · [MIT license](https://github.com/K2X-Lab/evoker/blob/main/LICENSE)
