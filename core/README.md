# @kartikeyak/evoker-core

Evoker's engine-independent TypeScript motion and input core. It has no React, DOM or runtime dependencies.

## Install the beta

```sh
npm install @kartikeyak/evoker-core@beta
```

The beta API may change before 1.0. The package ships ESM and TypeScript declarations.

```ts
import { Timeline, track } from '@kartikeyak/evoker-core';

const fade = new Timeline({
  duration: 300,
  tracks: [track('opacity', [
    { time: 0, value: 0 },
    { time: 300, value: 1 },
  ])],
});
```

The core describes motion; an application-owned renderer applies its output. For React components, use [`@kartikeyak/evoker`](https://www.npmjs.com/package/@kartikeyak/evoker).

[Source and documentation](https://github.com/KartikeyaKotkar/evoker) · [Contributing](https://github.com/KartikeyaKotkar/evoker/blob/main/CONTRIBUTING.md) · [MIT license](https://github.com/KartikeyaKotkar/evoker/blob/main/LICENSE)
