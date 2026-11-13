# Repository guidance

Evoker is an MIT-licensed, P3R-inspired UI library. Read `CONTRIBUTING.md` for the contributor workflow and `docs/SOURCE_POLICY.md` for distribution boundaries. Keep changes focused and use the existing architecture before adding dependencies or abstractions.

## Ownership

- `core/src` owns engine-independent motion, timelines, playback and input helpers. It has no React, DOM or runtime dependency.
- `react/src` owns React components, styling, blocks, themes and the DOM rendering adapter. Reuse Base UI for complex focus, forms and overlays. Keep root and subpath exports compatible.
- `playground/src` owns the standalone playground and separate documentation view. Shared block examples live in `BlockDemos.tsx`, `BlockPages.tsx` and `CompositionPages.tsx`; update these rather than creating divergent demos.
- `assets/brand` contains the official, self-contained SVG assets. Vite serves this directory as public assets; `Brand.tsx` shares the mark between the app and documentation.
- `scripts` owns browser and independent package checks. `core/test` contains deterministic unit tests.

## Development

Use Node.js 24 from `.nvmrc` and install with `npm ci`. Run `npm run dev` for the playground. Follow the existing TypeScript/React style, ESM `.js` import specifiers and `evoker-` CSS namespace. Native browser behavior and existing helpers take precedence over duplicate implementations.

The front page is the P3R Blocks & Motion playground. Documentation lives at `/#/docs`; preserve legacy `/#/blocks` and `/#/component` links. Keyboard handling must stay scoped to the focused playground area. Do not intercept native editing, nested widget navigation or portalled modal input with global shortcuts.

Applications own data, selection, async operations and status. In particular, QuestBrief completion remains controlled, ContactTile read state belongs to the caller, and DateBadge displays the supplied date and period. Its live local clock belongs to the shared demo, not the reusable badge.

Preserve accessible names, native form participation, focus behavior, disabled states and reduced motion. Public API changes need matching documentation and export checks. Keep the official logo editable as vector paths without external fonts, scripts or raster images.

## Verification

Run the smallest checks that prove the change:

- `npm test` for core behavior.
- `npm run typecheck` for TypeScript and public API changes.
- `npm run test:browser` for React interactions, visuals, playground and documentation. It requires installed Chrome/Chromium; `CHROME_PATH` overrides detection. The suite starts Vite on port 5174.
- `npm run test:package` for exports, declarations, styles, licensing and package contents. It builds everything and installs the archives into a separate temporary consumer; npm registry access is needed.

CI runs all four commands. Use browser and HTTP readiness signals rather than matching terminal log formatting, and retain cleanup of temporary profiles and child processes. See `docs/TESTING.md` for covered scenarios. Prose-only changes need link and formatting checks rather than unrelated full suites.

## Distribution

Only original or appropriately licensed code, geometry, documentation and assets belong in the public repository. Never publish `.reference`, extracted game artwork or fonts, native tables, keys, credentials or conversation transcripts. A game installation and private research are not required to build or test this repository.

The root `LICENSE` is canonical; library builds copy it into `dist/LICENSE`. Keep package allowlists and license delivery checks intact. Generated `dist`, npm archives, caches and `node_modules` stay untracked. Organization packages are @k2x/evoker and @k2x/evoker-core; publication must be verified before claiming availability; local archives remain available for contributor checks. Verify registry metadata and a fresh consumer install before claiming a release is published. Do not claim native game fidelity has been established.

Use conventional commit messages. Do not publish npm packages, create releases or deploy a website without a user request covering that action.
